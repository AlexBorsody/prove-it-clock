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
        <div className="brand">
          <div className="brand-mark">♥</div>
          <div className="brand-name">
            PROVE-IT
            <small>EVIDENCE-DRIVEN CRYPTO ACCOUNTABILITY</small>
          </div>
        </div>
        <SiteNav />
      </header>
      {children}
      <footer className="site">
        <p>
          <WalkthroughLink />
        </p>
      </footer>
      <Walkthrough />
    </div>
  );
}
