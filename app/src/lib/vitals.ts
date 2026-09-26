/**
 * Project vitals: live ecosystem stats for each project page.
 *
 * DISPLAY ONLY. Vitals never feed the hearts scoring algorithm. They are a
 * separate signal layer that may get their own ranking later.
 *
 * Data sources (all free, no signup):
 * - GitHub REST API: stars, forks, open issues, last commit, 52-week commit
 *   activity, open pull requests (via the search API). Unauthenticated limit
 *   is 60 requests/hour per IP (search has its own 10/minute budget). Each
 *   project needs 4 requests, refreshed at most every 6 hours, so ~6
 *   requests/hour total across all 8 projects. Set GITHUB_TOKEN to raise
 *   the limits; the code works without it and degrades gracefully.
 *
 * Deliberately NOT included (documented, not faked):
 * - X/Twitter follower counts and mentions: X API is paywalled.
 * - Social volume / sentiment: LunarCrush has a free tier but requires an API
 *   key signup; nobody has signed up yet.
 * - Reddit subscribers: reddit.com returns 403 to unauthenticated requests.
 * - CoinGecko community_data (twitter/reddit/telegram): returns null on the
 *   free tier as of 2026-09.
 */

export interface VitalsRepo {
  github: string; // "owner/repo"
  label: string; // human label for the repo
}

/** Canonical development repo per project slug. Verified 2026-09-25. */
export const VITALS_REPOS: Record<string, VitalsRepo> = {
  btc: { github: "bitcoin/bitcoin", label: "Bitcoin Core" },
  eth: { github: "ethereum/go-ethereum", label: "go-ethereum" },
  xrp: { github: "xrplf/rippled", label: "rippled" },
  sol: { github: "anza-xyz/agave", label: "Agave validator client" },
  link: { github: "smartcontractkit/chainlink", label: "Chainlink" },
  avax: { github: "ava-labs/avalanchego", label: "AvalancheGo" },
  dash: { github: "dashpay/dash", label: "Dash Core" },
  bat: { github: "brave/brave-browser", label: "Brave browser" },
};

export function isVitalsSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(VITALS_REPOS, slug);
}

export interface VitalsWeek {
  week: number; // unix timestamp, start of week
  total: number; // commits that week
}

export interface VitalsData {
  slug: string;
  repo: string;
  repoLabel: string;
  repoUrl: string;
  stars: number | null;
  forks: number | null;
  watchers: number | null;
  openIssues: number | null;
  openPRs: number | null;
  lastPushAt: string | null;
  lastCommitAt: string | null;
  lastCommitMessage: string | null;
  commits30d: number | null;
  commits90d: number | null;
  weeks: VitalsWeek[] | null; // oldest first
  fetchedAt: string;
  partial: boolean; // true when at least one source failed
}

const GITHUB_API = "https://api.github.com";
/** Upstream cache: GitHub data refreshes at most every 6 hours. */
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

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: ghHeaders(),
      signal: AbortSignal.timeout(3000),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** GitHub may still be computing. Return unknown now and retry on a later visit. */
async function ghCommitActivity(repo: string): Promise<VitalsWeek[] | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}/stats/commit_activity`, {
      headers: ghHeaders(), signal: AbortSignal.timeout(3000),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.status === 202 || !res.ok) return null;
    const weeks = await res.json();
    return Array.isArray(weeks) ? weeks.map(w => ({week:w.week,total:w.total})) : null;
  } catch { return null; }
}

/**
 * Pure helper, unit-tested: roll 52 weekly totals into 30d/90d commit counts.
 * Weeks are oldest-first; the last 4 entries cover ~28 days, last 13 ~91 days.
 */
export function summarizeWeeks(weeks: VitalsWeek[]): {
  commits30d: number;
  commits90d: number;
} {
  const last4 = weeks.slice(-4);
  const last13 = weeks.slice(-13);
  return {
    commits30d: last4.reduce((s, w) => s + w.total, 0),
    commits90d: last13.reduce((s, w) => s + w.total, 0),
  };
}

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  pushed_at: string;
}

interface GhCommit {
  commit: { author: { date: string }; message: string };
}

export async function fetchVitals(slug: string): Promise<VitalsData> {
  const meta = VITALS_REPOS[slug];
  const base: VitalsData = {
    slug,
    repo: meta.github,
    repoLabel: meta.label,
    repoUrl: `https://github.com/${meta.github}`,
    stars: null,
    forks: null,
    watchers: null,
    openIssues: null,
    openPRs: null,
    lastPushAt: null,
    lastCommitAt: null,
    lastCommitMessage: null,
    commits30d: null,
    commits90d: null,
    weeks: null,
    fetchedAt: new Date().toISOString(),
    partial: false,
  };

  const [repo, commits, weeks, prs] = await Promise.all([
    gh<GhRepo>(`/repos/${meta.github}`),
    gh<GhCommit[]>(`/repos/${meta.github}/commits?per_page=1`),
    ghCommitActivity(meta.github),
    gh<{ total_count: number }>(
      `/search/issues?q=${encodeURIComponent(`repo:${meta.github} type:pr state:open`)}&per_page=1`
    ),
  ]);

  if (!repo && !commits && !weeks && !prs) {
    return { ...base, partial: true }; // GitHub fully unreachable; UI shows the down state
  }

  if (repo) {
    base.stars = repo.stargazers_count;
    base.forks = repo.forks_count;
    base.watchers = repo.subscribers_count;
    base.openIssues = repo.open_issues_count;
    base.lastPushAt = repo.pushed_at;
  } else {
    base.partial = true;
  }

  // Search API is best-effort (stricter rate limits); the tile hides on null.
  if (prs && typeof prs.total_count === "number") {
    base.openPRs = prs.total_count;
  }

  if (commits && commits[0]) {
    base.lastCommitAt = commits[0].commit.author.date;
    base.lastCommitMessage = commits[0].commit.message.split("\n")[0].slice(0, 120);
  } else {
    base.partial = true;
  }

  if (weeks && weeks.length) {
    const total = weeks.reduce((s, w) => s + w.total, 0);
    const pushedRecently =
      base.lastPushAt != null &&
      Date.now() - new Date(base.lastPushAt).getTime() < 14 * 24 * 3600 * 1000;
    if (total === 0 && pushedRecently) {
      // GitHub's stats cache is stale (repo pushed recently but the series is
      // all zeros). Show n/a rather than a false zero.
      base.partial = true;
    } else {
      base.weeks = weeks;
      const { commits30d, commits90d } = summarizeWeeks(weeks);
      base.commits30d = commits30d;
      base.commits90d = commits90d;
    }
  } else {
    base.partial = true;
  }

  return base;
}
