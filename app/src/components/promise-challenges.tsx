"use client";

import { FastComments } from "fastcomments-nextjs";

/**
 * Per-promise challenge threads, powered by FastComments.
 * Each promise gets its own thread keyed by a stable urlId
 * (e.g. "promise-dash-p3"). The widget only mounts when the toggle is
 * opened, so long promise lists stay light. The promise list keeps only
 * one challenge open at a time (accordion) via the `open` prop.
 * Renders nothing until NEXT_PUBLIC_FASTCOMMENTS_TENANT_ID is configured.
 */
/**
 * Public FastComments tenant ID. Overridable via NEXT_PUBLIC_FASTCOMMENTS_TENANT_ID;
 * the ID itself is public (it ships inside page HTML by design), so a code
 * default keeps the widget live without a dashboard step.
 */
const TENANT_ID = process.env.NEXT_PUBLIC_FASTCOMMENTS_TENANT_ID ?? "dwICRpAyrz_";

export default function PromiseChallenges({
  threadId,
  pageTitle,
  pageUrl,
  open,
  onToggle,
}: {
  threadId: string;
  pageTitle: string;
  pageUrl: string;
  open: boolean;
  onToggle: () => void;
}) {
  if (!TENANT_ID) return null;

  return (
    <div className="promise-challenges">
      <button
        type="button"
        className="challenge-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="challenge-chev" aria-hidden="true">{open ? "▼" : "▶"}</span>
        Challenge this assessment
      </button>
      {open && (
        <div className="challenge-thread">
          <FastComments
            key={threadId}
            tenantId={TENANT_ID}
            urlId={threadId}
            url={pageUrl}
            pageTitle={pageTitle}
          />
        </div>
      )}
    </div>
  );
}
