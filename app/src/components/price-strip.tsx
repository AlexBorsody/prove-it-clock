"use client";
/**
 * PriceStrip — live market price, 7d change, market cap, and a 7-day
 * sparkline from CoinGecko. Client-side fetch so the static pages keep
 * building without an API key. Fails silent: no data, no strip.
 */
import { useEffect, useState } from "react";

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

interface MarketData {
  price: number;
  change7d: number;
  mcap: number;
  spark: number[];
}

function fmtPrice(p: number): string {
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + p.toFixed(4);
}

function fmtMcap(m: number): string {
  if (m >= 1e12) return "$" + (m / 1e12).toFixed(2) + "T";
  if (m >= 1e9) return "$" + (m / 1e9).toFixed(1) + "B";
  if (m >= 1e6) return "$" + (m / 1e6).toFixed(0) + "M";
  return "$" + m.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  if (points.length < 2) return null;
  const w = 132;
  const h = 44;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - 3 - ((p - min) / range) * (h - 6)).toFixed(1)}`)
    .join(" ");
  const color = up ? "var(--green)" : "var(--red)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="7-day price chart">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function PriceStrip({ slug }: { slug: string }) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = COINGECKO_IDS[slug];
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&sparkline=true&price_change_percentage=7d`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.[0]) return;
        const m = json[0];
        setData({
          price: m.current_price,
          change7d: m.price_change_percentage_7d_in_currency ?? 0,
          mcap: m.market_cap ?? 0,
          spark: m.sparkline_in_7d?.price ?? [],
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loading && !data) return null;

  const up = (data?.change7d ?? 0) >= 0;
  return (
    <div
      className="price-strip"
      style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 14 }}
      aria-live="polite"
    >
      {loading || !data ? (
        <span style={{ color: "var(--text-faint)", fontSize: 13 }}>Loading market data…</span>
      ) : (
        <>
          <span className="num" style={{ fontSize: 26, fontWeight: 800 }}>
            {fmtPrice(data.price)}
          </span>
          <span className={`tag num ${up ? "measured" : "bad"}`}>
            {up ? "+" : ""}
            {data.change7d.toFixed(1)}% 7d
          </span>
          <span style={{ color: "var(--text-dim)", fontSize: 14 }} className="num">
            Mkt cap <b style={{ color: "var(--text)" }}>{fmtMcap(data.mcap)}</b>
          </span>
          <Sparkline points={data.spark} up={up} />
          <span style={{ color: "var(--text-faint)", fontSize: 12 }}>Price data: CoinGecko</span>
        </>
      )}
    </div>
  );
}
