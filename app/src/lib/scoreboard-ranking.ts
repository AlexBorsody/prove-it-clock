import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import type { DeliverySummary } from './promise-verdict';
import { projectFlags } from './project-policy';

export const BOARD_SORTS = ['rank','hearts','stars','commits','hype','market-cap','coin','code','use'] as const;
export type BoardSort=typeof BOARD_SORTS[number];
export type BoardCategory=CategoryId|'';
export const BOARD_SORT_LABELS:Record<BoardSort,string>={rank:'Category delivery rank',hearts:'Promises kept share',stars:'GitHub stars',commits:'Commits (90d)',hype:'Hype mentions', 'market-cap':'Market cap',coin:'Name',code:'CODE activity',use:'Usage'};
export function parseBoardSort(value:string|null,category:BoardCategory=''):BoardSort {
  if(value==='verdict') return 'coin'; // Retired score URLs open the project browser.
  // Old overall-rank URLs now open the unranked project browser.
  if(value==='rank'&&!category) return 'coin';
  return BOARD_SORTS.includes(value as BoardSort)?value as BoardSort:category?'rank':'coin';
}
export const parseBoardCategory=(value:string|null):BoardCategory=>CATEGORIES.some(c=>c.id===value)?value as CategoryId:'';
interface RankingRow {
  slug:string;name:string;rank:number;filledPct:number;code:string;
  codeStars:number|null;codeCommits:number|null;hypeMentions:number|null;marketCap:number|null;
  delivery:DeliverySummary|null;
}
function share(row:RankingRow,category:BoardCategory):number|null {
  if (!row.delivery || projectFlags(row.slug).genesis) return null;
  return category ? (row.delivery.categories[category]?.total ? row.delivery.categories[category].kept/row.delivery.categories[category].total : null) : row.filledPct;
}
export function categoryRanks(rows:RankingRow[],category:BoardCategory):Map<string,number> {
  if(!category) return new Map();
  const members=rows.filter(row=>share(row,category)!=null).sort((a,b)=>share(b,category)!-share(a,category)!||a.name.localeCompare(b.name));
  let rank=0,previous:number|null=null;
  return new Map(members.map((row,index)=>{const value=share(row,category)!;if(value!==previous)rank=index+1;previous=value;return [row.slug,rank];}));
}
export function sortScoreboard<T extends RankingRow>(rows:T[],sort:BoardSort,category:BoardCategory):T[] {
  function value(row:T):number|string|null {
    switch(sort) {
      case 'rank': return category?share(row,category):row.name;
      case 'hearts':return share(row,category);
      case 'stars':return row.codeStars;
      case 'commits':return row.codeCommits;
      case 'hype':return row.hypeMentions;
      case 'market-cap':return row.marketCap;
      case 'coin':return row.name;
      case 'code':return row.code==='Active'?1:row.code==='Quiet'?0:null;
      case 'use':return null;
    }
  }
  const clean=(v:number|string|null)=>typeof v==='number'&&!Number.isFinite(v)?null:v;
  function categoryMember(row:T):boolean {
    if (sort==='rank'||sort==='hearts') return share(row,category)!=null;
    // Genesis changes delivery eligibility, not which subjects its promises cover.
    return !!category && (row.delivery?.categories[category]?.total??0)>0;
  }
  return [...rows].sort((a,b)=>{
    if(category) {const am=categoryMember(a),bm=categoryMember(b);if(am!==bm)return am?-1:1;}
    const av=clean(value(a)),bv=clean(value(b));
    if(av===null||bv===null) return av===bv?a.name.localeCompare(b.name):av===null?1:-1;
    return (typeof av==='string'?av.localeCompare(String(bv)):Number(bv)-av)||a.name.localeCompare(b.name);
  });
}
