/**
 * ContextRankBadge: a big clickable rank label for the Supporting context
 * sections on project pages. Pure context: it mirrors the destination
 * page's default sort (CODE by stars, HYPE by 7d mentions) and never feeds
 * any verdict. The whole badge links to the full ranking.
 */
import Link from "next/link";

export default function ContextRankBadge({ rank, total, kind, href, basis }: {
  rank: number;
  total: number;
  kind: "Code" | "Hype";
  href: string;
  basis: string;
}) {
  if (rank < 1 || total < 1) return null;
  return (
    <Link
      href={href}
      className="context-rank-badge"
      aria-label={`${kind} rank ${rank} of ${total}, ranked by ${basis}. Open the ${kind} ranking.`}
    >
      <span className="num context-rank-num">#{rank}</span>
      <span className="context-rank-sub">of {total} in {kind} · by {basis}</span>
    </Link>
  );
}
