"use client";

import nextDynamic from "next/dynamic";

/**
 * Below-fold charts, loaded only on the client after hydration.
 * Keeps heavy chart libraries out of the initial page JS.
 */
export const LazyHypeShareChart = nextDynamic(
  () => import("@/components/hype-share-chart"),
  { ssr: false, loading: () => <div className="skeleton chart-skeleton" aria-hidden="true" /> }
);

export const LazyCodeActivityChart = nextDynamic(
  () => import("@/components/delivery-timeline").then((m) => m.CodeActivityChart),
  { ssr: false, loading: () => <div className="skeleton chart-skeleton" aria-hidden="true" /> }
);
