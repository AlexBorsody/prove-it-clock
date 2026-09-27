import type { AtlasNode } from './atlas/types';
import { IMPORTANCE_WEIGHTS, type DeliveryOutcome } from './promise-assessment';
import type { CategoryId } from '../../data/atlas-taxonomy';

export const DELIVERY_GROUPS = ['kept', 'unkept', 'pending', 'unknown'] as const;
export const GROUP_LABELS: Record<DeliveryOutcome, string> = {kept:'Kept',unkept:'Unkept',pending:'Open',unknown:'Unknown'};
export interface DeliveryGroup { count: number; weight: number | null; recordIds: string[] }
export interface DeliveryCalculation {
  availability: 'available' | 'unreviewed' | 'pending' | 'not-applicable';
  reason: string | null; totalWeight: number | null; resolvedWeight: number | null;
  provenShare: number | null; outcomeCoverage: number | null; resolvedShare: number | null;
  groups: Record<DeliveryOutcome, DeliveryGroup>;
}
export interface CoreFinding { outcome: DeliveryOutcome | null; label: string; recordId: string | null; category: CategoryId | null }
/** Legacy states retain their published meaning, without inventing v4 inputs. */
export function deliveryOutcome(node: AtlasNode): DeliveryOutcome {
  if (node.reviewed) return node.reviewed.outcome;
  if (node.state === 'kept') return 'kept';
  if (['lapsed','retired','missed'].includes(node.state)) return 'unkept';
  if (['open','in_progress'].includes(node.state)) return 'pending';
  return 'unknown';
}
export function coreFinding(nodes: AtlasNode[]): CoreFinding {
  const cores = nodes.filter(n => n.core);
  if (cores.length !== 1) return {outcome:null,label:'Core assessment unavailable',recordId:null,category:null};
  const node = cores[0], outcome = deliveryOutcome(node);
  const labels = {kept:'Core promise kept',unkept:'Core promise unkept',pending:'Core promise unresolved',unknown:'Core assessment unavailable'};
  return {outcome,label:labels[outcome],recordId:node.id,category:node.primaryCategory};
}
/** All public shares are fractions, rounded only by presentation. No clock or context inputs. */
export function calculateDelivery(nodes: AtlasNode[]): DeliveryCalculation {
  const group = (): DeliveryGroup => ({count:0,weight:0,recordIds:[]});
  const groups: Record<DeliveryOutcome,DeliveryGroup> = {kept:group(),unkept:group(),pending:group(),unknown:group()};
  const ids = new Set<string>(), units = new Set<string>(); let complete = true;
  for (const node of nodes) {
    if (ids.has(node.id)) throw new Error('Duplicate delivery record'); ids.add(node.id);
    const group = groups[deliveryOutcome(node)]; group.count++; group.recordIds.push(node.id);
    const p = node.reviewed, importance = node.importance;
    if (p) {
      const unit = `${node.projectSlug}:${p.admission.obligation_id}`;
      if (units.has(unit)) throw new Error('Duplicate independent obligation'); units.add(unit);
    }
    if (!importance) { complete = false; continue; }
    if (importance.weight !== IMPORTANCE_WEIGHTS[importance.tier] || !importance.rationale.trim() || !importance.author.trim()) throw new Error('Invalid reviewed importance');
    group.weight! += importance.weight;
  }
  for (const group of Object.values(groups)) group.recordIds.sort();
  const empty = {groups, totalWeight:null, resolvedWeight:null, provenShare:null, outcomeCoverage:null, resolvedShare:null};
  if (!nodes.length) return {...empty, availability:'not-applicable', reason:'No tracked promises in this subject.'};
  if (!complete) {
    for (const group of Object.values(groups)) group.weight = null;
    return {...empty, availability:'unreviewed',reason:'Weighted delivery is unavailable until importance is reviewed for every promise in this scope.'};
  }
  const totalWeight = Object.values(groups).reduce((n,g) => n+g.weight!,0);
  const resolvedWeight = groups.kept.weight! + groups.unkept.weight!;
  if (!(totalWeight > 0)) throw new Error('Invalid delivery denominator');
  return {groups,totalWeight,resolvedWeight,
    availability:resolvedWeight > 0 ? 'available' : 'pending',
    reason:resolvedWeight > 0 ? null : 'No resolved outcomes.',
    provenShare:resolvedWeight > 0 ? groups.kept.weight! / totalWeight : null,
    outcomeCoverage:resolvedWeight / totalWeight,
    resolvedShare:resolvedWeight > 0 ? groups.kept.weight! / resolvedWeight : null};
}
export interface ReceiptRevision {runId:string;methodology:string;assignments?:string}
export function verdictReceipt(slug: string, revision: ReceiptRevision, filter: {category?:CategoryId;group?:DeliveryOutcome;promise?:string} = {}) {
  const q = new URLSearchParams({run:revision.runId,methodology:revision.methodology});
  if (revision.assignments) q.set('assignments',revision.assignments);
  if (filter.category) q.set('category',filter.category);
  if (filter.group) q.set('group',filter.group);
  if (filter.promise) q.set('promise',filter.promise);
  return `/projects/${encodeURIComponent(slug)}/verdict?${q}`;
}
