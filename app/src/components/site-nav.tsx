"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type ChromeIconName } from "@/components/chrome-icons";

const TABS: Array<{ href: string; label: string; icon: ChromeIconName }> = [
  { href: "/", label: "Projects", icon: "grid" },
  { href: "/methodology", label: "Methodology", icon: "book" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name={t.icon} size={14} />
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
