export const dynamic = "force-dynamic";

export const metadata = { title: "Methodology — Prove-It" };

export default function MethodologyPage() {
  return (
    <>
      <div className="meta-line">METHODOLOGY <b>HEARTS CLAIM-TYPE RULE v2</b> · ADOPTED <b>2026-09-25</b></div>
      <h1 className="page-title">The rule</h1>
      <p className="page-sub">
        One instrument per project: a heart meter and its history. A heart remains
        earned only while the evidence condition under which it was awarded remains
        true. Scores change because evidence changes, not because time passes.
      </p>

      <div className="panel">
        <h2>Capacity</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Locked tiers <span className="num">{`{5, 10, 20}`}</span> — 20 rewires global
          infrastructure, 10 owns a sector, 5 is a niche or single-application promise.
          Capacity is headroom, not a target; the meter is never expected to fill.
        </p>
      </div>

      <div className="panel">
        <h2>Earned hearts</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Each promise lineage can earn <span className="num">{`{0, 1, 2}`}</span> hearts,
          fixed <i>before</i> fulfillment with its success criterion written down first.
          Milestones stay earned once achieved unless explicitly retired.
          Ongoing claims count only while currently true — they lapse when evidence
          stops and reactivate if it resumes. Fulfilled-then-abandoned lineages retire
          their hearts as a visible event. History is never rewritten.
        </p>
      </div>

      <div className="panel">
        <h2>Unearned allowance</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          A small present-tense allowance for projects that exist and ship: working
          product, active team shipping, real economic activity tied to the promise.
          Count the checks, capped at <span className="num">min(3, floor(capacity / 5))</span>.
          Labeled unearned in the UI.
        </p>
      </div>

      <div className="panel">
        <h2>What clears "fulfilled"</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          The promise's own success criterion, observable by a third party: a working
          product anyone can use, a verifiable payout, a named customer on the record.
          The issuer's own announcement alone never clears it. Borderline cases stay
          unfulfilled.
        </p>
      </div>

      <div className="panel">
        <h2>The core promise</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          One lineage is the core promise. It earns nothing itself — it gates the final
          heart: while the core is open, the meter clips at capacity − 1.
        </p>
      </div>

      <div className="panel">
        <h2>Publication</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Runs are append-only and published whole. Scores carry their analyst's name;
          blinded replication upgrades a score to verified. Valuation is not computed —
          the meter sits beside market cap and the market provides the valuation.
        </p>
      </div>
    </>
  );
}
