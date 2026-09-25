"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Projects" },
  { href: "/methodology", label: "Methodology" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
