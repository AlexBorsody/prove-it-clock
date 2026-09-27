import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import type { DeliverySummary } from './promise-verdict';
import { projectFlags } from './project-policy';

export const BOARD_SORTS = ['rank','hearts','stars','commits','hype','market-cap','coin','verdict','code','use'] as const;
export type BoardSort=typeof BOARD_SORTS[number];
export type BoardCategory=CategoryId|'';
export const BOARD_SORT_LABELS:Record<BoardSort,string>={rank:'Category delivery rank',hearts:'Hearts kept share',stars:'GitHub stars',commits:'Commits (90d)',hype:'Hype mentions', 'market-cap':'Market cap',coin:'Name',verdict:'Shitcoin warning',code:'CODE activity',use:'Usage'};
export function parseBoardSort(value:string|null,category:BoardCategory=''):BoardSort {
  // Old overall-rank URLs now open the unranked project browser.
  if(value==='rank'&&!category) return 'coin';
  return BOARD_SORTS.includes(value as BoardSort)?value as BoardSort:category?'rank':'coin';
}
export const parseBoardCategory=(value:string|null):BoardCategory=>CATEGORIES.some(c=>c.id===value)?value as CategoryId:'';
interface RankingRow {
  slug:string;name:string;rank:number;filledPct:number;verdict:string;code:string;
  codeStars:number|null;codeCommits:number|null;hypeMentions:number|null;marketCap:number|null;
  delivery:DeliverySummary|null;
}
export const deliveryShare=(row:RankingRow,category:BoardCategory):number|null=>{
  if(!row.delivery || projectFlags(row.slug).genesis) return null;
  const scope=category?row.delivery.categories[category]:row.delivery;
  if(!scope?.total) return null;
  return row.delivery.weightedMethodology ? scope.calculation?.provenShare ?? null : category ? scope.kept/scope.total : row.filledPct;
};
export function categoryRanks(rows:RankingRow[],category:BoardCategory):Map<string,number> {
  if(!category) return new Map();
  const members=rows.filter(row=>deliveryShare(row,category)!=null).sort((a,b)=>deliveryShare(b,category)!-deliveryShare(a,category)!||a.name.localeCompare(b.name));
  let rank=0,previous:number|null=null;
  return new Map(members.map((row,index)=>{const value=deliveryShare(row,category)!;if(value!==previous)rank=index+1;previous=value;return [row.slug,rank];}));
}
export function sortScoreboard<T extends RankingRow>(rows:T[],sort:BoardSort,category:BoardCategory):T[] {
  const warning:Record<string,number>={'Not a shitcoin':1,Watch:4,'Shitcoin risk':7,Shitcoin:10};
  function value(row:T):number|string|null {
    switch(sort) {
      case 'rank': return category?deliveryShare(row,category):row.name;
      case 'hearts':return deliveryShare(row,category);
      case 'stars':return row.codeStars;
      case 'commits':return row.codeCommits;
      case 'hype':return row.hypeMentions;
      case 'market-cap':return row.marketCap;
      case 'coin':return row.name;
      case 'verdict':return projectFlags(row.slug).genesis || row.delivery?.weightedMethodology ? null : warning[row.verdict]??null;
      case 'code':return row.code==='Active'?1:row.code==='Quiet'?0:null;
      case 'use':return null;
    }
  }
  const clean=(v:number|string|null)=>typeof v==='number'&&!Number.isFinite(v)?null:v;
  return [...rows].sort((a,b)=>{
    if(category) {const am=deliveryShare(a,category)!=null,bm=deliveryShare(b,category)!=null;if(am!==bm)return am?-1:1;}
    const av=clean(value(a)),bv=clean(value(b));
    if(av===null||bv===null) return av===bv?a.name.localeCompare(b.name):av===null?1:-1;
    return (typeof av==='string'?av.localeCompare(String(bv)):Number(bv)-av)||a.name.localeCompare(b.name);
  });
}
