/**
 * Social collector (server only). Polls the free sources, one snapshot per
 * project per run. Every source is independent: a failure yields null for
 * that metric, never a fake number, and never blocks the other sources.
 *
 * Sources:
 * - Reddit: OAuth app flow (free registration at reddit.com/prefs/apps).
 *   Needs REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET. Without them the Reddit
 *   metric is skipped, not faked.
 * - Telegram: public t.me/s/{handle} preview page, parsed for the
 *   subscriber count. Best-effort: only channels with public previews
 *   enabled expose it; anything else yields null.
 * - News: Google News RSS search, counting items published in the last
 *   7 days. Free, no signup.
 *
 * Deliberately NOT collected:
 * - X/Twitter: API is paywalled ($100+/mo tier). See docs/implementation.md (HYPE pipeline appendix)
 *   for the upgrade path. No scraper: unreliable and against ToS.
 */

import { SOCIAL_SOURCES, parseCount, type SocialSnapshot } from "./social";

const UA = "prove-it-social/1.0 (+https://prove-it-clock.vercel.app)";

async function fetchText(url: string, headers: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Reddit OAuth: client-credentials grant, one token reused for the run. */
async function redditToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

async function redditSubscribers(subreddit: string, token: string | null): Promise<number | null> {
  if (!token) return null;
  try {
    const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/about.json`, {
      headers: { "User-Agent": UA, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { subscribers?: number } };
    const n = json.data?.subscribers;
    return typeof n === "number" && isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function telegramMembers(handle: string): Promise<number | null> {
  const html = await fetchText(`https://t.me/s/${handle}`, {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });
  if (!html) return null;
  // Preview pages render e.g. "185K subscribers" near the top.
  const m = html.match(/([\d.,]+\s*[KMB]?)\s+subscribers/i);
  return m ? parseCount(m[1]) : null;
}

async function newsMentions7d(query: string): Promise<number | null> {
  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
    `&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchText(url);
  if (!xml) return null;
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  let count = 0;
  const re = /<pubDate>([^<]+)<\/pubDate>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const t = Date.parse(m[1]);
    if (isFinite(t) && t >= cutoff) count++;
  }
  return count;
}

export interface CollectedSocial extends Omit<SocialSnapshot, "as_of"> {
  as_of: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Collect one snapshot per project. Never throws: per-source failures yield nulls. */
export async function collectAll(): Promise<CollectedSocial[]> {
  const token = await redditToken();
  const out: CollectedSocial[] = [];
  const slugs = Object.keys(SOCIAL_SOURCES);
  for (const slug of slugs) {
    const src = SOCIAL_SOURCES[slug];
    const [reddit, telegram, news] = await Promise.all([
      redditSubscribers(src.subreddit, token),
      telegramMembers(src.telegram),
      newsMentions7d(src.newsQuery),
    ]);
    const sources_ok: string[] = [];
    if (reddit != null) sources_ok.push("reddit");
    if (telegram != null) sources_ok.push("telegram");
    if (news != null) sources_ok.push("news");
    out.push({
      project_slug: slug,
      as_of: new Date().toISOString(),
      reddit_subscribers: reddit,
      telegram_members: telegram,
      news_mentions_7d: news,
      sources_ok,
    });
    // Be polite to the free endpoints between projects.
    if (slug !== slugs[slugs.length - 1]) await sleep(1500);
  }
  return out;
}
