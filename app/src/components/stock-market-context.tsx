import type { ReactNode } from 'react';
import {
  METRICS,
  metricText,
  nonPositiveEarnings,
  type StockContext,
} from '@/lib/stocks/context';
import styles from './stocks.module.css';

export default function StockMarketContext({
  context,
  company,
  compact = false,
  action,
}: {
  context: StockContext;
  company: string;
  compact?: boolean;
  action?: ReactNode;
}) {
  if (context.status === 'private')
    return (
      <section className={`panel ${styles.market}`}>
        <h2>Business context</h2>
        <p>
          Public-market ratios do not apply to {company}. No sourced
          private-company financials are available in this record.
        </p>
      </section>
    );
  const keys = compact
    ? METRICS.filter(([k]) =>
        ['marketCap', 'trailingPe', 'revenue', 'netIncome'].includes(k),
      )
    : METRICS;
  return (
    <section
      className={`panel ${styles.market}`}
      aria-label={`${company} business and market context`}
    >
      <div className={styles.heading}>
        <h2>{compact ? `${company} context` : 'Current business & market'}</h2>
        {action}
      </div>
      {context.status === 'unavailable' && (
        <p className={styles.muted}>
          Market and filing data could not be loaded.
        </p>
      )}
      <dl className={styles.metrics}>
        {keys.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{metricText(key, context)}</dd>
            {key === 'trailingPe' && nonPositiveEarnings(context) && (
              <small>Non-positive earnings</small>
            )}
          </div>
        ))}
      </dl>
      {Object.keys(context.metrics).length > 0 && (
        <details className={styles.sources}>
          <summary>Periods and sources</summary>
          <p>
            Prices are cached observations. Financials cover the period shown
            for each field.
          </p>
          <ul>
            {METRICS.map(([key, label]) => {
              const m = context.metrics[key];
              return (
                m && (
                  <li key={key}>
                    <strong>{label}:</strong> {m.period}.{' '}
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      {m.source}
                    </a>
                    {m.note && ` ${m.note}`}
                  </li>
                )
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
