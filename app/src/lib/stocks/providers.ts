import { finite, type StockContext, type MarketMetric } from './context';

export function normalizeOverview(
  data: Record<string, unknown>,
  ticker: string,
): StockContext['metrics'] {
  if (
    data.Symbol !== ticker ||
    typeof data.LatestQuarter !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.LatestQuarter)
  )
    return {};
  const result: StockContext['metrics'] = {};
  const map: Array<[MarketMetric, string, string]> = [
    ['trailingPe', 'PERatio', 'Provider trailing P/E'],
    ['forwardPe', 'ForwardPE', 'Provider forward estimate'],
    ['eps', 'DilutedEPSTTM', `TTM through ${data.LatestQuarter}`],
    ['revenue', 'RevenueTTM', `TTM through ${data.LatestQuarter}`],
    ['marketCap', 'MarketCapitalization', 'Provider snapshot'],
    ['priceSales', 'PriceToSalesRatioTTM', 'Provider trailing ratio'],
  ];
  for (const [key, field, period] of map) {
    const value = finite(data[field]);
    if (
      value !== null &&
      (!['trailingPe', 'forwardPe', 'marketCap', 'priceSales'].includes(key) ||
        value > 0)
    )
      result[key] = {
        value,
        period,
        source: 'Alpha Vantage',
        url: 'https://www.alphavantage.co/',
        note: 'Provider-reported observation.',
      };
  }
  return result;
}
