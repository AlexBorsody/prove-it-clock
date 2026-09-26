"use client";
/**
 * MarketPanel — live market data from CoinGecko: price, 7d change, market
 * cap, plus a real candlestick chart (7 days of 4h candles) with date
 * labels on the x axis. Click the chart to expand it. Fails silent.
 */
import { useEffect, useState } from "react";
import { searchMeta } from "@/lib/search-sections";

const COINGECKO_IDS: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  xrp: "ripple",
  bat: "basic-attention-token",
  link: "chainlink",
  sol: "solana",
  dash: "dash",
  avax: "avalanche-2",
};

interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

function fmtPrice(p: number): string {
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + p.toFixed(4);
}

function fmtAxis(p: number): string {
  if (p >= 10000) return "$" + (p / 1000).toFixed(1) + "k";
  if (p >= 1000) return "$" + (p / 1000).toFixed(2) + "k";
  if (p >= 1) return "$" + p.toFixed(p >= 100 ? 0 : 2);
  return "$" + p.toFixed(3);
}

function fmtMcap(m: number): string {
  if (m >= 1e12) return "$" + (m / 1e12).toFixed(2) + "T";
  if (m >= 1e9) return "$" + (m / 1e9).toFixed(1) + "B";
  if (m >= 1e6) return "$" + (m / 1e6).toFixed(0) + "M";
  return "$" + m.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CandleChart({ candles, big }: { candles: Candle[]; big?: boolean }) {
  const W = big ? 1100 : 680;
  const H = big ? 460 : 280;
  const padL = big ? 72 : 56;
  const padR = 10;
  const padT = 10;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const lows = candles.map((c) => c.l);
  const highs = candles.map((c) => c.h);
  let min = Math.min(...lows);
  let max = Math.max(...highs);
  const pad = (max - min) * 0.08 || 1;
  min -= pad;
  max += pad;

  const x = (i: number) => padL + (i + 0.5) * (plotW / candles.length);
  const y = (p: number) => padT + (1 - (p - min) / (max - min)) * plotH;
  const bodyW = Math.max(2, (plotW / candles.length) * 0.62);

  const yTicks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3);
  const xTickIdx = [0, 1, 2, 3, 4].map((i) =>
    Math.min(candles.length - 1, Math.round(((candles.length - 1) * i) / 4))
  );

  const last = candles[candles.length - 1];
  const lastUp = last.c >= last.o;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="7-day candlestick price chart"
    >
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={big ? 13 : 11} fill="var(--text-faint)" fontFamily="var(--mono)">
            {fmtAxis(t)}
          </text>
        </g>
      ))}
      {xTickIdx.map((i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize={big ? 13 : 11}
          fill="var(--text-faint)"
          fontFamily="var(--mono)"
        >
          {fmtDate(candles[i].t)}
        </text>
      ))}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? "var(--green)" : "var(--red)";
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={Math.max(1, bodyW * 0.22)} />
            <rect
              x={x(i) - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(1.5, bot - top)}
              fill={color}
              rx="1"
            />
          </g>
        );
      })}
      <line
        x1={padL}
        x2={W - padR}
        y1={y(last.c)}
        y2={y(last.c)}
        stroke={lastUp ? "var(--green)" : "var(--red)"}
        strokeWidth="1"
        strokeDasharray="5 4"
        opacity="0.7"
      />
      <text
        x={W - padR}
        y={y(last.c) - 6}
        textAnchor="end"
        fontSize={big ? 13 : 11}
        fill={lastUp ? "var(--green)" : "var(--red)"}
        fontFamily="var(--mono)"
        fontWeight="700"
      >
        {fmtPrice(last.c)}
      </text>
    </svg>
  );
}

export default function MarketPanel({ slug, name, symbol }: { slug: string; name: string; symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const [change7d, setChange7d] = useState<number | null>(null);
  const [mcap, setMcap] = useState<number | null>(null);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const id = COINGECKO_IDS[slug];
    if (!id) return;
    let cancelled = false;
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&price_change_percentage=7d`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.[0]) return;
        const m = json[0];
        setPrice(m.current_price);
        setChange7d(m.price_change_percentage_7d_in_currency ?? 0);
        setMcap(m.market_cap ?? 0);
      })
      .catch(() => {});
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=7`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !Array.isArray(json) || json.length < 2) return;
        setCandles(json.map((c: number[]) => ({ t: c[0], o: c[1], h: c[2], l: c[3], c: c[4] })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  if (price == null && candles == null) return null;

  const up = (change7d ?? 0) >= 0;

  return (
    <>
      <section className="panel market-section search-section" {...searchMeta({ id: `project-${slug}-market`, title: `${name} market data`, kind: "Market", project: slug, keywords: `${symbol} price chart market cap` })}>
        <h2>Market</h2>
        {price != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
            <span className="num" style={{ fontSize: 30, fontWeight: 800 }}>
              {fmtPrice(price)}
            </span>
            {change7d != null && (
              <span className={`tag num ${up ? "measured" : "bad"}`}>
                {up ? "+" : ""}
                {change7d.toFixed(1)}% 7d
              </span>
            )}
            {mcap != null && mcap > 0 && (
              <span style={{ color: "var(--text-dim)", fontSize: 14 }} className="num">
                Mkt cap <b style={{ color: "var(--text)" }}>{fmtMcap(mcap)}</b>
              </span>
            )}
          </div>
        )}
        {candles && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand price chart"
            title="Expand chart"
            style={{
              display: "block",
              width: "100%",
              padding: 0,
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--bg)",
              cursor: "zoom-in",
            }}
          >
            <CandleChart candles={candles} />
          </button>
        )}
        <p style={{ color: "var(--text-faint)", fontSize: 12, margin: "8px 0 0" }}>
          7-day candles · tap chart to expand · Price data: CoinGecko
        </p>
      </section>

      {expanded && candles && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded price chart"
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1060px, 100%)",
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              cursor: "default",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>
                {price != null ? fmtPrice(price) : ""}
                {change7d != null && (
                  <span className={`tag num ${up ? "measured" : "bad"}`} style={{ marginLeft: 10 }}>
                    {up ? "+" : ""}
                    {change7d.toFixed(1)}% 7d
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close expanded chart"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text-dim)",
                  fontSize: 16,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
            <CandleChart candles={candles} big />
          </div>
        </div>
      )}
    </>
  );
}
