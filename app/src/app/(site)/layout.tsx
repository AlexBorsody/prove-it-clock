import "../globals.css";

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
        <nav className="nav">
          <a href="/">Projects</a>
          <a href="/methodology">Methodology</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
