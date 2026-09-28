"use client";

import { useState } from "react";
import StockFundamentals from "@/components/stock-fundamentals";
import type { StockCompany } from "@/lib/stock-companies";
import type { StockFundamentals as FundamentalsRecord } from "@/lib/stock-data";
import styles from "./stock-overview-context.module.css";

export interface StockOverviewRecord {
  company: StockCompany;
  fundamentals: FundamentalsRecord[];
}

/** Select a company's existing reported context without aggregating companies. */
export default function StockOverviewContext({ records }: { records: StockOverviewRecord[] }) {
  const [slug, setSlug] = useState(records[0]?.company.slug ?? "");
  const selected = records.find(record => record.company.slug === slug) ?? records[0];
  if (!selected) return null;

  return <section className={styles.context}>
    <StockFundamentals key={selected.company.slug} fundamentals={selected.fundamentals} compact id={`overview-stock-${selected.company.slug}-fundamentals`}
      headerAction={<label className={styles.select}>
        <span className="sr-only">Company</span>
        <select value={selected.company.slug} onChange={event => setSlug(event.target.value)}>
          {records.map(({ company }) => <option key={company.slug} value={company.slug}>{company.name}</option>)}
        </select>
      </label>} />
  </section>;
}
