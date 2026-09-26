"use client";

import { useEffect, useRef, useState } from "react";
import { searchMeta } from "@/lib/search-sections";
import { MARKET_RANGES, parseCandles, formatPrice, type Candle, type MarketDays } from "@/lib/market-chart";
import MarketChart from "./market-chart";
import styles from "./market-panel.module.css";

import { MARKET_IDS as IDS } from '@/lib/market-ids';
const historyCache = new Map<string, { at: number; candles: Candle[] }>();
const TTL = 15 * 60_000;

export default function MarketPanel({ slug, name, symbol }: { slug: string; name: string; symbol: string }) {
  const [days, setDays] = useState<MarketDays>(7);
  const [mode, setMode] = useState<"line" | "candles">("line");
  const [history, setHistory] = useState<{ key: string; candles: Candle[] } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [market, setMarket] = useState<{ slug: string; price: number | null; cap: number | null } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const key = `${slug}:${days}`;
  const candles = history?.key === key ? history.candles : null;
  const quote = market?.slug === slug ? market : null;

  useEffect(() => {
    const id = IDS[slug];
    if (!id) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const number = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(rows => { if (!controller.signal.aborted && rows?.[0]) setMarket({ slug, price: number(rows[0].current_price), cap: number(rows[0].market_cap) }); })
      .catch(() => {}).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [slug]);

  useEffect(() => {
    const id = IDS[slug];
    setError("");
    if (!id) { setError("Market data is not available for this project."); return; }
    const cached = historyCache.get(key);
    if (cached && Date.now() - cached.at < TTL) { setHistory({ key, candles: cached.candles }); return; }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`, { signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error("Price history unavailable"); return parseCandles(await r.json()); })
      .then(value => { if (!cancelled) { historyCache.set(key, { at: Date.now(), candles: value }); setHistory({ key, candles: value }); } })
      .catch(() => { if (!cancelled) setError("Price history is temporarily unavailable. Try again shortly."); })
      .finally(() => clearTimeout(timeout));
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, [slug, days, key, retry]);

  useEffect(() => {
    if (!expanded) return;
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; expandButton.current?.focus({ preventScroll: true }); };
  }, [expanded]);

  const content = (full: boolean) => <>
    <div className={styles.toolbar}>
      <div className={styles.controls} role="group" aria-label="Price history range">{MARKET_RANGES.map(range => <button key={range.days} type="button" aria-pressed={days === range.days} onClick={() => setDays(range.days)}>{range.label}</button>)}</div>
      <div className={styles.controls} role="group" aria-label="Chart style"><button type="button" aria-pressed={mode === "line"} onClick={() => setMode("line")}>Line</button><button type="button" aria-pressed={mode === "candles"} onClick={() => setMode("candles")}>Candles</button></div>
      {full ? <button type="button" className={styles.action} onClick={() => setExpanded(false)}>Close</button> : <button ref={expandButton} type="button" className={styles.action} onClick={() => setExpanded(true)} aria-label="Expand price chart">Expand ↗</button>}
    </div>
    {candles ? <MarketChart key={`${key}:${full}`} candles={candles} days={days} mode={mode} symbol={symbol} /> : <div className={styles.status} role="status">{error ? <><p>{error}</p><button type="button" className={styles.action} onClick={() => setRetry(v => v + 1)}>Retry price history</button></> : `Loading ${days}-day price history…`}</div>}
    <p className={styles.source}>Sampled closing prices, not live ticks. <a href={`https://www.coingecko.com/en/coins/${IDS[slug] ?? ""}`} target="_blank" rel="noopener noreferrer">CoinGecko</a></p>
  </>;

  return <section className="panel market-section search-section" {...searchMeta({ id: `project-${slug}-market`, title: `${name} market data`, kind: "Market", project: slug, keywords: `${symbol} price chart market cap` })}>
    <div className={styles.heading}><h2>Market</h2>{quote && <span className={styles.quote}>{quote.price != null && <>Spot {formatPrice(quote.price)}</>}{quote.cap != null && <> · Market cap {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(quote.cap)}</>}</span>}</div>
    {content(false)}
    {expanded && <dialog ref={dialog} className={styles.dialog} aria-label={`${name} price chart`} onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)} onClick={e => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) setExpanded(false); } }}><h2>{name} · {symbol} / USD</h2>{content(true)}</dialog>}
  </section>;
}
