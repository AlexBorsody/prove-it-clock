import slots from './atlas-slots.json';
import { CATEGORIES, type CategoryId } from './atlas-taxonomy';
import type { AtlasNode, AtlasPosition, AtlasRegion } from '../src/lib/atlas/types';
export const LAYOUT_VERSION = 'atlas-layout-v1';
const COLS = 7, STEP = 42, WIDTH = 352, HEIGHT = 340, GAP = 24;
export const REGIONS: AtlasRegion[] = CATEGORIES.map((c,i) => ({ id:c.id, label:c.label, x:(i%3)*(WIDTH+GAP), y:Math.floor(i/3)*(HEIGHT+GAP), width:WIDTH, height:HEIGHT }));
export function layoutFor(nodes: Pick<AtlasNode,'id'|'primaryCategory'>[]) {
  const positions: AtlasPosition[] = [], pending: string[] = [];
  const regions = REGIONS.map(r=>({...r}));
  for (const region of regions) {
    const retained = slots[region.id] as string[];
    const members = nodes.filter(n=>(n.primaryCategory ?? 'unclassified') === region.id);
    // Retained IDs keep slots even if an old node disappears. Newly published
    // IDs occupy an extension until the next checked-in manifest revision.
    const additions = members.filter(n=>!retained.includes(n.id)).map(n=>n.id).sort();
    pending.push(...additions);
    const slotIds=[...retained,...additions];
    const rows=Math.ceil(slotIds.length/COLS);
    region.height=Math.max(HEIGHT, 90+rows*STEP);
    for(const n of members) {
      const i=slotIds.indexOf(n.id);
      positions.push({nodeId:n.id,x:region.x+44+(i%COLS)*STEP,y:region.y+94+Math.floor(i/COLS)*STEP});
    }
  }
  // Extension rows must never overlap the next category. Overflow uses a
  // dedicated right-hand lane, leaving every retained coordinate untouched.
  const overflow=positions.filter(p=>{
    const n=nodes.find(n=>n.id===p.nodeId)!;
    const r=REGIONS.find(r=>r.id===(n.primaryCategory ?? 'unclassified'))!;
    return p.y >= r.y+HEIGHT-20;
  });
  for(const p of overflow) {
    const n=nodes.find(n=>n.id===p.nodeId)!; const r=REGIONS.find(r=>r.id===(n.primaryCategory ?? 'unclassified'))!;
    const index=overflow.filter(q=>nodes.find(n=>n.id===q.nodeId)?.primaryCategory===n.primaryCategory).findIndex(q=>q.nodeId===p.nodeId);
    p.x=1160+(CATEGORIES.findIndex(c=>c.id===r.id))*WIDTH+44+(index%COLS)*STEP;
    p.y=94+Math.floor(index/COLS)*STEP;
  }
  if(overflow.length) for (const r of REGIONS) {
    const count=overflow.filter(p=>nodes.find(n=>n.id===p.nodeId)?.primaryCategory===(r.id==='unclassified'?null:r.id)).length;
    if(count) regions.push({...r,label:`${r.label} · new records`,x:1160+CATEGORIES.findIndex(c=>c.id===r.id)*WIDTH,y:0,height:Math.max(HEIGHT,90+Math.ceil(count/COLS)*STEP)});
  }
  for(const r of regions.slice(0,9)) r.height=HEIGHT;
  return {positions,regions,pending};
}
