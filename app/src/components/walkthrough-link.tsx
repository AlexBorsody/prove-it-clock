"use client";

import Icon from "@/components/chrome-icons";

/** Unobtrusive replay affordance for the first-run walkthrough. */
export default function WalkthroughLink() {
  return (
    <button
      type="button"
      className="wt-replay"
      onClick={() => window.dispatchEvent(new CustomEvent("proveit:walkthrough"))}
      aria-label="How to read this"
    >
      <span className="wt-replay-full">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="info" size={14} />
          How to read this
        </span>
      </span>
      <span className="wt-replay-short" aria-hidden="true">
        <Icon name="help" size={16} />
      </span>
    </button>
  );
}
