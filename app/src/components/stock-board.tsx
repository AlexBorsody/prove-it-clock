'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ViewToggle, { type BoardView } from './view-toggle';
import CompareMode, {
  CompareCheckbox,
  useCompareSelection,
} from './compare-mode';
import StockCompareTable from './stock-compare-table';
import type { StockOverviewRecord } from './stock-overview-context';
import {
  matchesScreen,
  metricText,
  nonPositiveEarnings,
  type StockScreen,
} from '@/lib/stocks/context';
import styles from './stocks.module.css';

const VIEW_KEY = 'pv-stocks-view';

export default function StockBoard({
  records,
}: {
  records: StockOverviewRecord[];
}) {
  const [view, setView] = useState<BoardView>('cards');
  const [listing, setListing] = useState('public');
  const [screen, setScreen] = useState<StockScreen>('high');
  const [sector, setSector] = useState('all');
  const [search, setSearch] = useState('');
  const selection = useCompareSelection(records.map((r) => r.company.slug));
  const selectedRecords = selection.selected.flatMap((slug) =>
    records.filter((r) => r.company.slug === slug),
  );
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === 'cards' || saved === 'list') setView(saved);
    } catch {
      /* Optional preference. */
    }
  }, []);
  function changeView(value: BoardView) {
    setView(value);
    try {
      localStorage.setItem(VIEW_KEY, value);
    } catch {
      /* Optional preference. */
    }
  }
  const candidates = records.filter(
    ({ company }) =>
      company.listing === listing &&
      (sector === 'all' || company.sector === sector) &&
      `${company.name} ${company.ticker ?? ''}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const matches = candidates.filter(
    (r) => listing === 'private' || matchesScreen(r.context, screen),
  );
  const unavailable =
    listing === 'public' && screen !== 'all'
      ? candidates.filter(
          (r) =>
            !nonPositiveEarnings(r.context) &&
            r.context.metrics.trailingPe == null &&
            !(
              screen === 'loss' &&
              (r.context.metrics.eps || r.context.metrics.netIncome)
            ),
        )
      : [];
  const compare = (r: StockOverviewRecord) => (
    <CompareCheckbox
      name={r.company.name}
      checked={selection.selected.includes(r.company.slug)}
      disabled={!selection.canSelect(r.company.slug)}
      onChange={() => selection.toggle(r.company.slug)}
    />
  );
  function results(items: StockOverviewRecord[]) {
    return view === 'cards' ? (
      <div className={styles.cards}>
        {items.map((r) => (
          <article key={r.company.slug} className={styles.card}>
            <Link
              href={`/stocks/${r.company.slug}`}
              className={styles.cardLink}
            >
              <div className={styles.identity}>
                <h2>{r.company.name}</h2>
                <span className="tag na">{r.company.ticker ?? 'Private'}</span>
              </div>
              <p className={styles.muted}>{r.company.sector}</p>
              {listing === 'public' && (
                <dl className={styles.metrics}>
                  {(
                    [
                      ['marketCap', 'Market cap'],
                      ['trailingPe', 'Trailing P/E'],
                      ['revenueGrowth', 'Revenue growth'],
                      ['netIncome', 'Net income'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{metricText(key, r.context)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {nonPositiveEarnings(r.context) && (
                <p className={styles.muted}>
                  P/E is N/M because earnings are non-positive.
                </p>
              )}
              <p>
                {r.hasLedger
                  ? 'Explore the pilot promise record and timeline'
                  : 'Promise research pending'}
              </p>
            </Link>
            <div className={styles.cardActions}>{compare(r)}</div>
          </article>
        ))}
      </div>
    ) : (
      <div
        className={styles.tableScroll}
        tabIndex={0}
        role="region"
        aria-label="Scrollable company list"
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Company</th>
              {listing === 'public' && (
                <>
                  <th scope="col">Market cap</th>
                  <th scope="col">P/E</th>
                  <th scope="col">Revenue growth</th>
                  <th scope="col">Net income</th>
                </>
              )}
              <th scope="col">Promise record</th>
              <th scope="col">Compare</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.company.slug}>
                <td>
                  <Link href={`/stocks/${r.company.slug}`}>
                    {r.company.name}
                    <small>
                      {r.company.ticker ?? 'Private'} · {r.company.sector}
                    </small>
                  </Link>
                </td>
                {listing === 'public' &&
                  (
                    [
                      'marketCap',
                      'trailingPe',
                      'revenueGrowth',
                      'netIncome',
                    ] as const
                  ).map((key) => (
                    <td key={key}>
                      {metricText(key, r.context)}
                      {key === 'trailingPe' &&
                        nonPositiveEarnings(r.context) && (
                          <small>Non-positive earnings</small>
                        )}
                    </td>
                  ))}
                <td>
                  <Link href={`/stocks/${r.company.slug}#company-commitments`}>
                    {r.hasLedger ? 'Pilot record' : 'Research pending'}
                  </Link>
                </td>
                <td>{compare(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <section aria-label="Company discovery">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <label>
            Companies
            <select
              value={listing}
              onChange={(e) => {
                setListing(e.target.value);
                setSector('all');
              }}
            >
              <option value="public">Public companies</option>
              <option value="private">Private companies</option>
            </select>
          </label>
          {listing === 'public' && (
            <label>
              P/E screen
              <select
                value={screen}
                onChange={(e) => setScreen(e.target.value as StockScreen)}
              >
                <option value="high">P/E &gt; 30 or earnings ≤ 0</option>
                <option value="50">P/E &gt; 50</option>
                <option value="100">P/E &gt; 100</option>
                <option value="loss">Non-positive earnings</option>
                <option value="all">All tracked public companies</option>
              </select>
            </label>
          )}
          <label>
            Sector
            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="all">All sectors</option>
              {[
                ...new Set(
                  records
                    .filter((r) => r.company.listing === listing)
                    .map((r) => r.company.sector),
                ),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Search companies
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <ViewToggle
          value={view}
          onChange={changeView}
          label="Company list layout"
        />
      </div>
      <p className={styles.muted}>
        {listing === 'public'
          ? 'A curated research universe, not a complete market screen. P/E is context; it does not grade delivery.'
          : 'Private companies have no public P/E. Their research records stay separate from the public-company screen.'}
      </p>
      {matches.length ? (
        results(matches)
      ) : (
        <p role="status">
          {unavailable.length
            ? 'The selected screen cannot be confirmed without the missing market data.'
            : 'No companies match these filters.'}
        </p>
      )}
      {unavailable.length > 0 && (
        <section className={styles.section}>
          <h2>Market data unavailable</h2>
          <p className={styles.muted}>
            These companies have not been included as matches for the P/E
            screen. Their research pages remain accessible.
          </p>
          {results(unavailable)}
        </section>
      )}
      <CompareMode
        selectedLabels={selectedRecords.map((r) => r.company.name)}
        onClear={selection.clear}
      >
        <StockCompareTable records={selectedRecords} />
      </CompareMode>
    </section>
  );
}
