import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStockCompany } from '@/lib/stock-companies';
import { getStockLedger } from '@/lib/stock-data';
import { readStockContext } from '@/lib/stocks/market-data';
import StockEvidenceExplorer from '@/components/stock-evidence-explorer';
import StockFundamentals from '@/components/stock-fundamentals';
import StockMarketContext from '@/components/stock-market-context';
import { searchMeta } from '@/lib/search-sections';
import styles from '@/components/stocks.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const company = getStockCompany((await params).slug);
  return {
    title: company
      ? `${company.name} promise record | Prove Value`
      : 'Company | Prove Value',
  };
}

export default async function StockCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getStockCompany(slug);
  const ledger = getStockLedger(slug);
  if (!company || !ledger) notFound();
  const context = await readStockContext(company);
  return (
    <>
      <Link href="/stocks">← Companies</Link>
      <header
        {...searchMeta({
          id: `stock-${slug}`,
          title: `${company.name}: promise record`,
          kind: 'Stock company',
          keywords: `${company.name} ${company.ticker ?? ''} management promises fundamentals timeline`,
        })}
      >
        <h1 className="page-title">{company.name}</h1>
        <p className="page-sub">
          {company.ticker ?? 'Private company'} · {company.sector}
        </p>
      </header>
      <nav className={styles.sectionNav} aria-label="Company sections">
        <a href="#current-business">Current business</a>
        {(ledger.lineages?.length ?? 0) > 0 && (
          <>
            <a href="#accountability-timeline">Timeline</a>
            <a href="#company-commitments">Promise record</a>
          </>
        )}
      </nav>
      <section id="current-business" className={styles.section}>
        <StockMarketContext context={context} company={company.name} />
        {(ledger.fundamentals?.length ?? 0) > 0 && (
          <details className={styles.sources}>
            <summary>Historical reported results</summary>
            <StockFundamentals fundamentals={ledger.fundamentals} />
          </details>
        )}
      </section>
      {(ledger.lineages?.length ?? 0) > 0 ? (
        <>
          <aside className={styles.pilot}>
            <strong>Pilot research.</strong> This record includes secondary
            sources and assessments that still need editorial review. Explicit
            fulfillment tests are not yet stored. Dates and outcomes below
            reproduce the research record.
          </aside>
          <StockEvidenceExplorer
            lineages={ledger.lineages}
            slug={slug}
            name={company.name}
          />
        </>
      ) : (
        <section className="panel" id="company-commitments">
          <h2>Promise research pending</h2>
          <p>No researched commitments are published for {company.name} yet.</p>
        </section>
      )}
    </>
  );
}
