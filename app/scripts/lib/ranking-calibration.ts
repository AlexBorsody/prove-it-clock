/** Offline sensitivity analysis. Never imported by the public ranking/read path. */
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { ATLAS_STATES, type AtlasDataset, type AtlasNode, type AtlasState } from '../../src/lib/atlas/types';

export type DraftTier = 1 | 2 | 4;
export interface DraftWeight { tier: DraftTier; rationale: string }
export type DraftWeights = Map<string, DraftWeight>;
export interface Profile { id: string; weights: Record<DraftTier, number> }
// Parameter probes, not approved weights. Include the required less-steep 1:2:3 comparison.
export const PROFILES: Profile[] = [1, 2, 4].flatMap(material =>
  (material === 2 ? [2, 3, 4, 8] : [1, 2, 4, 8].filter(high => high >= material)).map(high => ({
    id: `1:${material}:${high}`, weights: { 1: 1, 2: material, 4: high },
  })));

/** Read Muse's table in place: do not create another editorial weight inventory. */
export function parseDraftWeights(markdown: string, nodes: AtlasNode[]): DraftWeights {
  const byLineage = new Map<string, AtlasNode[]>();
  for (const node of nodes) byLineage.set(node.lineageId, [...(byLineage.get(node.lineageId) ?? []), node]);
  const result: DraftWeights = new Map();
  let inTable = false;
  for (const line of markdown.split('\n')) {
    if (/^\|\s*lineage\s*\|\s*tier\s*\|\s*rationale\s*\|$/i.test(line.trim())) {
      inTable = true;
      continue;
    }
    if (!line.trim().startsWith('|')) { inTable = false; continue; }
    if (!inTable || /^\|[\s:|\-]+$/.test(line.trim())) continue;
    const cells = line.trim().slice(1, -1).split('|').map(cell => cell.trim());
    if (!line.trim().endsWith('|') || cells.length !== 3 || !cells[2] || !['1', '2', '4'].includes(cells[1])) {
      throw new Error(`Invalid draft weight row: ${line}`);
    }
    const matches = byLineage.get(cells[0]);
    if (matches?.length !== 1) throw new Error(`Unknown or ambiguous draft lineage: ${cells[0]}`);
    const id = matches[0].id;
    if (result.has(id)) throw new Error(`Duplicate draft weight: ${id}`);
    result.set(id, { tier: Number(cells[1]) as DraftTier, rationale: cells[2] });
  }
  if (!result.size) throw new Error('No draft weight tables found');
  return result;
}

export interface Measurement {
  availability: 'available' | 'missing-weights' | 'not-applicable';
  stateWeights: Record<AtlasState, number> | null;
  totalWeight: number | null;
  keptWeight: number | null;
  keptShare: number | null;
  rank: number | null;
  missingIds: string[];
}

export function measure(nodes: AtlasNode[], assignments: DraftWeights, profile: Profile): Measurement {
  for (const tier of [1, 2, 4] as const) {
    if (!Number.isFinite(profile.weights[tier]) || profile.weights[tier] <= 0) throw new Error('Weights must be finite and positive');
  }
  const unavailable = (availability: Measurement['availability'], missingIds: string[] = []): Measurement =>
    ({ availability, stateWeights: null, totalWeight: null, keptWeight: null, keptShare: null, rank: null, missingIds });
  if (!nodes.length) return unavailable('not-applicable');
  if (new Set(nodes.map(node => node.id)).size !== nodes.length) throw new Error('Duplicate promise identity');
  // Equal-weight baseline needs no draft assignment. Every weighted scope must be complete.
  const equal = profile.weights[1] === profile.weights[2] && profile.weights[2] === profile.weights[4];
  const missingIds = equal ? [] : nodes.filter(node => !assignments.has(node.id)).map(node => node.id);
  if (missingIds.length) return unavailable('missing-weights', missingIds);
  const stateWeights = Object.fromEntries(ATLAS_STATES.map(state => [state, 0])) as Record<AtlasState, number>;
  for (const node of nodes) {
    if (!ATLAS_STATES.includes(node.state)) throw new Error('Unsupported normalized state');
    const weight = equal ? profile.weights[1] : profile.weights[assignments.get(node.id)!.tier];
    if (!Number.isFinite(weight) || weight <= 0) throw new Error('Invalid assigned tier');
    stateWeights[node.state] += weight;
  }
  const totalWeight = Object.values(stateWeights).reduce((sum, n) => sum + n, 0);
  if (!Number.isFinite(totalWeight)) throw new Error('Weight total overflow');
  return { availability: 'available', stateWeights, totalWeight, keptWeight: stateWeights.kept,
    keptShare: stateWeights.kept / totalWeight, rank: null, missingIds: [] };
}

