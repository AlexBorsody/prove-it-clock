"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";
import { normalizePromiseState } from "@/lib/hearts";
import {
  promiseAnchor,
  promiseReferences,
  promiseEvidenceHref,
  matchesPromiseFilter,
  promiseDisplay,
  type PromiseFilter,
} from "@/lib/promise-context";

const PAGE_SIZE = 3;

/** One promise = one heart: the heart this promise earned, is chasing, or lost. */
export function promiseHeart(pr: any): { filled: boolean; color: string; label: string } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { filled: false, color: "var(--text-faint)", label: "No heart yet" };
  }
  if (s === "fulfilled") return { filled: true, color: "var(--green)", label: "Earned 1 heart" };
  if (s === "lapsed" || s === "retired")
    return { filled: false, color: "var(--red)", label: "Heart lost" };
  return { filled: false, color: "var(--text-faint)", label: "No heart yet" };
}

export default function PromiseList({
  slug,
  name,
  promises,
  filter,
  evidence,
}: {
  slug: string;
  name: string;
  promises: any[];
  filter: PromiseFilter;
  evidence?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const refs = promiseReferences(slug, promises);
  const visible = promises
    .map((pr, i) => ({ pr, i }))
    .filter(({ pr }) => matchesPromiseFilter(pr.state, filter));
  const shown = expanded ? visible : visible.slice(0, PAGE_SIZE);

  return <>
    {shown.map(({ pr, i }) => {
      const d = promiseDisplay(pr);
      const h = promiseHeart(pr);
      // Escape every non-ID character (including underscores) without
      // collapsing distinct lineage names onto the same anchor.
      const anchor = promiseAnchor(slug, String(pr.lineage ?? i));
      const label = refs[i].label;
      return (
        <div className="comp-row search-section" key={pr.lineage ?? i} {...searchMeta({ id: anchor, title: `${name}: ${pr.criteria ?? pr.lineage ?? "Promise"}`, kind: "Promise", project: slug, keywords: `${pr.lineage ?? ""} ${pr.claim_type ?? ""} ${d.label}` })}>
          <div className="promise-head">
            <Link className="promise-heart-evidence" href={promiseEvidenceHref(slug, String(pr.lineage ?? i))} aria-label={`${label}: ${h.label}. View evidence`}>
              <Icon name="heart" size={20} filled={h.filled} title={h.label} style={{ color: h.color }} />
            </Link>
            <div className="comp-name">{pr.criteria}</div>
          </div>
          <div className="comp-tags">
            <span className="tag na">{label}</span>
            <Link className={`tag evidence-link ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`} href={promiseEvidenceHref(slug, String(pr.lineage ?? i))} aria-label={`${label}: ${d.label}. View evidence`}>{d.label} ↗</Link>
            {pr.core ? <span className="tag na">Main promise</span> : null}
          </div>
          <p className="comp-desc">{pr.rationale}</p>
          <details className="comp-sources" id={`${anchor}-evidence`} open={filter !== "all" || evidence === String(pr.lineage ?? i)}>
            <summary>Evidence ({pr.evidence?.length ?? 0})</summary>
            {pr.evidence?.length > 0 ? <ul>
              {pr.evidence.map((e: any, j: number) => (
                <li key={j}>
                  <a href={e.url} target="_blank" rel="noreferrer">{e.summary ?? e.url}</a>
                </li>
              ))}
            </ul> : <p className="comp-desc">No supporting sources are linked to this assessment yet.</p>}
          </details>
        </div>
      );
    })}
    {visible.length > PAGE_SIZE && (
      <button
        type="button"
        className="promise-show-more"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show all promises"}
      </button>
    )}
  </>;
}
