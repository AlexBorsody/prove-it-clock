export const dynamic = "force-dynamic";

export const metadata = { title: "How the scoring works | Prove-It" };

export default function MethodologyPage() {
  return (
    <>
      <h1 className="page-title">How the scoring works</h1>
      <p className="page-sub">
        Crypto projects make promises. We check whether they kept them.
        Every score is a heart meter plus its history. The graph shows hearts
        being earned <i>and</i> lost over time.
      </p>

      <div className="panel">
        <h2>1. List the promises</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          First we write down what the project actually promised, from its
          whitepaper or launch materials. Some projects have no issuer at
          all: for founderless protocols we score the claims the community
          converged on instead, and only when the story is dominant,
          measurable, and broadly shared. Before scoring anything, we also
          write down what "done" looks like for each promise, so the
          goalposts can't move later.
        </p>
      </div>

      <div className="panel section-alt">
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
          something and then quit (a partnership ends, a product shuts down),
          those hearts go away, and you see it on the graph. That's the rise and
          fall. We never rewrite the past; old scores stay exactly as published.
        </p>
      </div>

      <div className="panel section-alt">
        <h2>4. Some hearts are free</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          A project that actually exists gets a small head start: a working
          product, a team that's still shipping, real usage tied to the promise:
          up to 3 hearts. These are clearly labeled as unearned, so you can tell
          them apart from hearts that were earned with proof.
        </p>
      </div>

      <div className="panel">
        <h2>5. The meter size fits the promise</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Bigger promises get bigger meters: 5 for a niche product, 10 for a
          project aiming to own a sector, 20 for one trying to rewire global
          infrastructure. The meter is headroom, not a target. Most projects
          will never fill it.
        </p>
      </div>

      <div className="panel section-alt">
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
          Every project has one main promise: the reason it exists. Until that
          promise is actually fulfilled, the last heart on the meter stays empty.
          No project gets a perfect score on hype alone.
        </p>
      </div>

      <div className="panel section-alt">
        <h2>8. Who scored it</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Every score names the person who did the research, with their evidence
          linked. If a second researcher independently checks the work, the score
          gets marked verified. We don't do valuations. The meter sits next to
          the market cap, and the market can decide what it's worth.
        </p>
      </div>

      <div className="panel" id="shitcoin-score">
        <h2>9. The shitcoin score</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          One number, shown as a badge on every project: abandoned promises
          plus missing hearts. Add up the promises the project fulfilled then
          dropped, the promises whose proof dried up, the hearts it never
          earned, and the hearts it lost from its all-time high. Higher is
          worse. A project that promised big, proved little, and walked away
          from what it proved scores high. A project that kept its promises
          scores low.
        </p>
      </div>

      <div className="panel">
        <h2>An example</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          XRP is 5 out of 20. It earned 2 hearts for real cross-border payment
          usage, plus 3 free hearts for being a live project with real
          activity. In 2019 it gained a heart when the MoneyGram partnership
          launched, and lost it in 2021 when the partnership ended. That's the
          graph doing its job.
        </p>
      </div>

      <details className="panel fold">
        <summary className="fold-head">
          Under the hood: the precise rules, for the curious
        </summary>
        <div className="fold-body">
          <p>
            <b>Capacity.</b> Fixed tiers of 5, 10, or 20. 20 is for projects trying
            to rewire global infrastructure, 10 for owning a sector, 5 for a niche
            or single-application promise. Capacity is headroom, never a target.
          </p>
          <p>
            <b>Free hearts.</b> Count how many of these are true: working product,
            team actively shipping, real economic activity tied to the promise.
            The count is capped at 3, and at capacity ÷ 5 rounded down. So a
            5-heart project can get at most 1 free heart, a 20-heart project up
            to 3.
          </p>
          <p>
            <b>Earned hearts.</b> Each promise is worth 0, 1, or 2 hearts, decided
            <i> before </i>
            anyone checks the evidence. One-time achievements ("milestones") keep
            their hearts permanently unless the achievement is explicitly retired.
            Ongoing promises ("we process payments") only count while they're
            currently true. They lapse when the evidence stops and come back if
            it resumes.
          </p>
          <p>
            <b>What counts as proof.</b> The promise's own success criterion,
            checkable by someone other than the project: a working public product,
            a verifiable payout, a named customer on the record. The project's own
            announcement alone never counts. Borderline cases stay unfulfilled.
          </p>
          <p>
            <b>The main promise.</b> One promise per project is the main one. It
            earns no hearts itself. Instead, while it's unfulfilled, the meter
            can't go above capacity − 1.
          </p>
          <p>
            <b>History.</b> Scores are published as dated snapshots. Old snapshots
            are never edited or deleted. The past stays exactly as it was scored.
            Each score names its researcher; if a second researcher independently
            reproduces it, the score is marked verified.
          </p>
          <p style={{ marginBottom: 0 }}>
            <b>No valuations.</b> The meter sits next to the market cap. The market
            provides the valuation; we just check the promises.
          </p>
        </div>
      </details>
    </>
  );
}