export interface Scope {
  project: string;
  category: CategoryId;
  promiseIds: string[];
  states: Record<AtlasState, number>;
  coreFindings: Array<{ id: string; state: AtlasState }>;
  comparison: 'eligible' | 'genesis' | 'unclassified' | 'no-resolved-outcomes';
  profiles: Record<string, Measurement>;
}

/** Keep pending, unknown and recorded negative outcomes distinguishable in the report. */
export function formatStateBreakdown(scope: Scope): string {
  const weights = scope.profiles['1:2:4']?.stateWeights;
  return ATLAS_STATES.filter(state => scope.states[state] > 0).map(state =>
    `${scope.states[state]} ${state.replace('_', ' ')} (${weights == null ? 'weight unavailable' : `weight ${weights[state]}`})`,
  ).join('; ');
}

export function calibrate(data: AtlasDataset, assignments: DraftWeights, profiles = PROFILES) {
  if (!profiles.length || new Set(profiles.map(profile => profile.id)).size !== profiles.length) throw new Error('Missing or duplicate profiles');
  if (new Set(data.nodes.map(node => node.id)).size !== data.nodes.length) throw new Error('Duplicate promise identity');
  const scopes: Scope[] = [];
  const projects = [...new Set(data.nodes.map(node => node.projectSlug))].sort();
  for (const category of CATEGORIES) for (const project of projects) {
    const nodes = data.nodes.filter(node => node.projectSlug === project && (node.primaryCategory ?? 'unclassified') === category.id);
    if (!nodes.length) continue;
    const states = Object.fromEntries(ATLAS_STATES.map(state => [state, nodes.filter(node => node.state === state).length])) as Record<AtlasState, number>;
    scopes.push({ project, category: category.id, promiseIds: nodes.map(node => node.id), states,
      // Whole-project core findings survive a category filter. Draft tier 4 never changes core.
      coreFindings: data.nodes.filter(node => node.projectSlug === project && node.core).map(node => ({ id: node.id, state: node.state })),
      comparison: project === 'btc' ? 'genesis' : category.id === 'unclassified' ? 'unclassified'
        : states.kept + states.lapsed + states.retired === 0 ? 'no-resolved-outcomes' : 'eligible',
      profiles: Object.fromEntries(profiles.map(profile => [profile.id, measure(nodes, assignments, profile)])) });
  }
  // Diagnostic competition ranks, within primary categories only. No cross-category total.
  for (const category of CATEGORIES) for (const profile of profiles) {
    const eligible = scopes.filter(scope => scope.category === category.id && scope.comparison === 'eligible'
      && scope.profiles[profile.id].availability === 'available');
    for (const scope of eligible) {
      const value = scope.profiles[profile.id];
      value.rank = 1 + eligible.filter(other => {
        const candidate = other.profiles[profile.id];
        return candidate.keptWeight! * value.totalWeight! > value.keptWeight! * candidate.totalWeight!;
      }).length;
    }
  }
  return {
    formatVersion: 'ranking-calibration-v1', mode: 'diagnostic-only', dataRevision: data.dataRevision,
    methodologyVersion: data.methodologyVersion, taxonomyVersion: data.taxonomyVersion,
    assignmentVersion: data.assignmentVersion, asOf: data.asOf, profiles,
    coverage: { projects: projects.length, promises: data.nodes.length, draftWeights: assignments.size,
      missingWeightIds: data.nodes.filter(node => !assignments.has(node.id)).map(node => node.id),
      unavailableProjects: data.coverage.unavailableProjects,
      qualityFlags: Object.fromEntries([...new Set(data.nodes.flatMap(node => node.qualityFlags))].sort().map(flag =>
        [flag, data.nodes.filter(node => node.qualityFlags.includes(flag)).length])) },
    scopes,
    reviewClaims: data.nodes.filter(node => assignments.get(node.id)?.tier === 4 || node.core).map(node => {
      const assignment = assignments.get(node.id);
      const scope = scopes.find(scope => scope.project === node.projectSlug && scope.promiseIds.includes(node.id))!;
      const draft = scope.profiles['1:2:4'];
      return { id: node.id, lineage: node.lineageId, project: node.projectSlug, category: scope.category, state: node.state,
        core: node.core, draftTier: assignment?.tier ?? null, rationale: assignment?.rationale ?? null,
        maxCorrectionPoints: draft?.totalWeight && assignment ? 100 * assignment.tier / draft.totalWeight : null,
        qualityFlags: node.qualityFlags };
    }),
  };
}
