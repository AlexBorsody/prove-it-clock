'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './metrics-nav.module.css';
export default function LedgerNav() {
  const path=usePathname();
  if(path!=='/'&&path!=='/atlas') return null;
  return <nav className={`${styles.shell} ${styles.tabs}`} aria-label="Promise ledger views">
    <Link href="/" aria-current={path==='/'?'page':undefined}>Scores</Link>
    <Link href="/atlas" aria-current={path==='/atlas'?'page':undefined}>Atlas</Link>
  </nav>;
}
