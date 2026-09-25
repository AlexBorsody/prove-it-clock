import type { CSSProperties, ReactNode } from "react";

/**
 * Site-chrome icon set (nav, headers, buttons, badges, walkthrough).
 *
 * Octicons-style outline icons: 16px grid, 1.5px stroke, round caps/joins,
 * currentColor so icons inherit surrounding text color. For data/brand icons
 * (GitHub marks, stars, social) see ./icons.tsx, which the Vitals section uses.
 *
 * Usage: <Icon name="book" size={14} />
 * In text the icon sits near the baseline via vertical-align; in flex rows it
 * just works. Pass `title` only when the icon itself needs a label; otherwise
 * icons are aria-hidden and surrounding text carries the meaning.
 */
export type ChromeIconName =
  | "grid"
  | "book"
  | "info"
  | "help"
  | "x"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "check"
  | "flask"
  | "doc"
  | "alert"
  | "chart"
  | "heart"
  | "trending-down"
  | "gift"
  | "sliders"
  | "shield-check"
  | "star"
  | "person"
  | "list"
  | "wrench"
  | "inbox";

const PATHS: Record<ChromeIconName, ReactNode> = {
  grid: (
    <>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </>
  ),
  book: (
    <>
      <path d="M3.5 1.75h8a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2.75a1 1 0 0 1 1-1z" />
      <path d="M6 1.75v12.5" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5" />
      <path d="M8 4.75v.01" />
    </>
  ),
  help: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M6.2 6.1a1.9 1.9 0 1 1 2.75 1.7c-.55.3-.95.75-.95 1.3v.15" />
      <path d="M8 11.4v.01" />
    </>
  ),
  x: <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />,
  "chevron-left": <path d="M10 3.5L5.5 8l4.5 4.5" />,
  "chevron-right": <path d="M6 3.5l4.5 4.5L6 12.5" />,
  "chevron-down": <path d="M3.5 6L8 10.5 12.5 6" />,
  check: <path d="M3 8.5l3.2 3.2L13 5" />,
  flask: (
    <>
      <path d="M6.75 2h2.5" />
      <path d="M7.25 2v4.1L3.9 11.6a1.4 1.4 0 0 0 1.24 2.1h5.72a1.4 1.4 0 0 0 1.24-2.1L8.75 6.1V2" />
      <path d="M5.4 10h5.2" />
    </>
  ),
  doc: (
    <>
      <path d="M4.5 1.75h4.75L12.5 5v8.25a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V2.75a1 1 0 0 1 1-1z" />
      <path d="M9.25 1.75V5h3.25" />
    </>
  ),
  alert: (
    <>
      <path d="M8 2.25L14.75 13.5h-13.5z" />
      <path d="M8 6.5v3.25" />
      <path d="M8 11.75v.01" />
    </>
  ),
  chart: (
    <>
      <path d="M2 13.5l3.75-4.75 2.75 2.75 5-6.5" />
      <path d="M10.5 5H13.5v3" />
    </>
  ),
  heart: (
    <path d="M8 13.75C4.6 10.8 2.75 8.6 2.75 6.1A2.85 2.85 0 0 1 5.6 3.25c.95 0 1.8.5 2.4 1.3.6-.8 1.45-1.3 2.4-1.3a2.85 2.85 0 0 1 2.85 2.85c0 2.5-1.85 4.7-5.25 7.65z" />
  ),
  "trending-down": (
    <>
      <path d="M2 3.5l3.75 4.75 2.75-2.75 5 6.5" />
      <path d="M10.5 12H13.5V9" />
    </>
  ),
  gift: (
    <>
      <rect x="2.75" y="6.5" width="10.5" height="7" rx="1" />
      <path d="M2.75 9.75h10.5" />
      <path d="M8 6.5v7" />
      <path d="M8 6.5C8 4.6 6.9 3.6 5.85 3.6c-.95 0-1.6.75-1.35 1.6.25.95 1.9 1.3 3.5 1.3z" />
      <path d="M8 6.5c0-1.9 1.1-2.9 2.15-2.9.95 0 1.6.75 1.35 1.6-.25.95-1.9 1.3-3.5 1.3z" />
    </>
  ),
  sliders: (
    <>
      <path d="M2.5 5h2.5M10.5 5h3" />
      <circle cx="8" cy="5" r="2" />
      <path d="M2.5 11h4.5M11.5 11h2" />
      <circle cx="9.5" cy="11" r="2" />
    </>
  ),
  "shield-check": (
    <>
      <path d="M8 1.75l4.5 1.7v3.8c0 3.1-2.35 5.3-4.5 6.5-2.15-1.2-4.5-3.4-4.5-6.5v-3.8z" />
      <path d="M6.1 7.6l1.4 1.4 2.4-2.6" />
    </>
  ),
  star: (
    <path d="M8 2.1l1.75 3.55 3.9.57-2.82 2.75.66 3.9L8 11.05l-3.49 1.82.66-3.9-2.82-2.75 3.9-.57z" />
  ),
  person: (
    <>
      <circle cx="8" cy="5" r="2.75" />
      <path d="M3 13.75a5 5 0 0 1 10 0" />
    </>
  ),
  list: (
    <>
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
      <path d="M2.75 4v.01M2.75 8v.01M2.75 12v.01" />
    </>
  ),
  wrench: (
    <path d="M10.8 2.6a2.9 2.9 0 0 0-3.9 3.7L3 10.2a1.8 1.8 0 1 0 2.55 2.55l3.9-3.9a2.9 2.9 0 0 0 3.7-3.9l-2.15 2.15-1.85-1.85z" />
  ),
  inbox: (
    <>
      <path d="M2.5 9.5h11v3a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
      <path d="M3.5 9.5L4.9 4a1 1 0 0 1 .97-.75h4.26a1 1 0 0 1 .97.75l1.4 5.5" />
    </>
  ),
};

export default function Icon({
  name,
  size = 16,
  style,
  title,
}: {
  name: ChromeIconName;
  size?: number;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      style={{
        display: "inline-flex",
        flex: "none",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "-0.18em",
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {PATHS[name]}
      </svg>
    </span>
  );
}
