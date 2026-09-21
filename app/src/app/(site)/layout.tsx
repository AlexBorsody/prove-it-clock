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
          <div className="brand-mark">◷</div>
          <div className="brand-name">
            THE PROVE-IT CLOCK
            <small>EVIDENCE-DRIVEN CRYPTO ACCOUNTABILITY</small>
          </div>
        </div>
        <nav className="nav">
          <a href="/">Leaderboard</a>
          <a href="/methodology">Methodology</a>
        </nav>
      </header>
      {children}
      <footer className="site">
        <p>
          The Prove-It Clock is an independent accountability layer. It does not predict
          prices and does not tell anyone what to buy or sell. Every score is traceable
          to its inputs; every methodology change is versioned.
        </p>
        <p className="num">Methodology v0.2.0 · Scores are provisional while data coverage is incomplete.</p>
      </footer>
    </div>
  );
}
