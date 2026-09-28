/**
 * Live AI status-change scanner. One run: open promises x recent news.
 *
 * Usage: npm run scan:news [--dry-run]
 *
 * Interval is config, not code: SCAN_INTERVAL_HOURS (default 1). Schedule
 * this script externally (cron) at that interval.
 *
 * PROPOSAL-ONLY: the scanner drafts evidence / assessment / claim_repeated
 * events with quoted sources into the review queue. It never writes the
 * published ledger. A human approves via `npm run scan:review`; publication
 * is what fires notifications.
 *
 * Promise-level subscribers DO get a push when a news article matches their
 * followed lineage (news_mention), since a mention is an observed fact, not
 * a judgment.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { fetchNewsMentions } from '../src/lib/news-mentions';
import { isSocialSlug } from '../src/lib/social';
import { HEARTS_METHODOLOGY } from '../src/lib/heart-data';
import { webPushConfigured } from '../src/lib/web-push';
import { deliverPushOnce } from '../src/lib/push-delivery';
import { copyForNewsMention, copyForResolutionLikely, validateScope, type PushScope, type PushSubscriptionRecord } from '../src/lib/push';
import {
  aiJudge,
  draftProposals,
  extractKeywords,
  matchLineage,
  type DraftProposal,
  type NewsArticle,
  type OpenPromise,
} from '../src/lib/scan';

const PROPOSAL_DIR = join(__dirname, '..', '..', 'db', 'research', 'scan-proposals');

function matchesScope(subscription: PushSubscriptionRecord, expected: PushScope): boolean {
  try {
    const scope = validateScope(subscription.scope);
    return scope.project_slug === expected.project_slug
      && scope.lineage === expected.lineage && scope.kind === expected.kind;
  } catch {
    return false;
  }
}

function env(): { url: string; key: string } | null {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

interface StoredProposal extends DraftProposal {
  id: string;
  project_slug: string;
  article_url: string;
  article_title: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
}

async function openPromisesByProject(db: SupabaseClient): Promise<Record<string, { name: string; promises: OpenPromise[] }>> {
  const { data: run, error: runError } = await db
    .from('heart_runs')
    .select('id')
    .eq('review_status', 'published')
    .eq('methodology', HEARTS_METHODOLOGY)
    .order('as_of', { ascending: false })
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (runError) throw new Error(`Could not read published ledger: ${runError.message}`);
  if (!run) throw new Error('No published ledger run found');
  const { data: rows, error } = await db
    .from('heart_rankings')
    .select('slug, name, assessment')
    .eq('run_id', run.id);
  if (error) throw new Error(`Could not read rankings: ${error.message}`);
  const out: Record<string, { name: string; promises: OpenPromise[] }> = {};
  for (const row of rows ?? []) {
    const promises = ((row.assessment as { promises?: Array<{ lineage?: string; criteria?: string; claim_type?: string; state?: string }> } | null)?.promises ?? [])
      .filter((p) => p.lineage && ['open', 'active'].includes(String(p.state ?? '').toLowerCase()))
      .map((p) => ({ lineage: p.lineage as string, criteria: p.criteria ?? p.lineage as string, claimType: p.claim_type }));
    if (promises.length > 0) out[row.slug as string] = { name: (row.name as string) ?? row.slug, promises };
  }
  return out;
}

function pendingKeys(): Set<string> {
  const keys = new Set<string>();
  if (!existsSync(PROPOSAL_DIR)) return keys;
  for (const file of readdirSync(PROPOSAL_DIR)) {
    if (!file.endsWith('.json')) continue;
    try {
      const run = JSON.parse(readFileSync(join(PROPOSAL_DIR, file), 'utf8')) as { proposals?: StoredProposal[] };
      for (const p of run.proposals ?? []) {
        if (p.status === 'pending') keys.add(`${p.kind}:${p.project_slug}:${p.lineage}:${p.article_url}`);
      }
    } catch { /* skip unreadable run files */ }
  }
  return keys;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const intervalHours = Number(process.env.SCAN_INTERVAL_HOURS ?? '1');
  console.log(`Promise-news scan (interval config: every ${intervalHours}h).${dryRun ? ' DRY RUN.' : ''}`);

  const creds = env();
  const db = creds ? createClient(creds.url, creds.key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  const canWriteDb = !dryRun && Boolean(creds && process.env.SUPABASE_SERVICE_ROLE_KEY);

  let runId: string | null = null;
  if (canWriteDb && db) {
    const { data, error } = await db.from('scan_runs').insert({}).select('id').single();
    if (error || !data) throw new Error(`Could not start scan run: ${error?.message ?? 'run missing'}`);
    runId = data?.id ?? null;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const proposals: StoredProposal[] = [];
  const matchLog: Array<Record<string, unknown>> = [];
  const dbProposals: Array<Record<string, unknown>> = [];
  const dbMatchLog: Array<Record<string, unknown>> = [];
  let articlesSeen = 0;
  let projectsChecked = 0;
  let pushesSent = 0;
  const seenProposals = pendingKeys();
  let propCounter = 0;

  let dbTablesMissing = false;
  /** Flush buffered DB writes in batches; per-decision inserts are too slow for an hourly job. */
  async function flushDbWrites() {
    if (!canWriteDb || !db || dbTablesMissing) return;
    try {
      while (dbMatchLog.length > 0) {
        const batch = dbMatchLog.splice(0, 200);
        const { error } = await db.from('scan_match_log').insert(batch);
        if (error) throw new Error(`scan_match_log insert failed: ${error.message}`);
      }
      while (dbProposals.length > 0) {
        const batch = dbProposals.splice(0, 200);
        const { error } = await db.from('scan_proposals').insert(batch);
        if (error) throw new Error(`scan_proposals insert failed: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Could not find the table")) {
        // Migration 009 not applied yet: run JSON-only, keep the queue in files.
        dbTablesMissing = true;
        dbMatchLog.length = 0;
        dbProposals.length = 0;
        console.log('Scanner tables not in the database yet (apply db/migrations/009_push_notifications.sql); using the JSON queue only.');
      } else {
        throw err;
      }
    }
  }

  try {
    if (!db) throw new Error('SUPABASE_URL and a Supabase key are required to read the published ledger');
    const projects = await openPromisesByProject(db);
    const criteriaByProject: Record<string, Record<string, string>> = {};

    for (const [slug, { name, promises }] of Object.entries(projects)) {
      if (!isSocialSlug(slug)) continue;
      projectsChecked++;
      criteriaByProject[slug] = Object.fromEntries(promises.map((p) => [p.lineage, p.criteria]));
      // Project-name tokens never count as promise-specific match keywords.
      const projectTokens = extractKeywords(`${name} ${slug}`);
      let articles: NewsArticle[] = [];
      try {
        const feed = await fetchNewsMentions(slug);
        articles = feed.articles;
      } catch (err) {
        console.log(`News feed unavailable for ${slug}: ${err instanceof Error ? err.message : err}`);
        continue;
      }
      articlesSeen += articles.length;

      for (const article of articles) {
        for (const promise of promises) {
          const rule = matchLineage(article, promise, projectTokens);
          let matched = rule.matched;
          let reasoning = `rule: ${rule.reasoning}`;
          // The AI refines relevance where keywords fall short (paraphrase,
          // implication) and can veto a weak keyword match.
          const judgment = await aiJudge(article, promise);
          if (judgment) {
            if (judgment.relevant && !matched) {
              matched = true;
              reasoning += ` ai: relevant (${judgment.reasoning})`;
            } else if (!judgment.relevant && matched) {
              matched = false;
              reasoning += ` ai veto: not relevant (${judgment.reasoning})`;
            } else {
              reasoning += ` ai agrees: ${judgment.relevant ? 'relevant' : 'not relevant'}`;
            }
          }
          const entry = {
            project_slug: slug,
            lineage: promise.lineage,
            article_url: article.url,
            article_title: article.title,
            matched,
            reasoning,
            created_at: new Date().toISOString(),
          };
          matchLog.push(entry);
          dbMatchLog.push(entry);
          if (dbMatchLog.length >= 200) await flushDbWrites();
          if (!matched) continue;

          let likelyDecisive = false;
          let proposedState = "";
          for (const draft of draftProposals(article, promise, { lineage: promise.lineage, matched: true, reasoning: rule.reasoning })) {
            const key = `${draft.kind}:${slug}:${promise.lineage}:${article.url}`;
            if (seenProposals.has(key)) {
              // Already stored this run: still counts as a decisive signal.
              if (draft.kind === "assessment") {
                likelyDecisive = true;
                proposedState = (draft.payload as { state?: string }).state ?? "";
              }
              continue;
            }
            seenProposals.add(key);
            if (draft.kind === "assessment") {
              likelyDecisive = true;
              proposedState = (draft.payload as { state?: string }).state ?? "";
            }
            const stored: StoredProposal = {
              ...draft,
              id: `prop-${stamp}-${++propCounter}`,
              project_slug: slug,
              article_url: article.url,
              article_title: article.title,
              status: 'pending',
              review_note: null,
              created_at: new Date().toISOString(),
            };
            proposals.push(stored);
            dbProposals.push({
              kind: stored.kind,
              project_slug: slug,
              lineage: promise.lineage,
              payload: stored.payload,
              reasoning: stored.reasoning,
              article_url: article.url,
              article_title: article.title,
            });
          }

          // News mention push: an observed fact for promise-level followers.
          if (!dryRun && webPushConfigured() && canWriteDb && db) {
            const newsKey = 'news:' + createHash('sha256').update(article.url).digest('hex').slice(0, 32);
            const { data: subs, error: subsError } = await db
              .from('push_subscriptions')
              .select('id, endpoint, p256dh, auth, scope')
              .eq('scope->>project_slug', slug)
              .eq('scope->>lineage', promise.lineage)
              .is('scope->>kind', null);
            if (subsError) throw new Error(`Could not read promise subscriptions: ${subsError.message}`);
            for (const sub of (subs ?? []) as PushSubscriptionRecord[]) {
              if (!matchesScope(sub, { project_slug: slug, lineage: promise.lineage })) continue;
              const payload = copyForNewsMention(slug, name, promise.lineage, criteriaByProject[slug], article);
              const result = await deliverPushOnce(db, sub, newsKey, 'news_mention', payload);
              if (result === 'sent') pushesSent++;
            }

            // Coin-level news tiers: "any mention" and "likely decisive".
            const coinTiers: Array<{ kind: 'news' | 'resolution'; deliveryKind: 'news_mention' | 'resolution_likely' }> = [{ kind: 'news', deliveryKind: 'news_mention' }];
            if (likelyDecisive) coinTiers.push({ kind: 'resolution', deliveryKind: 'resolution_likely' });
            for (const tier of coinTiers) {
              const { data: coinSubs, error: coinSubsError } = await db
                .from('push_subscriptions')
                .select('id, endpoint, p256dh, auth, scope')
                .eq('scope->>project_slug', slug)
                .eq('scope->>kind', tier.kind)
                .is('scope->>lineage', null);
              if (coinSubsError) throw new Error(`Could not read news subscriptions: ${coinSubsError.message}`);
              for (const sub of (coinSubs ?? []) as PushSubscriptionRecord[]) {
                if (!matchesScope(sub, { project_slug: slug, kind: tier.kind })) continue;
                const payload =
                  tier.kind === 'resolution'
                    ? copyForResolutionLikely(slug, name, promise.lineage, criteriaByProject[slug], article, proposedState || 'decisive')
                    : copyForNewsMention(slug, name, promise.lineage, criteriaByProject[slug], article);
                const result = await deliverPushOnce(db, sub, newsKey, tier.deliveryKind, payload);
                if (result === 'sent') pushesSent++;
              }
            }
          }
        }
      }
    }
    await flushDbWrites();
  } catch (err) {
    if (canWriteDb && db && runId) {
      const { error } = await db.from('scan_runs').update({ finished_at: new Date().toISOString(), error: err instanceof Error ? err.message : String(err) }).eq('id', runId);
      if (error) throw new Error(`Scan failed and its failure could not be recorded: ${error.message}`, { cause: err });
    }
    throw err;
  }

  mkdirSync(PROPOSAL_DIR, { recursive: true });
  const runFile = join(PROPOSAL_DIR, `${stamp}.json`);
  writeFileSync(runFile, JSON.stringify({
    run_id: runId,
    started_at: stamp,
    interval_hours: intervalHours,
    projects_checked: projectsChecked,
    articles_seen: articlesSeen,
    proposals_created: proposals.length,
    pushes_sent: pushesSent,
    proposals,
    match_log: matchLog,
  }, null, 2));
  if (canWriteDb && db && runId) {
    const { error } = await db.from('scan_runs').update({
      finished_at: new Date().toISOString(),
      projects_checked: projectsChecked,
      articles_seen: articlesSeen,
      proposals_created: proposals.length,
      pushes_sent: pushesSent,
    }).eq('id', runId);
    if (error) throw new Error(`Could not finish scan run: ${error.message}`);
  }
  console.log(`Scan complete: ${projectsChecked} projects, ${articlesSeen} articles, ${proposals.length} proposals, ${pushesSent} news pushes. Queue: ${runFile}`);
  console.log('Review with: npm run scan:review -- list');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Scan failed');
  process.exitCode = 1;
});
