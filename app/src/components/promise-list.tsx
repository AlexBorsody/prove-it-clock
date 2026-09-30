"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/chrome-icons";
import PromiseChallenges from "@/components/promise-challenges";
import PushSubscribeToggle from "@/components/push-subscribe-toggle";
import ViewToggle, { type BoardView } from "@/components/view-toggle";
import { searchMeta } from "@/lib/search-sections";
import { normalizePromiseState } from "@/lib/hearts";
import { CATEGORIES } from "../../data/atlas-taxonomy";
import {
  promiseAnchor,
  promiseReferences,
  promiseEvidenceHref,
  matchesPromiseFilter,
  promiseDisplay,
  type PromiseFilter,
} from "@/lib/promise-context";
import { detectNarrativeSignals, signalLabel, signalTooltip } from "@/lib/narrative-signals";

const PAGE_SIZE = 3;
const PROMISE_VIEW_KEY = "proveit:promise-view";

function defaultPromiseView(): BoardView {
  if (typeof window === "undefined") return "list";
  try {
    const saved = window.localStorage.getItem(PROMISE_VIEW_KEY);
    if (saved === "cards" || saved === "list") return saved;
  } catch {}
  return "list";
}

/** One promise = one heart: the heart this promise earned, is chasing, or lost. */
export function promiseHeart(pr: any): { filled: boolean; color: string; label: string } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { filled: false, color: "var(--text-faint)", label: "Promise status unknown" };
  }
  if (s === "fulfilled") return { filled: true, color: "var(--green)", label: "Promise kept" };
  if (s === "lapsed" || s === "retired")
    return { filled: false, color: "var(--red)", label: "Promise lapsed" };
  return { filled: false, color: "var(--text-faint)", label: "Promise open" };
}

function evidenceList(pr: any) {
  return (
    <>
      {pr.evidence?.length > 0 ? <ul>
        {pr.evidence.map((e: any, j: number) => (
          <li key={j}>
            <a href={e.url} target="_blank" rel="noreferrer">{e.summary ?? e.url}</a>
          </li>
        ))}
      </ul> : <p className="comp-desc">No supporting sources are linked to this assessment yet.</p>}
    </>
  );
}

/** Compact row: heart | title | P# | state | chevron. Tap expands the detail. */
function PromiseRow({
  slug,
  name,
  pr,
  i,
  label,
  categoryLabel,
  filter,
  evidence,
  challengeOpen,
  onToggleChallenge,
}: {
  slug: string;
  name: string;
  pr: any;
  i: number;
  label: string;
  categoryLabel: string;
  filter: PromiseFilter;
  evidence?: string;
  challengeOpen: boolean;
  onToggleChallenge: () => void;
}) {
  const d = promiseDisplay(pr);
  const h = promiseHeart(pr);
  // Escape every non-ID character (including underscores) without
  // collapsing distinct lineage names onto the same anchor.
  const anchor = promiseAnchor(slug, String(pr.lineage ?? i));
  const evHref = promiseEvidenceHref(slug, String(pr.lineage ?? i));
  const evidenceOpen = filter !== "all" || evidence === String(pr.lineage ?? i);
  const [open, setOpen] = useState(evidenceOpen);
  useEffect(() => { if (evidenceOpen) setOpen(true); }, [evidenceOpen]);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div className="promise-row search-section" {...searchMeta({ id: anchor, title: `${name}: ${pr.criteria ?? pr.lineage ?? "Promise"}`, kind: "Promise", project: slug, keywords: `${pr.lineage ?? ""} ${pr.claim_type ?? ""} ${d.label}` })}>
      <div
        className="promise-row-head"
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${label}: ${pr.criteria ?? "Promise"}. ${d.label}. ${open ? "Collapse" : "Expand"} details`}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
      >
        <Link className="promise-heart-evidence" href={evHref} onClick={stop} aria-label={`${label}: ${h.label}. View evidence`}>
          <Icon name="heart" size={20} filled={h.filled} title={h.label} style={{ color: h.color }} />
        </Link>
        <span className="promise-row-copy">
          <span className="promise-row-title">{pr.criteria}</span>
          <span className="promise-row-category">{categoryLabel}</span>
          {detectNarrativeSignals(pr).map((s) => (
            <span key={s} className="tag warn" title={signalTooltip(s)}>Narrative: {signalLabel(s)}</span>
          ))}
        </span>
        <span className="tag na promise-row-ref">{label}</span>
        <Link className={`tag evidence-link ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`} href={evHref} onClick={stop} aria-label={`${label}: ${d.label}. View evidence`}>{d.label}</Link>
        <span className="promise-row-chev"><Icon name="chevron-right" size={18} /></span>
      </div>
      {open && (
        <div className="promise-row-body">
          <p className="comp-desc">{pr.rationale}</p>
          <div className="comp-tags">
            {pr.core ? <span className="tag na">Main promise</span> : null}
            {detectNarrativeSignals(pr).map((s) => (
              <span key={s} className="tag warn" title={signalTooltip(s)}>Narrative: {signalLabel(s)}</span>
            ))}
            {pr.lineage ? (
              <PushSubscribeToggle projectSlug={slug} lineage={String(pr.lineage)} label="Notify me about this promise" />
            ) : null}
          </div>
          <details className="comp-sources" id={`${anchor}-evidence`} open={evidenceOpen}>
            <summary>Evidence ({pr.evidence?.length ?? 0})</summary>
            {evidenceList(pr)}
          </details>
          <PromiseChallenges
            threadId={`promise-${slug}-${String(pr.lineage ?? i)}`}
            pageTitle={`${name}: ${pr.criteria ?? "Promise"}`}
            pageUrl={`${typeof window === "undefined" ? "" : window.location.origin}/projects/${slug}#${anchor}`}
            open={challengeOpen}
            onToggle={onToggleChallenge}
          />
        </div>
      )}
    </div>
  );
}

