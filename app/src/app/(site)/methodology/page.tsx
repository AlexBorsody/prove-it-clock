import Link from "next/link";
import Icon from "@/components/chrome-icons";
import { HEARTS_METHODOLOGY } from "@/lib/heart-data";
import { searchMeta } from "@/lib/search-sections";
import styles from "./methodology.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "How Prove Value works",
  description: "What was promised, what happened, and the evidence behind each verdict.",
};

function Section({ icon, title, id, open, children }: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  id: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      {...searchMeta({ id: `methodology-${id}`, title, kind: "Methodology" })}
      className="panel fold search-section"
      open={open}
    >
      <summary className="fold-head">
        <span id={id} aria-hidden="true" />
        <Icon name={icon} size={18} />
        <span>{title}</span>
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}

export default function MethodologyPage() {
  return (
    <div className={`methodology-page ${styles.page}`}>
      <section {...searchMeta({ id: "methodology-overview", title: "How Prove Value works", kind: "Methodology", keywords: "scoring hearts evidence promises" })} className="search-section">
        <h1 className="page-title">Did they deliver?</h1>
        <p className="page-sub">
          Prove Value checks what crypto projects promised against what they
          delivered. Every assessment starts with a claim, a test and evidence.
        </p>
        <ol className={`panel ${styles.steps}`}>
          <li><strong>Find the promise.</strong> A sourced claim from a whitepaper, roadmap or public statement.</li>
          <li><strong>Define delivery.</strong> A checkable test. Adoption claims need evidence of use.</li>
          <li><strong>Record the outcome.</strong> Compare evidence with the test and link the sources.</li>
        </ol>
      </section>

      <Section icon="heart" title="What the hearts mean" id="hearts" open>
        <p>
          <strong>One kept promise earns one heart.</strong> The total is the
          number of distinct scored promises. Repeated statements count once. Core
          promises are marked, but currently earn the same one heart.
        </p>
        <p>
          For example, <strong>2 of 16 kept</strong> means 14 have not earned
          credit. If those 14 are still open, they are pending, not 14 failures.
          Counts cover the promises we track, not every claim ever made.
        </p>
        <ul>
          <li><strong>Kept / fulfilled:</strong> assessed as meeting its test.</li>
          <li><strong>Open:</strong> unresolved.</li>
          <li><strong>Lapsed:</strong> an ongoing condition no longer met.</li>
          <li><strong>Retired:</strong> recorded as withdrawn or discontinued.</li>
          <li><strong>Unknown:</strong> unavailable or unsupported data.</li>
        </ul>
        <p>Open and unknown are not proof of failure. Select a count or promise to inspect its record.</p>
      </Section>

      <Section icon="grid" title="Comparing projects" id="rankings">
        <p>All projects opens as an unranked browser. Choose a category to see delivery rankings.</p>
        <p>
          Choose a subject to compare projects making similar kinds of promises.
          Category rankings currently use <strong>kept promises ÷ all tracked
          promises</strong> in that primary category. Equal shares tie; projects
          with no promises in the category are unranked.
        </p>
        <p>The share measures recorded delivery, not difficulty, impact or token value.</p>
      </Section>

      <Section icon="alert" title="What the warning means today" id="verdict">
        <p>
          The current warning dial uses fixed positions: <strong>1</strong> when
          no lapsed or retired promise is recorded, <strong>7</strong> when a
          supporting promise is lapsed or retired, and <strong>10</strong> when
          a core promise is. It is not a percentage or a probability.
        </p>
        <p>
          No recorded failure does not mean every promise was kept. Open
          promises still matter. A replacement using delivery and coverage
          is under review, explained below.
        </p>
      </Section>

      <Section icon="book" title="When an assessment changes" id="rules">
        <p>
          A milestone records an achievement. An ongoing promise requires
          evidence that its condition still holds. There is no automatic time
          penalty: a change needs an assessment and supporting evidence.
        </p>
        <p>
          Published assessments are dated and versioned. Corrections and rule
          changes belong in new records; they are not new delivery events.
          Older records remain available for comparison.
        </p>
      </Section>

      <Section icon="chart" title="What the other metrics tell you" id="pillars">
        <ul>
          <li><strong>CODE / TEAM:</strong> observed development activity and contributor participation.</li>
          <li><strong>USAGE:</strong> use for the promised purpose, where measured.</li>
          <li><strong>HYPE:</strong> observed attention.</li>
          <li><strong>Market data:</strong> what people currently pay.</li>
        </ul>
        <p>
          These do not independently add delivery credit. Code or usage may
          support a promise&apos;s test; popularity and price do not prove it was kept.
        </p>
      </Section>

      <Section icon="book" title="What if a project finds a different use?" id="evolution">
        <p>
          A project can miss an original promise and still find useful
          applications. Those are separate questions. Bitcoin&apos;s
          <strong> Genesis asset</strong> treatment keeps its promise
          inventory visible while excluding it from altcoin verdicts and
          rankings. Its founding role and later uses need their own evidence;
          they do not settle every original promise&apos;s outcome.
        </p>
      </Section>

      <Section icon="grid" title="Reading the Atlas" id="atlas">
        <p>
          Each point is one scored promise, grouped by subject. Green means
          kept; red means lapsed or retired; grey means unresolved or unknown.
          Select it for the exact status and evidence.
        </p>
        <p>
          Categories are curated. Distance and point size do not measure
          importance, similarity or value. <Link href="/atlas">Explore the Atlas ↗</Link>
        </p>
      </Section>

      <Section icon="book" title="Sources and limits" id="data">
        <p>
          Collection and drafting can be automated. An announcement establishes
          a claim, not its fulfillment. Missing source details and ambiguous
          evidence need review; a working link alone does not validate a verdict.
        </p>
        <p>
          Some current records lack a clearly identified original claim source
          or evidence date. These gaps are flagged in the Atlas. Published does
          not mean independently verified, and counts do not prove research is exhaustive.
        </p>
        <p>Missing data stays unavailable. A failed data request is not a zero score.</p>
        <p className={styles.version}><strong>Current rules:</strong> {HEARTS_METHODOLOGY}</p>
      </Section>

      <Section icon="wrench" title="Overall ranking: under review" id="publication">
        <p>
          We are reviewing how category economic impact and demonstrated usage
          should contribute to an overall ranking. Neither is scored today.
        </p>
        <p>
          The working delivery model gives promises documented importance weights:
          supporting <strong>1</strong>, material <strong>2</strong>, core <strong>4</strong>.
          Each assignment needs an author and a reason.
        </p>
        <ul>
          <li><strong>Proven delivery:</strong> kept weight ÷ all tracked weight.</li>
          <li><strong>Outcome coverage:</strong> resolved weight ÷ all tracked weight. Resolved means assessed as kept or unkept.</li>
        </ul>
        <p>
          Open and unknown promises stay in the total without being called
          failures. Core problems remain visible. Archiving a delivered milestone
          does not undo its achievement; withdrawing an unmet obligation earns no credit.
        </p>
        <p>
          These are product rules, not a scientifically established measure of
          value. Weighted results require a compatible reviewed publication.
          Missing weights are not guessed. Current scores remain under the rules above.
        </p>
      </Section>
    </div>
  );
}
