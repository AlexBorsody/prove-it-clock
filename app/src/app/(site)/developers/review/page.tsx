/**
 * Internal review queue for scanner proposals. Minimal, human-facing.
 * Reads pending proposals from the scan_proposals table (migration 009);
 * falls back to the JSON queue for local runs without the database.
 * Approval happens through the CLI (npm run scan:review) and the normal
 * publication flow; this page is the read view. Nothing here touches the
 * published ledger.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Proposal {
  id: string;
  kind: string;
  project_slug: string;
  lineage: string;
  reasoning: string;
  article_url: string | null;
  article_title: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
}

function loadPendingFromJson(): Proposal[] {
  // Scanner writes to <repo>/db/research/scan-proposals; the app runs from <repo>/app.
  const dir = join(process.cwd(), "..", "db", "research", "scan-proposals");
  if (!existsSync(dir)) return [];
  const out: Proposal[] = [];
  for (const file of readdirSync(dir).sort().reverse()) {
    if (!file.endsWith(".json")) continue;
    try {
      const run = JSON.parse(readFileSync(join(dir, file), "utf8"));
      for (const p of run.proposals ?? []) {
        if (p.status === "pending") out.push(p);
      }
    } catch {
      /* skip */
    }
  }
  return out;
}

async function loadPending(): Promise<{ proposals: Proposal[]; source: string }> {
  try {
    const db = getSupabase();
    const { data, error } = await db
      .from("scan_proposals")
      .select("id, kind, project_slug, lineage, reasoning, article_url, article_title, status, review_note, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { proposals: (data ?? []) as Proposal[], source: "database" };
  } catch {
    return { proposals: loadPendingFromJson(), source: "local JSON queue" };
  }
}

export default async function ReviewPage() {
  const { proposals: pending, source } = await loadPending();
  return (
    <>
      <h1 className="page-title">Scanner review queue</h1>
      <p className="page-sub">
        Machine-drafted evidence and assessment proposals ({source}). Nothing here touches
        the published ledger. Review in the terminal: npm run scan:review -- list
      </p>
      <div className="panel">
        {pending.length === 0 ? (
          <p>No pending proposals.</p>
        ) : (
          <ul>
            {pending.map((p) => (
              <li key={p.id} style={{ marginBottom: 16 }}>
                <strong>{p.id}</strong> [{p.kind}] {p.project_slug}/{p.lineage}
                <br />
                {p.article_url ? (
                  <a href={p.article_url} target="_blank" rel="noreferrer">{p.article_title ?? p.article_url}</a>
                ) : (
                  <span>{p.article_title}</span>
                )}
                <br />
                <span>{p.reasoning}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
