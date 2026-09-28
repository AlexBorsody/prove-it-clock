"use client";

import Link from "next/link";
import { ComparisonGrid, type ComparisonGroup } from "@/components/compare-table";
import { STOCK_METRIC_LABELS, formatStockMetric } from "@/components/stock-fundamentals";
import type { StockOverviewRecord } from "@/components/stock-overview-context";

/** Company facts stay in a separate contract from crypto promise metrics. */
export default function StockCompareTable({ records }: { records: StockOverviewRecord[] }) {
  const latest = records.map(record => [...record.fundamentals].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0]);
  const rows: ComparisonGroup["rows"] = [
    { key: "company", label: "Company", title: "Company", cells: records.map(({ company }) => company.name) },
    { key: "sector", label: "Sector", title: "Sector", cells: records.map(({ company }) => company.sector) },
    { key: "listing", label: "Listing", title: "Listing", cells: records.map(({ company }) => company.listing === "public" ? `Public${company.ticker ? `, ${company.ticker}` : ""}` : "Private") },
    { key: "fundamentals", label: "Reported fundamentals", title: "Reported fundamentals", cells: latest.map(snapshot => snapshot ? <span key={snapshot.period}>
      {snapshot.period}<br /><a href={snapshot.source.url} target="_blank" rel="noreferrer">{snapshot.source.title}</a>
    </span> : "No reported fundamentals captured yet.") },
    ...STOCK_METRIC_LABELS.filter(([key]) => latest.some(snapshot => typeof snapshot?.metrics[key] === "number")).map(([key, label]) => ({
      key,
      label,
      title: label,
      cells: latest.map(snapshot => typeof snapshot?.metrics[key] === "number" ? formatStockMetric(key, snapshot.metrics[key]) : "n/a"),
    })),
  ];
  return <ComparisonGrid id="stock-compare-metrics" rowIdPrefix="stock-compare" title="Reported fundamentals" keywords="company fundamentals revenue profit cash flow"
    columns={records.map(({ company }) => ({ key: company.slug, header: <Link href={`/stocks/${company.slug}`}>{company.name}</Link> }))}
    groups={[{ label: "Reported fundamentals", rows }]} />;
}
