"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hearts sparkline: filled hearts through time, drawn as plain SVG.
 * One point per published run. Rises and falls are the product — a flat
 * line means nothing changed. Plain SVG keeps it light: no chart library
 * for a 46px line.
 */
export type HeartPoint = { as_of: string; filled: number; capacity: number };

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

/** Minimal sparkline for cards: area + line, endpoint dot on the current
 *  value. Rises and falls at a glance; the filled area reads as history,
 *  not decoration. */
export function HeartSparkline({ points }: { points: HeartPoint[] }) {
  const ordered = [...points].sort((a, b) => a.as_of.localeCompare(b.as_of));
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (ordered.length < 2) return null;
  const cap = Math.max(...ordered.map((p) => p.capacity), 1);
  const H = 46;
  const PAD = 5;
  const W = Math.max(width, 40);
  const x = (i: number) => PAD + (i / (ordered.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / cap) * (H - PAD * 2);
  const line = ordered.map((p, i) => `${x(i).toFixed(1)},${y(p.filled).toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${(W - PAD).toFixed(1)},${H - PAD}`;
  const last = ordered[ordered.length - 1];
  const first = ordered[0];

  return (
    <div
      ref={box}
      style={{ width: "100%", height: H }}
      role="img"
      aria-label={`Proof history: ${first.filled} of ${first.capacity} on ${fmtDate(first.as_of)}, now ${last.filled} of ${last.capacity}`}
    >
      {width > 0 && (
        <svg width={W} height={H} aria-hidden="true">
          <polygon points={area} fill="#3fb950" fillOpacity={0.14} />
          <polyline
            points={line}
            fill="none"
            stroke="#3fb950"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            cx={x(ordered.length - 1)}
            cy={y(last.filled)}
            r={3.5}
            fill="#3fb950"
            stroke="#0d1117"
            strokeWidth={1.5}
          />
        </svg>
      )}
    </div>
  );
}
