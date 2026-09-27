"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isMetricsPath, METRIC_VIEWS } from "@/lib/metric-navigation";
import styles from "./metrics-nav.module.css";

/** Shared navigation shell. The existing metric pages own their content. */
export default function MetricsNav() {
  const pathname = usePathname();
  if (!isMetricsPath(pathname)) return null;
  return <div id="metrics-navigation" className={`metrics-navigation ${styles.shell}`}>
    <p className={styles.title}>Context</p>
    {pathname !== '/compare' && <p className={styles.description}>Development and attention data. These do not add ranking points.</p>}
    <nav aria-label="Context views" className={styles.tabs}>
      {METRIC_VIEWS.map(view => <Link key={view.href} href={view.href} aria-current={pathname === view.href ? "page" : undefined}>{view.label}</Link>)}
    </nav>
  </div>;
}
