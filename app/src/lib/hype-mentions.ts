/** Public source records, safe to use in the client explorer. */
export interface NewsMention {
  url: string;
  title: string;
  publisher: string;
  publisher_url: string | null;
  published_at: string;
}

export interface MentionFeed {
  slug: string;
  provider: "Google News RSS";
  fetched_at: string;
  window_start: string;
  window_end: string;
  source_url: string;
  articles: NewsMention[];
  feed_items: number;
}

export function publisherCounts(articles: NewsMention[]) {
  const counts = new Map<string, number>();
  for (const article of articles) counts.set(article.publisher, (counts.get(article.publisher) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Calendar buckets in UTC, including the partial days at either window edge. */
export function dailyMentions(feed: MentionFeed, publisher = "") {
  const counts = new Map<string, number>();
  const start = Date.parse(feed.window_start.slice(0, 10));
  const end = Date.parse(feed.window_end.slice(0, 10));
  for (let time = start; time <= end; time += 86_400_000) {
    counts.set(new Date(time).toISOString().slice(0, 10), 0);
  }
  for (const article of feed.articles) {
    if (publisher && article.publisher !== publisher) continue;
    const day = article.published_at.slice(0, 10);
    if (counts.has(day)) counts.set(day, counts.get(day)! + 1);
  }
  return [...counts].map(([day, count]) => ({ day, count }));
}
