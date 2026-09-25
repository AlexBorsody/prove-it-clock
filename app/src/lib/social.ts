/**
 * Social metrics: Prove-It's own social data layer.
 *
 * DISPLAY ONLY. Social metrics never feed the hearts scoring algorithm.
 * They are our proprietary signal layer: instead of cloning CoinGecko's
 * raw community numbers, we juxtapose HYPE (social volume) against
 * SUBSTANCE (hearts earned). A project with massive buzz and few hearts
 * reads as all sizzle, no steak. That contrast is the differentiator.
 *
 * This module holds types, per-project source config, and pure helpers.
 * Network fetching lives in lib/social-collect.ts (server only) so this
 * file stays safe to import from client components.
 */

/** Per-project social sources. Subreddits are well-known communities;
 *  Telegram handles are best-effort (public preview pages only). */
export interface SocialSource {
  subreddit: string; // without the r/
  telegram: string; // t.me handle, without @
  newsQuery: string; // Google News RSS search
}

export const SOCIAL_SOURCES: Record<string, SocialSource> = {
  btc: { subreddit: "Bitcoin", telegram: "bitcoin", newsQuery: "bitcoin" },
  eth: { subreddit: "ethereum", telegram: "ethereum", newsQuery: "ethereum" },
  xrp: { subreddit: "XRP", telegram: "xrp", newsQuery: "XRP" },
  sol: { subreddit: "solana", telegram: "solana", newsQuery: "solana" },
  link: { subreddit: "Chainlink", telegram: "chainlink", newsQuery: "chainlink" },
  avax: { subreddit: "Avax", telegram: "avalanche", newsQuery: "Avalanche AVAX" },
  dash: { subreddit: "dashpay", telegram: "dashpay", newsQuery: "Dash cryptocurrency" },
  bat: { subreddit: "BATProject", telegram: "batproject", newsQuery: "Basic Attention Token" },
};

export function isSocialSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(SOCIAL_SOURCES, slug);
}

export interface SocialSnapshot {
  project_slug: string;
  as_of: string;
  reddit_subscribers: number | null;
  telegram_members: number | null;
  news_mentions_7d: number | null;
  sources_ok: string[];
}

/** Parse counts like "185K subscribers", "1.2M", "42,300" into numbers. */
export function parseCount(text: string): number | null {
  const m = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] || 1;
  return Math.round(n * mult);
}

/** Median of a number list. Null when empty. */
export function median(values: number[]): number | null {
  const sorted = values.filter((v) => v != null && isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export type Trend = "up" | "down" | "flat" | null;

/** Trend of a metric between two snapshots. Null when not comparable. */
export function trendOf(current: number | null, previous: number | null): Trend {
  if (current == null || previous == null || previous === 0) return null;
  const pct = (current - previous) / previous;
  if (pct > 0.02) return "up";
  if (pct < -0.02) return "down";
  return "flat";
}

export type HypeTone = "sizzle" | "proven" | "neutral";

export interface HypeVerdict {
  buzz: "high" | "moderate" | "low" | null;
  tone: HypeTone;
  read: string;
}

/**
 * The special sauce: juxtapose HYPE (social buzz, measured against the
 * median of all tracked projects in the latest batch) with SUBSTANCE
 * (hearts earned). Documented, dead-simple rules:
 *
 * - buzz is high when a project's 7-day news mentions are at least 2x the
 *   cross-project median, low when at most half the median.
 * - high buzz + under 40% of hearts filled: all sizzle, no steak.
 * - low buzz + at least 60% of hearts filled: quietly proven.
 * - anything else: neutral juxtaposition, no judgment.
 *
 * No composite score is computed; the two numbers sit side by side and the
 * read is plain language. Buzz needs at least 4 projects with news data in
 * the batch, otherwise it is null and the verdict stays neutral.
 */
export function hypeVerdict(
  mentions7d: number | null,
  medianMentions: number | null,
  batchSize: number,
  earned: number,
  capacity: number,
): HypeVerdict {
  const substance = capacity > 0 ? earned / capacity : 0;
  const m = mentions7d == null ? "n/a" : String(mentions7d);
  const hearts = `${earned} of ${capacity} hearts`;

  let buzz: HypeVerdict["buzz"] = null;
  if (medianMentions != null && medianMentions > 0 && batchSize >= 4 && mentions7d != null) {
    if (mentions7d >= 2 * medianMentions) buzz = "high";
    else if (mentions7d <= 0.5 * medianMentions) buzz = "low";
    else buzz = "moderate";
  }

  if (buzz === "high" && substance < 0.4) {
    return {
      buzz,
      tone: "sizzle",
      read: `All sizzle, no steak: ${m} news mentions in 7 days against ${hearts}.`,
    };
  }
  if (buzz === "low" && substance >= 0.6) {
    return {
      buzz,
      tone: "proven",
      read: `Quietly proven: ${hearts} on modest buzz.`,
    };
  }
  if (mentions7d == null) {
    return { buzz, tone: "neutral", read: `Social buzz is not reporting yet; ${hearts} stand on their own.` };
  }
  return {
    buzz,
    tone: "neutral",
    read: `${m} news mentions in 7 days sit next to ${hearts}.`,
  };
}

/** Compact number formatting shared with the social tiles. */
export function fmtSocial(v: number | null): string {
  if (v == null) return "n/a";
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}
