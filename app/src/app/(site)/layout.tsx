import "../globals.css";
import BottomNav from "@/components/bottom-nav";
import Walkthrough from "@/components/walkthrough";

/**
 * Site chrome: topbar, shell, bottom tab bar. Applies to the public site
 * routes only (route group `(site)`); the embeddable widget renders
 * chromeless.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <main className="with-bottomnav">{children}</main>
      <BottomNav />
      <Walkthrough />
    </div>
  );
}
