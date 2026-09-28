/**
 * Stock (Speculative Tech) data access. Reads the curated pilot seed ledgers
 * from app/data/stocks/*.json. The production path will read the stock
 * ledger tables (migration 008); the seed path keeps pages renderable and
 * testable without a database connection.
 */
import { cache } from 'react';
import teslaLedger from '../../data/stocks/tesla-ledger.json';
import {
  getStockCompany,
  STOCK_COMPANIES,
  type StockCompany,
} from './stock-companies';

import type { StockLedger } from './stocks/ledger';
export * from './stocks/ledger';

const SEEDS: Record<string, StockLedger> = {
  tesla: teslaLedger as unknown as StockLedger,
};

export function listStockCompanies(): StockCompany[] {
  return STOCK_COMPANIES;
}

export const getStockLedger = cache((slug: string): StockLedger | null => {
  const company = getStockCompany(slug);
  if (!company) return null;
  const seed = SEEDS[slug];
  if (!seed) {
    return {
      schemaVersion: 1,
      companySlug: slug,
      capturedAt: '',
      lineages: [],
      fundamentals: [],
      expectationGap: null,
    };
  }
  return {
    ...seed,
    lineages: seed.lineages.map((lineage) => ({
      ...lineage,
      events: [...lineage.events],
    })),
  };
});
