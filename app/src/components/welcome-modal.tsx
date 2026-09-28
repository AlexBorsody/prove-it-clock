"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/**
 * First-arrival greeting: a pop-up with the methodology in it.
 * Shows once per browser. "Take the tour" hands off to the walkthrough;
 * "Explore on my own" dismisses without nagging the tour afterwards.
 */
const SEEN_KEY = "proveit-welcome-seen";
const TOUR_SEEN_KEY = "proveit-walkthrough-seen";
const REPLAY_EVENT = "proveit:walkthrough";

function wasSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // fail closed: never pop when storage is unavailable
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* stay quiet */
  }
}

function markTourSeen() {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    /* stay quiet */
  }
}

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wasSeen()) return;
    const t = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = useCallback((takeTour: boolean) => {
    markSeen();
    setOpen(false);
    if (takeTour) {
      window.dispatchEvent(new CustomEvent(REPLAY_EVENT));
    } else {
      markTourSeen();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="welcome-overlay"
      onClick={() => dismiss(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="welcome-close"
          onClick={() => dismiss(false)}
          aria-label="Close welcome message"
        >
          ✕
        </button>
        <div className="welcome-kicker">Prove Value</div>
        <h2 id="welcome-title" className="welcome-title">Did they deliver?</h2>
        <div className="welcome-body">
          <p>We check what crypto projects promised against what they actually did.</p>
          <p>
            Every promise is tracked with its source, a checkable test, and the
            evidence. A kept promise earns a heart. An open one is still pending,
            never a failure.
          </p>
          <p className="welcome-prop">
            If a project proves its value, it should be worth money. This is the record.
          </p>
        </div>
        <div className="welcome-actions">
          <button type="button" className="welcome-primary" onClick={() => dismiss(true)}>
            Take the tour
          </button>
          <button type="button" className="welcome-quiet" onClick={() => dismiss(false)}>
            Explore on my own
          </button>
        </div>
        <Link href="/methodology" className="welcome-method" onClick={() => dismiss(false)}>
          Read the full methodology
        </Link>
      </div>
    </div>
  );
}
