"use client";

import { useEffect, useMemo, useState } from "react";
import { relatedMentions, type PromiseReference } from "@/lib/promise-context";
import type { MentionFeed } from "@/lib/hype-mentions";
import { searchMeta } from "@/lib/search-sections";
import Icon from "@/components/chrome-icons";
import styles from "./promise-context.module.css";

export default function PromiseNews({ slug, name, symbol, promises }: { slug: string; name: string; symbol: string; promises: PromiseReference[] }) {
  const [feed, setFeed] = useState<MentionFeed | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [limit, setLimit] = useState(5);
  useEffect(() => {
    const controller = new AbortController();
    setFeed(null); setFailed(false); setLimit(5);
    fetch(`/api/v1/mentions/${slug}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("Unavailable"); return response.json() as Promise<MentionFeed>; })
      .then(result => { if (!controller.signal.aborted) setFeed(result); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [slug, retry]);
  const related = useMemo(() => relatedMentions(feed?.articles ?? [], promises, `${slug} ${name} ${symbol}`), [feed, promises, slug, name, symbol]);
  return <section className={`panel recent-promises-section search-section ${styles.recent}`} {...searchMeta({ id: `project-${slug}-recent`, title: `${name} recently happened`, kind: "News", project: slug, keywords: "recent news related promises automatic keyword matches" })}>
    <h2>Recently happened</h2>
    <p className={styles.sub}>News related to {name}’s promises. <Icon name="info" size={14} title="Automatically linked by shared keywords. Related coverage, not verified delivery." /></p>
    {!feed && !failed && <p role="status" className={styles.empty}>Finding related coverage…</p>}
    {failed && <div role="status" className={styles.empty}><p>News is temporarily unavailable.</p><button onClick={() => setRetry(v => v + 1)} className={styles.more}>Try again</button></div>}
    {feed && !related.length && <p className={styles.empty}>No clear headline matches in the current seven-day feed. That does not mean no progress was made.</p>}
    {related.length > 0 && <ol className={styles.timeline}>{related.slice(0, limit).map(({ article, matches }) => <li key={article.url} className="promise-news-item">
      <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" })} UTC</time>
      <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3>
      <span className={styles.publisher}>{article.publisher}</span>
      <div className={styles.tags}>{matches.map(match => <a key={match.promise.lineage} href={`/projects/${slug}?promises=all#${match.promise.anchor}`} title={match.promise.criteria} aria-label={`Related to ${match.promise.label}: ${match.promise.criteria}`}>Relates to {match.promise.label}</a>)}</div>
      <details className={styles.why}><summary>Why this match?</summary>{matches.map(match => <p key={match.promise.lineage}><b>{match.promise.label}</b> · Shared topic words: {match.terms.join(", ")}.<br /><span>{match.promise.lineage.replace(/^.*?-p\d+-/i, "").replace(/-/g, " ")}</span><br />{match.promise.criteria}</p>)}</details>
    </li>)}</ol>}
    {related.length > limit && <button className={styles.more} onClick={() => setLimit(value => value + 5)}>Show more</button>}
    {feed && <p className={styles.note}>Google News RSS · Limited seven-day sample, refreshed hourly. Each link opens the publisher’s story through Google News.</p>}
  </section>;
}
