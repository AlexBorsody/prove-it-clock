import type { CSSProperties } from "react";
import {
  lineageAssessment,
  lineageRevisions,
  lineageState,
  type StockLedgerEvent,
  type StockLineage,
} from "@/lib/stock-data";
import { searchMeta } from "@/lib/search-sections";

const STATE_TONE: Record<string, { label: string; style: CSSProperties }> = {
  fulfilled: { label: "Delivered", style: { color: "var(--green)" } },
  missed: { label: "Missed", style: { color: "var(--red)" } },
  withdrawn: { label: "Withdrawn", style: { color: "var(--text-faint)" } },
  superseded: { label: "Superseded", style: { color: "var(--text-faint)" } },
  active: { label: "Active", style: { color: "var(--text)" } },
  open: { label: "Open", style: { color: "var(--text-faint)" } },
};

function SourceLink({ event }: { event: StockLedgerEvent }) {
  return (
    <a href={event.source.url} target="_blank" rel="noreferrer">
      {event.source.title}
    </a>
  );
}

function ClaimEvent({ event }: { event: StockLedgerEvent }) {
  return (
    <li>
      <div>
        <strong>{event.occurredOn}</strong>
        {event.speaker ? `, ${event.speaker}` : ""}
        {event.speakerCapacity ? ` (${event.speakerCapacity})` : ""}: {event.summary}
      </div>
      {event.targetValue ? (
        <div className="comp-desc" style={{ marginTop: 4 }}>Target: {event.targetValue}</div>
      ) : null}
      {event.revisionReason ? (
        <div className="comp-desc" style={{ marginTop: 4 }}>Why revised: {event.revisionReason}</div>
      ) : null}
      {event.source.quote ? (
        <blockquote className="comp-desc" style={{ marginTop: 4 }}>&ldquo;{event.source.quote}&rdquo;</blockquote>
      ) : null}
      <div className="comp-desc" style={{ marginTop: 4 }}>
        Source: <SourceLink event={event} />
      </div>
    </li>
  );
}

function ClaimRow({ lineage, slug, name }: { lineage: StockLineage; slug: string; name: string }) {
  const state = lineageState(lineage);
  const assessment = lineageAssessment(lineage);
  const revisions = lineageRevisions(lineage);
  const evidence = lineage.events.filter((e) => e.kind === "evidence");
  const tone = STATE_TONE[state] ?? STATE_TONE.open;
  const anchor = `stock-${slug}-${lineage.id}`;
  return (
    <div className="comp-row search-section" {...searchMeta({ id: anchor, title: `${name}: ${lineage.title}`, kind: "Stock claim", keywords: `${lineage.id} ${lineage.claimCategory} ${lineage.tags.join(" ")}` })}>
      <div className="promise-head">
        <div className="comp-name">{lineage.title}</div>
      </div>
      <div className="comp-tags">
        <span className="tag" style={tone.style}>{tone.label}</span>
        <span className="tag na">{lineage.claimCategory}</span>
        {lineage.tags.map((t) => (
          <span className="tag na" key={t}>{t}</span>
        ))}
      </div>
      {assessment ? <p className="comp-desc">{assessment.summary}</p> : null}
      <details className="comp-sources">
        <summary>Claim history ({revisions.length})</summary>
        <ul>
          {revisions.map((e) => (
            <ClaimEvent key={e.id} event={e} />
          ))}
        </ul>
      </details>
      {evidence.length > 0 ? (
        <details className="comp-sources">
          <summary>Evidence ({evidence.length})</summary>
          <ul>
            {evidence.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.occurredOn}</strong>: {e.summary}
                </div>
                <div className="comp-desc" style={{ marginTop: 4 }}>
                  Source: <SourceLink event={e} />
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

/** The stock claim ledger: every management claim, its revision history,
 *  the evidence, and the assessment. Green = delivered, red = missed,
 *  grey = still open. Grouped into the three layers from the v1 scope:
 *  delivered promises, open commitments, closed without delivery. */
export default function StockClaimList({
  slug,
  name,
  lineages,
}: {
  slug: string;
  name: string;
  lineages: StockLineage[];
}) {
  if (lineages.length === 0) {
    return (
      <div className="panel">
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          No researched claims for {name} yet.
        </p>
      </div>
    );
  }
  const states = lineages.map(lineageState);
  const count = (s: string) => states.filter((x) => x === s).length;
  const delivered = lineages.filter((l) => lineageState(l) === "fulfilled");
  const open = lineages.filter((l) => ["open", "active"].includes(lineageState(l)));
  const closed = lineages.filter((l) => ["missed", "withdrawn", "superseded"].includes(lineageState(l)));
  return (
    <div>
      <p className="panel-sub">
        Promise record: {count("fulfilled")} delivered · {count("open") + count("active")} open ·{" "}
        {count("missed")} missed · {count("withdrawn")} withdrawn
      </p>
      {delivered.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>Delivered promises</h3>
          {delivered.map((lineage) => (
            <ClaimRow key={lineage.id} lineage={lineage} slug={slug} name={name} />
          ))}
        </>
      ) : null}
      {open.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>Open commitments</h3>
          {open.map((lineage) => (
            <ClaimRow key={lineage.id} lineage={lineage} slug={slug} name={name} />
          ))}
        </>
      ) : null}
      {closed.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>Closed without delivery</h3>
          {closed.map((lineage) => (
            <ClaimRow key={lineage.id} lineage={lineage} slug={slug} name={name} />
          ))}
        </>
      ) : null}
    </div>
  );
}
