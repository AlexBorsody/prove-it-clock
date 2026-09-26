import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { ATLAS_STATES, type AtlasDataset, type AtlasNode, type AtlasState } from './atlas/types';

export interface DeliveryCounts {
  total: number;
  kept: number;
  states: Record<AtlasState, number>;
}
export interface DeliverySummary extends DeliveryCounts {
  categories: Record<CategoryId, DeliveryCounts>;
}
function counts(nodes: AtlasNode[]): DeliveryCounts {
  const states = Object.fromEntries(ATLAS_STATES.map(state => [state,0])) as Record<AtlasState,number>;
  for (const node of nodes) states[node.state]++;
  return {total:nodes.length,kept:states.kept,states};
}
export function summarizeDelivery(data: AtlasDataset, slug: string): DeliverySummary | null {
  if (data.coverage.unavailableProjects.includes(slug)) return null;
  const nodes=data.nodes.filter(node=>node.projectSlug===slug);
  if(!nodes.length) return null;
  return {...counts(nodes), categories:Object.fromEntries(CATEGORIES.map(category=>[
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
