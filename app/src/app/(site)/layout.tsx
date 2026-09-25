import "../globals.css";
import SiteNav from "@/components/site-nav";
import Walkthrough from "@/components/walkthrough";
import WalkthroughLink from "@/components/walkthrough-link";

/**
 * Site chrome: topbar, shell, footer. Applies to the public site routes only
 * (route group `(site)`); the embeddable widget renders chromeless.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-side">
          <SiteNav />
        </div>
        <div className="brand">
          <div className="brand-mark">♥</div>
          <div className="brand-name">Prove-It</div>
        </div>
        <div className="topbar-side topbar-right">
          <WalkthroughLink />
        </div>
      </header>
      {children}
      <Walkthrough />
    </div>
  );
}
