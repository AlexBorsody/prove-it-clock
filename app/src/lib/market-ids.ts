/** Existing tracked-project mappings, shared by the market chart and scoreboard. */
export const MARKET_IDS: Record<string,string> = {btc:'bitcoin',eth:'ethereum',xrp:'ripple',bat:'basic-attention-token',link:'chainlink',sol:'solana',dash:'dash',avax:'avalanche-2'};
export function marketCapFor(slug:string, rows:{id:string;market_cap:number|null}[]):number|null {
  const value=rows.find(row=>row.id===MARKET_IDS[slug])?.market_cap;
  return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
}
