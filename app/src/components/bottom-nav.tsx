"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isMetricsPath } from "@/lib/metric-navigation";
import Icon, { type ChromeIconName } from "@/components/chrome-icons";

/**
 * Bottom tab bar, app-style: Scoreboard / Metrics / Methodology / API.
 * Tour is a button, not a route, so it stays out of the TABS list.
 */
const TABS: Array<{ href: string; label: string; shortLabel?: string; icon: ChromeIconName }> = [
  { href: "/", label: "Scoreboard", shortLabel: "Scores", icon: "grid" },
  { href: "/metrics", label: "Metrics", icon: "chart" },
  { href: "/methodology", label: "Methodology", shortLabel: "Method", icon: "book" },
  { href: "/developers", label: "API", icon: "code" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="Primary">
      {TABS.map((t) => {
        const active = t.href === "/metrics" ? isMetricsPath(pathname) : t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
            aria-label={t.label}
          >
            <Icon name={t.icon} size={22} />
            {t.shortLabel ? (
              <>
                <span className="bottomnav-label-full" aria-hidden="true">{t.label}</span>
                <span className="bottomnav-label-short" aria-hidden="true">{t.shortLabel}</span>
              </>
            ) : <span aria-hidden="true">{t.label}</span>}
          </Link>
        );
      })}
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
