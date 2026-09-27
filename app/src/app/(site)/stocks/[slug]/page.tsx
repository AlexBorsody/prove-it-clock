import { notFound } from "next/navigation";
import { getStockCompany } from "@/lib/stock-companies";
import { getStockLedger } from "@/lib/stock-data";
import StockClaimList from "@/components/stock-claim-list";
import StockFundamentals from "@/components/stock-fundamentals";
import StockExpectationGap from "@/components/stock-expectation-gap";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

export default async function StockCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getStockCompany(slug);
  if (!company) notFound();
  const ledger = getStockLedger(slug);
  if (!ledger) notFound();

  return (
    <>
      <div className="search-section" {...searchMeta({ id: `stock-${slug}`, title: `${company.name}: stock ledger`, kind: "Stock company", keywords: `${company.name} ${company.ticker ?? ""} management promises fundamentals expectation gap` })}>
        <h1 className="page-title">{company.name}</h1>
        <p className="page-sub">
          {company.sector} · {company.listing === "public" ? `Public${company.ticker ? ` (${company.ticker})` : ""}` : "Private"}
        </p>
        <p className="panel-sub">Sources: {company.dataSources.join(", ")}</p>
      </div>

      <h2 className="page-title" style={{ fontSize: 22, marginTop: 24 }}>Claim ledger</h2>
      <p className="panel-sub">
        Management claims scoped to {company.name} only: a statement counts when made as a
        commitment or forecast for this company in an official capacity. Green is delivered,
        red is missed, grey is still open.
      </p>
      <StockClaimList slug={slug} name={company.name} lineages={ledger.lineages} />

      <h2 className="page-title" style={{ fontSize: 22, marginTop: 24 }}>Fundamentals</h2>
      <StockFundamentals fundamentals={ledger.fundamentals} />

      {ledger.expectationGap ? (
        <>
          <h2 className="page-title" style={{ fontSize: 22, marginTop: 24 }}>Valuation</h2>
          <StockExpectationGap gap={ledger.expectationGap} companyName={company.name} />
        </>
      ) : null}
    </>
  );
}
