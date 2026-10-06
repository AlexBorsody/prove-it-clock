/**
 * Promise-news scan runner: the shared core behind `npm run scan:news`
 * (scripts/scan-promise-news.ts) and the Vercel Cron route
 * (src/app/api/cron/scan-news/route.ts).
 *
 * One run: open promises x recent news. PROPOSAL-ONLY: it drafts evidence /
 * assessment / claim_repeated events with quoted sources into the review
 * queue. It never writes the published ledger. A human approves via
 * `npm run scan:review`; publication is what fires notifications.
 *
 * Promise-level subscribers DO get a push when a news article matches their
 * followed lineage (news_mention), since a mention is an observed fact, not
 * a judgment.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchNewsMentions } from "./news-mentions";
import { isSocialSlug, isStockSlug, STOCK_SOURCES } from "./social";
import { HEARTS_METHODOLOGY } from "./heart-data";
import { sendPush, webPushConfigured } from "./web-push";
import { copyForNewsMention, copyForResolutionLikely, type PushSubscriptionRecord } from "./push";
import {
  aiConfigured,
  aiJudgeBatch,
  draftProposals,
  extractKeywords,
  matchLineage,
  type AiJudgment,
  type DraftProposal,
  type MatchDecision,
  type NewsArticle,
  type OpenPromise,
} from "./scan";

export const PROPOSAL_DIR = join(process.cwd(), "..", "db", "research", "scan-proposals");

export interface StoredProposal extends DraftProposal {
  id: string;
  project_slug: string;
  article_url: string;
  article_title: string;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
}

export interface ScanOptions {
  dryRun?: boolean;
  /** Write the JSON run file (CLI). Serverless cron sets false. */
  persistRunFile?: boolean;
  /** Dedupe against pending rows in scan_proposals (cron). CLI uses the JSON queue. */
  dedupeFromDb?: boolean;
  /**
   * Live scans must not silently fall back to keywords when the AI is
   * unconfigured: throw instead. The CLI defaults to false (local runs may
   * lack SCANNER_AI_*); the cron route passes true.
   */
  requireAi?: boolean;
  log?: (message: string) => void;
}

export interface ScanSummary {
  projectsChecked: number;
  articlesSeen: number;
  proposalsCreated: number;
  pushesSent: number;
  runId: string | null;
  error?: string;
}

export async function openPromisesByProject(
  db: SupabaseClient,
): Promise<Record<string, { name: string; promises: OpenPromise[] }>> {
  const { data: run } = await db
    .from("heart_runs")
    .select("id")
    .eq("review_status", "published")
    .eq("methodology", HEARTS_METHODOLOGY)
    .order("as_of", { ascending: false })
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!run) throw new Error("No published ledger run found");
  const { data: rows, error } = await db.from("heart_rankings").select("slug, name, assessment").eq("run_id", run.id);
  if (error) throw new Error(`Could not read rankings: ${error.message}`);
  const out: Record<string, { name: string; promises: OpenPromise[] }> = {};
  for (const row of rows ?? []) {
    const promises = (
      (row.assessment as { promises?: Array<{ lineage?: string; criteria?: string; claim_type?: string; state?: string }> } | null)
        ?.promises ?? []
    )
      .filter((p) => p.lineage && ["open", "active"].includes(String(p.state ?? "").toLowerCase()))
      .map((p) => ({ lineage: p.lineage as string, criteria: p.criteria ?? (p.lineage as string), claimType: p.claim_type }));
    if (promises.length > 0) out[row.slug as string] = { name: (row.name as string) ?? row.slug, promises };
  }
  return out;
}

const STOCK_LEDGER_DIR = join(process.cwd(), "data", "stocks");

/** Latest event state for a stock lineage (events ordered by occurredOn). */
function stockLineageState(events: Array<{ occurredOn?: string; recordedAt?: string; state?: string }>): string {
  const sorted = [...(events ?? [])].sort((a, b) =>
    String(a.occurredOn ?? a.recordedAt ?? "").localeCompare(String(b.occurredOn ?? b.recordedAt ?? "")),
  );
  return String(sorted[sorted.length - 1]?.state ?? "").toLowerCase();
}

/**
 * Open stock promises from app/data/stocks/<slug>-ledger.json.
 * Same shape as openPromisesByProject so the scan loop treats stocks
 * and crypto identically (keyword first pass, AI judge, proposals, pushes).
 */
