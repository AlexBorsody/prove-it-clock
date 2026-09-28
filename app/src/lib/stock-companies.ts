/**
 * Curated company registry for the Speculative Tech (stocks) domain.
 * A registry, not a market API, because the set includes private companies
 * (SpaceX, OpenAI, Anthropic) where no market-cap screen applies.
 */
export interface StockCompany {
  slug: string;
  name: string;
  sector: string;
  listing: 'public' | 'private';
  ticker: string | null;
  dataSources: string[];
  sourceDomains: string[];
}

export const STOCK_COMPANIES: StockCompany[] = [
  {
    slug: 'tesla',
    sourceDomains: ['tesla.com'],
    name: 'Tesla',
    sector: 'Automotive / Energy',
    listing: 'public',
    ticker: 'TSLA',
    dataSources: [
      'SEC EDGAR 10-K',
      'Tesla IR quarterly updates and earnings calls',
    ],
  },
  {
    slug: 'nvidia',
    sourceDomains: ['nvidia.com'],
    name: 'Nvidia',
    sector: 'Semiconductors',
    listing: 'public',
    ticker: 'NVDA',
    dataSources: [
      'SEC EDGAR 10-K',
      'Nvidia IR quarterly updates and earnings calls',
    ],
  },
  {
    slug: 'broadcom',
    sourceDomains: ['broadcom.com'],
    name: 'Broadcom',
    sector: 'Semiconductors',
    listing: 'public',
    ticker: 'AVGO',
    dataSources: [
      'SEC EDGAR 10-K',
      'Broadcom IR quarterly updates and earnings calls',
    ],
  },
  {
    slug: 'oracle',
    sourceDomains: ['oracle.com'],
    name: 'Oracle',
    sector: 'Enterprise software / Cloud',
    listing: 'public',
    ticker: 'ORCL',
    dataSources: [
      'SEC EDGAR 10-K',
      'Oracle IR quarterly updates and earnings calls',
    ],
  },
  {
    slug: 'spacex',
    sourceDomains: ['spacex.com'],
    name: 'SpaceX',
    sector: 'Aerospace',
    listing: 'private',
    ticker: null,
    dataSources: ['Company statements', 'FAA filings'],
  },
  {
    slug: 'openai',
    sourceDomains: ['openai.com'],
    name: 'OpenAI',
    sector: 'AI',
    listing: 'private',
    ticker: null,
    dataSources: ['Company statements'],
  },
  {
    slug: 'anthropic',
    sourceDomains: ['anthropic.com'],
    name: 'Anthropic',
    sector: 'AI',
    listing: 'private',
    ticker: null,
    dataSources: ['Company statements'],
  },
];

export function getStockCompany(slug: string): StockCompany | null {
  return STOCK_COMPANIES.find((c) => c.slug === slug) ?? null;
}

export function isStockCompanySlug(slug: string): boolean {
  return STOCK_COMPANIES.some((c) => c.slug === slug);
}
