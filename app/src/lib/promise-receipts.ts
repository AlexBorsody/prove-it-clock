import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import type { AtlasDataset, AtlasNode } from './atlas/types';
import type { DeliveryCounts } from './promise-verdict';

export const COMPOSITION_GROUPS = ['kept', 'unkept', 'open', 'unknown'] as const;
export type CompositionGroup = typeof COMPOSITION_GROUPS[number];
export const GROUP_LABELS: Record<CompositionGroup, string> = {
  kept: 'Kept', unkept: 'Lapsed / retired', open: 'Open / in progress', unknown: 'Unknown',
};
export function compositionGroup(node: AtlasNode): CompositionGroup {
  if (node.state === 'kept') return 'kept';
  if (node.state === 'lapsed' || node.state === 'retired') return 'unkept';
  if (node.state === 'open' || node.state === 'in_progress') return 'open';
  return 'unknown';
}
/** Counts only. No weights, judgment, or comparative ordering. */
export function compositionCounts(counts: DeliveryCounts): Record<CompositionGroup, number> {
  const s = counts.states;
  return {kept:s.kept, unkept:s.lapsed+s.retired, open:s.open+s.in_progress, unknown:s.unknown};
}
export interface ReceiptSelection {
  runId: string; methodology: string; assignmentVersion: string;
  category?: CategoryId; group?: CompositionGroup; promise?: string;
}
export type ReceiptRevision = Pick<ReceiptSelection, 'runId' | 'methodology' | 'assignmentVersion'>;
export const receiptRevision = (data: AtlasDataset): ReceiptRevision => ({
  runId:data.dataRevision, methodology:data.methodologyVersion, assignmentVersion:data.assignmentVersion,
});
export function evidenceReceipt(slug: string, revision: ReceiptRevision,
  filter: Pick<ReceiptSelection, 'category' | 'group' | 'promise'> = {}) {
  const query = new URLSearchParams({run:revision.runId, methodology:revision.methodology, assignments:revision.assignmentVersion});
  if (filter.category) query.set('category',filter.category);
  if (filter.group) query.set('group',filter.group);
  if (filter.promise) query.set('promise',filter.promise);
  return `/projects/${encodeURIComponent(slug)}/evidence?${query}`;
}
export function parseReceiptQuery(query: URLSearchParams): ReceiptSelection {
  function one(key: string, required = false): string | undefined {
    const values = query.getAll(key);
    if (values.length > 1 || (required && !values[0]) || (values[0]?.length ?? 0) > 500) throw new Error('Invalid receipt parameter');
    return values[0] || undefined;
  }
  const runId = one('run',true)!;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) throw new Error('Invalid run identifier');
  const methodology = one('methodology',true)!;
  const assignmentVersion = one('assignments',true)!;
  const category = one('category') as CategoryId | undefined;
  const group = one('group') as CompositionGroup | undefined;
  const promise = one('promise');
  if (category && !CATEGORIES.some(c => c.id === category)) throw new Error('Invalid category');
  if (group && !COMPOSITION_GROUPS.includes(group)) throw new Error('Invalid outcome group');
  return {runId,methodology,assignmentVersion,category,group,promise};
}
/** Never substitute a newer run or a changed category population for a shared receipt. */
export function receiptNodes(data: AtlasDataset, slug: string, selection: ReceiptSelection): AtlasNode[] {
  if (data.dataRevision !== selection.runId || data.methodologyVersion !== selection.methodology) throw new Error('Published run mismatch');
  if (selection.category && data.assignmentVersion !== selection.assignmentVersion) throw new Error('Category revision unavailable');
  return data.nodes.filter(node => node.projectSlug === slug &&
    (!selection.category || (node.primaryCategory ?? 'unclassified') === selection.category) &&
    (!selection.group || compositionGroup(node) === selection.group) &&
    (!selection.promise || node.id === selection.promise));
}
