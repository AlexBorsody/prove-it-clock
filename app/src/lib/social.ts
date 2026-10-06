/**
 * Social metrics: Prove-It's own social data layer.
 *
 * DISPLAY ONLY. Social metrics never feed the hearts scoring algorithm.
 * They are our proprietary signal layer: instead of cloning CoinGecko's
 * raw community numbers, we juxtapose HYPE (social volume) against
 * SUBSTANCE (hearts earned). A project with massive hype and few hearts
 * reads as all sizzle, no steak. That contrast is the differentiator.
 *
 * This module holds types, per-project source config, and pure helpers.
 * Network fetching lives in lib/social-collect.ts (server only) so this
 * file stays safe to import from client components.
 */

/** Per-project social sources. Subreddits are well-known communities;
 *  Telegram handles are best-effort (public preview pages only). */
export interface SocialSource {
  subreddit: string; // without the r/
  telegram: string; // t.me handle, without @
  newsQuery: string; // Google News RSS search
}

export const SOCIAL_SOURCES: Record<string, SocialSource> = {
  btc: { subreddit: "Bitcoin", telegram: "bitcoin", newsQuery: "bitcoin" },
  eth: { subreddit: "ethereum", telegram: "ethereum", newsQuery: "ethereum" },
  xrp: { subreddit: "XRP", telegram: "xrp", newsQuery: "XRP" },
  sol: { subreddit: "solana", telegram: "solana", newsQuery: "solana" },
  link: { subreddit: "Chainlink", telegram: "chainlink", newsQuery: "chainlink" },
  avax: { subreddit: "Avax", telegram: "avalanche", newsQuery: "Avalanche AVAX" },
  dash: { subreddit: "dashpay", telegram: "dashpay", newsQuery: "Dash cryptocurrency" },
  bat: { subreddit: "BATProject", telegram: "batproject", newsQuery: "Basic Attention Token" },
  trac: { subreddit: "OriginTrail", telegram: "origintrail", newsQuery: "OriginTrail TRAC" },
  ada: { subreddit: "", telegram: "", newsQuery: "Cardano" },
  usdt: { subreddit: "", telegram: "", newsQuery: "Tether" },
  bnb: { subreddit: "", telegram: "", newsQuery: "BNB" },
  usdc: { subreddit: "", telegram: "", newsQuery: "USD Coin" },
  trx: { subreddit: "", telegram: "", newsQuery: "TRON" },
  zec: { subreddit: "", telegram: "", newsQuery: "Zcash" },
  hype: { subreddit: "", telegram: "", newsQuery: "Hyperliquid" },
  doge: { subreddit: "", telegram: "", newsQuery: "Dogecoin" },
  xmr: { subreddit: "", telegram: "", newsQuery: "Monero" },
  rain: { subreddit: "", telegram: "", newsQuery: "Rain" },
  usds: { subreddit: "", telegram: "", newsQuery: "USDS" },
  leo: { subreddit: "", telegram: "", newsQuery: "LEO Token" },
  xlm: { subreddit: "", telegram: "", newsQuery: "Stellar" },
  figr_heloc: { subreddit: "", telegram: "", newsQuery: "Figure Heloc" },
  wbt: { subreddit: "", telegram: "", newsQuery: "WhiteBIT Coin" },
  near: { subreddit: "", telegram: "", newsQuery: "NEAR Protocol" },
  bch: { subreddit: "", telegram: "", newsQuery: "Bitcoin Cash" },
  uni: { subreddit: "", telegram: "", newsQuery: "Uniswap" },
  ltc: { subreddit: "", telegram: "", newsQuery: "Litecoin" },
  canton: { subreddit: "", telegram: "", newsQuery: "Canton" },
  hbar: { subreddit: "", telegram: "", newsQuery: "Hedera" },
  usde: { subreddit: "", telegram: "", newsQuery: "Ethena USDe" },
  sui: { subreddit: "", telegram: "", newsQuery: "Sui" },
  ton: { subreddit: "", telegram: "", newsQuery: "Gram (prev. Toncoin)" },
  syrup: { subreddit: "", telegram: "", newsQuery: "Maple Finance" },
  rune: { subreddit: "", telegram: "", newsQuery: "THORChain" },
  akt: { subreddit: "", telegram: "", newsQuery: "Akash Network" },
  eigen: { subreddit: "", telegram: "", newsQuery: "EigenCloud (prev. EigenLayer)" },
  twt: { subreddit: "", telegram: "", newsQuery: "Trust Wallet" },
  comp: { subreddit: "", telegram: "", newsQuery: "Compound" },
  kaia: { subreddit: "", telegram: "", newsQuery: "Kaia" },
  imx: { subreddit: "", telegram: "", newsQuery: "Immutable" },
  snx: { subreddit: "", telegram: "", newsQuery: "Synthetix" },
  "1inch": { subreddit: "", telegram: "", newsQuery: "1INCH" },
  tao: { subreddit: "", telegram: "", newsQuery: "Bittensor" },
  geod: { subreddit: "", telegram: "", newsQuery: "Geodnet" },
  dot: { subreddit: "", telegram: "", newsQuery: "Polkadot" },
  om: { subreddit: "", telegram: "", newsQuery: "MANTRA" },
  pepe: { subreddit: "", telegram: "", newsQuery: "Pepe" },
  ondo: { subreddit: "", telegram: "", newsQuery: "Ondo" },
  render: { subreddit: "", telegram: "", newsQuery: "Render" },
  arb: { subreddit: "", telegram: "", newsQuery: "Arbitrum" },
  kas: { subreddit: "", telegram: "", newsQuery: "Kaspa" },
  aave: { subreddit: "", telegram: "", newsQuery: "Aave" },
  atom: { subreddit: "", telegram: "", newsQuery: "Cosmos Hub" },
  algo: { subreddit: "", telegram: "", newsQuery: "Algorand" },
  fet: { subreddit: "", telegram: "", newsQuery: "Artificial Superintelligence Alliance" },
  jup: { subreddit: "", telegram: "", newsQuery: "Jupiter" },
  sei: { subreddit: "", telegram: "", newsQuery: "Sei" },
  floki: { subreddit: "", telegram: "", newsQuery: "FLOKI" },
  bonk: { subreddit: "", telegram: "", newsQuery: "Bonk" },
  strk: { subreddit: "", telegram: "", newsQuery: "Starknet" },
  inj: { subreddit: "", telegram: "", newsQuery: "Injective" },
  op: { subreddit: "", telegram: "", newsQuery: "Optimism" },
  grt: { subreddit: "", telegram: "", newsQuery: "The Graph" },
  qnt: { subreddit: "", telegram: "", newsQuery: "Quant" },
  ldo: { subreddit: "", telegram: "", newsQuery: "Lido DAO" },
  ousd: { subreddit: "", telegram: "", newsQuery: "Ondo USD Yield" },
  gala: { subreddit: "", telegram: "", newsQuery: "GALA" },
  sky: { subreddit: "", telegram: "", newsQuery: "Sky" },
  pengu: { subreddit: "", telegram: "", newsQuery: "Pudgy Penguins" },
  fil: { subreddit: "", telegram: "", newsQuery: "Filecoin" },
  xaut: { subreddit: "", telegram: "", newsQuery: "Tether Gold" },
  wld: { subreddit: "", telegram: "", newsQuery: "Worldcoin" },
  crv: { subreddit: "", telegram: "", newsQuery: "Curve DAO" },
  pyth: { subreddit: "", telegram: "", newsQuery: "Pyth Network" },
  hsol: { subreddit: "", telegram: "", newsQuery: "Helius Staked SOL" },
  jto: { subreddit: "", telegram: "", newsQuery: "Jito" },
  xtz: { subreddit: "", telegram: "", newsQuery: "Tezos" },
  bgb: { subreddit: "", telegram: "", newsQuery: "Bitget Token" },
  jasmy: { subreddit: "", telegram: "", newsQuery: "JasmyCoin" },
  cfx: { subreddit: "", telegram: "", newsQuery: "Conflux" },
  cake: { subreddit: "", telegram: "", newsQuery: "PancakeSwap" },
  nexo: { subreddit: "", telegram: "", newsQuery: "NEXO" },
  fartcoin: { subreddit: "", telegram: "", newsQuery: "Fartcoin" },
  okb: { subreddit: "", telegram: "", newsQuery: "OKB" },
  tia: { subreddit: "", telegram: "", newsQuery: "Celestia" },
  vet: { subreddit: "", telegram: "", newsQuery: "VeChain" },
  eos: { subreddit: "", telegram: "", newsQuery: "EOS" },
  s: { subreddit: "", telegram: "", newsQuery: "Sonic" },
  iota: { subreddit: "", telegram: "", newsQuery: "IOTA" },
  xdc: { subreddit: "", telegram: "", newsQuery: "XDC Network" },
  ath: { subreddit: "", telegram: "", newsQuery: "Aethir" },
  wif: { subreddit: "", telegram: "", newsQuery: "dogwifhat" },
  hnt: { subreddit: "", telegram: "", newsQuery: "Helium" },
  stx: { subreddit: "", telegram: "", newsQuery: "Stacks" },
  kava: { subreddit: "", telegram: "", newsQuery: "Kava" },
  mnt: { subreddit: "", telegram: "", newsQuery: "Mantle" },
  apt: { subreddit: "", telegram: "", newsQuery: "Aptos" },
  pol: { subreddit: "", telegram: "", newsQuery: "Polygon" },
  ftm: { subreddit: "", telegram: "", newsQuery: "Fantom" },
  cro: { subreddit: "", telegram: "", newsQuery: "Cronos" },
  egld: { subreddit: "", telegram: "", newsQuery: "MultiversX" },
  flow: { subreddit: "", telegram: "", newsQuery: "Flow" },
  chz: { subreddit: "", telegram: "", newsQuery: "Chiliz" },
  a7a5: { subreddit: "", telegram: "", newsQuery: "A7A5" },
  xpl: { subreddit: "", telegram: "", newsQuery: "Plasma" },
  pendle: { subreddit: "", telegram: "", newsQuery: "Pendle" },
  drv: { subreddit: "", telegram: "", newsQuery: "Derive" },
  spx: { subreddit: "", telegram: "", newsQuery: "SPX6900" },
  bsv: { subreddit: "", telegram: "", newsQuery: "Bitcoin SV" },
  mon: { subreddit: "", telegram: "", newsQuery: "Monad" },
  ff: { subreddit: "", telegram: "", newsQuery: "Falcon Finance" },
  btt: { subreddit: "", telegram: "", newsQuery: "BitTorrent" },
  pieverse: { subreddit: "", telegram: "", newsQuery: "Pieverse" },
  kite: { subreddit: "", telegram: "", newsQuery: "Kite" },
  ub: { subreddit: "", telegram: "", newsQuery: "Unibase" },
  usdai: { subreddit: "", telegram: "", newsQuery: "USDai" },
  sofid: { subreddit: "", telegram: "", newsQuery: "SoFiUSD" },
  prl: { subreddit: "", telegram: "", newsQuery: "Pearl" },
  sun: { subreddit: "", telegram: "", newsQuery: "Sun Token" },
  hash: { subreddit: "", telegram: "", newsQuery: "Provenance Blockchain" },
  jtrsy: { subreddit: "", telegram: "", newsQuery: "Janus Henderson Anemoy Treasury Fund" },
  fdusd: { subreddit: "", telegram: "", newsQuery: "First Digital USD" },
  ousg: { subreddit: "", telegram: "", newsQuery: "Ondo Short-Term U.S. Government Bond Fund" },
  dcr: { subreddit: "", telegram: "", newsQuery: "Decred" },
  apxusd: { subreddit: "", telegram: "", newsQuery: "apxUSD" },
  gno: { subreddit: "", telegram: "", newsQuery: "Gnosis" },
  bp: { subreddit: "", telegram: "", newsQuery: "Backpack" },
  ohm: { subreddit: "", telegram: "", newsQuery: "Olympus" },
  reusd: { subreddit: "", telegram: "", newsQuery: "Re Protocol reUSD" },
  lunc: { subreddit: "", telegram: "", newsQuery: "Terra Luna Classic" },
  ar: { subreddit: "", telegram: "", newsQuery: "Arweave" },
  ens: { subreddit: "", telegram: "", newsQuery: "Ethereum Name Service" },
  pons: { subreddit: "", telegram: "", newsQuery: "Pons" },
  apepe: { subreddit: "", telegram: "", newsQuery: "Ape and Pepe" },
  zbcn: { subreddit: "", telegram: "", newsQuery: "Zebec Network" },
  useless: { subreddit: "", telegram: "", newsQuery: "Useless Coin" },
  axs: { subreddit: "", telegram: "", newsQuery: "Axie Infinity" },
  nft: { subreddit: "", telegram: "", newsQuery: "AINFT" },
  "2z": { subreddit: "", telegram: "", newsQuery: "DoubleZero" },
  sand: { subreddit: "", telegram: "", newsQuery: "The Sandbox" },
  crvusd: { subreddit: "", telegram: "", newsQuery: "crvUSD" },
  kmno: { subreddit: "", telegram: "", newsQuery: "Kamino" },
  theta: { subreddit: "", telegram: "", newsQuery: "Theta Network" },
  cards: { subreddit: "", telegram: "", newsQuery: "Collector Crypt" },
  kag: { subreddit: "", telegram: "", newsQuery: "Kinesis Silver" },
  koge: { subreddit: "", telegram: "", newsQuery: "KOGE" },
  ausd: { subreddit: "", telegram: "", newsQuery: "AUSD" },
  zama: { subreddit: "", telegram: "", newsQuery: "Zama" },
  frax: { subreddit: "", telegram: "", newsQuery: "Legacy Frax Dollar" },
  shfl: { subreddit: "", telegram: "", newsQuery: "Shuffle" },
  usx: { subreddit: "", telegram: "", newsQuery: "USX" },
  safo: { subreddit: "", telegram: "", newsQuery: "Spiko Amundi Overnight Swap Fund" },
  cvx: { subreddit: "", telegram: "", newsQuery: "Convex Finance" },
  mina: { subreddit: "", telegram: "", newsQuery: "Mina Protocol" },
  mana: { subreddit: "", telegram: "", newsQuery: "Decentraland" },
  pc0000031: { subreddit: "", telegram: "", newsQuery: "Tradable NA Rent Financing Platform SSTN" },
  grx: { subreddit: "", telegram: "", newsQuery: "GRX Chain" },
  xcn: { subreddit: "", telegram: "", newsQuery: "Onyxcoin" },
  eurcv: { subreddit: "", telegram: "", newsQuery: "EUR CoinVertible" },
  usat: { subreddit: "", telegram: "", newsQuery: "USAT" },
  neo: { subreddit: "", telegram: "", newsQuery: "NEO" },
  internet-computer: { subreddit: "", telegram: "", newsQuery: "Internet Computer" },
  berachain: { subreddit: "", telegram: "", newsQuery: "Berachain" },
  harmony: { subreddit: "", telegram: "", newsQuery: "Harmony" },
  oasis-network: { subreddit: "", telegram: "", newsQuery: "Oasis Network" },
  zilliqa: { subreddit: "", telegram: "", newsQuery: "Zilliqa" },
  waves: { subreddit: "", telegram: "", newsQuery: "Waves" },
  kadena: { subreddit: "", telegram: "", newsQuery: "Kadena" },
  nervos-network: { subreddit: "", telegram: "", newsQuery: "Nervos Network" },
  radix: { subreddit: "", telegram: "", newsQuery: "Radix" },
  zksync: { subreddit: "", telegram: "", newsQuery: "ZKsync" },
  scroll: { subreddit: "", telegram: "", newsQuery: "Scroll" },
  blast: { subreddit: "", telegram: "", newsQuery: "Blast" },
  dydx: { subreddit: "", telegram: "", newsQuery: "dYdX" },
  taiko: { subreddit: "", telegram: "", newsQuery: "Taiko" },
  metis: { subreddit: "", telegram: "", newsQuery: "Metis" },
  movement: { subreddit: "", telegram: "", newsQuery: "Movement" },
  fuel: { subreddit: "", telegram: "", newsQuery: "Fuel" },
  aevo: { subreddit: "", telegram: "", newsQuery: "Aevo" },
  base: { subreddit: "", telegram: "", newsQuery: "Base" },
  balancer: { subreddit: "", telegram: "", newsQuery: "Balancer" },
  sushiswap: { subreddit: "", telegram: "", newsQuery: "SushiSwap" },
  yearn-finance: { subreddit: "", telegram: "", newsQuery: "Yearn" },
  gmx: { subreddit: "", telegram: "", newsQuery: "GMX" },
  raydium: { subreddit: "", telegram: "", newsQuery: "Raydium" },
  orca: { subreddit: "", telegram: "", newsQuery: "Orca" },
  morpho: { subreddit: "", telegram: "", newsQuery: "Morpho" },
  liquity: { subreddit: "", telegram: "", newsQuery: "Liquity" },
  rocket-pool: { subreddit: "", telegram: "", newsQuery: "Rocket Pool" },
  ethena: { subreddit: "", telegram: "", newsQuery: "Ethena" },
  etherfi: { subreddit: "", telegram: "", newsQuery: "Ether.fi" },
  renzo: { subreddit: "", telegram: "", newsQuery: "Renzo" },
  marinade: { subreddit: "", telegram: "", newsQuery: "Marinade" },
  goldfinch: { subreddit: "", telegram: "", newsQuery: "Goldfinch" },
  centrifuge: { subreddit: "", telegram: "", newsQuery: "Centrifuge" },
  band: { subreddit: "", telegram: "", newsQuery: "Band Protocol" },
  api3: { subreddit: "", telegram: "", newsQuery: "API3" },
  storj: { subreddit: "", telegram: "", newsQuery: "Storj" },
  siacoin: { subreddit: "", telegram: "", newsQuery: "Siacoin" },
  livepeer: { subreddit: "", telegram: "", newsQuery: "Livepeer" },
  ocean: { subreddit: "", telegram: "", newsQuery: "Ocean Protocol" },
  covalent: { subreddit: "", telegram: "", newsQuery: "Covalent" },
  ankr: { subreddit: "", telegram: "", newsQuery: "Ankr" },
  pocket: { subreddit: "", telegram: "", newsQuery: "Pocket Network" },
  tellor: { subreddit: "", telegram: "", newsQuery: "Tellor" },
  layerzero: { subreddit: "", telegram: "", newsQuery: "LayerZero" },
  wormhole: { subreddit: "", telegram: "", newsQuery: "Wormhole" },
  axelar: { subreddit: "", telegram: "", newsQuery: "Axelar" },
  across: { subreddit: "", telegram: "", newsQuery: "Across Protocol" },
  synapse: { subreddit: "", telegram: "", newsQuery: "Synapse Protocol" },
  stargate: { subreddit: "", telegram: "", newsQuery: "Stargate Finance" },
  aleo: { subreddit: "", telegram: "", newsQuery: "Aleo" },
  ironfish: { subreddit: "", telegram: "", newsQuery: "Iron Fish" },
  hivemapper: { subreddit: "", telegram: "", newsQuery: "Hivemapper" },
  ionet: { subreddit: "", telegram: "", newsQuery: "io.net" },
  ronin: { subreddit: "", telegram: "", newsQuery: "Ronin" },
  enjin: { subreddit: "", telegram: "", newsQuery: "Enjin" },
  mythos: { subreddit: "", telegram: "", newsQuery: "Mythos" },
  beam: { subreddit: "", telegram: "", newsQuery: "Beam" },
  xai: { subreddit: "", telegram: "", newsQuery: "Xai" },
  treasure: { subreddit: "", telegram: "", newsQuery: "Treasure" },
  blur: { subreddit: "", telegram: "", newsQuery: "Blur" },
  illuvium: { subreddit: "", telegram: "", newsQuery: "Illuvium" },
  wax: { subreddit: "", telegram: "", newsQuery: "WAX" },
  echelon-prime: { subreddit: "", telegram: "", newsQuery: "Echelon Prime" },
  osmosis: { subreddit: "", telegram: "", newsQuery: "Osmosis" },
  kujira: { subreddit: "", telegram: "", newsQuery: "Kujira" },
  neutron: { subreddit: "", telegram: "", newsQuery: "Neutron" },
  stride: { subreddit: "", telegram: "", newsQuery: "Stride" },
  secret: { subreddit: "", telegram: "", newsQuery: "Secret Network" },
  juno: { subreddit: "", telegram: "", newsQuery: "Juno" },
  babylon: { subreddit: "", telegram: "", newsQuery: "Babylon" },
  mars: { subreddit: "", telegram: "", newsQuery: "Mars Protocol" },
  star-atlas: { subreddit: "", telegram: "", newsQuery: "Star Atlas" },
  step-finance: { subreddit: "", telegram: "", newsQuery: "Step Finance" },
  mango-markets: { subreddit: "", telegram: "", newsQuery: "Mango Markets" },
  drift-protocol: { subreddit: "", telegram: "", newsQuery: "Drift Protocol" },
  tensor: { subreddit: "", telegram: "", newsQuery: "Tensor" },
  sanctum: { subreddit: "", telegram: "", newsQuery: "Sanctum" },
  singularitynet: { subreddit: "", telegram: "", newsQuery: "SingularityNET" },
  dimo: { subreddit: "", telegram: "", newsQuery: "DIMO" },
  peaq: { subreddit: "", telegram: "", newsQuery: "peaq" },
  numerai: { subreddit: "", telegram: "", newsQuery: "Numerai" },
  virtuals-protocol: { subreddit: "", telegram: "", newsQuery: "Virtuals Protocol" },
  astar: { subreddit: "", telegram: "", newsQuery: "Astar" },
  moonbeam: { subreddit: "", telegram: "", newsQuery: "Moonbeam" },
  celo: { subreddit: "", telegram: "", newsQuery: "Celo" },
  sommelier: { subreddit: "", telegram: "", newsQuery: "Sommelier" },
  beefy: { subreddit: "", telegram: "", newsQuery: "Beefy Finance" },
  vertex: { subreddit: "", telegram: "", newsQuery: "Vertex Protocol" },
  dia: { subreddit: "", telegram: "", newsQuery: "DIA" },
  subsquid: { subreddit: "", telegram: "", newsQuery: "Subsquid" },
  supra: { subreddit: "", telegram: "", newsQuery: "Supra" },
  railgun: { subreddit: "", telegram: "", newsQuery: "Railgun" },
  allora: { subreddit: "", telegram: "", newsQuery: "Allora Network" },
  grass: { subreddit: "", telegram: "", newsQuery: "Grass" },
  nosana: { subreddit: "", telegram: "", newsQuery: "Nosana" },
  weatherxm: { subreddit: "", telegram: "", newsQuery: "WeatherXM" },
  wingbits: { subreddit: "", telegram: "", newsQuery: "Wingbits" },
  plume: { subreddit: "", telegram: "", newsQuery: "Plume Network" },
  debridge: { subreddit: "", telegram: "", newsQuery: "deBridge" },
  swell: { subreddit: "", telegram: "", newsQuery: "Swell Network" },
  silencio: { subreddit: "", telegram: "", newsQuery: "Silencio" },
  natix: { subreddit: "", telegram: "", newsQuery: "NATIX Network" },
};

