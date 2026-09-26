import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import type { DeliverySummary } from './promise-verdict';

export const BOARD_SORTS = ['rank','hearts','stars','commits','hype','market-cap','coin','verdict','code','use'] as const;
export type BoardSort=typeof BOARD_SORTS[number];
export type BoardCategory=CategoryId|'';
export const BOARD_SORT_LABELS:Record<BoardSort,string>={rank:'Overall rank',hearts:'Hearts kept share',stars:'GitHub stars',commits:'Commits (90d)',hype:'Hype mentions', 'market-cap':'Market cap',coin:'Name',verdict:'Shitcoin warning',code:'CODE activity',use:'Usage'};
export const parseBoardSort=(value:string|null):BoardSort=>BOARD_SORTS.includes(value as BoardSort)?value as BoardSort:'rank';
export const parseBoardCategory=(value:string|null):BoardCategory=>CATEGORIES.some(c=>c.id===value)?value as CategoryId:'';
interface RankingRow {
  slug:string;name:string;rank:number;filledPct:number;verdict:string;code:string;
  codeStars:number|null;codeCommits:number|null;hypeMentions:number|null;marketCap:number|null;
  delivery:DeliverySummary|null;
}
const share=(row:RankingRow,category:BoardCategory)=>category?(row.delivery?.categories[category]?.total?row.delivery.categories[category].kept/row.delivery.categories[category].total:null):row.delivery?row.filledPct:null;
export function categoryRanks(rows:RankingRow[],category:BoardCategory):Map<string,number> {
  if(!category) return new Map(rows.map(row=>[row.slug,row.rank]));
  const members=rows.filter(row=>share(row,category)!=null).sort((a,b)=>share(b,category)!-share(a,category)!||a.name.localeCompare(b.name));
  let rank=0,previous:number|null=null;
  return new Map(members.map((row,index)=>{const value=share(row,category)!;if(value!==previous)rank=index+1;previous=value;return [row.slug,rank];}));
}
export function sortScoreboard<T extends RankingRow>(rows:T[],sort:BoardSort,category:BoardCategory):T[] {
  const warning:Record<string,number>={'Not a shitcoin':1,Watch:4,'Shitcoin risk':7,Shitcoin:10};
  function value(row:T):number|string|null {
    switch(sort) {
      case 'rank': return category?share(row,category):-row.rank;
      case 'hearts':return share(row,category);
      case 'stars':return row.codeStars;
      case 'commits':return row.codeCommits;
      case 'hype':return row.hypeMentions;
      case 'market-cap':return row.marketCap;
      case 'coin':return row.name;
      case 'verdict':return warning[row.verdict]??null;
      case 'code':return row.code==='Active'?1:row.code==='Quiet'?0:null;
      case 'use':return null;
    }
  }
  const clean=(v:number|string|null)=>typeof v==='number'&&!Number.isFinite(v)?null:v;
  return [...rows].sort((a,b)=>{
    if(category) {const am=share(a,category)!=null,bm=share(b,category)!=null;if(am!==bm)return am?-1:1;}
    const av=clean(value(a)),bv=clean(value(b));
    if(av===null||bv===null) return av===bv?a.name.localeCompare(b.name):av===null?1:-1;
    return (typeof av==='string'?av.localeCompare(String(bv)):Number(bv)-av)||a.name.localeCompare(b.name);
  });
}
