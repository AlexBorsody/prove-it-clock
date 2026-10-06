"use client";

/**
 * Per-promise challenge threads.
 * FastComments integration temporarily disabled (package build issue).
 * Renders the toggle UI; thread content coming soon.
 */

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
          <p className="dim">Challenge threads coming soon.</p>
        </div>
      )}
    </div>
  );
}
