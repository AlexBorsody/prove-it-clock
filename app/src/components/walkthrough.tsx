"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/chrome-icons";

const SEEN_KEY = "proveit-walkthrough-seen";
const REPLAY_EVENT = "proveit:walkthrough";

type Step = { title: string; body: string; anchor?: string };

const STEPS: Step[] = [
  {
    title: "Hearts = proof delivered",
    body: "Every heart maps to a promise and evidence.",
    anchor: ".hearts, .mcard-hearts",
  },
  {
    title: "Shitcoin warning = what went wrong",
    body: "Abandoned or failed promises trigger the verdict.",
    anchor: ".shitcoin-meter",
  },
  {
    title: "CODE + HYPE = context",
    body: "See whether they're still building and whether attention outruns substance.",
    anchor: ".mcard-stats",
  },
  {
    title: "Timeline = the special sauce",
    body: "Watch credibility rise and fall as real events happen. Click through to the evidence.",
  },
];

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: stay quiet */
  }
}

function wasSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // fail closed: never nag when storage is unavailable
  }
}

export default function Walkthrough() {
  const [step, setStep] = useState<number | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const clearAnchor = useCallback(() => {
    anchorRef.current?.classList.remove("wt-anchor");
    anchorRef.current = null;
  }, []);

  const place = useCallback(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const w = Math.min(340, window.innerWidth - 32);
    tip.style.width = `${w}px`;
    const el = anchorRef.current;
    if (!el) {
      // centered card when there is nothing to anchor to
      tip.style.left = `${Math.max(16, (window.innerWidth - w) / 2)}px`;
      tip.style.top = `${Math.max(16, (window.innerHeight - tip.offsetHeight) / 2)}px`;
      return;
    }
    const r = el.getBoundingClientRect();
    const gap = 12;
    const h = tip.offsetHeight || 220;
    let top = r.bottom + gap;
    if (top + h > window.innerHeight - 16) top = r.top - h - gap; // flip above
    top = Math.max(16, top);
    const left = Math.max(16, Math.min(r.left, window.innerWidth - w - 16));
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }, []);

  const showStep = useCallback(
    (i: number) => {
      clearAnchor();
      const sel = STEPS[i].anchor;
      const el = sel ? (document.querySelector(sel) as HTMLElement | null) : null;
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("wt-anchor");
        anchorRef.current = el;
      }
      setStep(i);
      // position after paint, and again once smooth-scroll settles
      requestAnimationFrame(() => place());
      setTimeout(place, 450);
    },
    [clearAnchor, place]
  );

  const dismiss = useCallback(
    (save = true) => {
      if (save) markSeen();
      clearAnchor();
      setStep(null);
    },
    [clearAnchor]
  );

  // first-run autostart + replay listener
  useEffect(() => {
    const onReplay = () => showStep(0);
    window.addEventListener(REPLAY_EVENT, onReplay);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (!wasSeen()) t = setTimeout(() => showStep(0), 700);
    return () => {
      window.removeEventListener(REPLAY_EVENT, onReplay);
      if (t) clearTimeout(t);
    };
  }, [showStep]);

  // keep the tooltip glued to its anchor while scrolling / resizing
  useEffect(() => {
    if (step === null) return;
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      cancelAnimationFrame(raf);
    };
  }, [step, place]);

  // escape dismisses
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, dismiss]);

  useEffect(() => () => clearAnchor(), [clearAnchor]);

  if (step === null) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <>
      <div className="wt-scrim" onClick={() => dismiss()} aria-hidden="true" />
      <div
        ref={tipRef}
        className="wt-tip"
        role="dialog"
        aria-modal="true"
        aria-label={`Step ${step + 1} of ${STEPS.length}: ${s.title}`}
      >
        <button
          type="button"
          className="wt-close"
          onClick={() => dismiss()}
          aria-label="Skip walkthrough"
        >
          <Icon name="x" size={14} />
        </button>
        <div className="wt-step num">
          STEP {step + 1} / {STEPS.length}
        </div>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
        <div className="wt-actions">
          {step > 0 && (
            <button type="button" className="wt-btn ghost" onClick={() => showStep(step - 1)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="chevron-left" size={14} />
                Back
              </span>
            </button>
          )}
          {!last && (
            <button type="button" className="wt-btn primary" onClick={() => showStep(step + 1)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Next
                <Icon name="chevron-right" size={14} />
              </span>
            </button>
          )}
          {last && (
            <button type="button" className="wt-btn primary" onClick={() => dismiss()}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={14} />
                Got it
              </span>
            </button>
          )}
          <button type="button" className="wt-skip" onClick={() => dismiss()}>
            Skip
          </button>
        </div>
      </div>
    </>
  );
}
