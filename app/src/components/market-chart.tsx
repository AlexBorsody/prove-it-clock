"use client";

import { useId, useState, useRef, useEffect, type PointerEvent } from "react";
import { formatPrice, nearestCandle, type Candle, type MarketDays } from "@/lib/market-chart";
import styles from "./market-panel.module.css";

/** Same interactive chart in the project card and expanded dialog. */
export default function MarketChart({ candles, days, mode, symbol }: { candles: Candle[]; days: MarketDays; mode: "line" | "candles"; symbol: string }) {
  const [active, setActive] = useState<number | null>(null);
  const gradient = useId().replace(/:/g, "");
  const help = useId();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const W = width, H = width <= 540 ? 260 : 320, left = 8, right = 70, top = 20, bottom = 32;
  const plotW = W - left - right, plotH = H - top - bottom;
  const first = candles[0], last = candles[candles.length - 1];
  const chosen = candles[active ?? candles.length - 1];
  const change = chosen.c - first.c;
  const pct = change / first.c * 100;
  const up = last.c >= first.c;
  const color = up ? "var(--green)" : "var(--red)";
  const values = candles.flatMap(c => mode === "candles" ? [c.l, c.h] : [c.c]);
  const low = Math.min(...values), high = Math.max(...values);
  const pad = (high - low) * .12 || high * .01;
  const min = low - pad, max = high + pad;
  const x = (t: number) => left + (t - first.t) / (last.t - first.t) * plotW;
  const y = (p: number) => top + (max - p) / (max - min) * plotH;
  const path = candles.map((c, i) => `${i ? "L" : "M"}${x(c.t)},${y(c.c)}`).join(" ");
  const time = (t: number, full = false) => new Date(t).toLocaleString("en-US", { timeZone: "UTC", ...(days === 1 && !full ? {} : { month: "short", day: "numeric" }), ...(days === 1 || full ? { hour: "numeric", minute: "2-digit" } : {}) });
  function point(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, ((event.clientX - box.left) / box.width * W - left) / plotW));
    setActive(nearestCandle(candles, first.t + fraction * (last.t - first.t)));
  }
  const tickCount = width < 480 ? 2 : 4;
  const ticks = Array.from(new Set(Array.from({ length: tickCount }, (_, i) => Math.round((candles.length - 1) * i / (tickCount - 1)))));
  return <div className={styles.chart} ref={container}>
    <div className={styles.readout}>
      <div><span className={styles.price}>{formatPrice(chosen.c)}</span><span className={styles.change} style={{ color: change >= 0 ? "var(--green)" : "var(--red)" }}>{change >= 0 ? "+" : "−"}{formatPrice(Math.abs(change))} ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)</span></div>
      <div className={styles.caption}>{active === null ? "Latest plotted close" : "Historical close"} · {time(chosen.t, true)} UTC</div>
      <div className={styles.caption}>{active === null ? `Change across displayed ${days}-day history` : "Change from first plotted close"}</div>
    </div>
    <svg className={styles.plot} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" tabIndex={0} role="slider" aria-label={`${symbol} historical price`} aria-describedby={help} aria-valuemin={0} aria-valuemax={candles.length - 1} aria-valuenow={active ?? candles.length - 1} aria-valuetext={`${time(chosen.t, true)} UTC, ${formatPrice(chosen.c)}`} onPointerMove={point} onPointerDown={e => { e.currentTarget.focus({ preventScroll: true }); e.currentTarget.setPointerCapture(e.pointerId); point(e); }} onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => setActive(null)} onPointerLeave={e => { if (!e.currentTarget.hasPointerCapture(e.pointerId) && e.pointerType === "mouse") setActive(null); }} onBlur={() => setActive(null)} onKeyDown={e => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(e.key)) return;
      if (e.key === "Escape") { setActive(null); return; }
      e.preventDefault();
      setActive(i => e.key === "Home" ? 0 : e.key === "End" ? candles.length - 1 : Math.max(0, Math.min(candles.length - 1, (i ?? candles.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
    }}>
      <defs><linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map(i => { const price = min + (max - min) * i / 3; return <g key={i}><line x1={left} x2={W - right} y1={y(price)} y2={y(price)} stroke="var(--border)" strokeDasharray="3 6" /><text x={W - right + 10} y={y(price) + 4} fill="var(--text-dim)" fontSize="12">{price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : formatPrice(price)}</text></g>; })}
      {mode === "line" ? <><path d={`${path} L${x(last.t)},${H - bottom} L${x(first.t)},${H - bottom} Z`} fill={`url(#${gradient})`} /><path d={path} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></> : candles.map(c => { const width = Math.max(1, Math.min(12, plotW / candles.length * .65)); const tint = c.c >= c.o ? "var(--green)" : "var(--red)"; return <g key={c.t}><line x1={x(c.t)} x2={x(c.t)} y1={y(c.h)} y2={y(c.l)} stroke={tint} /><rect x={x(c.t) - width / 2} y={y(Math.max(c.o, c.c))} width={width} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={tint} /></g>; })}
      {ticks.map((i, n) => <text key={i} x={x(candles[i].t)} y={H - 9} textAnchor={n === 0 ? "start" : n === ticks.length - 1 ? "end" : "middle"} fill="var(--text-dim)" fontSize="12">{time(candles[i].t)}</text>)}
      {active !== null && <g pointerEvents="none"><line x1={x(chosen.t)} x2={x(chosen.t)} y1={top} y2={H - bottom} stroke="var(--text-dim)" strokeDasharray="4 4" /><line x1={left} x2={W - right} y1={y(chosen.c)} y2={y(chosen.c)} stroke={color} strokeOpacity=".45" strokeDasharray="4 4" /><circle cx={x(chosen.t)} cy={y(chosen.c)} r="5" fill={color} stroke="var(--bg)" strokeWidth="2" /></g>}
    </svg>
    {mode === "candles" && <div className={styles.ohlc}>{([['Open',chosen.o],['High',chosen.h],['Low',chosen.l],['Close',chosen.c]] as const).map(([label,value]) => <span key={label}>{label} <b>{formatPrice(value)}</b></span>)}</div>}
    <p id={help} className={styles.hint}>Hover or drag to explore · Arrow keys move through prices · UTC</p>
  </div>;
}
