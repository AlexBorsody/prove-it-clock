import "../globals.css";
import BottomNav from "@/components/bottom-nav";
import Walkthrough from "@/components/walkthrough";
import WalkthroughLink from "@/components/walkthrough-link";

/**
 * Site chrome: topbar, shell, bottom tab bar. Applies to the public site
 * routes only (route group `(site)`); the embeddable widget renders
 * chromeless.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-side" />
        <div className="brand">
          <div className="brand-mark">♥</div>
          <div className="brand-name">Prove-It</div>
        </div>
        <div className="topbar-side topbar-right">
          <WalkthroughLink />
        </div>
      </header>
      <main className="with-bottomnav">{children}</main>
      <BottomNav />
      <Walkthrough />
    </div>
  );
}
