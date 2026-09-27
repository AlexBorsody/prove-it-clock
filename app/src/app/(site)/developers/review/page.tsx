/**
 * Internal review queue for scanner proposals. Minimal, human-facing.
 * Approval happens through the CLI (npm run scan:review) and the normal
 * publication flow; this page is the read view.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";

interface Proposal {
  id: string;
  kind: string;
  project_slug: string;
  lineage: string;
  reasoning: string;
  article_url: string;
  article_title: string;
  status: string;
  review_note: string | null;
  created_at: string;
}

function loadPending(): Proposal[] {
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

export default function ReviewPage() {
  const pending = loadPending();
  return (
    <>
      <h1 className="page-title">Scanner review queue</h1>
      <p className="page-sub">
        Machine-drafted evidence and assessment proposals. Nothing here touches
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
                <a href={p.article_url} target="_blank" rel="noreferrer">{p.article_title}</a>
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
