import { CATEGORIES, TAGS, TAXONOMY_VERSION } from '../../../data/atlas-taxonomy';
import { ASSIGNMENTS, ASSIGNMENT_VERSION } from '../../../data/atlas-assignments';
import { promiseAnchor } from '../promise-context';
import { layoutFor, LAYOUT_VERSION } from '../../../data/atlas-layout';
import { promiseId, type AtlasAssignment, type AtlasDataset, type AtlasNode, type AtlasSource, type AtlasState, type PublishedHeartDataset } from './types';

// Version-specific interpretation. The v3 writer rejects ambiguous "active".
const V3 = 'hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one heart; capacity = promise count)';
export function atlasState(value: unknown, methodology: string): AtlasState {
  if (methodology !== V3) return 'unknown';
  switch (value) {
    case 'fulfilled': return 'kept';
    case 'open': case 'unfulfilled': return 'open';
    case 'lapsed': return 'lapsed';
    case 'retired': return 'retired';
    default: return 'unknown';
  }
}
const text = (v: unknown): string | null => typeof v === 'string' && v.trim() ? v : null;
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Invalid published ledger record');
  return v as Record<string, unknown>;
}
export function safeSourceUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; }
}
function sources(v: unknown, flags: string[]): AtlasSource[] {
  if (v == null) return [];
  if (!Array.isArray(v)) { flags.push('Invalid source list'); return []; }
  return v.flatMap(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { flags.push('Invalid source record'); return []; }
    const e = entry as Record<string, unknown>; const url = safeSourceUrl(e.url);
    if (!url) { flags.push('Unsafe or missing source URL'); return []; }
    return [{ url, title: text(e.title) ?? text(e.summary) ?? undefined,
      publishedAt: text(e.published_at) ?? undefined, locator: text(e.locator) ?? undefined, quote: text(e.quote) ?? undefined }];
  });
}
export function validateAssignments(assignments: Record<string, AtlasAssignment>) {
  const categories = new Set<string>(CATEGORIES.map(c => c.id));
  for (const [id, a] of Object.entries(assignments)) {
    if (!id || !a.rationale.trim() || !a.author.trim() || (a.primary != null && (!categories.has(a.primary) || a.primary === 'unclassified')) ||
      a.secondary.some(c => !categories.has(c) || c === 'unclassified' || c === a.primary) || new Set(a.secondary).size !== a.secondary.length ||
      a.tags.some(t => !(TAGS as readonly string[]).includes(t))) throw new Error(`Invalid Atlas assignment: ${id}`);
  }
}
export function adaptAtlas(input: PublishedHeartDataset, assignments = ASSIGNMENTS): AtlasDataset | null {
  const { run } = input;
  if (!run) return null;
  if (!run.id || !run.methodology || !Number.isFinite(Date.parse(run.as_of)) || (run.review_status && run.review_status !== 'published')) throw new Error('Atlas requires a published run');
  validateAssignments(assignments);
  const nodes: AtlasNode[] = []; const ids = new Set<string>(); const projects = new Set<string>(); const unavailableProjects: string[] = [];
  for (const value of input.projects) {
    const p = record(value); const slug = text(p.slug);
    if (!slug || !/^[a-z0-9-]+$/.test(slug) || projects.has(slug)) throw new Error('Missing or duplicate project identity');
    projects.add(slug);
    if (p.run_id !== run.id || p.methodology !== run.methodology) throw new Error('Mixed published runs');
    if (p.availability === 'unavailable') { unavailableProjects.push(slug); continue; }
    if (p.availability !== 'available') throw new Error('Invalid assessment availability');
    const assessment = record(p.assessment);
    if (!Array.isArray(assessment.promises)) throw new Error('Missing scored promises');
    const lineages = new Set<string>();
    for (const value of assessment.promises) {
      const pr = record(value); const lineage = text(pr.lineage);
      if (!lineage) throw new Error('Missing promise lineage');
      if (lineages.has(lineage)) throw new Error(`Duplicate promise lineage: ${lineage}`);
      lineages.add(lineage);
      const id = text(pr.id) ?? promiseId(slug, lineage);
      if (ids.has(id)) throw new Error(`Duplicate promise ID: ${id}`);
      ids.add(id);
      const flags: string[] = []; const state = atlasState(pr.state, run.methodology);
      if (state === 'unknown') flags.push('State needs methodology review');
      const claimSources = sources(pr.claim_sources, flags);
      const separated = Array.isArray(pr.outcome_evidence);
      const outcomeEvidence = sources(separated ? pr.outcome_evidence : pr.evidence, flags);
      if (!claimSources.length) flags.push('Original claim source not separately recorded');
      if (!separated && outcomeEvidence.length) flags.push('Assessment reference roles are not separated');
      const explicitClaim = text(pr.claim_text); const criteria = text(pr.fulfillment_test) ?? text(pr.criteria);
      if (!explicitClaim) flags.push('Original claim text not separately recorded');
      if (!criteria) flags.push('No explicit fulfillment test stored');
      if (!outcomeEvidence.length) flags.push('No outcome evidence linked');
      const a = Object.hasOwn(assignments, id) ? assignments[id] : undefined;
      if (!a || !a.primary) flags.push('Classification needs review');
      if (typeof pr.core !== 'boolean') flags.push('Core designation not recorded');
      nodes.push({ id, lineageId: lineage, sourceRunId: run.id,
        projectSlug: slug, projectName: text(p.name) ?? slug, symbol: text(p.symbol) ?? slug.toUpperCase(),
        claimText: explicitClaim ?? criteria ?? 'Promise description not recorded',
        claimTextKind: explicitClaim ? 'published-description' : 'published-criteria',
        state, originalState: text(pr.state) ?? '(missing)', core: pr.core === true,
        assessmentExplanation: text(pr.rationale), assessedAt: text(pr.assessed_at), snapshotAsOf: run.as_of,
        claimSources, outcomeEvidence, evidenceRolesSeparated: separated, fulfillmentTest: criteria,
        primaryCategory: a?.primary ?? null, secondaryCategories: a?.secondary ?? [], tags: a?.tags ?? [],
        assignmentRationale: a?.rationale ?? null, assignmentAuthor: a?.author ?? null,
        projectHref: `/projects/${slug}`, promiseHref: `/projects/${slug}?evidence=${encodeURIComponent(lineage)}#${promiseAnchor(slug, lineage)}-evidence`,
        qualityFlags: flags });
    }
  }
  nodes.sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const layout = layoutFor(nodes);
  return { dataRevision: run.id, methodologyVersion: run.methodology, taxonomyVersion: TAXONOMY_VERSION,
    assignmentVersion: ASSIGNMENT_VERSION, layoutVersion: LAYOUT_VERSION, asOf: run.as_of,
    positioningMethod: 'curated-category', nodes, positions: layout.positions, regions: layout.regions,
    coverage: { projects: projects.size, unavailableProjects, layoutPending: layout.pending } };
}
