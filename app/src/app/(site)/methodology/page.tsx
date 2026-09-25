export const dynamic = "force-dynamic";

export const metadata = { title: "How the scoring works — Prove-It" };

export default function MethodologyPage() {
  return (
    <>
      <div className="meta-line">HOW THE SCORING WORKS · LAST UPDATED <b>2026-09-25</b></div>
      <h1 className="page-title">How the scoring works</h1>
      <p className="page-sub">
        Crypto projects make promises. We check whether they kept them.
        Every score is a heart meter plus its history — the graph shows hearts
        being earned <i>and</i> lost over time.
      </p>

      <div className="panel">
        <h2>1. List the promises</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          First we write down what the project actually promised — from its
          whitepaper or launch materials. Before scoring anything, we also write
          down what "done" looks like for each promise, so the goalposts can't
          move later.
        </p>
      </div>

      <div className="panel">
        <h2>2. Hearts are given for proof</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          A heart means: the project said it would do X, and here is the evidence
          it happened. Every heart links to its evidence on the project's page.
          Each promise can earn up to 2 hearts, depending on how central it is to
          the project.
        </p>
      </div>

      <div className="panel">
        <h2>3. Hearts can be taken away</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          A heart stays only while the proof stays true. If a project delivered
          something and then quit — a partnership ends, a product shuts down —
          those hearts go away, and you see it on the graph. That's the rise and
          fall. We never rewrite the past; old scores stay exactly as published.
        </p>
      </div>

      <div className="panel">
        <h2>4. Some hearts are free</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          A project that actually exists gets a small head start: a working
          product, a team that's still shipping, real usage tied to the promise —
          up to 3 hearts. These are clearly labeled as unearned, so you can tell
          them apart from hearts that were earned with proof.
        </p>
      </div>

      <div className="panel">
        <h2>5. The meter size fits the promise</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Bigger promises get bigger meters: 5 for a niche product, 10 for a
          project aiming to own a sector, 20 for one trying to rewire global
          infrastructure. The meter is headroom, not a target — most projects
          will never fill it.
        </p>
      </div>

      <div className="panel">
        <h2>6. "Done" needs outside proof</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          The project's own announcement never counts as proof. What counts: a
          working product anyone can use, a payout that can be verified, a named
          customer on the record. If it's borderline, it doesn't count.
        </p>
      </div>

      <div className="panel">
        <h2>7. The last heart is special</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Every project has one main promise — the reason it exists. Until that
          promise is actually fulfilled, the last heart on the meter stays empty.
          No project gets a perfect score on hype alone.
        </p>
      </div>

      <div className="panel">
        <h2>8. Who scored it</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Every score names the person who did the research, with their evidence
          linked. If a second researcher independently checks the work, the score
          gets marked verified. We don't do valuations — the meter sits next to
          the market cap, and the market can decide what it's worth.
        </p>
      </div>

      <div className="panel">
        <h2>An example</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          XRP is 5 out of 20. It earned 2 hearts for real cross-border payment
          usage, plus 3 unearned hearts for being a live project with real
          activity. In 2019 it gained a heart when the MoneyGram partnership
          launched — and lost it in 2021 when the partnership ended. That's the
          graph doing its job.
        </p>
      </div>
    </>
  );
}
