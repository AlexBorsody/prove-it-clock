import type { CSSProperties } from 'react';
import {
  lineageAssessment,
  lineageRevisions,
  lineageState,
  sourceHref,
  sourceIsPrimary,
  dateLabel,
  type StockLedgerEvent,
  type StockLineage,
} from '@/lib/stocks/ledger';
import { searchMeta } from '@/lib/search-sections';

const STATE_TONE: Record<string, { label: string; style: CSSProperties }> = {
  fulfilled: { label: 'Delivered', style: { color: 'var(--green)' } },
  missed: { label: 'Missed', style: { color: 'var(--red)' } },
  withdrawn: { label: 'Withdrawn', style: { color: 'var(--text-faint)' } },
  superseded: { label: 'Superseded', style: { color: 'var(--text-faint)' } },
  active: { label: 'Active', style: { color: 'var(--text)' } },
  unknown: { label: 'Unknown', style: { color: 'var(--text-faint)' } },
  open: { label: 'Open', style: { color: 'var(--text-faint)' } },
};

function SourceLink({ event }: { event: StockLedgerEvent }) {
  return (
    <a
      href={sourceHref(event.source.url) ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      {event.source.title}
    </a>
  );
}

function ClaimEvent({ event }: { event: StockLedgerEvent }) {
  return (
    <li>
      <div>
        <strong>{event.occurredOn}</strong>
        {event.speaker ? `, ${event.speaker}` : ''}
        {event.speakerCapacity ? ` (${event.speakerCapacity})` : ''}:{' '}
        {event.summary}
      </div>
      {event.targetValue ? (
        <div className="comp-desc" style={{ marginTop: 4 }}>
          Target: {event.targetValue}
        </div>
      ) : null}
      {event.revisionReason ? (
        <div className="comp-desc" style={{ marginTop: 4 }}>
          Why revised: {event.revisionReason}
        </div>
      ) : null}
      {event.deadline && (
        <p className="comp-desc">Target date: {dateLabel(event.deadline)}</p>
      )}
      {event.source.locator && (
        <p className="comp-desc">Location: {event.source.locator}</p>
      )}
      {!sourceIsPrimary(event) && (
        <p className="comp-desc">
          Secondary source. Original statement needs verification.
        </p>
      )}
      {event.source.quote ? (
        <blockquote className="comp-desc" style={{ marginTop: 4 }}>
          <small>Quoted in the linked source</small>
          <br />
          &ldquo;{event.source.quote}&rdquo;
        </blockquote>
      ) : null}
      <div className="comp-desc" style={{ marginTop: 4 }}>
        Source: <SourceLink event={event} />
      </div>
    </li>
  );
}

function ClaimRow({
  lineage,
  slug,
  name,
}: {
  lineage: StockLineage;
  slug: string;
  name: string;
}) {
  const state = lineageState(lineage);
  const assessment = lineageAssessment(lineage);
  const revisions = lineageRevisions(lineage);
  const evidence = lineage.events.filter((e) => e.kind === 'evidence');
  const tone = STATE_TONE[state] ?? STATE_TONE.open;
  const anchor = `stock-${slug}-${lineage.id}`;
  return (
    <div
      className="comp-row search-section"
      {...searchMeta({
        id: anchor,
        title: `${name}: ${lineage.title}`,
        kind: 'Stock claim',
        keywords: `${lineage.id} ${lineage.claimCategory} ${lineage.tags.join(' ')}`,
      })}
    >
      <div className="promise-head">
        <div className="comp-name">{lineage.title}</div>
      </div>
      <div className="comp-tags">
        <span className="tag" style={tone.style}>
          {tone.label}
        </span>
        <span className="tag na">{lineage.claimCategory}</span>
        {lineage.tags.map((t) => (
          <span className="tag na" key={t}>
            {t}
          </span>
        ))}
      </div>
      {assessment ? (
        <p className="comp-desc">{assessment.summary}</p>
      ) : (
        <p className="comp-desc">No assessment recorded.</p>
      )}
      <p className="comp-desc">
        {lineage.horizon
          ? {
              quarter: 'Quarterly',
              annual: 'Annual',
              multi_year: 'Multi-year',
              undated: 'Undated',
            }[lineage.horizon]
          : 'Horizon not recorded'}
      </p>
      <details className="comp-sources">
        <summary>Fulfillment test</summary>
        <p>
          {lineage.fulfillmentTest ??
            'No explicit fulfillment test is stored in this pilot record.'}
        </p>
      </details>
      <details className="comp-sources">
        <summary>Claim history</summary>
        <ul>
          {revisions.map((e) => (
            <ClaimEvent key={e.id} event={e} />
          ))}
        </ul>
      </details>
      {evidence.length > 0 ? (
        <details className="comp-sources">
          <summary>Outcome evidence</summary>
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
  const delivered = lineages.filter((l) => lineageState(l) === 'fulfilled');
  const open = lineages.filter((l) =>
    ['open', 'active'].includes(lineageState(l)),
  );
  const closed = lineages.filter((l) =>
    ['missed', 'withdrawn', 'superseded', 'unknown'].includes(lineageState(l)),
  );
  return (
    <div>
      {delivered.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>
            Delivered promises
          </h3>
          {delivered.map((lineage) => (
            <ClaimRow
              key={lineage.id}
              lineage={lineage}
              slug={slug}
              name={name}
            />
          ))}
        </>
      ) : null}
      {open.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>
            Open commitments
          </h3>
          {open.map((lineage) => (
            <ClaimRow
              key={lineage.id}
              lineage={lineage}
              slug={slug}
              name={name}
            />
          ))}
        </>
      ) : null}
      {closed.length > 0 ? (
        <>
          <h3 className="comp-name" style={{ marginTop: 16 }}>
            Other recorded outcomes
          </h3>
          {closed.map((lineage) => (
            <ClaimRow
              key={lineage.id}
              lineage={lineage}
              slug={slug}
              name={name}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
