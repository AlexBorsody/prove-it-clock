import ButtonLink from "@/components/button-link";
import { normalizePromiseState } from "@/lib/hearts";

export interface PromiseBrief {
  criteria: string;
  state: string;
  core: boolean;
  /** Where the promise was stated: whitepaper, tweet, interview, article. */
  sourceUrl?: string | null;
}

function stateLabel(pr: PromiseBrief): { label: string; tone: "good" | "dim" | "bad" } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { label: "Unknown", tone: "dim" };
  }
  if (s === "fulfilled") return { label: "Fulfilled", tone: "good" };
  if (s === "active") return { label: "Active", tone: "dim" };
  if (s === "open") return { label: "Open", tone: "dim" };
  if (s === "lapsed") return { label: "Lapsed", tone: "bad" };
  return { label: "Retired", tone: "bad" };
}

/**
 * Compact promise list for expandable scoreboard rows. Criteria plus state
 * tags; each promise links to where it was stated. The full evidence lives
 * on the project page.
 */
export default function PromiseRows({ slug, promises }: { slug: string; promises: PromiseBrief[] }) {
  if (promises.length === 0) {
    return <p className="promise-rows-empty">No promises tracked yet.</p>;
  }
  return (
    <div className="promise-rows">
      {promises.map((pr, i) => {
        const d = stateLabel(pr);
        const criteria = pr.sourceUrl ? (
          <a href={pr.sourceUrl} target="_blank" rel="noreferrer" className="promise-row-source">
            {pr.criteria}
          </a>
        ) : (
          <span className="promise-row-criteria">{pr.criteria}</span>
        );
        return (
          <div className="promise-row" key={i}>
            {criteria}
            <span className="promise-row-tags">
              <span className={`tag ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`}>
                {d.label}
              </span>
              {pr.core ? <span className="tag na">Main promise</span> : null}
            </span>
          </div>
        );
      })}
      <ButtonLink href={`/projects/${slug}`}>
        Full evidence on the project page
      </ButtonLink>
    </div>
  );
}
