import { formatMoneyUsdM, type StockFundamentals } from "@/lib/stock-data";
import { searchMeta } from "@/lib/search-sections";

const METRIC_LABELS: Array<[string, string]> = [
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

function formatMetric(key: string, value: number): string {
  if (key === "grossMarginPct") return `${value}%`;
  if (key === "energyStorageGwh") return `${value} GWh`;
  if (key === "vehicleDeliveries") return value.toLocaleString("en-US");
  return formatMoneyUsdM(value);
}

/** Reported fundamentals: append-only snapshots from filings, not a
 *  mutable "current" row. Each period cites its source. */
export default function StockFundamentals({ fundamentals }: { fundamentals: StockFundamentals[] }) {
  if (fundamentals.length === 0) {
    return (
      <div className="panel">
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          No reported fundamentals captured yet.
        </p>
      </div>
    );
  }
  const ordered = [...fundamentals].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  return (
    <div className="panel search-section" {...searchMeta({ id: "stock-fundamentals", title: "Reported fundamentals", kind: "Fundamentals", keywords: "revenue profit cash flow margins" })}>
      <h2>Reported fundamentals</h2>
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
            {METRIC_LABELS.map(([key, label]) => {
              if (!ordered.some((f) => typeof f.metrics[key] === "number")) return null;
              return (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {ordered.map((f) => (
                    <td key={f.period}>
                      {typeof f.metrics[key] === "number" ? formatMetric(key, f.metrics[key]) : "n/a"}
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
    </div>
  );
}
