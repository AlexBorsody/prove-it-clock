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
      <footer className="site">
        <p>
          Prove-It is an independent accountability layer. It does not predict
          prices and does not tell anyone what to buy or sell. Every heart is traceable
          to its evidence; every run is published whole and append-only.
        </p>
        <p className="num">Hearts claim-type rule v2 · Scores are single-analyst unless marked verified.</p>
      </footer>
    </div>
  );
}
