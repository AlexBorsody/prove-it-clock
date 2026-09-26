import { CATEGORIES, type CategoryId } from '../../../data/atlas-taxonomy';
import { ATLAS_STATES, type AtlasState, type AtlasNode } from './types';
export interface AtlasFilters { projects: string[]; category: CategoryId | ''; states: AtlasState[]; q: string; promise: string | null; primaryOnly?: boolean }
export const EMPTY_FILTERS: AtlasFilters = { projects:[],category:'',states:[],q:'',promise:null };
export function parseAtlasQuery(query: URLSearchParams, nodes: AtlasNode[]): AtlasFilters {
  const projects=new Set(nodes.map(n=>n.projectSlug)); const category=query.get('category');
  return {projects:[...new Set(query.getAll('project').filter(s=>projects.has(s)))],
    category:CATEGORIES.some(c=>c.id===category)?category as CategoryId:'',
    states:[...new Set(query.getAll('state').filter(s=>(ATLAS_STATES as readonly string[]).includes(s)))] as AtlasState[],
    q:(query.get('q')??'').slice(0,160), promise:query.get('promise')?.slice(0,1000)||null,
    ...(query.get('scope')==='primary'?{primaryOnly:true}:{}) };
}
export function matchesAtlas(node: AtlasNode, filters: AtlasFilters): boolean {
  const terms=filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const haystack=`${node.claimText} ${node.projectName} ${node.symbol}`.toLowerCase();
  return (!filters.projects.length||filters.projects.includes(node.projectSlug)) &&
    (!filters.states.length||filters.states.includes(node.state)) &&
    (!filters.category||(node.primaryCategory??'unclassified')===filters.category||(!filters.primaryOnly&&node.secondaryCategories.includes(filters.category))) &&
    terms.every(term=>haystack.includes(term));
}
export function atlasQuery(filters: AtlasFilters): string {
  const query=new URLSearchParams();
  for(const p of [...filters.projects].sort()) query.append('project',p);
  if(filters.category) query.set('category',filters.category);
  if(filters.primaryOnly) query.set('scope','primary');
  for(const s of [...filters.states].sort()) query.append('state',s);
  if(filters.q.trim()) query.set('q',filters.q);
  if(filters.promise) query.set('promise',filters.promise);
  return query.toString();
}
export function revealSelection(filters: AtlasFilters, nodes: AtlasNode[]) {
  const selected=nodes.find(n=>n.id===filters.promise);
  const cleared=!!selected&&!matchesAtlas(selected,filters);
  return { filters:cleared?{...EMPTY_FILTERS,promise:selected.id}:filters, cleared,
    missing:!!filters.promise&&!selected };
}
