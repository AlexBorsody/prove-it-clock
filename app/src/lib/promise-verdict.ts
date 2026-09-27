import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { ATLAS_STATES, type AtlasDataset, type AtlasNode, type AtlasState } from './atlas/types';
import { calculateDelivery, coreFinding, type DeliveryCalculation, type CoreFinding } from './delivery-calculation';

export interface DeliveryCounts {
  total: number;
  kept: number;
  states: Record<AtlasState, number>;
  calculation?: DeliveryCalculation;
}
export interface DeliverySummary extends DeliveryCounts {
  categories: Record<CategoryId, DeliveryCounts>;
  core?: CoreFinding;
  weightedMethodology?: boolean;
}
function counts(nodes: AtlasNode[]): DeliveryCounts {
  const states = Object.fromEntries(ATLAS_STATES.map(state => [state,0])) as Record<AtlasState,number>;
  for (const node of nodes) states[node.state]++;
  return {total:nodes.length,kept:states.kept,states,calculation:calculateDelivery(nodes)};
}
export function summarizeDelivery(data: AtlasDataset, slug: string): DeliverySummary | null {
  if (data.coverage.unavailableProjects.includes(slug)) return null;
  const nodes=data.nodes.filter(node=>node.projectSlug===slug);
  if(!nodes.length) return null;
  return {...counts(nodes), core:coreFinding(nodes), weightedMethodology:!!data.verdictVersions,
    categories:Object.fromEntries(CATEGORIES.map(category=>[
    category.id, counts(nodes.filter(node=>(node.primaryCategory??'unclassified')===category.id)),
  ])) as Record<CategoryId,DeliveryCounts>};
}
/** Receipts use the same primary-only population as the displayed total. */
export function deliveryReceipt(slug: string, category?: CategoryId, state?: AtlasState): string {
  const query=new URLSearchParams({project:slug});
  if(category) {query.set('category',category);query.set('scope','primary');}
  if(state) query.set('state',state);
  return `/atlas?${query}`;
}
