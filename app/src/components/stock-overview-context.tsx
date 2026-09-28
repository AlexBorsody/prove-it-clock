'use client';

import { useState } from 'react';
import StockMarketContext from '@/components/stock-market-context';
import type { StockContext } from '@/lib/stocks/context';
import type { StockCompany } from '@/lib/stock-companies';
import styles from './stock-overview-context.module.css';

export interface StockOverviewRecord {
  company: StockCompany;
  context: StockContext;
  hasLedger: boolean;
}

/** Select a company's existing reported context without aggregating companies. */
export default function StockOverviewContext({
  records,
}: {
  records: StockOverviewRecord[];
}) {
  const [slug, setSlug] = useState(records[0]?.company.slug ?? '');
  const selected =
    records.find((record) => record.company.slug === slug) ?? records[0];
  if (!selected) return null;

  return (
    <section className={styles.context}>
      <StockMarketContext
        key={selected.company.slug}
        context={selected.context}
        company={selected.company.name}
        compact
        action={
          <label className={styles.select}>
            <span className="sr-only">Company</span>
            <select
              value={selected.company.slug}
              onChange={(event) => setSlug(event.target.value)}
            >
              {records.map(({ company }) => (
                <option key={company.slug} value={company.slug}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
        }
      />
    </section>
  );
}
