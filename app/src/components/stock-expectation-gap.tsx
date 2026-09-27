import type { StockExpectationGap } from "@/lib/stock-data";
import { searchMeta } from "@/lib/search-sections";

/** The expectation gap: the stock equivalent of the crypto thesis. This is a
 *  versioned, assumption-driven MODEL, not an observed fact, and the UI says
 *  so: model version and assumptions are always visible. */
export default function StockExpectationGap({
  gap,
  companyName,
}: {
  gap: StockExpectationGap;
  companyName: string;
}) {
  return (
    <div className="panel search-section" {...searchMeta({ id: "expectation-gap", title: "Expectation gap", kind: "Model", keywords: "valuation expectations model assumptions" })}>
      <h2>Expectation gap</h2>
      <p className="panel-sub">
        Valuation model <strong>{gap.modelVersion}</strong>, assessed {gap.asOf}. This is a model of what
        the market price appears to require, not a fact about what {companyName} will do.
      </p>
      <p className="comp-desc">{gap.gapSummary}</p>
      <details className="comp-sources" open>
        <summary>Embedded expectations</summary>
        <ul>
          {gap.embeddedExpectations.map((e) => (
            <li key={e.outcome}>
              <strong>{e.outcome}.</strong> <span className="comp-desc">{e.assumption}</span>
            </li>
          ))}
        </ul>
      </details>
      <details className="comp-sources">
        <summary>Model assumptions</summary>
        <ol>
          {gap.assumptions.map((a, i) => (
            <li key={i} className="comp-desc">{a}</li>
          ))}
        </ol>
      </details>
      <p className="comp-desc" style={{ marginTop: 8 }}>
        Recorded by {gap.author}. New model versions are published as new versions, never as edits to this one.
      </p>
    </div>
  );
}
