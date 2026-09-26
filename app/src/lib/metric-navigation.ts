/** Keep existing page URLs, query parameters and search anchors valid. */
export const METRIC_VIEWS = [
  { href: "/code", label: "CODE" },
  { href: "/hype", label: "HYPE" },
  { href: "/compare", label: "Compare" },
] as const;

export function isMetricsPath(pathname: string): boolean {
  return pathname === "/metrics" || METRIC_VIEWS.some(view => pathname === view.href || pathname.startsWith(view.href + "/"));
}