export function isSocialSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(SOCIAL_SOURCES, slug);
}

/**
 * Stock (Speculative Tech) companies covered by the news scanner.
 * newsQuery is the Google News RSS search, scoped to the company.
 * Ledgers live in app/data/stocks/<slug>-ledger.json.
 */
export interface StockSource {
  name: string;
  newsQuery: string; // Google News RSS search
}

export const STOCK_SOURCES: Record<string, StockSource> = {
  tesla: { name: "Tesla", newsQuery: "Tesla" },
  nvidia: { name: "Nvidia", newsQuery: "Nvidia" },
  broadcom: { name: "Broadcom", newsQuery: "Broadcom" },
  oracle: { name: "Oracle", newsQuery: "Oracle Corporation" },
  spacex: { name: "SpaceX", newsQuery: "SpaceX" },
  openai: { name: "OpenAI", newsQuery: "OpenAI" },
  anthropic: { name: "Anthropic", newsQuery: "Anthropic" },
};

export function isStockSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(STOCK_SOURCES, slug);
}

export interface SocialSnapshot {
  project_slug: string;
  as_of: string;
  reddit_subscribers: number | null;
  telegram_members: number | null;
  news_mentions_7d: number | null;
  sources_ok: string[];
}

/** Parse counts like "185K subscribers", "1.2M", "42,300" into numbers. */
export function parseCount(text: string): number | null {
  const m = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] || 1;
  return Math.round(n * mult);
}

