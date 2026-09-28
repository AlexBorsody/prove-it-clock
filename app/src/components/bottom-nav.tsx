"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type ChromeIconName } from "@/components/chrome-icons";

/**
 * Bottom tab bar, app-style: Scoreboard / Stocks / Methodology / API / Search.
 * Tour is a button, not a route, so it stays out of the TABS list.
 */
const TABS: Array<{ href: string; label: string; shortLabel?: string; icon: ChromeIconName }> = [
  { href: "/", label: "Scoreboard", shortLabel: "Scores", icon: "grid" },
  { href: "/stocks", label: "Stocks", icon: "chart" },
  { href: "/methodology", label: "Methodology", shortLabel: "Method", icon: "book" },
  { href: "/developers", label: "API", icon: "code" },
];

function TabLink({ tab, pathname }: { tab: (typeof TABS)[number]; pathname: string }) {
  const active = tab.href === "/" ? (pathname === "/" || pathname === "/atlas") : pathname.startsWith(tab.href);
  return (
    <Link
      href={tab.href}
      className={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={tab.label}
    >
      <Icon name={tab.icon} size={22} />
      {tab.shortLabel ? (
        <>
          <span className="bottomnav-label-full" aria-hidden="true">{tab.label}</span>
          <span className="bottomnav-label-short" aria-hidden="true">{tab.shortLabel}</span>
        </>
      ) : <span aria-hidden="true">{tab.label}</span>}
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="Primary">
      <TabLink tab={TABS[0]} pathname={pathname} />
      <TabLink tab={TABS[1]} pathname={pathname} />
      <TabLink tab={TABS[2]} pathname={pathname} />
      <button type="button" className="tabbtn" onClick={() => window.dispatchEvent(new CustomEvent("proveit:search"))} aria-label="Search site content">
        <Icon name="search" size={22} /><span>Search</span>
      </button>
      <TabLink tab={TABS[3]} pathname={pathname} />
      <button
        type="button"
        className="tabbtn"
        onClick={() => window.dispatchEvent(new CustomEvent("proveit:walkthrough"))}
        aria-label="Replay the guided tour"
      >
        <Icon name="help" size={22} />
        <span>Tour</span>
      </button>
    </nav>
  );
}
