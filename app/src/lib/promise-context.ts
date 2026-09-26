import { normalizePromiseState } from "./hearts";
import type { NewsMention } from "./hype-mentions";

export interface TrackedPromise { lineage: string; criteria: string; state: string }
export interface PromiseReference { lineage: string; label: string; criteria: string; anchor: string }
export interface RelatedMention { article: NewsMention; matches: { promise: PromiseReference; terms: string[] }[] }

/** Same stable anchor used by the full promise and every reference to it. */
export function promiseAnchor(slug: string, lineage: string): string {
  const id = lineage.replace(/[^a-zA-Z0-9-]/gu, character => `_${character.codePointAt(0)!.toString(16)}_`);
  return `project-${slug}-promise-${id}`;
}

export const PROMISE_FILTERS = ["all", "kept", "open", "in-play", "failed", "lapsed", "retired", "unknown"] as const;
export type PromiseFilter = typeof PROMISE_FILTERS[number];

export function matchesPromiseFilter(state: string, filter: PromiseFilter): boolean {
  if (filter === "all") return true;
  let normalized: string;
  try { normalized = normalizePromiseState(state); } catch { normalized = "unknown"; }
  if (filter === "kept") return normalized === "fulfilled";
  if (filter === "open") return ["open", "active"].includes(normalized);
  if (filter === "in-play") return ["open", "active", "unknown"].includes(normalized);
  if (filter === "failed") return ["lapsed", "retired"].includes(normalized);
  return normalized === filter;
}

export function promiseFilterHref(slug: string, filter: PromiseFilter): string {
  return `/projects/${slug}?promises=${filter}#promises`;
}

/** Display promise state using the canonical five: open / active / fulfilled / lapsed / retired. Legacy DB values normalize at the boundary. */
export function promiseDisplay(pr: { state: string }): { label: string; tone: "good" | "dim" | "bad" } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { label: "Unknown", tone: "dim" };
  }
  if (s === "fulfilled") return { label: "Fulfilled", tone: "good" };
  if (s === "active") return { label: "Active", tone: "dim" };
  if (s === "open") return { label: "Open", tone: "dim" };
  if (s === "lapsed") return { label: "Lapsed", tone: "bad" };
  return { label: "Retired", tone: "bad" };
}

export function promiseEvidenceHref(slug: string, lineage: string): string {
  return `/projects/${slug}?evidence=${encodeURIComponent(lineage)}#${promiseAnchor(slug, lineage)}-evidence`;
}

export function promiseReferences(slug: string, promises: TrackedPromise[]): PromiseReference[] {
  return promises.map((promise, index) => ({
    lineage: promise.lineage,
    label: `P${Number(promise.lineage.match(/(?:^|-)p(\d+)(?:-|$)/i)?.[1] ?? index + 1)}`,
    criteria: promise.criteria,
    anchor: promiseAnchor(slug, promise.lineage),
  }));
}

export function promiseCounts(promises: TrackedPromise[]) {
  const counts = { fulfilled: 0, open: 0, active: 0, lapsed: 0, retired: 0, unknown: 0 };
  for (const promise of promises) {
    try { counts[normalizePromiseState(promise.state)]++; }
    catch { counts.unknown++; }
  }
  return counts;
}

const STOP = new Set(`bitcoin btc ethereum ether eth ripple xrp solana sol chainlink link avalanche avax brave bat dash dashpay the and for that this with from into under over after before about against than then when where while which what who whose they their there these those have has had was were been being are can could should would will not never only every more most some such through without within across between each both other also still any all its our out does did itself same one two new first last current future original near nearly around high low higher lower large small million billion trillion total worth hit hits adds added add rise rises rising fall falls falling rally record reach reaches reached next back get gets got seen see latest long short end start overall ongoing milestone promise promises project projects cryptocurrency crypto token tokens coin coins price prices market markets news says said say today week year years month months time times real use used using user users network system platform support supports supported provide provides allow allows make makes public remain remains`.split(/\s+/));
function terms(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z]+/g) ?? [])
    .filter(word => word.length >= 3 && !STOP.has(word))
    .map(word => word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));
}

/** Topic suggestions only. No verdict, sentiment, or evidence-state inference. */
export function relatedMentions(articles: NewsMention[], promises: PromiseReference[], projectWords: string): RelatedMention[] {
  const excluded = terms(projectWords);
  const candidates = promises.map(promise => ({ promise, words: terms(`${promise.criteria} ${promise.lineage.replace(/(?:^|-)p\d+(?:-|$)/gi, " ")}`) }));
  return articles.map(article => {
    const headline = terms(article.title);
    const matches = candidates.map(({ promise, words }) => ({ promise, terms: [...headline].filter(word => !excluded.has(word) && words.has(word)) }))
      // Two distinct topic words are required; project name alone never links a story.
      .filter(match => match.terms.length >= 2)
      .sort((a, b) => b.terms.length - a.terms.length || a.promise.lineage.localeCompare(b.promise.lineage))
      .slice(0, 3);
    return { article, matches };
  }).filter(item => item.matches.length > 0).sort((a, b) => b.article.published_at.localeCompare(a.article.published_at));
}
