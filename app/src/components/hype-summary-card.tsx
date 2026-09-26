/**
 * HypeSummaryCard: the compact HYPE summary for project detail pages.
 * Not the full list row (that's HypeRowCard): just the important stuff
 * that fits on a card. Modular: any surface can render it from a HypeRow.
 */
import { SourceIcons, type HypeRow } from "@/components/hype-leaderboard";
import { searchMeta } from "@/lib/search-sections";

export default function HypeSummaryCard({ row: r }: { row: HypeRow }) {
  return (
    <article
      className="hype-summary search-section"
      {...searchMeta({
        id: `project-${r.slug}-hype-summary`,
        title: `${r.name} HYPE summary`,
        kind: "HYPE",
        project: r.slug,
        keywords: `${r.symbol} mentions attention`,
      })}
    >
      <div className="hype-summary-top">
        <img
          src={`/icons/${r.symbol.toLowerCase()}.svg`}
          alt=""
          width={40}
          height={40}
          className="coin-icon"
        />
        <div className="hype-summary-id">
          <span className="proj-name">{r.name}</span>
          <span className="proj-cat num">{r.symbol}</span>
        </div>
        <div className="hype-summary-mentions num">
          <span className="hype-val">
            {r.mentions == null ? "-" : r.mentions.toLocaleString()}
          </span>
          <span className="cell-sub">
            {r.mentions == null
              ? "no data yet"
              : r.baselineWeeks < 8
                ? `collecting, week ${r.baselineWeeks}/8`
                : "mentions / 7d"}
          </span>
        </div>
      </div>
      <div className="hype-summary-sources">
        <span className="cell-sub">Sources</span>
        <SourceIcons sources={r.sources} />
      </div>
    </article>
  );
}
