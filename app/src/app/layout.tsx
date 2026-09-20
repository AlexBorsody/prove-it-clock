import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Prove-It Clock — Crypto Accountability, Evidence-Driven",
  description:
    "Measuring the distance between crypto's promises and reality. Versioned, evidence-traceable project scores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
            <p className="num">Methodology v0.3.0 · Scores are provisional while data coverage is incomplete.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
