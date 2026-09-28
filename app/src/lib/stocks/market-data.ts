import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { StockCompany } from '../stock-companies';
import {
  finite,
  nonPositiveEarnings,
  type StockContext,
  type Observation,
} from './context';
import { normalizeSec } from './sec';
import { normalizeOverview } from './providers';

const CIK: Record<string, number> = {
  TSLA: 1318605,
  NVDA: 1045810,
  AVGO: 1730168,
  ORCL: 1341439,
};
async function json(url: string, headers: Record<string, string> = {}) {
  // Cache normalized results below; companyfacts payloads exceed Next's fetch-cache limit.
  const response = await fetch(url, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error('Market provider unavailable');
  return response.json();
}
async function load(ticker: string): Promise<StockContext> {
  const fetchedAt = new Date().toISOString();
  let metrics: StockContext['metrics'] = {};
  try {
    if (CIK[ticker])
      metrics = normalizeSec(
        await json(
          `https://data.sec.gov/api/xbrl/companyfacts/CIK${String(CIK[ticker]).padStart(10, '0')}.json`,
          {
            'User-Agent':
              process.env.SEC_USER_AGENT ??
              'ProveValue/1.0 (https://prove-it-clock.vercel.app)',
            Accept: 'application/json',
          },
        ),
        CIK[ticker],
        fetchedAt.slice(0, 10),
      );
  } catch {
    /* Keep a distinct unavailable field, never a zero or seeded valuation. */
  }
  const av =
    process.env.ALPHA_VANTAGE_API_KEY ?? process.env.ALPHAVANTAGE_API_KEY;
  if (av)
    try {
      const overview = normalizeOverview(
        await json(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${encodeURIComponent(av)}`,
        ),
        ticker,
      );
      metrics = { ...overview, ...metrics }; // SEC is the source of truth for filing facts.
    } catch {
      /* Provider errors cannot alter the ledger. */
    }
  let price: Observation | undefined;
  const fmp = process.env.FMP_API_KEY,
    finnhub = process.env.FINNHUB_API_KEY;
  if (fmp)
    try {
      const rows = await json(
        `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${encodeURIComponent(fmp)}`,
      );
      const q = Array.isArray(rows)
        ? rows.find((r) => r.symbol === ticker)
        : null;
      if (q && (finite(q.price) ?? 0) > 0 && (finite(q.timestamp) ?? 0) > 0) {
        price = {
          value: Number(q.price),
          period: `Quote ${new Date(Number(q.timestamp) * 1000).toISOString()}`,
          source: 'Financial Modeling Prep',
          url: 'https://financialmodelingprep.com/',
        };
        if ((finite(q.marketCap) ?? 0) > 0)
          metrics.marketCap = { ...price, value: Number(q.marketCap) };
      }
    } catch {
      /* Try the configured fallback. */
    }
  if (!price && finnhub)
    try {
      const q = await json(`https://finnhub.io/api/v1/quote?symbol=${ticker}`, {
        'X-Finnhub-Token': finnhub,
      });
      if ((finite(q.c) ?? 0) > 0 && (finite(q.t) ?? 0) > 0)
        price = {
          value: Number(q.c),
          period: `Quote ${new Date(Number(q.t) * 1000).toISOString()}`,
          source: 'Finnhub',
          url: 'https://finnhub.io/',
        };
    } catch {
      /* Try Alpha Vantage daily quote. */
    }
  if (!price && av)
    try {
      const data = await json(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${encodeURIComponent(av)}`,
      );
      const q = data['Global Quote'];
      if (
        q?.['01. symbol'] === ticker &&
        (finite(q['05. price']) ?? 0) > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(q['07. latest trading day'])
      )
        price = {
          value: Number(q['05. price']),
          period: `Close ${q['07. latest trading day']}`,
          source: 'Alpha Vantage',
          url: 'https://www.alphavantage.co/',
        };
    } catch {
      /* Missing prices remain unavailable. */
    }
  if (price) metrics.price = price;
  // Do not combine a new filing with EPS/ratios from an older provider quarter.
  const periodEnd = (observation?: Observation) =>
    observation?.period.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const filingEnd = periodEnd(metrics.netIncome),
    epsEnd = periodEnd(metrics.eps);
  if (filingEnd && epsEnd && epsEnd < filingEnd) {
    delete metrics.trailingPe;
    delete metrics.eps;
  }
  const context: StockContext = {
    metrics,
    status: Object.keys(metrics).length ? 'partial' : 'unavailable',
    fetchedAt,
  };
  if (nonPositiveEarnings(context)) delete metrics.trailingPe;
  else if (price && metrics.eps && metrics.eps.value > 0)
    metrics.trailingPe = {
      ...price,
      value: price.value / metrics.eps.value,
      note: `Price / diluted EPS (${metrics.eps.period}, ${metrics.eps.source}).`,
    };
  if (metrics.marketCap && metrics.revenue && metrics.revenue.value > 0)
    metrics.priceSales = {
      ...metrics.marketCap,
      value: metrics.marketCap.value / metrics.revenue.value,
      note: `Market cap / revenue (${metrics.revenue.period}, ${metrics.revenue.source}).`,
    };
  if (metrics.price && metrics.revenue && metrics.trailingPe)
    context.status = 'available';
  return context;
}
const cached = unstable_cache(
  async (ticker: string, _configuration: string) => load(ticker),
  ['stock-market-context-v1'],
  { revalidate: 43200 },
);
export const readStockContext = cache(
  async (company: StockCompany): Promise<StockContext> => {
    if (company.listing === 'private')
      return { metrics: {}, status: 'private', fetchedAt: null };
    if (!company.ticker)
      return { metrics: {}, status: 'unavailable', fetchedAt: null };
    const config = [
      'FMP_API_KEY',
      'FINNHUB_API_KEY',
      'ALPHA_VANTAGE_API_KEY',
      'ALPHAVANTAGE_API_KEY',
    ]
      .map((key) => Boolean(process.env[key]))
      .join(',');
    return cached(company.ticker, config);
  },
);
