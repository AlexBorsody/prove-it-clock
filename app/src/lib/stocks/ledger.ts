import { STOCK_COMPANIES } from '../stock-companies';

export type StockAssessmentState =
  | 'open'
  | 'active'
  | 'fulfilled'
  | 'missed'
  | 'withdrawn'
  | 'superseded'
  | 'unknown';

export type StockSourceType =
  | '10-k'
  | '10-q'
  | '8-k'
  | 'earnings-call'
  | 'investor-day'
  | 'press-release'
  | 'executive-interview'
  | 'executive-social';

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
  source: {
    url: string;
    title: string;
    publishedOn: string;
    quote?: string;
    locator?: string;
  };
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
  fulfillmentTest?: string;
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

/** Latest assessment state for a lineage; claims with no assessment are open. */
export function lineageState(lineage: StockLineage): StockAssessmentState {
  const assessment = lineageAssessment(lineage);
  if (!assessment) return 'open';
  return [
    'open',
    'active',
    'fulfilled',
    'missed',
    'withdrawn',
    'superseded',
  ].includes(assessment.state ?? '')
    ? assessment.state!
    : 'unknown';
}
export function lineageAssessment(
  lineage: StockLineage,
): StockLedgerEvent | null {
  return (
    lineage.events
      .filter((e) => e.kind === 'assessment')
      .sort((a, b) => (a.recordedAt ?? '').localeCompare(b.recordedAt ?? ''))
      .at(-1) ?? null
  );
}
export function sourceHref(url: string): string | null {
  try {
    const u = new URL(url);
    return ['https:', 'http:'].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function sourceIsPrimary(event: StockLedgerEvent): boolean {
  const href = sourceHref(event.source.url);
  if (!href) return false;
  const host = new URL(href).hostname;
  return (
    host === 'sec.gov' ||
    host.endsWith('.sec.gov') ||
    STOCK_COMPANIES.some((c) =>
      c.sourceDomains.some(
        (domain) => host === domain || host.endsWith(`.${domain}`),
      ),
    )
  );
}
export const EVENT_LABELS: Record<string, string> = {
  claim_stated: 'Promise made',
  claim_repeated: 'Promise repeated',
  claim_revised: 'Target revised',
  evidence: 'Outcome evidence',
  fundamentals_reported: 'Financial result',
  assessment: 'Assessment',
};
export const STATE_LABELS: Record<StockAssessmentState, string> = {
  fulfilled: 'Delivered',
  missed: 'Missed',
  open: 'Open',
  active: 'Active',
  withdrawn: 'Withdrawn',
  superseded: 'Superseded',
  unknown: 'Unknown',
};
export function dateLabel(value: string): string {
  const expanded =
    value.length === 4
      ? `${value}-01-01`
      : value.length === 7
        ? `${value}-01`
        : value.slice(0, 10);
  const date = new Date(`${expanded}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: value.length > 4 ? 'short' : undefined,
    day: value.length > 7 ? 'numeric' : undefined,
    timeZone: 'UTC',
  });
}

/** The full revision chain for a lineage: stated, repeats, revisions, in order. */
export function lineageRevisions(lineage: StockLineage): StockLedgerEvent[] {
  return lineage.events
    .filter(
      (e) =>
        e.kind === 'claim_stated' ||
        e.kind === 'claim_repeated' ||
        e.kind === 'claim_revised',
    )
    .sort((a, b) => a.occurredOn.localeCompare(b.occurredOn));
}

export function formatMoneyUsdM(value: number): string {
  return `$${value.toLocaleString('en-US')}M`;
}
