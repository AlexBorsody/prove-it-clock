"use client";

import { useEffect, useState } from "react";
import { dailyMentions, publisherCounts, type MentionFeed } from "@/lib/hype-mentions";
import { SOCIAL_SOURCES } from "@/lib/social";
import { searchMeta } from "@/lib/search-sections";
import styles from "./hype-explorer.module.css";

const names: Record<string, string> = { btc: "Bitcoin", eth: "Ethereum", xrp: "XRP", sol: "Solana", link: "Chainlink", avax: "Avalanche", dash: "Dash", bat: "Basic Attention Token" };
const date = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function HypeExplorer() {
  const [slug, setSlug] = useState("btc");
  const [feed, setFeed] = useState<MentionFeed | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [publisher, setPublisher] = useState("");
  const [day, setDay] = useState("");
  const [limit, setLimit] = useState(12);
  useEffect(() => {
    const controller = new AbortController();
    setFeed(null); setError(""); setPublisher(""); setDay(""); setLimit(12);
    fetch(`/api/v1/mentions/${slug}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("News sources are temporarily unavailable."); return response.json() as Promise<MentionFeed>; })
      .then(value => { if (!controller.signal.aborted) setFeed(value); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause.message); });
    return () => controller.abort();
  }, [slug, retry]);
  const publishers = publisherCounts(feed?.articles ?? []);
  const days = feed ? dailyMentions(feed, publisher) : [];
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const filtered = (feed?.articles ?? []).filter(a => (!publisher || a.publisher === publisher) && (!day || a.published_at.startsWith(day)));
  const reset = () => { setPublisher(""); setDay(""); setLimit(12); };

  return <section className={`panel search-section ${styles.explorer}`} {...searchMeta({ id: "hype-news-sources", title: "Explore news sources", kind: "HYPE", keywords: "publishers headlines daily coverage news sources Google News" })}>
    <div className={styles.heading}><div><span className={styles.eyebrow}>Behind the attention</span><h2>Who’s talking?</h2><p className="panel-sub">Explore the headlines, publishers and days behind the news.</p></div><span className={styles.badge}>Rolling 7 days</span></div>
    <div className={styles.coins} role="group" aria-label="Choose news project">{Object.keys(SOCIAL_SOURCES).map(key => <button key={key} aria-pressed={slug === key} onClick={() => { setSlug(key); reset(); }}><img src={`/icons/${key}.svg`} width={20} height={20} alt="" />{key.toUpperCase()}</button>)}</div>
    <div aria-live="polite" aria-busy={!feed && !error}>
      {!feed && !error && <p className={styles.loading}>Loading {names[slug]} news sources…</p>}
      {error && <p role="alert">{error} <button className={styles.reset} onClick={() => setRetry(v => v + 1)}>Try again</button></p>}
    </div>
    {feed && <>
      <div className={styles.stats}><div><strong>{feed.articles.length}</strong><span>news articles returned</span></div><div><strong>{publishers.length}</strong><span>publishers</span></div><div><strong>{names[slug]}</strong><span>{date(feed.window_start)} – {date(feed.window_end)}</span></div></div>
      <div className={styles.grid}>
        <div><h3>When the coverage happened</h3><p className={styles.hint}>Select a day to read its headlines{publisher ? ` from ${publisher}` : ""}.</p>
          <div className={styles.chart} role="group" aria-label="Articles by publication day in UTC">{days.map(d => <button key={d.day} className={styles.day} aria-pressed={day === d.day} aria-label={`${date(d.day)}: ${d.count} articles`} onClick={() => { setDay(day === d.day ? "" : d.day); setLimit(12); }}><span className={styles.barSpace}><span className={styles.bar} style={{ height: `${Math.max(2, d.count / maxDay * 100)}%` }} /><span className={styles.count}>{d.count}</span></span><span className={styles.date}>{date(d.day)}</span></button>)}</div>
          <p className={styles.hint}>Publication dates in UTC. First and last days cover partial days.</p>
        </div>
        <div><h3>Where it’s being covered</h3><p className={styles.hint}>Select a publisher to filter the chart and headlines.</p><div className={styles.publishers}>{publishers.map(p => <button key={p.name} aria-pressed={publisher === p.name} onClick={() => { setPublisher(publisher === p.name ? "" : p.name); setDay(""); setLimit(12); }}><span className={styles.publisherBar} style={{ width: `${p.count / Math.max(1, publishers[0].count) * 100}%` }} /><span>{p.name}</span><strong>{p.count}</strong></button>)}{!publishers.length && <p>No publishers returned for this window.</p>}</div></div>
      </div>
      <div className={styles.heading}><h3>{publisher || "All publishers"}{day ? ` · ${date(day)}` : ""} <span className={styles.hint}>({filtered.length})</span></h3>{(publisher || day) && <button className={styles.reset} onClick={reset}>Clear filters</button>}</div>
      <ul className={styles.articles}>{filtered.slice(0, limit).map(a => <li key={a.url}><div className={styles.articleMeta}><span>{a.publisher}</span><time dateTime={a.published_at}>{date(a.published_at)}</time></div><a href={a.url} target="_blank" rel="noopener noreferrer">{a.title}<span aria-hidden="true"> ↗</span></a></li>)}</ul>
      {!filtered.length && <p>No matching articles in this feed. This does not mean there was no coverage elsewhere.</p>}
      {filtered.length > limit && <button className={styles.more} onClick={() => setLimit(v => v + 12)}>Show more headlines ({filtered.length - limit} remaining)</button>}
      <p className={styles.hint}>Source: <a href={feed.source_url} target="_blank" rel="noopener noreferrer">Google News RSS</a> · checked {new Date(feed.fetched_at).toLocaleString("en-US", { timeZone: "UTC" })} UTC. Refreshed hourly. This is a limited search feed, not every mention on the internet. Syndicated stories may appear under multiple publishers. Live results can differ from saved daily totals below.</p>
    </>}
    <div className={styles.coverage}><div><strong>News sites</strong><span>Headlines and publishers via Google News</span></div><div><strong>Reddit + Telegram</strong><span>Community size only; posts are not indexed</span></div><div><strong>X / Twitter</strong><span>Not connected; no post data yet</span></div></div>
  </section>;
}
