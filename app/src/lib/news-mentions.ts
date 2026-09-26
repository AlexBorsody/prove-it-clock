import { DOMParser } from "linkedom";
import { isSocialSlug, SOCIAL_SOURCES } from "./social";
import type { MentionFeed, NewsMention } from "./hype-mentions";

function safeUrl(value: string | null | undefined): string | null {
  try {
    const url = new URL(value ?? "");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    url.hash = "";
    return url.href;
  } catch { return null; }
}

export function newsFeedUrl(slug: string): string {
  if (!isSocialSlug(slug)) throw new Error("Unknown project");
  const url = new URL("https://news.google.com/rss/search");
  url.search = new URLSearchParams({ q: SOCIAL_SOURCES[slug].newsQuery + " when:7d", hl: "en-US", gl: "US", ceid: "US:en" }).toString();
  return url.href;
}

/** Count actual items, not channel dates; never interpret feed HTML as markup. */
export function parseNewsFeed(xml: string, slug: string, now = new Date()): MentionFeed {
  const source_url = newsFeedUrl(slug);
  if (xml.length > 2_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("Invalid news feed");
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (!doc.querySelector("rss > channel")) throw new Error("Invalid news feed");
  const end = now.getTime();
  const start = end - 7 * 86_400_000;
  const items = [...doc.querySelectorAll("item")];
  const articles: NewsMention[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const url = safeUrl(item.querySelector("link")?.textContent?.trim());
    const published = Date.parse(item.querySelector("pubDate")?.textContent ?? "");
    let title = item.querySelector("title")?.textContent?.trim() ?? "";
    if (!url || !title || !Number.isFinite(published) || published < start || published > end || seen.has(url)) continue;
    const source = item.querySelector("source");
    const publisher = source?.textContent?.trim() || "Unknown publisher";
    // Google appends the publisher to the title; it is already shown separately.
    const suffix = " - " + publisher;
    if (title.endsWith(suffix)) title = title.slice(0, -suffix.length);
    seen.add(url);
    articles.push({ url, title, publisher, publisher_url: safeUrl(source?.getAttribute("url")), published_at: new Date(published).toISOString() });
  }
  articles.sort((a, b) => b.published_at.localeCompare(a.published_at) || a.url.localeCompare(b.url));
  return { slug, provider: "Google News RSS", fetched_at: now.toISOString(), window_start: new Date(start).toISOString(), window_end: now.toISOString(), source_url, articles, feed_items: items.length };
}

export async function fetchNewsMentions(slug: string, fetcher: typeof fetch = fetch): Promise<MentionFeed> {
  const response = await fetcher(newsFeedUrl(slug), {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(12_000), cache: "no-store", redirect: "error",
  });
  if (!response.ok) throw new Error("News provider unavailable");
  return parseNewsFeed(await response.text(), slug);
}
