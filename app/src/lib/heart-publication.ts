import { calculateHeartBalance } from './hearts';
import type { HeartCapacity } from './hearts-config';

export interface HeartPublication {
  schema_version: 1;
  run_key: string;
  as_of: string;
  methodology: string;
  review_status: 'draft' | 'published';
  reviewed_by?: string;
  policy_ref?: string;
  projects: Array<{
    slug: string;
    availability: 'available' | 'unavailable';
    unavailable_reason?: string;
    assessment?: {
      capacity: HeartCapacity;
      starting_allowance: number;
      years_since_fulfillment: number;
      rationale: string;
      recency_rationale: string;
      promises: Array<{
        lineage: string;
        criteria: string;
        reward: 0 | 1 | 2;
        core: boolean;
        state: 'unfulfilled' | 'fulfilled' | 'abandoned';
        effective_at: string;
        rationale: string;
        evidence: Array<{url: string; summary: string}>;
      }>;
    } | null;
    market?: {
      observed_at: string;
      source_url: string;
      price_usd: number | null;
      market_cap_usd: number | null;
      raw_payload: Record<string, unknown>;
    } | null;
  }>;
}

function record(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object');
}
function nonempty(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Expected nonempty text');
}
function timestamp(value: unknown): number {
  nonempty(value);
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error('Expected ISO timestamp with timezone');
  }
  return Date.parse(value);
}
function source(value: unknown) {
  nonempty(value);
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Expected HTTP evidence URL');
}

/** Runtime guard for operator artifacts. SQL independently enforces publication invariants. */
export function validateHeartPublication(value: unknown): asserts value is HeartPublication {
  record(value);
  if (value.schema_version !== 1) throw new Error('Unsupported publication schema');
  nonempty(value.run_key); nonempty(value.methodology);
  if (value.run_key.length > 200) throw new Error('run_key too long');
  const asOf = timestamp(value.as_of);
  if (!['draft','published'].includes(String(value.review_status))) throw new Error('Invalid review_status');
  if (value.review_status === 'published') { nonempty(value.reviewed_by); nonempty(value.policy_ref); }
  if (!Array.isArray(value.projects) || !value.projects.length || value.projects.length > 1000) throw new Error('Expected 1–1000 projects');
  const slugs = new Set<string>();
  for (const project of value.projects) {
    record(project); nonempty(project.slug);
    if (slugs.has(project.slug)) throw new Error('Duplicate project');
    slugs.add(project.slug);
    if (project.availability === 'unavailable') {
      nonempty(project.unavailable_reason);
      if (project.assessment != null) throw new Error('Unavailable project cannot carry assessment');
    } else if (project.availability === 'available') {
      if (project.unavailable_reason != null) throw new Error('Available project cannot have unavailable reason');
      const a = project.assessment; record(a);
      nonempty(a.rationale); nonempty(a.recency_rationale);
      if (!Array.isArray(a.promises) || !a.promises.length) throw new Error('Missing promises');
      const lineages = new Set<string>();
      let earned = 0; let core: boolean | null = null;
      for (const p of a.promises) {
        record(p); nonempty(p.lineage); nonempty(p.criteria); nonempty(p.rationale);
        if (lineages.has(p.lineage)) throw new Error('Duplicate lineage');
        lineages.add(p.lineage);
        if (![0,1,2].includes(p.reward as number) || typeof p.core !== 'boolean' ||
          !['unfulfilled','fulfilled','abandoned'].includes(String(p.state))) throw new Error('Invalid promise');
        if (timestamp(p.effective_at) > asOf) throw new Error('Future promise event');
        if (!Array.isArray(p.evidence) || !p.evidence.length) throw new Error('Missing evidence');
        for (const e of p.evidence) { record(e); source(e.url); nonempty(e.summary); }
        if (p.core) {
          if (core !== null || p.reward !== 0) throw new Error('Exactly one zero-reward core required');
          core = p.state === 'fulfilled';
        } else if (p.state === 'fulfilled') earned += p.reward as number;
      }
      if (core === null) throw new Error('Missing core promise');
      calculateHeartBalance({capacity: a.capacity as HeartCapacity, startingAllowance: a.starting_allowance as number,
        yearsSinceFulfillment: a.years_since_fulfillment as number, earned, coreFulfilled: core});
    } else throw new Error('Invalid availability');
    if (project.market != null) {
      const m = project.market; record(m); source(m.source_url); record(m.raw_payload);
      if (timestamp(m.observed_at) > asOf) throw new Error('Future market observation');
      for (const n of [m.price_usd,m.market_cap_usd]) {
        if (n !== null && (typeof n !== 'number' || !Number.isFinite(n) || n < 0)) throw new Error('Invalid market value');
      }
    }
  }
}