export function openStockPromises(): Record<string, { name: string; promises: OpenPromise[] }> {
  const out: Record<string, { name: string; promises: OpenPromise[] }> = {};
  if (!existsSync(STOCK_LEDGER_DIR)) return out;
  for (const file of readdirSync(STOCK_LEDGER_DIR)) {
    if (!file.endsWith("-ledger.json")) continue;
    try {
      const ledger = JSON.parse(readFileSync(join(STOCK_LEDGER_DIR, file), "utf8")) as {
        companySlug?: string;
        lineages?: Array<{
          id?: string; title?: string; claimCategory?: string;
          fulfillmentTest?: string; events?: Array<{ occurredOn?: string; recordedAt?: string; state?: string }>;
        }>;
      };
      const slug = ledger.companySlug ?? file.replace(/-ledger\.json$/, "");
      const name = STOCK_SOURCES[slug]?.name ?? slug;
      const promises: OpenPromise[] = [];
      for (const lineage of ledger.lineages ?? []) {
        if (!lineage.id) continue;
        if (!["open", "active", "at-risk"].includes(stockLineageState(lineage.events ?? []))) continue;
        promises.push({
          lineage: lineage.id,
          criteria: lineage.fulfillmentTest ?? lineage.title ?? lineage.id,
          claimType: lineage.claimCategory,
        });
      }
      if (promises.length > 0) out[slug] = { name, promises };
    } catch {
      /* skip unreadable ledgers */
    }
  }
  return out;
}

function pendingKeysFromFiles(): Set<string> {
  const keys = new Set<string>();
  if (!existsSync(PROPOSAL_DIR)) return keys;
  for (const file of readdirSync(PROPOSAL_DIR)) {
    if (!file.endsWith(".json")) continue;
    try {
      const run = JSON.parse(readFileSync(join(PROPOSAL_DIR, file), "utf8")) as { proposals?: StoredProposal[] };
      for (const p of run.proposals ?? []) {
        if (p.status === "pending") keys.add(`${p.kind}:${p.project_slug}:${p.lineage}:${p.article_url}`);
      }
    } catch {
      /* skip unreadable run files */
    }
  }
  return keys;
}

async function pendingKeysFromDb(db: SupabaseClient): Promise<Set<string>> {
  const keys = new Set<string>();
  const { data, error } = await db.from("scan_proposals").select("kind, project_slug, lineage, article_url").eq("status", "pending");
  if (error) throw new Error(`Could not read pending proposals: ${error.message}`);
  for (const p of data ?? []) {
    keys.add(`${p.kind}:${p.project_slug}:${p.lineage}:${p.article_url}`);
  }
  return keys;
}

