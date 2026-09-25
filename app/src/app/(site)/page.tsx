import { HEARTS_METHODOLOGY, readHeartHistory, readHeartRankings } from "@/lib/heart-data";
import HeartMeter from "@/components/heart-meter";
import { HeartSparkline } from "@/components/hearts-timeline";
import ShitcoinBadge, { shitcoinScore } from "@/components/shitcoin-badge";
import Icon from "@/components/chrome-icons";

export const dynamic = "force-dynamic";

function fmtUsd(v: number | null | undefined): string {
  if (v == null) return "n/a";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toPrecision(2)}`;
}

export default async function Home() {
  let projects: any[] = [];
  try {
    const data = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100);
    projects = data.projects;
  } catch {
    // fall through to the empty state below
  }

  // Sparkline histories: rises and falls are the product, so they belong on the cards.
  // Also keep each project's latest full point so we can compute its shitcoin score.
  const histories: Record<string, { as_of: string; filled: number; capacity: number }[]> = {};
  const latestBySlug: Record<string, any> = {};
  await Promise.all(
    projects.map(async (p) => {
      try {
        const h = await readHeartHistory(p.slug, HEARTS_METHODOLOGY, 1, 100);
        const pts = (h.points ?? []).filter((pt: any) => pt.availability === "available");
        histories[p.slug] = pts.map((pt: any) => ({ as_of: pt.as_of, filled: pt.filled, capacity: pt.capacity }));
        latestBySlug[p.slug] = pts[0] ?? null;
      } catch {
        histories[p.slug] = [];
        latestBySlug[p.slug] = null;
      }
    })
  );

  const shitcoinBySlug: Record<string, number | null> = {};
  for (const p of projects) {
    const latest = latestBySlug[p.slug];
    const pts = histories[p.slug] ?? [];
    if (!latest || !pts.length) {
      shitcoinBySlug[p.slug] = null;
      continue;
    }
    const promises: any[] = latest.assessment?.promises ?? [];
    const peak = Math.max(...pts.map((pt) => pt.filled));
    shitcoinBySlug[p.slug] = shitcoinScore({
      promises,
      capacity: latest.capacity,
      filled: latest.filled,
      peak,
    });
  }

  return (
    <>
      <h1 className="page-title">Prove-It</h1>
      <p className="page-sub">
        Crypto runs on hype. Prove-It shows what's real. Every token has a
        market price. We measure what the project actually proved it could do,
        promise by promise, with the evidence linked. Compare the proof against
        the price, and decide for yourself.
      </p>

      {projects.length === 0 ? (
        <div className="panel">
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            No scores published
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            The heart database is not reachable or no run is published yet.
          </p>
        </div>
      ) : (
        <div className="cards">
          {projects.map((p) => (
            <a key={p.slug} href={`/projects/${p.slug}`} className="card-link">
              <div className="panel card">
                <div className="card-top">
                  <div className="card-identity">
                    <img
                      src={`/icons/${p.symbol.toLowerCase()}.svg`}
                      alt=""
                      width={34}
                      height={34}
                      className="coin-icon"
                    />
                    <div>
                      <div className="card-name">{p.name}</div>
                      <div className="card-symbol num">{p.symbol}{p.market_cap_rank ? ` · #${p.market_cap_rank}` : ""}</div>
                    </div>
                  </div>
                  <div className="card-score num">{p.filled}/{p.capacity}</div>
                </div>
                <HeartMeter filled={p.filled} capacity={p.capacity} allowance={p.allowance} />
                <HeartSparkline points={histories[p.slug] ?? []} />
                {shitcoinBySlug[p.slug] != null ? (
                  <div style={{ margin: "2px 0 10px" }}>
                    <ShitcoinBadge score={shitcoinBySlug[p.slug] as number} capacity={p.capacity} compact noLink />
                  </div>
                ) : null}
                <div className="card-foot num">
                  <Icon name="check" size={12} style={{ marginRight: 4 }} />
                  {p.earned} earned
                  {" · "}
                  <Icon name="gift" size={12} style={{ marginRight: 4 }} />
                  {p.allowance} free
                  {" · "}
                  <Icon name="chart" size={12} style={{ marginRight: 4 }} />
                  {fmtUsd(p.market_cap_usd)} mcap
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
