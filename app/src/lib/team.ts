/**
 * TEAM: is development backed by a real, durable team or a handful of
 * accounts? Built from the curated GitHub repos in vitals.ts.
 *
 * DISPLAY ONLY. Like all CODE data, TEAM never feeds hearts or the
 * Shitcoin warning. It answers "who is actually building" next to the
 * raw commit counts.
 *
 * Data source: GET /repos/{owner}/{repo}/stats/contributors (free, no
 * signup). Per-contributor weekly commit counts for the trailing ~52
 * weeks. GitHub computes these stats asynchronously: the first hit can
 * return 202, so we retry like ghCommitActivity in vitals.ts.
 */

import { VITALS_REPOS } from "./vitals";

export type TeamRead = "Broad" | "Concentrated" | "Thin" | "Unknown";

export interface TeamData {
  slug: string;
  repo: string;
  /** Contributors with at least one commit in the last ~90 days. */
  active90d: number | null;
  /** Contributors with at least one commit in the last ~52 weeks. */
  active365d: number | null;
  /** Share of trailing-52w commits from the top 3 contributors, 0-1. */
  top3Share: number | null;
  /** Contributors with commits in at least 2 of the last 4 quarters. */
  recurring: number | null;
  read: TeamRead;
  fetchedAt: string;
  partial: boolean;
}

const GITHUB_API = "https://api.github.com";
const REVALIDATE_SECONDS = 6 * 60 * 60;

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "prove-it-vitals",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

interface GhContributorWeek {
  w: number;
  a: number;
  d: number;
  c: number;
}

interface GhContributor {
  author: { login: string } | null;
  total: number;
  weeks: GhContributorWeek[];
}

/** Bots (dependabot etc.) commit but are not a team. Excluded, documented. */
function isBot(login: string): boolean {
  return login.toLowerCase().endsWith("[bot]");
}

/**
 * Pure, unit-testable: roll contributor weeklies into the TEAM read.
 * Weeks are oldest-first; the last 13 entries cover ~91 days.
 */
export function summarizeContributors(contributors: GhContributor[]): {
  active90d: number;
  active365d: number;
  top3Share: number;
  recurring: number;
  read: TeamRead;
} {
  const humans = contributors.filter((c) => c.author && !isBot(c.author.login));
  const commitsIn = (c: GhContributor, fromEnd: number) =>
    c.weeks.slice(-fromEnd).reduce((s, w) => s + (w.c || 0), 0);

  const active90d = humans.filter((c) => commitsIn(c, 13) > 0).length;
  const active365d = humans.filter((c) => (c.total || 0) > 0).length;

  const totals = humans
    .map((c) => c.weeks.reduce((s, w) => s + (w.c || 0), 0))
    .sort((a, b) => b - a);
  const grand = totals.reduce((s, t) => s + t, 0);
  const top3Share = grand > 0 ? totals.slice(0, 3).reduce((s, t) => s + t, 0) / grand : 0;

  // Quarters: four 13-week chunks of the trailing 52 weeks.
  const recurring = humans.filter((c) => {
    let quarters = 0;
    for (let q = 0; q < 4; q++) {
      const chunk = c.weeks.slice(-(q + 1) * 13, q === 0 ? undefined : -q * 13);
      if (chunk.reduce((s, w) => s + (w.c || 0), 0) > 0) quarters++;
    }
    return quarters >= 2;
  }).length;

  const read: TeamRead =
    active90d < 5 ? "Thin" : top3Share >= 0.5 ? "Concentrated" : "Broad";

  return { active90d, active365d, top3Share, recurring, read };
}

async function ghContributorStats(repo: string): Promise<GhContributor[] | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GITHUB_API}/repos/${repo}/stats/contributors`, {
        headers: ghHeaders(),
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (res.status === 202) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      if (!res.ok) return null;
      const data = (await res.json()) as GhContributor[];
      if (!Array.isArray(data)) return null;
      return data;
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchTeam(slug: string): Promise<TeamData> {
  const meta = VITALS_REPOS[slug];
  const base: TeamData = {
    slug,
    repo: meta.github,
    active90d: null,
    active365d: null,
    top3Share: null,
    recurring: null,
    read: "Unknown",
    fetchedAt: new Date().toISOString(),
    partial: true,
  };
  const stats = await ghContributorStats(meta.github).catch(() => null);
  // GitHub can 200 with an empty body while the stats are still computing.
  // An empty list is indistinguishable from "no contributors", so it must
  // read as Unknown, never as a false zero (missing data means unknown).
  if (!stats || stats.length === 0) return base;
  const s = summarizeContributors(stats);
  return {
    ...base,
    active90d: s.active90d,
    active365d: s.active365d,
    top3Share: s.top3Share,
    recurring: s.recurring,
    read: s.read,
    partial: false,
  };
}

/** "TEAM: Broad · 34 active contributors · top 3 produced 21% of commits" */
export function teamLine(t: TeamData): string {
  if (t.read === "Unknown" || t.active90d == null || t.top3Share == null) {
    return "TEAM: Unknown · couldn't reach GitHub";
  }
  const pct = Math.round(t.top3Share * 100);
  return (
    `TEAM: ${t.read} · ${t.active90d} active contributor${t.active90d === 1 ? "" : "s"}` +
    ` · top 3 produced ${pct}% of commits`
  );
}
