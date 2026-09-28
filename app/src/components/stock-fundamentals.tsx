import { formatMoneyUsdM, type StockFundamentals } from "@/lib/stock-data";
import { searchMeta } from "@/lib/search-sections";
import type { ReactNode } from "react";
import styles from "./stock-overview-context.module.css";

export const STOCK_METRIC_LABELS: Array<[string, string]> = [
  ["revenueUsdM", "Revenue"],
  ["grossProfitUsdM", "Gross profit"],
  ["grossMarginPct", "Gross margin"],
  ["netIncomeUsdM", "Net income"],
  ["operatingCashFlowUsdM", "Operating cash flow"],
  ["capexUsdM", "CapEx"],
  ["freeCashFlowUsdM", "Free cash flow"],
  ["vehicleDeliveries", "Vehicle deliveries"],
  ["energyStorageGwh", "Energy storage (GWh)"],
];

export function formatStockMetric(key: string, value: number): string {
  if (key === "grossMarginPct") return `${value}%`;
  if (key === "energyStorageGwh") return `${value} GWh`;
  if (key === "vehicleDeliveries") return value.toLocaleString("en-US");
  return formatMoneyUsdM(value);
}

/** Reported fundamentals: append-only snapshots from filings, not a
 *  mutable "current" row. Each period cites its source. */
export default function StockFundamentals({ fundamentals, compact = false, id = "stock-fundamentals", headerAction }: {
  fundamentals: StockFundamentals[];
  compact?: boolean;
  id?: string;
  headerAction?: ReactNode;
}) {
  if (fundamentals.length === 0) {
    return (
      <div className="panel" id={id}>
        {compact && <div className={styles.heading}><h2>Reported fundamentals</h2>{headerAction}</div>}
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          No reported fundamentals captured yet.
        </p>
      </div>
    );
  }
  const ordered = [...fundamentals].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const table = (
    <>
      <p className="panel-sub">
        Snapshots from company filings and earnings releases. New periods are added as new snapshots; old ones are never edited.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {ordered.map((f) => (
                <th scope="col" key={f.period}>{f.period}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STOCK_METRIC_LABELS.map(([key, label]) => {
              if (!ordered.some((f) => typeof f.metrics[key] === "number")) return null;
              return (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {ordered.map((f) => (
                    <td key={f.period}>
                      {typeof f.metrics[key] === "number" ? formatStockMetric(key, f.metrics[key]) : "n/a"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul className="comp-sources">
        {ordered.map((f) => (
          <li key={f.period}>
            {f.period}: <a href={f.source.url} target="_blank" rel="noreferrer">{f.source.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
  const latest = ordered[0];
  return (
    <div className="panel search-section" {...searchMeta({ id, title: "Reported fundamentals", kind: "Fundamentals", keywords: "revenue profit cash flow margins" })}>
      {compact ? <>
        <div className={styles.heading}>
          <div><h2>Reported fundamentals</h2><p className={styles.period}>{latest.period}</p></div>
          {headerAction}
        </div>
        <dl className={styles.stats}>
          {STOCK_METRIC_LABELS.filter(([key]) => ["revenueUsdM", "netIncomeUsdM", "freeCashFlowUsdM"].includes(key)).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{typeof latest.metrics[key] === "number" ? formatStockMetric(key, latest.metrics[key]) : "n/a"}</dd>
            </div>
          ))}
        </dl>
        <details className={styles.details}>
          <summary>Reported fundamentals</summary>
          {table}
        </details>
      </> : <>
        <h2>Reported fundamentals</h2>
        {table}
      </>}
    </div>
  );
}
