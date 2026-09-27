/**
 * Stock (Speculative Tech) data access. Reads the curated pilot seed ledgers
 * from app/data/stocks/*.json. The production path will read the stock
 * ledger tables (migration 008); the seed path keeps pages renderable and
 * testable without a database connection.
 */
import { cache } from 'react';
import teslaLedger from '../../data/stocks/tesla-ledger.json';
import { getStockCompany, STOCK_COMPANIES, type StockCompany } from './stock-companies';

export type StockAssessmentState = 'open' | 'active' | 'fulfilled' | 'missed' | 'withdrawn' | 'superseded';

export type StockSourceType =
  | '10-k' | '10-q' | '8-k' | 'earnings-call' | 'investor-day'
  | 'press-release' | 'executive-interview' | 'executive-social';

export type StockHorizon = 'quarter' | 'annual' | 'multi_year' | 'undated';

export interface StockLedgerEvent {
  id: string;
  lineage: string;
  kind: string;
  occurredOn: string;
  /** When Prove Value captured/researched the event. Never equals occurredOn by default. */
  recordedAt?: string;
  summary: string;
  author: string;
  source: { url: string; title: string; publishedOn: string; quote?: string; locator?: string };
  sourceType?: StockSourceType;
  speaker?: string;
  speakerCapacity?: string;
  speakerRole?: string;
  claimCategory?: string;
  tags?: string[];
  deadline?: string | null;
  metric?: string;
  targetValue?: string;
  originalId?: string;
  wordingChange?: string;
  supersedes?: string | null;
  revisionReason?: string;
  stance?: string;
  provenance?: string[];
  state?: StockAssessmentState;
  methodology?: string;
}

export interface StockLineage {
  id: string;
  title: string;
  claimCategory: string;
  tags: string[];
  horizon?: StockHorizon;
  events: StockLedgerEvent[];
}

export interface StockFundamentals {
  period: string;
  periodEnd: string;
  metrics: Record<string, number>;
  source: { url: string; title: string; publishedOn: string };
}

export interface StockExpectationGap {
  modelVersion: string;
  asOf: string;
  inputs: Record<string, unknown>;
  assumptions: string[];
  embeddedExpectations: Array<{ outcome: string; assumption: string }>;
  gapSummary: string;
  author: string;
}

export interface StockLedger {
  schemaVersion: number;
  companySlug: string;
  capturedAt: string;
  lineages: StockLineage[];
  fundamentals: StockFundamentals[];
  expectationGap: StockExpectationGap | null;
}

const SEEDS: Record<string, StockLedger> = {
  tesla: teslaLedger as unknown as StockLedger,
};

const KIND_ORDER: Record<string, number> = {
  claim_stated: 0,
  claim_repeated: 1,
  claim_revised: 2,
  evidence: 3,
  fundamentals_reported: 4,
  assessment: 5,
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
      events: [...lineage.events].sort(
        (a, b) => a.occurredOn.localeCompare(b.occurredOn)
          || (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9)
          || a.id.localeCompare(b.id)
      ),
    })),
  };
});

/** Latest assessment state for a lineage; claims with no assessment are open. */
export function lineageState(lineage: StockLineage): StockAssessmentState {
  const assessments = lineage.events.filter((e) => e.kind === 'assessment');
  const latest = assessments[assessments.length - 1];
  return latest?.state ?? 'open';
}

export function lineageAssessment(lineage: StockLineage): StockLedgerEvent | null {
  const assessments = lineage.events.filter((e) => e.kind === 'assessment');
  return assessments[assessments.length - 1] ?? null;
}

/** The full revision chain for a lineage: stated, repeats, revisions, in order. */
export function lineageRevisions(lineage: StockLineage): StockLedgerEvent[] {
  return lineage.events.filter(
    (e) => e.kind === 'claim_stated' || e.kind === 'claim_repeated' || e.kind === 'claim_revised'
  );
}

export function formatMoneyUsdM(value: number): string {
  return `$${value.toLocaleString('en-US')}M`;
}
