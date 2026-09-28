/** Market observations are context only. Nothing here reads or grades promises. */
export type MarketMetric =
  | 'price'
  | 'marketCap'
  | 'trailingPe'
  | 'forwardPe'
  | 'revenue'
  | 'revenueGrowth'
  | 'netIncome'
  | 'eps'
  | 'freeCashFlow'
  | 'priceSales'
  | 'cash';
export interface Observation {
  value: number;
  period: string;
  source: string;
  url: string;
  note?: string;
}
export interface StockContext {
  metrics: Partial<Record<MarketMetric, Observation>>;
  status: 'available' | 'partial' | 'unavailable' | 'private';
  fetchedAt: string | null;
}
export const METRICS: Array<[MarketMetric, string]> = [
  ['price', 'Price'],
  ['marketCap', 'Market cap'],
  ['trailingPe', 'Trailing P/E'],
  ['forwardPe', 'Forward P/E'],
  ['revenue', 'Revenue'],
  ['revenueGrowth', 'Revenue growth'],
  ['netIncome', 'Net income'],
  ['eps', 'Diluted EPS'],
  ['freeCashFlow', 'Free cash flow'],
  ['priceSales', 'Price / sales'],
  ['cash', 'Cash and equivalents'],
];
export function finite(value: unknown): number | null {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  )
    return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
export function nonPositiveEarnings(context: StockContext): boolean {
  const earnings = context.metrics.netIncome ?? context.metrics.eps;
  return earnings != null && earnings.value <= 0;
}
export function metricText(key: MarketMetric, context: StockContext): string {
  if (context.status === 'private') return 'Not public';
  if (key === 'trailingPe' && nonPositiveEarnings(context)) return 'N/M';
  const value = context.metrics[key]?.value;
  if (value == null) return 'Unavailable';
  if (key === 'trailingPe' || key === 'forwardPe' || key === 'priceSales')
    return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}×`;
  if (key === 'revenueGrowth')
    return `${value > 0 ? '+' : ''}${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: Math.abs(value) >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
}
export type StockScreen = 'all' | 'high' | '50' | '100' | 'loss';
export function matchesScreen(
  context: StockContext,
  screen: StockScreen,
): boolean {
  if (context.status === 'private') return false;
  if (screen === 'all') return true;
  const loss = nonPositiveEarnings(context);
  if (screen === 'loss') return loss;
  if (screen === 'high' && loss) return true;
  return (
    !loss &&
    (context.metrics.trailingPe?.value ?? -Infinity) >
      (screen === 'high' ? 30 : Number(screen))
  );
}
