import { listStockCompanies, getStockLedger } from '@/lib/stock-data';
import { readStockContext } from '@/lib/stocks/market-data';
import { searchMeta } from '@/lib/search-sections';
import StockOverviewContext from '@/components/stock-overview-context';
import StockBoard from '@/components/stock-board';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Speculative Tech | Prove Value',
  description: 'Company commitments, revisions, outcomes and business context.',
};

export default async function StocksPage() {
  const records = await Promise.all(
    listStockCompanies().map(async (company) => {
      const ledger = getStockLedger(company.slug);
      return {
        company,
        hasLedger: Boolean(ledger?.lineages.length),
        context: await readStockContext(company),
      };
    }),
  );
  return (
    <>
      <header
        {...searchMeta({
          id: 'stocks-overview',
          title: 'Speculative Tech',
          kind: 'Stocks',
          keywords:
            'stocks management promises fundamentals guidance P/E timeline',
        })}
      >
        <h1 className="page-title">High Expectations</h1>
        <p className="page-sub">
          What companies earn today. What management promised for tomorrow. The
          evidence of what happened.
        </p>
      </header>
      <StockOverviewContext
        records={records.filter((r) => r.company.listing === 'public')}
      />
      <StockBoard records={records} />
      <details className="panel">
        <summary>How to read this</summary>
        <p>
          Start with a company, then follow its commitments through targets,
          revisions, and outcomes. The timeline keeps the original target
          visible when guidance changes.
        </p>
        <p>
          Business results and market prices provide context. They never change
          the promise record. Valuation estimates require a separate model and
          are not published here.
        </p>
        <p>
          Tesla is the pilot. Its research gaps are visible on the company page;
          other companies are registered for future research.
        </p>
      </details>
    </>
  );
}
