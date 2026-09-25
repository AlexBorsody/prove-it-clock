"use client";

/** Unobtrusive replay affordance for the first-run walkthrough. */
export default function WalkthroughLink() {
  return (
    <button
      type="button"
      className="wt-replay"
      onClick={() => window.dispatchEvent(new CustomEvent("proveit:walkthrough"))}
    >
      How to read this
    </button>
  );
}
