"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

const SEEN_KEY = "proveit-walkthrough-seen";
const REPLAY_EVENT = "proveit:walkthrough";

type TourStep = { selector: string; title: string; body: string };

/**
 * The tour lives on a project detail page: that page is the sauce.
 * Every step spotlights the actual section, not a modal description.
 */
const STEPS: TourStep[] = [
  {
    selector: '[data-tour="promises"]',
    title: "Promises, kept or broken",
    body: "This is the whole point. Everything Bitcoin promised, and what actually happened. A filled heart means the promise was kept. Tap any promise to see the proof.",
  },
  {
    selector: '[data-tour="shitcoin"]',
    title: "The warning light",
    body: "When promises fail or get quietly dropped, it shows up here. Tap the gauge to see exactly what went wrong.",
  },
  {
    selector: '[data-tour="code"]',
    title: "Are they still building?",
    body: "Real activity from GitHub. If the code stops moving but the price keeps climbing, that is the tell.",
  },
];

/** Tour the project page the user is already on; otherwise start with Bitcoin. */
function detailRoute(): string {
  const m = window.location.pathname.match(/^\/projects\/[^/]+/);
  return m ? m[0] : "/projects/btc";
}

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

/** Poll for an element rendered after a route change. */
function waitForElement(
  selector: string,
  onFound: () => void,
  onTimeout: () => void,
  timeoutMs = 6000
) {
  const started = Date.now();
  const id = window.setInterval(() => {
    if (document.querySelector(selector)) {
      window.clearInterval(id);
      onFound();
    } else if (Date.now() - started > timeoutMs) {
      window.clearInterval(id);
      onTimeout();
    }
  }, 120);
}

export default function Walkthrough() {
  const router = useRouter();
  const drvRef = useRef<Driver | null>(null);
  const stepRef = useRef(0);
  const activeRef = useRef(false);
  const transitioningRef = useRef(false);

  const endTour = useCallback((save = true) => {
    activeRef.current = false;
    transitioningRef.current = false;
    drvRef.current?.destroy();
    drvRef.current = null;
    if (save) markSeen();
  }, []);

  const showStep = useCallback(
    (i: number) => {
      if (i < 0 || i >= STEPS.length) {
        endTour();
        return;
      }
      // Tear down the previous highlight before doing anything else.
      transitioningRef.current = true;
      drvRef.current?.destroy();
      drvRef.current = null;

      stepRef.current = i;
      activeRef.current = true;
      const s = STEPS[i];
      const last = i === STEPS.length - 1;
      const route = detailRoute();

      const render = () => {
        const el = document.querySelector(s.selector) as HTMLElement | null;
        if (!el || !activeRef.current) {
          // Section missing on this render: skip forward, never strand the user.
          showStep(i + 1);
          return;
        }
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        const drv = driver({
          allowClose: true,
          overlayColor: "rgba(2,6,16,0.78)",
          popoverClass: "wt-driver-pop",
          showProgress: false,
          nextBtnText: last ? "Got it" : "Next",
          prevBtnText: "Back",
          doneBtnText: "Got it",
          onNextClick: () => showStep(i + 1),
          onPrevClick: () => {
            if (i > 0) showStep(i - 1);
          },
          onCloseClick: () => endTour(),
          onDestroyed: () => {
            // Escape key or outside tap: close the tour, but not when we are
            // mid-transition to the next step's page.
            if (activeRef.current && !transitioningRef.current) endTour();
          },
        });
        drvRef.current = drv;
        // Let the smooth scroll settle before measuring the highlight box.
        window.setTimeout(() => {
          if (!activeRef.current) return;
          transitioningRef.current = false;
          drv.highlight({
            element: el,
            popover: {
              title: s.title,
              showButtons: i === 0 ? ["next", "close"] : ["previous", "next", "close"],
              description:
                `<div class="wt-stepnum num">Step ${i + 1} of ${STEPS.length}</div>` +
                `<p>${s.body}</p>`,
              side: "bottom",
              align: "center",
            },
          });
        }, 380);
      };

      if (window.location.pathname !== route) {
        router.push(route);
        waitForElement(
          s.selector,
          render,
          () => showStep(i + 1) // page never rendered the section: move on
        );
      } else {
        render();
      }
    },
    [router, endTour]
  );

  // first-run autostart + replay listener
  useEffect(() => {
    const onReplay = () => showStep(0);
    window.addEventListener(REPLAY_EVENT, onReplay);
    let t: number | undefined;
    if (!wasSeen()) t = window.setTimeout(() => showStep(0), 700);
    return () => {
      window.removeEventListener(REPLAY_EVENT, onReplay);
      if (t) window.clearTimeout(t);
      endTour(false);
    };
  }, [showStep, endTour]);

  return null;
}