/** The original full card. */
function PromiseCard({
  slug,
  name,
  pr,
  i,
  label,
  categoryLabel,
  filter,
  evidence,
  challengeOpen,
  onToggleChallenge,
}: {
  slug: string;
  name: string;
  pr: any;
  i: number;
  label: string;
  categoryLabel: string;
  filter: PromiseFilter;
  evidence?: string;
  challengeOpen: boolean;
  onToggleChallenge: () => void;
}) {
  const d = promiseDisplay(pr);
  const h = promiseHeart(pr);
  const anchor = promiseAnchor(slug, String(pr.lineage ?? i));
  return (
    <div className="comp-row search-section" {...searchMeta({ id: anchor, title: `${name}: ${pr.criteria ?? pr.lineage ?? "Promise"}`, kind: "Promise", project: slug, keywords: `${pr.lineage ?? ""} ${pr.claim_type ?? ""} ${d.label}` })}>
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
        {detectNarrativeSignals(pr).map((s) => (
          <span key={s} className="tag warn" title={signalTooltip(s)}>Narrative: {signalLabel(s)}</span>
        ))}
        <span className="tag na">{categoryLabel}</span>
        {pr.lineage ? (
          <PushSubscribeToggle projectSlug={slug} lineage={String(pr.lineage)} label="Notify me about this promise" />
        ) : null}
      </div>
      <p className="comp-desc">{pr.rationale}</p>
      <details className="comp-sources" id={`${anchor}-evidence`} open={filter !== "all" || evidence === String(pr.lineage ?? i)}>
        <summary>Evidence ({pr.evidence?.length ?? 0})</summary>
        {evidenceList(pr)}
      </details>
      <PromiseChallenges
        threadId={`promise-${slug}-${String(pr.lineage ?? i)}`}
        pageTitle={`${name}: ${pr.criteria ?? "Promise"}`}
        pageUrl={`${typeof window === "undefined" ? "" : window.location.origin}/projects/${slug}#${anchor}`}
        open={challengeOpen}
        onToggle={onToggleChallenge}
      />
    </div>
  );
}

export default function PromiseList({
  slug,
  name,
  promises,
  filter,
  evidence,
  category = "",
  categoryOf,
}: {
  slug: string;
  name: string;
  promises: any[];
  filter: PromiseFilter;
  evidence?: string;
  /** When set, only promises in this category show. Refs and labels are
      built from the full list so P-numbers never renumber. */
  category?: string;
  categoryOf?: (pr: any) => string | null;
}) {
  const [expanded, setExpanded] = useState(() => !!evidence);
  useEffect(() => { if (evidence) setExpanded(true); }, [evidence]);
  const [view, setView] = useState<BoardView>("list");
  useEffect(() => { setView(defaultPromiseView()); }, []);
  // Only one promise challenge is open at a time, keeping the page light.
  const [challengeOpen, setChallengeOpen] = useState<string | null>(null);
  function changeView(v: BoardView) {
    setView(v);
    try { window.localStorage.setItem(PROMISE_VIEW_KEY, v); } catch {}
  }
  const refs = promiseReferences(slug, promises);
  const visible = promises
    .map((pr, i) => ({ pr, i }))
    .filter(({ pr }) => matchesPromiseFilter(pr.state, filter))
    .filter(({ pr }) => !category || (categoryOf?.(pr) ?? "unclassified") === category);
  const renderPromise = ({ pr, i }: { pr: any; i: number }) => {
    const anchor = promiseAnchor(slug, String(pr.lineage ?? i));
    const challengeProps = {
      challengeOpen: challengeOpen === anchor,
      onToggleChallenge: () => setChallengeOpen(cur => (cur === anchor ? null : anchor)),
    };
    return view === "list"
      ? <PromiseRow key={pr.lineage ?? i} slug={slug} name={name} pr={pr} i={i} label={refs[i].label} categoryLabel={CATEGORIES.find(c => c.id === categoryOf?.(pr))?.label ?? "Unclassified"} filter={filter} evidence={evidence} {...challengeProps} />
      : <PromiseCard key={pr.lineage ?? i} slug={slug} name={name} pr={pr} i={i} label={refs[i].label} categoryLabel={CATEGORIES.find(c => c.id === categoryOf?.(pr))?.label ?? "Unclassified"} filter={filter} evidence={evidence} {...challengeProps} />;
  };
  return <>
    <div className="promise-view-toggle"><ViewToggle value={view} onChange={changeView} label="Promise layout" /></div>
    {visible.slice(0, PAGE_SIZE).map(renderPromise)}
    {visible.length > PAGE_SIZE && (
      <details className="promise-more" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
        <summary className="promise-show-more">{expanded ? "Show less" : "Show all promises"}</summary>
        {visible.slice(PAGE_SIZE).map(renderPromise)}
      </details>
    )}
  </>;
}
