"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ViewToggle, { type BoardView } from "@/components/view-toggle";
import type { StockCompany } from "@/lib/stock-companies";
import CompareMode, { CompareCheckbox, useCompareSelection } from "@/components/compare-mode";
import StockCompareTable from "@/components/stock-compare-table";
import type { StockOverviewRecord } from "@/components/stock-overview-context";
import styles from "./compare-mode.module.css";

const STOCKS_VIEW_KEY = "pv-stocks-view";

function statusFor(slug: string): string {
  return slug === "tesla"
    ? "Claim ledger, reported fundamentals, and the expectation gap, from researched management statements with exact sources."
    : "Company registered. Claim research for this company has not started yet.";
}

export default function StockBoard({ companies, records = [] }: { companies: StockCompany[]; records?: StockOverviewRecord[] }) {
  const [view, setView] = useState<BoardView>("cards");
  const selection = useCompareSelection(companies.map(company => company.slug));
  const selectedCompanies = selection.selected.map(slug => companies.find(company => company.slug === slug)!);
  const selectedRecords = selectedCompanies.map(company => ({
    company,
    fundamentals: records.find(record => record.company.slug === company.slug)?.fundamentals ?? [],
  }));
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STOCKS_VIEW_KEY);
      if (saved === "cards" || saved === "list") setView(saved);
    } catch { /* storage unavailable */ }
  }, []);
  function changeView(v: BoardView) {
    setView(v);
    try { window.localStorage.setItem(STOCKS_VIEW_KEY, v); } catch { /* storage unavailable */ }
  }

  return (
    <>
      <div className="board-view-bar">
        <ViewToggle value={view} onChange={changeView} label="Company list layout" />
      </div>
      {view === "cards" ? (
        <div>
          {companies.map((company) => (
            <div key={company.slug} className="comp-row project-card">
              <div className={styles.stockSelection}>
                <CompareCheckbox name={company.name} checked={selection.selected.includes(company.slug)} disabled={!selection.canSelect(company.slug)} onChange={() => selection.toggle(company.slug)} />
              </div>
            <Link
              href={`/stocks/${company.slug}`}
              className="project-card-link"
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <div className="comp-name">
                {company.name}
                {company.slug === "tesla" ? <span className="tag" style={{ marginLeft: 8 }}>Reference case</span> : null}
              </div>
              <div className="comp-tags">
                <span className="tag na">{company.sector}</span>
                <span className="tag na">{company.listing === "public" ? `Public${company.ticker ? `, ${company.ticker}` : ""}` : "Private"}</span>
              </div>
              <p className="comp-desc">{statusFor(company.slug)}</p>
            </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="board stocks-board">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Compare</span></th>
                <th>#</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Listing</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, i) => (
                <tr key={company.slug}>
                  <td><CompareCheckbox name={company.name} checked={selection.selected.includes(company.slug)} disabled={!selection.canSelect(company.slug)} onChange={() => selection.toggle(company.slug)} /></td>
                  <td className="num" style={{ color: "var(--text-faint)" }}>{i + 1}</td>
                  <td>
                    <Link href={`/stocks/${company.slug}`} className="proj-cell" style={{ fontWeight: 400 }}>
                      <span>
                        <span className="proj-name" style={{ color: "var(--text)" }}>{company.name}</span>
                        <br />
                        <span className="proj-cat num">{company.ticker ?? "Private"}</span>
                        {company.slug === "tesla" ? <span className="tag" style={{ marginLeft: 8 }}>Reference case</span> : null}
                      </span>
                    </Link>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{company.sector}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{company.listing === "public" ? `Public${company.ticker ? `, ${company.ticker}` : ""}` : "Private"}</td>
                  <td className="stocks-status">{statusFor(company.slug)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CompareMode selectedLabels={selectedCompanies.map(company => company.name)} onClear={selection.clear}>
        <StockCompareTable records={selectedRecords} />
      </CompareMode>
    </>
  );
}
