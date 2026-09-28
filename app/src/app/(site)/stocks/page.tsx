import { listStockCompanies } from "@/lib/stock-data";
import { searchMeta } from "@/lib/search-sections";
import StockBoard from "@/components/stock-board";

export const dynamic = "force-dynamic";

/** Speculative Tech: management promises against delivery, fundamentals,
 *  and the expectations embedded in valuation. */
export default function StocksPage() {
  const companies = listStockCompanies();
  return (
    <>
      <div className="search-section" {...searchMeta({ id: "stocks-overview", title: "Speculative Tech", kind: "Stocks", keywords: "stocks management promises fundamentals valuation expectation gap" })}>
        <h1 className="page-title">High Expectations</h1>
        <p className="page-sub">
          Speculative Tech: companies priced heavily on future execution. Crypto asks what a project
          has proven. Speculative tech asks how much of a valuation is supported by the current
          business, and how much depends on promises about the future.
          For each company: what management told the world would happen, every revision they made,
          what actually happened, and how much of today&apos;s valuation still depends on outcomes
          that have not happened yet.
        </p>
      </div>
      <StockBoard companies={companies} />
      <div className="panel">
        <h2>How the stock ledger works</h2>
        <p className="panel-sub">
          Claims are recorded with the exact statement, who said it, in what capacity, the deadline,
          and the source. Guidance revisions are new events that reference what they revise; the
          original is never edited. Assessments are open, active, delivered, missed, withdrawn, or superseded.
        </p>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          The expectation gap is a versioned valuation model with its assumptions visible, not a fact
          about what the company will do. No rankings, no coin-versus-coin style leaderboard: the gap
          per company is the product.
        </p>
      </div>
    </>
  );
}
