"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/chrome-icons";
import styles from "./market-switcher.module.css";

/** Navigation only. Each market keeps its own route and data reader. */
export default function MarketSwitcher() {
  const path = usePathname();
  if (path !== "/" && path !== "/stocks") return null;
  return <nav className={styles.switcher} aria-label="Market">
    <Link href="/" aria-current={path === "/" ? "page" : undefined}>
      <Icon name="grid" size={20} />Crypto
    </Link>
    <Link href="/stocks" aria-current={path === "/stocks" ? "page" : undefined}>
      <Icon name="chart" size={20} />Stocks
    </Link>
  </nav>;
}
