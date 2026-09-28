/** Hourly, keyword-only review queue intake. Never publishes or sends pushes. */
import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HEARTS_METHODOLOGY } from './heart-data';
import { fetchNewsMentions } from './news-mentions';
import { isSocialSlug } from './social';
import { draftProposals, extractKeywords, matchLineage, type OpenPromise } from './scan';

export interface NewsScanSummary {
  status: 'completed' | 'partial' | 'skipped';
  run_id: string;
  projects_checked: number;
  articles_seen: number;
  proposals_created: number;
  pushes_sent: number;
  feed_errors: Array<{ project_slug: string; error: string }>;
}

export interface NewsScanOptions {
  signal?: AbortSignal;
  now?: () => Date;
  maxDurationMs?: number;
  fetcher?: typeof fetch;
}

const PAGE_SIZE = 500;
const BATCH_SIZE = 200;

/** UUIDv8: a stable, namespaced SHA-256 identity using the existing UUID PKs. */
function stableId(parts: string[]): string {
  const bytes = createHash('sha256').update(JSON.stringify(parts)).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function proposalKey(kind: string, slug: string, lineage: string, articleUrl: string): string {
  return JSON.stringify([kind, slug, lineage, articleUrl]);
}

function message(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 2000);
}

async function checked<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>, label: string): Promise<T | null> {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

/**
 * One claim per UTC hour, including failed attempts. Retrying waits for the next
 * hour; a crashed process cannot strand a permanent lock. Proposal identities
 * also survive hour boundaries, deployments, and later review decisions.
 */
export async function runNewsScan(db: SupabaseClient, options: NewsScanOptions = {}): Promise<NewsScanSummary> {
  const now = options.now ?? (() => new Date());
  const startedAt = now();
  const hour = new Date(Math.floor(startedAt.getTime() / 3_600_000) * 3_600_000).toISOString();
  const signal = AbortSignal.any([
    AbortSignal.timeout(options.maxDurationMs ?? 260_000),
    ...(options.signal ? [options.signal] : []),
  ]);
  const summary: NewsScanSummary = {
    status: 'completed', run_id: stableId(['promise-news-hour-v1', hour]),
    projects_checked: 0, articles_seen: 0, proposals_created: 0, pushes_sent: 0, feed_errors: [],
  };
  signal.throwIfAborted();
  const claim = await db.from('scan_runs').insert({ id: summary.run_id, started_at: startedAt.toISOString() })
    .select('id').abortSignal(signal).single();
  if (claim.error?.code === '23505') return { ...summary, status: 'skipped' };
  if (claim.error) throw new Error(`Could not claim scan hour: ${claim.error.message}`);
  if (!claim.data) throw new Error('Could not claim scan hour: missing run record');

  async function finish(error: string | null, finishSignal: AbortSignal) {
    await checked(db.from('scan_runs').update({
      finished_at: now().toISOString(), projects_checked: summary.projects_checked,
      articles_seen: summary.articles_seen, proposals_created: summary.proposals_created,
      pushes_sent: 0, error,
    }).eq('id', summary.run_id).select('id').abortSignal(finishSignal).single(), 'Could not finish scan run');
  }

  try {
    const run = await checked<{ id: string }>(db.from('heart_runs').select('id')
      .eq('review_status', 'published').eq('methodology', HEARTS_METHODOLOGY)
      .order('as_of', { ascending: false }).order('recorded_at', { ascending: false })
      .order('id', { ascending: false }).limit(1).abortSignal(signal).maybeSingle(), 'Could not read published ledger');
    if (!run) throw new Error('No published ledger run found');

    const fetcher: typeof fetch = (input, init) => (options.fetcher ?? fetch)(input, {
      ...init,
      // fetchNewsMentions supplies its own 12-second request timeout.
      signal: AbortSignal.any([signal, ...(init?.signal ? [init.signal] : [])]),
    });
    let rankingsSeen = 0;
    for (let offset = 0; ; offset += PAGE_SIZE) {
      signal.throwIfAborted();
      const rankings = await checked(db.from('heart_rankings').select('slug, name, assessment')
        .eq('run_id', run.id).order('slug').range(offset, offset + PAGE_SIZE - 1).abortSignal(signal), 'Could not read rankings');
      if (!rankings) throw new Error('Could not read rankings: missing response');
      rankingsSeen += rankings.length;
      for (const row of rankings) {
        signal.throwIfAborted();
        if (!isSocialSlug(row.slug)) continue;
        const rawPromises = (row.assessment as { promises?: Array<{ lineage?: string; criteria?: string; claim_type?: string; state?: string }> } | null)?.promises;
        if (!Array.isArray(rawPromises)) throw new Error(`Missing published promises for ${row.slug}`);
        // Matches Atlas's v3 open-state contract. Ambiguous active and unknown
        // states are not candidates; no legacy active=>fulfilled mapping.
        const promises: OpenPromise[] = rawPromises.filter((p) => p.state === 'open' || p.state === 'unfulfilled').map((p) => {
          if (!p.lineage?.trim() || !p.criteria?.trim()) throw new Error(`Missing open promise lineage or criteria for ${row.slug}`);
          return { lineage: p.lineage, criteria: p.criteria, claimType: p.claim_type };
        });
        if (!promises.length) continue;
        summary.projects_checked++;

        let articles;
        try {
          articles = (await fetchNewsMentions(row.slug, fetcher)).articles;
        } catch (error) {
          signal.throwIfAborted();
          summary.feed_errors.push({ project_slug: row.slug, error: message(error) });
          continue;
        }
        signal.throwIfAborted();
        summary.articles_seen += articles.length;

        // Historical CLI rows use random UUIDs. Include every review status and
        // every page so those records are not recreated with deterministic IDs.
        const seen = new Set<string>();
        for (let page = 0; ; page += PAGE_SIZE) {
          signal.throwIfAborted();
          const existing = await checked(db.from('scan_proposals').select('kind, lineage, article_url')
            .eq('project_slug', row.slug).order('id').range(page, page + PAGE_SIZE - 1).abortSignal(signal), 'Could not read existing proposals');
          if (!existing) throw new Error('Could not read existing proposals: missing response');
          for (const proposal of existing) {
            if (proposal.article_url) seen.add(proposalKey(proposal.kind, row.slug, proposal.lineage, proposal.article_url));
          }
          if (existing.length < PAGE_SIZE) break;
        }

        const projectTokens = extractKeywords(`${row.name ?? row.slug} ${row.slug}`);
        let matchLog: Array<Record<string, unknown>> = [];
        let proposals: Array<Record<string, unknown>> = [];
        async function flush() {
          signal.throwIfAborted();
          if (matchLog.length) {
            await checked(db.from('scan_match_log').insert(matchLog).abortSignal(signal), 'Could not write scan match log');
            matchLog = [];
          }
          if (proposals.length) {
            const inserted = await checked(db.from('scan_proposals').upsert(proposals, { onConflict: 'id', ignoreDuplicates: true })
              .select('id').abortSignal(signal), 'Could not write scan proposals');
            if (!inserted) throw new Error('Could not write scan proposals: missing response');
            summary.proposals_created += inserted.length;
            proposals = [];
          }
        }

        for (const article of articles) {
          for (const promise of promises) {
            signal.throwIfAborted();
            const decision = matchLineage(article, promise, projectTokens);
            matchLog.push({
              project_slug: row.slug, lineage: promise.lineage, article_url: article.url,
              article_title: article.title, matched: decision.matched,
              reasoning: `rule: ${decision.reasoning}`, created_at: now().toISOString(),
            });
            if (decision.matched) {
              for (const draft of draftProposals(article, promise, decision, now())) {
                const key = proposalKey(draft.kind, row.slug, promise.lineage, article.url);
                if (seen.has(key)) continue;
                seen.add(key);
                proposals.push({
                  id: stableId(['promise-news-proposal-v1', key]), kind: draft.kind,
                  project_slug: row.slug, lineage: promise.lineage, payload: draft.payload,
                  reasoning: draft.reasoning, article_url: article.url, article_title: article.title,
                });
              }
            }
            if (matchLog.length >= BATCH_SIZE || proposals.length >= BATCH_SIZE) await flush();
          }
        }
        await flush();
      }
      if (rankings.length < PAGE_SIZE) break;
    }
    if (!rankingsSeen) throw new Error('Published ledger run has no rankings');
    summary.status = summary.feed_errors.length ? 'partial' : 'completed';
    await finish(summary.feed_errors.length ? JSON.stringify(summary.feed_errors) : null, signal);
    return summary;
  } catch (error) {
    // A fresh bounded signal lets deadline failures record the failure itself.
    try {
      await finish(message(error), AbortSignal.timeout(10_000));
    } catch (recordError) {
      throw new Error(`${message(error)}; failure bookkeeping also failed: ${message(recordError)}`, { cause: error });
    }
    throw error;
  }
}
