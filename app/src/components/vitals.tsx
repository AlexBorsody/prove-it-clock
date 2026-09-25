"use client";

import { useEffect, useState } from "react";
import type { VitalsData } from "@/lib/vitals";

/** Project vitals: live GitHub activity. Display only, never scored. */

function fmtCompact(v: number | null): string {
  if (v == null) return "n/a";
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

function relTime(iso: string | null): string {
  if (!iso) return "unknown";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function Sparkline({ weeks }: { weeks: NonNullable<VitalsData["weeks"]> }) {
  const max = Math.max(1, ...weeks.map((w) => w.total));
  const W = 260;
  const H = 44;
  const n = weeks.length;
  const bw = W / n;
  return (
    <svg
      className="vitals-spark"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Weekly commits over the last year"
    >
      <title>Commits per week, last 52 weeks</title>
      {weeks.map((w, i) => {
        const h = Math.max(2, (w.total / max) * (H - 4));
        return (
          <rect
            key={i}
            x={i * bw + 0.5}
            y={H - h}
            width={Math.max(1, bw - 1)}
            height={h}
            rx={1}
          >
            <title>{`${w.total} commits, week of ${new Date(w.week * 1000).toISOString().slice(0, 10)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function Tile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="vital-tile">
      <div className="vital-num num">{fmtCompact(value)}</div>
      <div className="vital-label">{label}</div>
    </div>
  );
}

export default function Vitals({ slug }: { slug: string }) {
  const [data, setData] = useState<VitalsData | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let live = true;
    setFailed(false);
    fetch(`/api/vitals/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error(`http ${r.status}`);
        return r.json();
      })
      .then((d: VitalsData) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [slug, retry]);

  const down = failed || (data && data.stars == null && data.weeks == null);

  return (
    <div className="panel">
      <h2>
        Vitals <span className="tag measured">live</span>
      </h2>
      <p className="panel-sub">
        Developer activity, pulled live from GitHub. Display only: it does not
        affect the hearts score.
      </p>

      {!data && !down && (
        <div className="vitals-loading" aria-label="Loading vitals">
          <div className="vitals-skel" />
          <div className="vitals-skel" />
          <div className="vitals-skel" />
        </div>
      )}

      {down && (
        <div className="vitals-down">
          <p>
            Vitals are unavailable right now. GitHub may be rate limiting us;
            nothing is broken on your end.
          </p>
          <button className="vitals-retry" onClick={() => setRetry((r) => r + 1)}>
            Try again
          </button>
        </div>
      )}

      {data && !down && (
        <>
          <p className="vitals-repo">
            <a href={data.repoUrl} target="_blank" rel="noreferrer">
              {data.repo}
            </a>
            <span className="vitals-repo-label">{data.repoLabel}</span>
          </p>
          <div className="vitals-grid">
            <Tile label="Stars" value={data.stars} />
            <Tile label="Forks" value={data.forks} />
            <Tile label="Open issues" value={data.openIssues} />
            <Tile label="Commits, 30d" value={data.commits30d} />
            <Tile label="Commits, 90d" value={data.commits90d} />
          </div>
          {data.lastCommitAt && (
            <p className="vitals-commit">
              <b>Last commit</b> {relTime(data.lastCommitAt)}
              {data.lastCommitMessage ? (
                <span className="vitals-commit-msg">{data.lastCommitMessage}</span>
              ) : null}
            </p>
          )}
          {data.weeks && data.weeks.length > 0 && (
            <div className="vitals-spark-wrap">
              <div className="vitals-spark-label">Commits per week, last year</div>
              <Sparkline weeks={data.weeks} />
            </div>
          )}
          <p className="vitals-foot">
            Refreshed every few hours from the public GitHub API.
          </p>
        </>
      )}
    </div>
  );
}