/** Median of a number list. Null when empty. */
export function median(values: number[]): number | null {
  const sorted = values.filter((v) => v != null && isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export type Trend = "up" | "down" | "flat" | null;

/** Trend of a metric between two snapshots. Null when not comparable. */
export function trendOf(current: number | null, previous: number | null): Trend {
  if (current == null || previous == null || previous === 0) return null;
  const pct = (current - previous) / previous;
  if (pct > 0.02) return "up";
  if (pct < -0.02) return "down";
  return "flat";
}

export type HypeTone = "sizzle" | "proven" | "neutral";

export interface HypeVerdict {
  buzz: "high" | "moderate" | "low" | null;
  tone: HypeTone;
  read: string;
}

/**
 * The special sauce: juxtapose HYPE (social hype, measured against the
 * median of all tracked projects in the latest batch) with SUBSTANCE
 * (hearts earned). Documented, dead-simple rules:
 *
 * - buzz is high when a project's 7-day news mentions are at least 2x the
 *   cross-project median, low when at most half the median.
 * - high buzz + under 40% of hearts filled: all sizzle, no steak.
 * - low buzz + at least 60% of hearts filled: quietly proven.
 * - anything else: neutral juxtaposition, no judgment.
 *
 * No composite score is computed; the two numbers sit side by side and the
 * read is plain language. Hype needs at least 4 projects with news data in
 * the batch, otherwise it is null and the verdict stays neutral.
 */
export function hypeVerdict(
  mentions7d: number | null,
  medianMentions: number | null,
  batchSize: number,
  earned: number,
  capacity: number,
): HypeVerdict {
  const substance = capacity > 0 ? earned / capacity : 0;
  const m = mentions7d == null ? "n/a" : String(mentions7d);
  const promises = `${earned} of ${capacity} promises`;

  let buzz: HypeVerdict["buzz"] = null;
  if (medianMentions != null && medianMentions > 0 && batchSize >= 4 && mentions7d != null) {
    if (mentions7d >= 2 * medianMentions) buzz = "high";
    else if (mentions7d <= 0.5 * medianMentions) buzz = "low";
    else buzz = "moderate";
  }

  if (buzz === "high" && substance < 0.4) {
    return {
      buzz,
      tone: "sizzle",
      read: `All sizzle, no steak: ${m} news mentions in 7 days against ${promises}.`,
    };
  }
  if (buzz === "low" && substance >= 0.6) {
    return {
      buzz,
      tone: "proven",
      read: `Quietly proven: ${promises} on modest hype.`,
    };
  }
  if (mentions7d == null) {
    return { buzz, tone: "neutral", read: `Social hype is not reporting yet; ${promises} stand on their own.` };
  }
  return {
    buzz,
    tone: "neutral",
    read: `${m} news mentions in 7 days sit next to ${promises}.`,
  };
}

/** Compact number formatting shared with the social tiles. */
export function fmtSocial(v: number | null): string {
  if (v == null) return "n/a";
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}
