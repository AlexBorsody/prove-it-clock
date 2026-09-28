'use client';

import { useEffect, useRef, useState } from 'react';
import StockClaimList from './stock-claim-list';
import {
  dateLabel,
  EVENT_LABELS,
  STATE_LABELS,
  lineageState,
  sourceHref,
  sourceIsPrimary,
  type StockLineage,
  type StockLedgerEvent,
} from '@/lib/stocks/ledger';
import {
  timelinePoints,
  timelineDomain,
  type DateAxis,
} from '@/lib/stocks/timeline';
import styles from './stocks.module.css';

const COLORS: Record<string, string> = {
  claim_stated: 'var(--blue)',
  claim_repeated: 'var(--blue)',
  claim_revised: 'var(--purple)',
  evidence: 'var(--accent)',
  assessment: 'var(--text-dim)',
};
const HORIZONS = {
  quarter: 'Quarterly',
  annual: 'Annual',
  multi_year: 'Multi-year',
  undated: 'Undated',
};
const eventLabel = (e: StockLedgerEvent) =>
  e.kind === 'assessment'
    ? `Assessment: ${STATE_LABELS[e.state ?? 'unknown'] ?? 'Unknown'}`
    : (EVENT_LABELS[e.kind] ?? e.kind);

export default function StockEvidenceExplorer({
  lineages,
  slug,
  name,
}: {
  lineages: StockLineage[];
  slug: string;
  name: string;
}) {
  const [category, setCategory] = useState('all');
  const [horizon, setHorizon] = useState('all');
  const [state, setState] = useState('all');
  const [search, setSearch] = useState('');
  const [axis, setAxis] = useState<DateAxis>('occurred');
  const [selected, setSelected] = useState<string | null>(null);
  const detail = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  function selectEvent(id: string, element?: HTMLElement | SVGElement) {
    if (element) trigger.current = element;
    setSelected(id);
  }
  function closeEvent() {
    setSelected(null);
    trigger.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    if (selected && detail.current) {
      detail.current.scrollIntoView({ block: 'nearest' });
      detail.current.focus({ preventScroll: true });
    }
  }, [selected]);
  const matches = lineages.filter(
    (l) =>
      (category === 'all' || l.claimCategory === category) &&
      (horizon === 'all' || l.horizon === horizon) &&
      (state === 'all' || lineageState(l) === state) &&
      `${l.title} ${l.tags.join(' ')} ${l.events.map((e) => e.summary).join(' ')}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const ids = new Set(matches.map((l) => l.id));
  const points = timelinePoints(lineages, axis);
  const [min, max] = timelineDomain(points);
  const x = (date: number) => 260 + ((date - min) / (max - min)) * 700;
  const allEvents = lineages.flatMap((lineage) =>
    lineage.events.map((event) => ({ lineage, event })),
  );
  const selection = allEvents.find(
    (p) => p.event.id === selected && ids.has(p.lineage.id),
  );
  const previous =
    selection &&
    allEvents.find(
      (p) =>
        p.lineage.id === selection.lineage.id &&
        p.event.id ===
          (selection.event.supersedes ?? selection.event.originalId),
    );
  const href = selection && sourceHref(selection.event.source.url);
  const filteredEvents = allEvents
    .filter((p) => ids.has(p.lineage.id))
    .sort((a, b) =>
      (axis === 'recorded'
        ? (a.event.recordedAt ?? '')
        : a.event.occurredOn
      ).localeCompare(
        axis === 'recorded' ? (b.event.recordedAt ?? '') : b.event.occurredOn,
      ),
    );
  const categories = [...new Set(lineages.map((l) => l.claimCategory))];
  // Stack coincident markers vertically; dates always retain their true x position.
  const rows = lineages.map((lineage) => {
    const levels: number[] = [];
    const events = points
      .filter((p) => p.lineage.id === lineage.id)
      .sort((a, b) => a.start - b.start)
      .map((p) => {
        const center = x((p.start + p.end) / 2);
        let level = levels.findIndex((right) => center - right >= 24);
        if (level < 0) level = levels.length;
        levels[level] = x(p.end);
        return { ...p, center, level };
      });
    return { lineage, events, height: Math.max(66, levels.length * 26 + 28) };
  });
  let nextY = 58;
  const placed = rows.map((row) => {
    const y = nextY;
    nextY += row.height;
    return { ...row, y };
  });
  const reset = () => {
    setCategory('all');
    setHorizon('all');
    setState('all');
    setSearch('');
  };

  return (
    <>
      <section
        id="accountability-timeline"
        className={styles.section}
        aria-labelledby="timeline-title"
      >
        <h2 id="timeline-title">Accountability timeline</h2>
        <p className={styles.muted}>
          Follow a commitment from its original target through revisions and
          recorded outcomes. Select an event to see its source.
        </p>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Horizon
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
              >
                <option value="all">All horizons</option>
                {Object.entries(HORIZONS).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Recorded outcome
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="all">All outcomes</option>
                {Object.entries(STATE_LABELS).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search commitments
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
              />
            </label>
            <button type="button" onClick={reset}>
              Reset filters
            </button>
          </div>
        </div>
        {matches.length === 0 ? (
          <p role="status">No commitments match these filters.</p>
        ) : (
          <>
            <div className={styles.filters}>
              <label>
                Date axis
                <select
                  value={axis}
                  onChange={(e) => setAxis(e.target.value as DateAxis)}
                >
                  <option value="occurred">When it happened</option>
                  <option value="recorded">When we recorded it</option>
                </select>
              </label>
            </div>
            <p className={styles.muted}>
              {axis === 'occurred'
                ? 'Positions use the event dates in the pilot record. Date ranges show month or year precision.'
                : 'Recording dates show when this research was captured, not when it was known to the market.'}
            </p>
            <div
              className={styles.plotScroll}
              tabIndex={0}
              role="region"
              aria-label="Scrollable commitment timeline"
            >
              <svg
                className={styles.plot}
                viewBox={`0 0 1000 ${nextY + 12}`}
                role="group"
                aria-label={`${name} commitment timeline. A text event list follows.`}
              >
                {Array.from(
                  { length: 6 },
                  (_, i) => min + ((max - min) * i) / 5,
                ).map((date) => (
                  <g key={date}>
                    <line
                      x1={x(date)}
                      x2={x(date)}
                      y1={36}
                      y2={nextY}
                      stroke="var(--border)"
                    />
                    <text
                      x={x(date)}
                      y={24}
                      fill="var(--text-dim)"
                      fontSize={12}
                      textAnchor="middle"
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: max - min < 365 * 86400000 ? 'numeric' : undefined,
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </text>
                  </g>
                ))}
                {placed.map((row) => (
                  <g
                    key={row.lineage.id}
                    aria-hidden={!ids.has(row.lineage.id)}
                    opacity={ids.has(row.lineage.id) ? 1 : 0.15}
                  >
                    <text
                      x={16}
                      y={row.y + 22}
                      fill="var(--text)"
                      fontSize={13}
                    >
                      <title>{row.lineage.title}</title>
                      {row.lineage.title.length > 32
                        ? `${row.lineage.title.slice(0, 31)}…`
                        : row.lineage.title}
                    </text>
                    <line
                      x1={260}
                      x2={960}
                      y1={row.y + row.height - 6}
                      y2={row.y + row.height - 6}
                      stroke="var(--border)"
                    />
                    {row.events.map((p) => (
                      <g
                        key={p.event.id}
                        role="button"
                        tabIndex={ids.has(row.lineage.id) ? 0 : -1}
                        aria-label={`${dateLabel(axis === 'recorded' ? p.event.recordedAt! : p.event.occurredOn)}: ${eventLabel(p.event)}, ${p.event.summary}`}
                        aria-pressed={selected === p.event.id}
                        style={{
                          cursor: ids.has(row.lineage.id)
                            ? 'pointer'
                            : 'default',
                        }}
                        onClick={(e) => {
                          if (ids.has(row.lineage.id))
                            selectEvent(p.event.id, e.currentTarget);
                        }}
                        onKeyDown={(e) => {
                          if (
                            (e.key === 'Enter' || e.key === ' ') &&
                            ids.has(row.lineage.id)
                          ) {
                            e.preventDefault();
                            selectEvent(p.event.id, e.currentTarget);
                          }
                        }}
                      >
                        <rect
                          x={p.center - 12}
                          y={row.y + 6 + p.level * 26}
                          width={24}
                          height={24}
                          fill="transparent"
                        />
                        {p.end > p.start && (
                          <line
                            x1={x(p.start)}
                            x2={x(p.end)}
                            y1={row.y + 18 + p.level * 26}
                            y2={row.y + 18 + p.level * 26}
                            stroke={COLORS[p.event.kind] ?? 'var(--text-dim)'}
                            strokeWidth={5}
                          />
                        )}
                        <circle
                          cx={p.center}
                          cy={row.y + 18 + p.level * 26}
                          r={7}
                          fill={COLORS[p.event.kind] ?? 'var(--text-dim)'}
                          stroke={
                            selected === p.event.id
                              ? 'var(--text)'
                              : 'var(--bg-panel)'
                          }
                          strokeWidth={selected === p.event.id ? 3 : 1}
                        />
                      </g>
                    ))}
                  </g>
                ))}
              </svg>
            </div>
            <div className={styles.legend}>
              {['claim_stated', 'claim_revised', 'evidence', 'assessment'].map(
                (kind) => (
                  <span key={kind}>
                    <i data-kind={kind} />
                    {EVENT_LABELS[kind]}
                  </span>
                ),
              )}
            </div>
            {selection && (
              <section
                ref={detail}
                tabIndex={-1}
                className={styles.eventDetail}
                aria-label="Selected timeline event"
              >
                <div className={styles.heading}>
                  <h3>{eventLabel(selection.event)}</h3>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={closeEvent}
                  >
                    Close
                  </button>
                </div>
                <p>
                  <strong>{selection.lineage.title}</strong>
                </p>
                <p>{selection.event.summary}</p>
                <dl>
                  <dt>Event date</dt>
                  <dd>{dateLabel(selection.event.occurredOn)}</dd>
                  <dt>Recorded</dt>
                  <dd>
                    {selection.event.recordedAt
                      ? dateLabel(selection.event.recordedAt)
                      : 'Not stored'}
                  </dd>
                  <dt>Source published</dt>
                  <dd>{dateLabel(selection.event.source.publishedOn)}</dd>
                  {selection.event.speaker && (
                    <>
                      <dt>Speaker</dt>
                      <dd>
                        {selection.event.speaker}
                        {selection.event.speakerCapacity
                          ? ` (${selection.event.speakerCapacity})`
                          : ''}
                      </dd>
                    </>
                  )}
                  {selection.event.targetValue && (
                    <>
                      <dt>Target</dt>
                      <dd>{selection.event.targetValue}</dd>
                    </>
                  )}
                  {selection.event.deadline && (
                    <>
                      <dt>Target date</dt>
                      <dd>{dateLabel(selection.event.deadline)}</dd>
                    </>
                  )}
                  {selection.event.revisionReason && (
                    <>
                      <dt>Revision reason</dt>
                      <dd>{selection.event.revisionReason}</dd>
                    </>
                  )}
                  <dt>Source</dt>
                  <dd>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {selection.event.source.title}
                      </a>
                    ) : (
                      'No usable source link'
                    )}
                    {selection.event.source.locator && (
                      <p>{selection.event.source.locator}</p>
                    )}
                  </dd>
                </dl>
                {!sourceIsPrimary(selection.event) && (
                  <p className={styles.muted}>
                    This record links to secondary reporting. The original
                    statement still needs verification.
                  </p>
                )}
                {selection.event.source.quote && (
                  <blockquote>
                    <small>Quoted in the linked source</small>
                    <p>{selection.event.source.quote}</p>
                  </blockquote>
                )}
                {previous && (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => selectEvent(previous.event.id)}
                  >
                    View earlier target
                  </button>
                )}
                <p>
                  <a href={`#stock-${slug}-${selection.lineage.id}`}>
                    Read the full commitment
                  </a>
                </p>
              </section>
            )}
            <details className={styles.sources}>
              <summary>Browse events as a list</summary>
              <ul className={styles.eventList}>
                {filteredEvents.map(({ event, lineage }) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      aria-pressed={selected === event.id}
                      onClick={(e) => selectEvent(event.id, e.currentTarget)}
                    >
                      <time>
                        {axis === 'recorded'
                          ? event.recordedAt
                            ? dateLabel(event.recordedAt)
                            : 'Recording date not stored'
                          : dateLabel(event.occurredOn)}
                      </time>
                      <strong>{eventLabel(event)}</strong> · {lineage.title}
                      <br />
                      {event.summary}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </section>
      <section id="company-commitments" className={styles.section}>
        <h2>Promise record</h2>
        <p className={styles.muted}>
          Recorded assessments from the pilot research. Delivery is separate
          from economic impact or valuation.
        </p>
        {matches.length > 0 && (
          <StockClaimList slug={slug} name={name} lineages={matches} />
        )}
      </section>
    </>
  );
}
