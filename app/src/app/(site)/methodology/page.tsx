export const dynamic = "force-dynamic";

export const metadata = { title: "How the scoring works | Prove Value" };

import Icon from "@/components/chrome-icons";
import { HEARTS_METHODOLOGY } from "@/lib/heart-data";
import { searchMeta } from "@/lib/search-sections";

type IconName = Parameters<typeof Icon>[0]["name"];

function Section({
  icon,
  title,
  tag,
  open,
  alt,
  id,
  searchTitle,
  children,
}: {
  icon: IconName;
  title: React.ReactNode;
  tag?: string;
  open?: boolean;
  alt?: boolean;
  id: string;
  searchTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <details {...searchMeta({ id: `methodology-${id}`, title: searchTitle ?? (typeof title === "string" ? title : "Scoring methodology"), kind: "Methodology" })} className={"panel fold search-section" + (alt ? " section-alt" : "")} open={open}>
      <summary className="fold-head">
        <span id={id} aria-hidden="true" />
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
      <div className="search-section" {...searchMeta({ id: "methodology-overview", title: "How the scoring works", kind: "Methodology", keywords: "scoring hearts evidence promises" })}>
      <h1 className="page-title">How the scoring works</h1>
      <p className="page-sub">
        Crypto projects make promises. We check whether they kept them.
        Projects are ranked within promise categories, not on a single
        leaderboard. Hearts are the receipts. The index is the trend.
      </p>
      </div>

      <Section icon="heart" title="Hearts are the receipts" id="hearts" open>
        <p>
          One promise, one heart. A heart is a receipt that says a specific
          promise was kept, with the evidence linked. Hearts are the
          drill-down detail, not the headline: they tell you <i>what</i>
          happened, promise by promise.
        </p>
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

      <Section icon="grid" title="Rankings live in categories" id="rankings" alt>
        <p>
          There is no single leaderboard. A payment coin and a smart contract
          platform made different promises, so ranking them against each other
          never made sense. Projects are ranked within promise categories:
          money, payments, platform, scale, and the rest. Each project gets a
          category-relative index, plotted over time.
        </p>
        <p style={{ marginBottom: 0 }}>
          An overall aggregate exists for context, but it is never the
          headline. Compare like with like, or do not compare at all.
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
          CODE and HYPE never move the verdict directly. USAGE can support a
          promise state only when it measures a predefined, promise-specific
          condition.
        </p>
      </Section>

      <Section icon="grid" title="PROMISES / CODE / USAGE / HYPE" id="pillars">
        <p>Four pillars feed the index. PROMISES is the receipts; the other three explain the trend.</p>
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
            <b>USAGE</b> asks: is anyone using it for its stated purpose? It must
            measure intended use, never generic chain activity.
          </li>
          <li>
            <b>HYPE</b> asks: is anyone talking about it? Observed mention
            counts. Attention is not support and never evidence of delivery.
          </li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          CODE and USAGE are evidence. HYPE is context.
        </p>
      </Section>

      <Section icon="chart" title="The Prove Value Index" id="index" tag="in development" alt>
        <p>
          Hearts tell you what happened, promise by promise. The Prove Value
          Index is the trend underneath: one category-relative number per
          project, plotted through time. It combines two things: the
          intrinsic value of what the project built (code, usage) and how
          well it fulfilled its promises (evidence, weighted by how central
          each promise is to what the project is for).
        </p>
        <p>
          Every meaningful move gets a clickable event marker explaining
          exactly why the score moved: promise fulfilled, lapsed, or retired,
          deadline missed, major release, usage milestone, development resumed
          or stalled.
        </p>
        <p style={{ marginBottom: 0 }}>
          The Index is in development. The formula, weights, and category
          definitions are being finalized now, and every parameter will be
          published and versioned before the first score goes live. Nothing
          about the Index is estimated or provisional when it ships.
        </p>
      </Section>

      <Section icon="flask" title="The promise atlas" id="atlas" tag="in development">
        <p>
          Every promise, mapped. The atlas places each promise by how similar
          it is to every other promise, so clusters form naturally: the
          money promises gather together, the platform promises gather
          together. Node size reflects impact. Green kept, red lapsed, grey
          open.
        </p>
        <p style={{ marginBottom: 0 }}>
          Positions come from the promises themselves. We draw no invented
          connections between promises that are not really connected.
        </p>
      </Section>

      <Section icon="flask" title="Prove Value Data" id="data">
        <p>
          Prove Value runs its own independently operated data collection. We do
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

      <Section icon="shield-check" title="Nothing unfinished ships" id="publication" alt>
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

      <Section icon="person" title="Who scored it" id="analysts">
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

      <Section icon="book" id="xrp-example" searchTitle="Worked example: XRP at 2 of 4 promises kept" title={<>Worked example: <img className="coin-icon" src="/icons/xrp.svg" alt="" aria-hidden="true" style={{ verticalAlign: "-3px" }} /> XRP at 2 of 4 promises kept</>} alt>
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

      <Section icon="wrench" title="Under the hood: the precise rules" id="rules">
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
