import type { StockLedgerEvent, StockLineage } from './ledger';

export type DateAxis = 'occurred' | 'recorded';
export interface EventPoint {
  event: StockLedgerEvent;
  lineage: StockLineage;
  start: number;
  end: number;
}

/** Preserve month/year precision as a range; do not invent a day. */
export function dateRange(value: string | undefined): [number, number] | null {
  if (!value) return null;
  const date = value.slice(0, 10);
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date)) return null;
  const startText =
    date.length === 4
      ? `${date}-01-01`
      : date.length === 7
        ? `${date}-01`
        : date;
  const start = Date.parse(`${startText}T00:00:00Z`);
  if (
    !Number.isFinite(start) ||
    new Date(start).toISOString().slice(0, 10) !== startText
  )
    return null;
  const d = new Date(start);
  const end =
    date.length === 4
      ? Date.UTC(d.getUTCFullYear() + 1, 0, 1) - 1
      : date.length === 7
        ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - 1
        : start;
  return [start, end];
}

export function timelinePoints(
  lineages: StockLineage[],
  axis: DateAxis,
): EventPoint[] {
  return lineages.flatMap((lineage) =>
    lineage.events.flatMap((event) => {
      const range = dateRange(
        axis === 'recorded' ? event.recordedAt : event.occurredOn,
      );
      return range ? [{ event, lineage, start: range[0], end: range[1] }] : [];
    }),
  );
}

/** The full ledger defines the axis, so filters cannot change event positions. */
export function timelineDomain(points: EventPoint[]): [number, number] {
  if (!points.length) return [0, 1];
  const start = Math.min(...points.map((p) => p.start));
  const end = Math.max(...points.map((p) => p.end));
  const pad = Math.max((end - start) * 0.04, 30 * 86400000);
  return [start - pad, end + pad];
}
