import Link from "next/link";
import { normalizePromiseState } from "@/lib/hearts";

export interface PromiseBrief {
  criteria: string;
  state: string;
  core: boolean;
  reward: number;
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
 * tags; the full evidence lives on the project page.
 */
export default function PromiseRows({ slug, promises }: { slug: string; promises: PromiseBrief[] }) {
  if (promises.length === 0) {
    return <p className="promise-rows-empty">No promises tracked yet.</p>;
  }
  return (
    <div className="promise-rows">
      {promises.map((pr, i) => {
        const d = stateLabel(pr);
        return (
          <div className="promise-row" key={i}>
            <span className="promise-row-criteria">{pr.criteria}</span>
            <span className="promise-row-tags">
              <span className={`tag ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`}>
                {d.label}
              </span>
              {pr.core ? <span className="tag na">Main promise</span> : null}
              {pr.reward ? (
                <span className="comp-hearts num">
                  {pr.reward} heart{pr.reward > 1 ? "s" : ""}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
      <Link href={`/projects/${slug}`} className="promise-rows-more">
        Full evidence on the project page
      </Link>
    </div>
  );
}
