export interface Candle { t: number; o: number; h: number; l: number; c: number }
export const MARKET_RANGES = [{ days: 1, label: "1D" }, { days: 7, label: "1W" }, { days: 30, label: "1M" }] as const;
export type MarketDays = typeof MARKET_RANGES[number]["days"];

/** Reject malformed prices instead of drawing a plausible but false chart. */
export function parseCandles(value: unknown): Candle[] {
  if (!Array.isArray(value)) throw new Error("Price history unavailable");
  const rows = new Map<number, Candle>();
  for (const row of value) {
    if (!Array.isArray(row) || row.length < 5 || !row.slice(0, 5).every(v => typeof v === "number" && Number.isFinite(v))) continue;
    const [t, o, h, l, c] = row;
    if (t <= 0 || l <= 0 || h < Math.max(o, c) || l > Math.min(o, c)) continue;
    rows.set(t, { t, o, h, l, c });
  }
  const candles = [...rows.values()].sort((a, b) => a.t - b.t);
  if (candles.length < 2) throw new Error("Price history unavailable");
  return candles;
}

export function nearestCandle(candles: Candle[], timestamp: number): number {
  let low = 0, high = candles.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (candles[mid].t < timestamp) low = mid + 1;
    else high = mid;
  }
  return low > 0 && timestamp - candles[low - 1].t <= candles[low].t - timestamp ? low - 1 : low;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value);
}
