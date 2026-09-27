/** Keep existing page URLs, query parameters and search anchors valid. */
export const METRIC_VIEWS = [
  { href: "/compare", label: "Compare" },
  { href: "/code", label: "Code" },
  { href: "/hype", label: "Hype" },
] as const;

export function isMetricsPath(pathname: string): boolean {
  return pathname === "/metrics" || METRIC_VIEWS.some(view => pathname === view.href || pathname.startsWith(view.href + "/"));
}
