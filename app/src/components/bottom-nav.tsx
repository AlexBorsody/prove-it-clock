"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type ChromeIconName } from "@/components/chrome-icons";

/**
 * Bottom tab bar, app-style: Scoreboard / HYPE / Compare / Methodology.
 */
const TABS: Array<{ href: string; label: string; icon: ChromeIconName }> = [
  { href: "/", label: "Scoreboard", icon: "grid" },
  { href: "/hype", label: "HYPE", icon: "megaphone" },
  { href: "/compare", label: "Compare", icon: "sliders" },
  { href: "/methodology", label: "Methodology", icon: "book" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="Primary">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
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
