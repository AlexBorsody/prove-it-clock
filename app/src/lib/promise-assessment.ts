import { CATEGORIES, TAXONOMY_VERSION, type CategoryId } from '../../data/atlas-taxonomy';

export const VERDICT_METHODOLOGY = 'promise delivery v4 (2026-09-26; reviewed importance, outcome coverage, separate lifecycle)';
export const VERDICT_POLICY = 'promise-verdict-v1';
export const IMPORTANCE_VERSION = 'importance-1-2-4-v1';
export const IMPORTANCE_WEIGHTS = { supporting: 1, material: 2, core: 4 } as const;
export type DeliveryOutcome = 'kept' | 'unkept' | 'pending' | 'unknown';
export type Lifecycle = 'current' | 'retired' | 'archived' | 'completed';
export type UnkeptReason = 'lapsed' | 'retired_unmet' | 'missed';
export interface EvidenceSource { url: string; summary: string; locator: string; published_at: string | null; quote?: string }
export interface Importance {
  tier: keyof typeof IMPORTANCE_WEIGHTS; weight: 1 | 2 | 4;
  rationale: string; author: string;
}
export interface VerdictVersions {
  policy: typeof VERDICT_POLICY; importance: typeof IMPORTANCE_VERSION;
  taxonomy: typeof TAXONOMY_VERSION; assignments: string; admission: string;
}
export interface ReviewedPromise {
  lineage: string; claim_type: 'milestone' | 'ongoing'; core: boolean;
  claim_text: string; attribution: 'issuer' | 'community'; criteria: string;
  state: 'fulfilled' | 'open' | 'lapsed' | 'retired' | 'missed' | 'unknown';
  outcome: DeliveryOutcome; lifecycle: Lifecycle; unkept_reason: UnkeptReason | null;
  effective_at: string; assessed_at: string; observed_at: string | null;
  evidence_valid_until: string | null; obligation_end_at: string | null;
  rationale: string; author: string; importance: Importance | null;
  classification: { primary: CategoryId; rationale: string; author: string };
  admission: { obligation_id: string; rationale: string; author: string };
  claim_sources: EvidenceSource[]; outcome_evidence: EvidenceSource[];
  deadline: { at: string; kind: 'target' | 'essential'; source: EvidenceSource } | null;
  transitions: Array<{ event: 'kept' | 'lapsed' | 'retired' | 'missed' | 'recovered' | 'corrected';
    effective_at: string | null; recorded_at: string; rationale: string; author: string; evidence: EvidenceSource[] }>;
}
export interface VerdictPublication {
  schema_version: 4; run_key: string; as_of: string; methodology: typeof VERDICT_METHODOLOGY;
  versions: VerdictVersions; review_status: 'draft' | 'published'; reviewed_by?: string; policy_ref?: string;
  projects: Array<{ slug: string; availability: 'available' | 'unavailable'; unavailable_reason?: string;
    assessment?: { capacity: number; allowance: 0; allowance_rationale: string; rationale: string;
      research_scope: string; promises: ReviewedPromise[] } | null }>;
}
function fail(message: string): never { throw new Error(`Invalid verdict publication: ${message}`); }
function record(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected object');
  return value as Record<string, any>;
}
function nonempty(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) fail(`${name} is required`);
}
function timestamp(value: unknown, name: string, max?: number): number {
  nonempty(value, name);
  const t = Date.parse(value);
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(t) || (max != null && t > max)) fail(`${name} must be a valid bounded timestamp`);
  return t;
}
function nullableTime(value: unknown, name: string, max?: number) {
  if (value !== null) timestamp(value, name, max);
}
function source(value: unknown) {
  const e = record(value); nonempty(e.url, 'source URL'); nonempty(e.summary, 'source summary'); nonempty(e.locator, 'source locator');
  let u: URL; try { u = new URL(e.url); } catch { fail('invalid source URL'); }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) fail('unsafe source URL');
  nullableTime(e.published_at, 'source publication date');
}
function sources(value: unknown, required: boolean) {
  if (!Array.isArray(value) || (required && !value.length)) fail('missing source list');
  value.forEach(source);
}
export function validateVerdictVersions(value: unknown): asserts value is VerdictVersions {
  const v = record(value);
  if (v.policy !== VERDICT_POLICY || v.importance !== IMPORTANCE_VERSION || v.taxonomy !== TAXONOMY_VERSION) fail('unsupported policy versions');
  nonempty(v.assignments, 'assignment version'); nonempty(v.admission, 'admission version');
}
export function validateReviewedPromise(value: unknown, asOf: string): asserts value is ReviewedPromise {
  const p = record(value), end = timestamp(asOf, 'as_of');
  for (const name of ['lineage', 'claim_text', 'criteria', 'rationale', 'author']) nonempty(p[name], name);
  if (!['milestone', 'ongoing'].includes(p.claim_type) || typeof p.core !== 'boolean') fail('claim type/core');
  if (!['issuer', 'community'].includes(p.attribution)) fail('attribution');
  if (!['kept', 'unkept', 'pending', 'unknown'].includes(p.outcome) || !['current', 'retired', 'archived', 'completed'].includes(p.lifecycle)) fail('outcome/lifecycle');
  const expected = p.outcome === 'kept' ? 'fulfilled' : p.outcome === 'pending' ? 'open' : p.outcome === 'unknown' ? 'unknown' : ({ lapsed: 'lapsed', retired_unmet: 'retired', missed: 'missed' } as Record<string, string>)[p.unkept_reason];
  if (!expected || p.state !== expected || (p.outcome !== 'unkept' && p.unkept_reason !== null)) fail('state/outcome mismatch');
  if (p.unkept_reason === 'lapsed' && (p.claim_type !== 'ongoing' || p.lifecycle !== 'current')) fail('only a current ongoing condition can lapse');
  if (p.unkept_reason === 'retired_unmet' && p.lifecycle !== 'retired') fail('unmet retirement lifecycle');
  if (p.outcome === 'pending' && p.lifecycle !== 'current') fail('pending obligation must be current');
  if (p.outcome === 'kept' && p.lifecycle === 'retired') fail('archive completed delivery instead of retiring it unmet');
  timestamp(p.effective_at, 'promise date', end); const assessed = timestamp(p.assessed_at, 'assessment date', end);
  nullableTime(p.observed_at, 'observation date', assessed);
  nullableTime(p.evidence_valid_until, 'evidence validity'); nullableTime(p.obligation_end_at, 'obligation end', end);
  if (p.outcome === 'kept' || p.outcome === 'unkept') {
    if (p.observed_at == null) fail('resolved outcomes require an observation date');
  }
  if (p.claim_type === 'ongoing' && p.outcome === 'kept') {
    if (p.lifecycle === 'archived') fail('ongoing delivery cannot be archived as a milestone');
    if (p.lifecycle === 'completed' && p.obligation_end_at == null) fail('completed ongoing obligation needs its original end');
    if (p.lifecycle === 'current' && (p.evidence_valid_until == null || Date.parse(p.evidence_valid_until) < end)) fail('ongoing kept needs evidence valid at snapshot');
  }
  if (p.importance !== null) {
    const w = record(p.importance);
    if (!Object.hasOwn(IMPORTANCE_WEIGHTS, w.tier) || w.weight !== IMPORTANCE_WEIGHTS[w.tier as keyof typeof IMPORTANCE_WEIGHTS] || (w.tier === 'core') !== p.core) fail('importance tier/weight/core mismatch');
    nonempty(w.rationale, 'importance rationale'); nonempty(w.author, 'importance author');
  }
  const c = record(p.classification), a = record(p.admission);
  if (!CATEGORIES.some(cat => cat.id === c.primary)) fail('primary category');
  for (const [obj, label] of [[c, 'classification'], [a, 'admission']] as const) {
    nonempty(obj.rationale, `${label} rationale`); nonempty(obj.author, `${label} author`);
  }
  nonempty(a.obligation_id, 'independent obligation ID');
  if ('reward' in p || 'reward_hearts' in p || 'parent_id' in p) fail('rewards and scored child units are not allowed');
  sources(p.claim_sources, true); sources(p.outcome_evidence, p.outcome === 'kept' || p.outcome === 'unkept');
  if (p.deadline !== null) {
    const d = record(p.deadline); timestamp(d.at, 'deadline'); source(d.source);
    if (!['target', 'essential'].includes(d.kind)) fail('deadline kind');
  }
  if (p.unkept_reason === 'missed' && (!p.deadline || Date.parse(p.deadline.at) > end)) fail('confirmed miss requires a past sourced deadline');
  if (!Array.isArray(p.transitions)) fail('transitions must be explicit');
  for (const value of p.transitions) {
    const t = record(value);
    if (!['kept', 'lapsed', 'retired', 'missed', 'recovered', 'corrected'].includes(t.event)) fail('transition event');
    const recorded = timestamp(t.recorded_at, 'transition recorded date', end);
    nullableTime(t.effective_at, 'transition event date', recorded);
    nonempty(t.rationale, 'transition rationale'); nonempty(t.author, 'transition author'); sources(t.evidence, true);
  }
  if (p.unkept_reason === 'missed' && !p.transitions.some((t: any) => t.event === 'missed')) fail('confirmed miss requires a recorded transition');
  if (p.outcome === 'kept' && p.deadline?.kind === 'essential' && p.transitions.some((t: any) => t.event === 'missed')) fail('late delivery cannot fulfill an essential missed deadline');
}
export function validateVerdictPublication(value: unknown): asserts value is VerdictPublication {
  const d = record(value);
  if (d.schema_version !== 4 || d.methodology !== VERDICT_METHODOLOGY) fail('schema/methodology');
  nonempty(d.run_key, 'run key'); if (d.run_key.length > 200) fail('run key too long'); timestamp(d.as_of, 'as_of');
  validateVerdictVersions(d.versions);
  if (!['draft', 'published'].includes(d.review_status)) fail('review status');
  if (d.review_status === 'published') { nonempty(d.reviewed_by, 'reviewer'); nonempty(d.policy_ref, 'policy reference'); }
  if (!Array.isArray(d.projects) || !d.projects.length || d.projects.length > 1000) fail('project count');
  const slugs = new Set<string>();
  for (const item of d.projects) {
    const p = record(item); nonempty(p.slug, 'project slug');
    if (!/^[a-z0-9-]+$/.test(p.slug) || slugs.has(p.slug)) fail('invalid/duplicate project'); slugs.add(p.slug);
    if (p.availability === 'unavailable') {
      nonempty(p.unavailable_reason, 'unavailable reason'); if (p.assessment != null) fail('unavailable assessment'); continue;
    }
    if (p.availability !== 'available' || p.unavailable_reason != null) fail('availability');
    const a = record(p.assessment);
    for (const key of ['rationale', 'allowance_rationale', 'research_scope']) nonempty(a[key], key);
    if (!Array.isArray(a.promises) || !a.promises.length || a.promises.length > 1000 || a.capacity !== a.promises.length || a.allowance !== 0) fail('capacity/allowance');
    const ids = new Set<string>(), obligations = new Set<string>(); let core = 0;
    for (const pr of a.promises) {
      validateReviewedPromise(pr, d.as_of);
      if (ids.has(pr.lineage) || obligations.has(pr.admission.obligation_id)) fail('duplicate lineage or independent obligation');
      ids.add(pr.lineage); obligations.add(pr.admission.obligation_id); if (pr.core) core++;
    }
    if (core !== 1) fail('exactly one core is required');
  }
}
