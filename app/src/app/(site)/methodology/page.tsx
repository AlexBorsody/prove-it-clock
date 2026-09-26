export const dynamic = "force-dynamic";

export const metadata = { title: "How the scoring works | Prove-It" };

import Icon from "@/components/chrome-icons";
import { HEARTS_METHODOLOGY } from "@/lib/heart-data";

type IconName = Parameters<typeof Icon>[0]["name"];

function Section({
  icon,
  title,
  tag,
  open,
  alt,
  id,
  children,
}: {
  icon: IconName;
  title: React.ReactNode;
  tag?: string;
  open?: boolean;
  alt?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <details id={id} className={"panel fold" + (alt ? " section-alt" : "")} open={open}>
      <summary className="fold-head">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Icon name={icon} size={16} />
          {title}
          {tag ? (
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--accent)",
                border: "1px solid var(--border-strong)",
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              {tag}
            </span>
          ) : null}
        </span>
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}

export default function MethodologyPage() {
  return (
    <div className="methodology-page">
      <h1 className="page-title">How the scoring works</h1>
      <p className="page-sub">
        Crypto projects make promises. We check whether they kept them.
        Every score is a heart meter plus its history. The graph shows hearts
        being earned <i>and</i> lost over time.
      </p>

      <Section icon="heart" title="Hearts are earned, never given" id="hearts" open>
        <p>
          Every heart on the meter was <b style={{ color: "var(--green)" }}>earned</b> by
          keeping a promise. There are no free hearts, no head start, no points
          for existing. A project starts at zero and every heart has a named
          promise and linked evidence behind it.
        </p>
        <p>
          A heart stays earned only while its evidence condition holds.
          One-time achievements ("shipped mainnet") keep their hearts
          permanently. Ongoing claims ("advertisers are buying ads") count
          only while they are currently true: when the evidence stops, the
          heart lapses, and you see the fall on the graph. If evidence
          resumes, the heart comes back. There is no time decay. Scores
          change because evidence changes, not because time passes.
        </p>
        <p className="update-marker">
          <b>Methodology update:</b> free hearts removed. Historical scores
          recalculated. This is not a change in project performance.
        </p>
      </Section>

      <Section icon="alert" title="The Shitcoin warning meter" id="verdict" alt>
        <p>
          The meter reads 1 to 10 and shows the number only, never a label.
          It is a delivery-accountability rating, not a fraud or
          investment-risk rating. Tapping it opens the project page at the
          verdict section, which lists exactly what feeds the meter: each
          failed promise, its state, and whether it was core. The software
          picks the position from the promise states; humans resolve ambiguous
          evidence.
        </p>
        <ul>
          <li>
            <b>Not a shitcoin:</b> no retired or lapsed promise on record.
          </li>
          <li>
            <b>Watch:</b> reserved for verified overdue promises once deadline
            evidence is researched. Nothing triggers it yet.
          </li>
          <li>
            <b>Shitcoin risk:</b> a supporting promise was retired or lapsed.
          </li>
          <li>
            <b>Shitcoin:</b> the core promise was retired or lapsed.
          </li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          CODE and HYPE never move the verdict directly. USE can support a
          promise state only when it measures a predefined, promise-specific
          condition.
        </p>
      </Section>

      <Section icon="grid" title="PROMISES / CODE / USE / HYPE" id="pillars">
        <p>Four pillars. One of them is the score; the other three explain it.</p>
        <ul>
          <li>
            <b>PROMISES</b> is the score. Hearts, earned only, one per kept
            promise lineage while its evidence condition holds.
          </li>
          <li>
            <b>CODE</b> asks: are they building? Observable GitHub activity on
            curated repos. Activity is not proof of progress.
          </li>
          <li>
            <b>USE</b> asks: is anyone using it for its stated purpose? It must
            measure intended use, never generic chain activity.
          </li>
          <li>
            <b>HYPE</b> asks: is anyone talking about it? Observed mention
            counts. Attention is not support and never evidence of delivery.
          </li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          CODE and USE are evidence. HYPE is context.
        </p>
      </Section>

      <Section icon="chart" title="The Prove-It Index" tag="gated" alt>
        <p>
          Hearts are the simple public mechanic: did they keep their promises?
          The Prove-It Index is the deeper health and credibility algorithm
          underneath. One number, 0-100, plotted through time. We are building
          it now. It is not live yet.
        </p>
        <ul>
          <li><b>Promises: 60%</b></li>
          <li><b>USE: 25%</b></li>
          <li><b>CODE: 15%</b></li>
          <li><b>HYPE: 0%.</b> Context only. It never improves the score.</li>
        </ul>
        <p>
          Every meaningful move gets a clickable event marker explaining
          exactly why the score moved: promise fulfilled, lapsed, or retired, deadline
          missed, major release, usage milestone, development resumed or
          stalled, major hype spike (context only).
        </p>
        <p style={{ marginBottom: 0 }}>
          The Index does not publish until USE metrics exist, because 25% of
          the score cannot be fiction. The formula is locked; the build waits
          on the data.
        </p>
      </Section>

      <Section icon="flask" title="Prove-It Data">
        <p>
          Prove-It runs its own independently operated data collection. We do
          not rent our inputs from aggregators and relabel them. For each
          metric family we publish:
        </p>
        <ul>
          <li>source, definition, and coverage,</li>
          <li>how it is calculated, and</li>
          <li>a timestamp and methodology version.</li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          Raw data may stay private, but anything that moves a heart or a
          verdict ships with enough evidence, aggregates, and source scope
          for you to challenge it.
        </p>
      </Section>

      <Section icon="shield-check" title="Nothing unfinished ships" alt>
        <p>
          A section, metric, or verdict that lacks real data or a reviewed
          definition never renders publicly. No "coming soon" panels, no
          provisional scores.
        </p>
        <p style={{ marginBottom: 0 }}>
          Missing data means unknown, never zero. A failed collection never
          renders as zero.
        </p>
      </Section>

      <Section icon="person" title="Who scored it">
        <p>
          Every score names the analyst who did the research, with evidence
          linked. If a second researcher independently reproduces the work,
          the score is marked verified.
        </p>
        <p style={{ marginBottom: 0 }}>
          We do no valuations. The meter sits next to the market cap, and the
          market decides what it is worth.
        </p>
      </Section>

      <Section icon="book" title={<>Worked example: <img className="coin-icon" src="/icons/xrp.svg" alt="" aria-hidden="true" style={{ verticalAlign: "-3px" }} /> XRP at 2 of 4 promises kept</>} alt>
        <p>
          <img className="coin-icon" src="/icons/xrp.svg" alt="" aria-hidden="true" style={{ verticalAlign: "-3px" }} /> XRP is <b>2 of 4</b>, earned only. One heart for the ledger
          milestone (permanent), one for XRP payments as an ongoing claim
          (currently kept). The MoneyGram corridor earned a heart in 2019
          and retired it in 2021 when the partnership ended: the rise and the
          fall, visible on the graph. Bank settlement never delivered, so the
          core promise stays open. Verdict:
          Shitcoin risk.
        </p>
      </Section>

      <Section icon="wrench" title="Under the hood: the precise rules">
        <p>
          <b>Capacity.</b> The promise count. Every project gets one meter
          slot per promise it made: 16 promises means 16 hearts to earn.
          Capacity is headroom, never a target.
        </p>
        <p>
          <b>One promise, one heart.</b> Each fulfilled promise earns exactly
          one heart. No weighting, no tiers, no free hearts. Every promise
          counts the same.
        </p>
        <p>
          <b>Milestone vs ongoing.</b> Milestones ("shipped X") keep their
          hearts permanently unless the achievement is explicitly retired.
          Ongoing claims ("X is true") count only while currently true. They
          lapse when the evidence stops and come back if it resumes.
        </p>
        <p>
          <b>The core promise.</b> One promise per project is flagged as the
          main one. It is a label, not a gate: it earns its heart like every
          other promise.
        </p>
        <p>
          <b>What counts as proof.</b> The promise's own success criterion,
          checkable by someone other than the project: a working public
          product, a verifiable payout, a named customer on the record. The
          project's own announcement alone never counts. Borderline cases stay
          open.
        </p>
        <p>
          <b>The adoption test.</b> Shipping the tech is not enough. A promise
          counts as fulfilled only if the thing was delivered <i>and</i> real
          people actually use it. A proof of concept nobody touches, a
          mainnet nobody transacts on, a feature with no users: unfulfilled.
          Teams routinely declare victory at the demo stage. We score the
          usage, not the press release.
        </p>
        <p>
          <b>History.</b> Scores are published as dated snapshots. Old
          snapshots are never edited or deleted. When the methodology itself
          changes, history is restated openly and the originals stay as an
          immutable audit archive.
        </p>
        <p style={{ marginBottom: 0 }}>
          <b>Methodology string.</b>{" "}
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.85em" }}>
            {HEARTS_METHODOLOGY}
          </span>
        </p>
      </Section>
    </div>
  );
}
