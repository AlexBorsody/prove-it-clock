"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prewarmSearchIndex } from "@/lib/site-search";

let pageVisits = 0;
let lastVisitedPath: string | undefined;
let visitStorageAvailable = true;
const VISIT_STORAGE_KEY = "prove-it.search-page-visits";

function recordPageVisit() {
  if (visitStorageAvailable) {
    try {
      const saved = window.sessionStorage.getItem(VISIT_STORAGE_KEY);
      const count = saved === null ? pageVisits : Number(saved);
      if (Number.isInteger(count) && count >= 0 && count < 5) pageVisits = count;
    } catch { visitStorageAvailable = false; }
  }
  pageVisits = (pageVisits + 1) % 5;
  if (visitStorageAvailable) {
    try {
      window.sessionStorage.setItem(VISIT_STORAGE_KEY, String(pageVisits));
    } catch { visitStorageAvailable = false; }
  }
  if (pageVisits === 0) prewarmSearchIndex();
}

/** Resolve deep links after route rendering, including content inside closed details. */
export default function SearchAnchor() {
  const pathname = usePathname();

  useEffect(() => {
    if (lastVisitedPath !== pathname) {
      lastVisitedPath = pathname;
      // The module guard ignores StrictMode's replay; storage survives reloads.
      recordPageVisit();
    }
    let observer: MutationObserver | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let highlightTimer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    let target: HTMLElement | undefined;
    let addedTabIndex = false;

    function clear() {
      observer?.disconnect();
      observer = undefined;
      if (deadline) clearTimeout(deadline);
      if (highlightTimer) clearTimeout(highlightTimer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      target?.classList.remove("search-target-active");
      if (addedTabIndex) target?.removeAttribute("tabindex");
      target = undefined;
      addedTabIndex = false;
    }

    function navigate(hash: string) {
      clear();
      if (!hash || hash === "#") return;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }

      function reveal(): boolean {
        const element = document.getElementById(id);
        if (!element) return false;
        observer?.disconnect();
        if (deadline) clearTimeout(deadline);
        target = element;
        for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
        }
        frame = requestAnimationFrame(() => {
          if (!element.isConnected) return;
          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          element.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
          if (!element.hasAttribute("tabindex")) { element.setAttribute("tabindex", "-1"); addedTabIndex = true; }
          element.focus({ preventScroll: true });
          element.classList.add("search-target-active");
          highlightTimer = setTimeout(() => element.classList.remove("search-target-active"), 2600);
        });
        return true;
      }

      if (!reveal()) {
        // A route can stream its content after the layout commits. Bound the wait.
        observer = new MutationObserver(() => { reveal(); });
        observer.observe(document.body, { childList: true, subtree: true });
        deadline = setTimeout(() => observer?.disconnect(), 5000);
      }
    }

    const onHashChange = () => navigate(window.location.hash);
    const onSearchNavigate = (event: Event) => {
      const hash = (event as CustomEvent<unknown>).detail;
      if (typeof hash === "string") navigate(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("site-search-navigate", onSearchNavigate);
    navigate(window.location.hash);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("site-search-navigate", onSearchNavigate);
      clear();
    };
  }, [pathname]);

  return null;
}
