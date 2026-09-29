/**
 * Stock (Speculative Tech) data access. Reads the curated pilot seed ledgers
 * from app/data/stocks/*.json. The production path will read the stock
 * ledger tables (migration 008); the seed path keeps pages renderable and
 * testable without a database connection.
 */
import { cache } from 'react';
import teslaLedger from '../../data/stocks/tesla-ledger.json';
import nvidiaLedger from '../../data/stocks/nvidia-ledger.json';
import broadcomLedger from '../../data/stocks/broadcom-ledger.json';
import oracleLedger from '../../data/stocks/oracle-ledger.json';
import spacexLedger from '../../data/stocks/spacex-ledger.json';
import openaiLedger from '../../data/stocks/openai-ledger.json';
import anthropicLedger from '../../data/stocks/anthropic-ledger.json';
import {
  getStockCompany,
  STOCK_COMPANIES,
  type StockCompany,
} from './stock-companies';

import type { StockLedger } from './stocks/ledger';
export * from './stocks/ledger';

const SEEDS: Record<string, StockLedger> = {
  tesla: teslaLedger as unknown as StockLedger,
  nvidia: nvidiaLedger as unknown as StockLedger,
  broadcom: broadcomLedger as unknown as StockLedger,
  oracle: oracleLedger as unknown as StockLedger,
  spacex: spacexLedger as unknown as StockLedger,
  openai: openaiLedger as unknown as StockLedger,
  anthropic: anthropicLedger as unknown as StockLedger,
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
