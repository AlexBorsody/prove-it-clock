"use client";

/** Unobtrusive replay affordance for the first-run walkthrough. */
export default function WalkthroughLink() {
  return (
    <button
      type="button"
      className="wt-replay"
      onClick={() => window.dispatchEvent(new CustomEvent("proveit:walkthrough"))}
      aria-label="How to read this"
    >
      <span className="wt-replay-full">How to read this</span>
      <span className="wt-replay-short" aria-hidden="true">?</span>
    </button>
  );
}