export async function runPromiseNewsScan(
  db: SupabaseClient,
  canWriteDb: boolean,
  options: ScanOptions = {},
): Promise<ScanSummary> {
  const { dryRun = false, persistRunFile = true, dedupeFromDb = false, requireAi = false, log = () => {} } = options;
  const intervalHours = Number(process.env.SCAN_INTERVAL_HOURS ?? "1");
  log(`Promise-news scan (interval config: every ${intervalHours}h).${dryRun ? " DRY RUN." : ""}`);

  // Live scans require AI judgment: keywords alone are not enough, and a
  // silent fallback would quietly degrade the whole pipeline.
  if (requireAi && !aiConfigured()) {
    throw new Error(
      "AI judging is required for live scans but SCANNER_AI_URL / SCANNER_AI_API_KEY are not set. " +
        "Set them (Vercel env) or run the CLI without requireAi for a keyword-only local pass.",
    );
  }
  const aiEnabled = aiConfigured();
  if (!aiEnabled) {
    log("AI judging not configured; keyword-only pass (live scans require SCANNER_AI_URL / SCANNER_AI_API_KEY).");
  }

  let runId: string | null = null;
  if (canWriteDb) {
    const { data } = await db.from("scan_runs").insert({}).select("id").maybeSingle();
    runId = data?.id ?? null;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const proposals: StoredProposal[] = [];
  const matchLog: Array<Record<string, unknown>> = [];
  const dbProposals: Array<Record<string, unknown>> = [];
  const dbMatchLog: Array<Record<string, unknown>> = [];
  let articlesSeen = 0;
  let projectsChecked = 0;
  let pushesSent = 0;
  const seenProposals = dedupeFromDb ? await pendingKeysFromDb(db) : pendingKeysFromFiles();
  let propCounter = 0;

  let dbTablesMissing = false;
  /** Flush buffered DB writes in batches; per-decision inserts are too slow for an hourly job. */
  async function flushDbWrites() {
    if (!canWriteDb || dbTablesMissing) return;
    try {
      while (dbMatchLog.length > 0) {
        const batch = dbMatchLog.splice(0, 200);
        const { error } = await db.from("scan_match_log").insert(batch);
        if (error) throw new Error(`scan_match_log insert failed: ${error.message}`);
      }
      while (dbProposals.length > 0) {
        const batch = dbProposals.splice(0, 200);
        const { error } = await db.from("scan_proposals").insert(batch);
        if (error) throw new Error(`scan_proposals insert failed: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Could not find the table")) {
        // Migration 009 not applied yet: run JSON-only, keep the queue in files.
        dbTablesMissing = true;
        dbMatchLog.length = 0;
        dbProposals.length = 0;
        log("Scanner tables not in the database yet (apply db/migrations/009_push_notifications.sql); using the JSON queue only.");
      } else {
        throw err;
      }
    }
  }

  try {
    const projects = { ...(await openPromisesByProject(db)), ...openStockPromises() };
    const criteriaByProject: Record<string, Record<string, string>> = {};

    // Fetch all project feeds in parallel; sequential RSS fetches (12s timeout
    // each) would blow a serverless time budget.
    const feeds = await Promise.all(
      Object.entries(projects).map(async ([slug, { name, promises }]) => {
        if (!isSocialSlug(slug) && !isStockSlug(slug)) return null;
        criteriaByProject[slug] = Object.fromEntries(promises.map((p) => [p.lineage, p.criteria]));
        const projectTokens = extractKeywords(`${name} ${slug}`);
        try {
          const feed = await fetchNewsMentions(slug);
          return { slug, name, promises, projectTokens, articles: feed.articles as NewsArticle[] };
        } catch (err) {
          log(`News feed unavailable for ${slug}: ${err instanceof Error ? err.message : err}`);
          return null;
        }
      }),
    );

    for (const entry of feeds) {
      if (!entry) continue;
      const { slug, name, promises, projectTokens, articles } = entry;
      projectsChecked++;
      articlesSeen += articles.length;

      for (const article of articles) {
        // Rule-based pass over every promise (cheap). The AI pass below then
        // refines only the articles that show any rule signal at all.
        const pairs: Array<{ promise: OpenPromise; rule: MatchDecision }> = promises.map((promise) => ({
          promise,
          rule: matchLineage(article, promise, projectTokens),
        }));
        let aiJudgments = new Map<string, AiJudgment>();
        if (aiEnabled && pairs.some(({ rule }) => rule.matched || rule.hits >= 1)) {
          // ONE model call judges this article against every open promise of
          // the project (paraphrase, implication), and can veto weak keyword
          // matches. Articles with zero rule signal skip the model entirely.
          aiJudgments = await aiJudgeBatch(article, promises);
        }
        for (const { promise, rule } of pairs) {
          let matched = rule.matched;
          let reasoning = `rule: ${rule.reasoning}`;
          const judgment = aiJudgments.get(promise.lineage);
          if (judgment) {
            if (judgment.relevant && !matched) {
              matched = true;
              reasoning += ` ai: relevant (${judgment.reasoning})`;
            } else if (!judgment.relevant && matched) {
              matched = false;
              reasoning += ` ai veto: not relevant (${judgment.reasoning})`;
            } else {
              reasoning += ` ai agrees: ${judgment.relevant ? "relevant" : "not relevant"}`;
            }
          }
          const logEntry = {
            project_slug: slug,
            lineage: promise.lineage,
            article_url: article.url,
            article_title: article.title,
            matched,
            reasoning,
            created_at: new Date().toISOString(),
          };
          matchLog.push(logEntry);
          dbMatchLog.push(logEntry);
          if (dbMatchLog.length >= 200) await flushDbWrites();
          if (!matched) continue;

          let likelyDecisive = false;
          let proposedState = "";
          for (const draft of draftProposals(article, promise, {
            lineage: promise.lineage,
            matched: true,
            reasoning: rule.reasoning,
            hits: rule.hits,
          })) {
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
            // Auto-approve high-confidence AI assessments for set-and-forget operation.
            // The AI judge must have marked this as relevant with high confidence
            // and a clear fulfilled/lapsed assessment.
            const aiJudgment = aiJudgments.get(promise.lineage);
            const autoApprove = aiJudgment?.relevant === true &&
              aiJudgment.confidence === "high" &&
              (aiJudgment.assessment === "fulfilled" || aiJudgment.assessment === "lapsed") &&
              draft.kind === "assessment";
            const stored: StoredProposal = {
              ...draft,
              id: `prop-${stamp}-${++propCounter}`,
              project_slug: slug,
              article_url: article.url,
              article_title: article.title,
              status: autoApprove ? "approved" : "pending",
              review_note: autoApprove ? `Auto-approved: AI high-confidence ${aiJudgment.assessment} (${aiJudgment.reasoning})` : null,
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
          if (!dryRun && webPushConfigured()) {
            const newsKey = "news:" + createHash("sha256").update(article.url).digest("hex").slice(0, 32);
            const { data: subs } = await db
              .from("push_subscriptions")
              .select("id, endpoint, p256dh, auth, scope")
              .eq("scope->>project_slug", slug)
              .eq("scope->>lineage", promise.lineage);
            const { data: done } = await db
              .from("push_deliveries")
              .select("subscription_id")
              .eq("revision_key", newsKey)
              .eq("kind", "news_mention");
            const doneSet = new Set((done ?? []).map((d) => d.subscription_id as string));
            for (const sub of (subs ?? []) as PushSubscriptionRecord[]) {
              if (doneSet.has(sub.id)) continue;
              const payload = copyForNewsMention(slug, name, promise.lineage, criteriaByProject[slug], article);
              const result = await sendPush(sub, payload);
              if (result.gone) {
                await db.from("push_subscriptions").delete().eq("id", sub.id);
                continue;
              }
              await db.from("push_deliveries").insert({ subscription_id: sub.id, revision_key: newsKey, kind: "news_mention" });
              pushesSent++;
            }

            // Coin-level news tiers: "any mention" and "likely decisive".
            const coinTiers: Array<{ kind: "news" | "resolution"; deliveryKind: string }> = [
              { kind: "news", deliveryKind: "news_mention" },
            ];
            if (likelyDecisive) coinTiers.push({ kind: "resolution", deliveryKind: "resolution_likely" });
            for (const tier of coinTiers) {
              const { data: coinSubs } = await db
                .from("push_subscriptions")
                .select("id, endpoint, p256dh, auth, scope")
                .eq("scope->>project_slug", slug)
                .eq("scope->>kind", tier.kind);
              const { data: coinDone } = await db
                .from("push_deliveries")
                .select("subscription_id")
                .eq("revision_key", newsKey)
                .eq("kind", tier.deliveryKind);
              const coinDoneSet = new Set((coinDone ?? []).map((d) => d.subscription_id as string));
              for (const sub of (coinSubs ?? []) as PushSubscriptionRecord[]) {
                if (coinDoneSet.has(sub.id)) continue;
                const payload =
                  tier.kind === "resolution"
                    ? copyForResolutionLikely(slug, name, promise.lineage, criteriaByProject[slug], article, proposedState || "decisive")
                    : copyForNewsMention(slug, name, promise.lineage, criteriaByProject[slug], article);
                const result = await sendPush(sub, payload);
                if (result.gone) {
                  await db.from("push_subscriptions").delete().eq("id", sub.id);
                  continue;
                }
                await db.from("push_deliveries").insert({ subscription_id: sub.id, revision_key: newsKey, kind: tier.deliveryKind });
                pushesSent++;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    if (canWriteDb && runId) {
      await db
        .from("scan_runs")
        .update({ finished_at: new Date().toISOString(), error: err instanceof Error ? err.message : String(err) })
        .eq("id", runId);
    }
    throw err;
  }

  await flushDbWrites();
  if (persistRunFile) {
    mkdirSync(PROPOSAL_DIR, { recursive: true });
    const runFile = join(PROPOSAL_DIR, `${stamp}.json`);
    writeFileSync(
      runFile,
      JSON.stringify(
        {
          run_id: runId,
          started_at: stamp,
          interval_hours: intervalHours,
          projects_checked: projectsChecked,
          articles_seen: articlesSeen,
          proposals_created: proposals.length,
          pushes_sent: pushesSent,
          proposals,
          match_log: matchLog,
        },
        null,
        2,
      ),
    );
  }
  if (canWriteDb && runId) {
    await db
      .from("scan_runs")
      .update({
        finished_at: new Date().toISOString(),
        projects_checked: projectsChecked,
        articles_seen: articlesSeen,
        proposals_created: proposals.length,
        pushes_sent: pushesSent,
      })
      .eq("id", runId);
  }
  return { projectsChecked, articlesSeen, proposalsCreated: proposals.length, pushesSent, runId };
}
