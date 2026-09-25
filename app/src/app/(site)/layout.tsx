import "../globals.css";
import BottomNav from "@/components/bottom-nav";
import Walkthrough from "@/components/walkthrough";
import ProjectSearch from "@/components/project-search";
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
  const projects = (rankings.projects ?? []).map((p: any) => ({
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
  }));

  return (
    <div className="shell">
      <header className="appbar">
        <div className="appbar-inner">
          <span className="appbar-left" aria-hidden="true" />
          <ProjectSearch projects={projects} />
        </div>
      </header>
      <main className="with-bottomnav">{children}</main>
      <BottomNav />
      <Walkthrough />
    </div>
  );
}
