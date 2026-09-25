import { HEARTS_METHODOLOGY, readHeartHistory, readHeartRankings } from "@/lib/heart-data";
import HeartMeter from "@/components/heart-meter";
import { HeartSparkline } from "@/components/hearts-timeline";

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
  let run: { as_of: string } | null = null;
  let projects: any[] = [];
  try {
    const data = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100);
    run = data.run;
    projects = data.projects;
  } catch {
    // fall through to the empty state below
  }

  // Sparkline histories: rises and falls are the product, so they belong on the cards.
  const histories: Record<string, { as_of: string; filled: number; capacity: number }[]> = {};
  await Promise.all(
    projects.map(async (p) => {
      try {
        const h = await readHeartHistory(p.slug, HEARTS_METHODOLOGY, 1, 100);
        histories[p.slug] = (h.points ?? [])
          .filter((pt: any) => pt.availability === "available")
          .map((pt: any) => ({ as_of: pt.as_of, filled: pt.filled, capacity: pt.capacity }));
      } catch {
        histories[p.slug] = [];
      }
    })
  );

  return (
    <>
      <div className="meta-line">
        {run ? (
          <>LAST SCORED <b>{String(run.as_of).slice(0, 10)}</b> · {projects.length} PROJECTS</>
        ) : (
          <>NO SCORES PUBLISHED YET</>
        )}
      </div>
      <h1 className="page-title">Prove-It</h1>
      <p className="page-sub">
        Did the project do what it said it would? A heart means the project proved
        something it promised. If the proof goes away, so does the heart — the graph
        shows the whole story, rises and falls included.
      </p>

      {projects.length === 0 ? (
        <div className="panel">
          <h2>No scores published</h2>
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
                  <div>
                    <div className="card-name">{p.name}</div>
                    <div className="card-symbol num">{p.symbol}{p.market_cap_rank ? ` · #${p.market_cap_rank}` : ""}</div>
                  </div>
                  <div className="card-score num">{p.filled}/{p.capacity}</div>
                </div>
                <HeartMeter filled={p.filled} capacity={p.capacity} />
                <HeartSparkline points={histories[p.slug] ?? []} />
                <div className="card-foot num">
                  {p.earned} earned · {p.allowance} free · {fmtUsd(p.market_cap_usd)} mcap
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
