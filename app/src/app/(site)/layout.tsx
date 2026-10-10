import { feedbackEnabled } from '@/lib/feedback/data';
import supportStyles from '@/components/support-feedback.module.css';
import LedgerNav from "@/components/ledger-nav";
import "../globals.css";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import Walkthrough from "@/components/walkthrough";
import WelcomeModal from "@/components/welcome-modal";
import ProjectSearch from "@/components/project-search";
import { BrandMark } from "@/components/heart-meter";
import SearchAnchor from "@/components/search-anchor";
import { siteSearchPaths } from "@/lib/search-sections";
import { CASE_STUDY_DOCUMENTS } from "@/lib/case-studies";
import { HEARTS_METHODOLOGY, readHeartRankings } from "@/lib/heart-data";

/**
 * Site chrome: slim search header, shell, bottom tab bar. Applies to the
 * public site routes only (route group `(site)`); the embeddable widget
 * renders chromeless.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const rankings = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100).catch(() => ({
    projects: [] as any[],
  }));
  const paths = siteSearchPaths((rankings.projects ?? []).map((p: {slug:string}) => p.slug), Object.keys(CASE_STUDY_DOCUMENTS));

  return (
    <div className="shell">
      <header className="appbar">
        <div className="appbar-inner">
          <Link href="/" className="appbar-home" aria-label="Bubble or Build home">
            <BrandMark size={40} />
            <span>Bubble or Build</span>
          </Link>
          <span className="appbar-left" aria-hidden="true" />
          <ProjectSearch paths={paths} />
        </div>
      </header>
      <main className="with-bottomnav"><LedgerNav />{children}
        {feedbackEnabled() && <footer className={supportStyles.footer}><Link href="/support">Share an idea</Link></footer>}
      </main>
      <BottomNav />
      <Walkthrough />
      <WelcomeModal />
      <SearchAnchor />
    </div>
  );
}
