#!/usr/bin/env node
/**
 * Refresh GitHub vitals cache for the scoreboard.
 *
 * Run by .github/workflows/vitals-refresh.yml (daily) with the automatic
 * GITHUB_TOKEN — no manual token management, no Vercel env var needed.
 *
 * Reads the repo mapping from app/src/lib/vitals.ts (single source of truth),
 * fetches stars + 52-week commit activity per repo, and writes
 * app/data/vitals-cache.json which /api/vitals serves.
 *
 * Usage: GITHUB_TOKEN=... node app/scripts/refresh-vitals.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const API = "https://api.github.com";

if (!TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

/** Extract slug -> owner/repo from vitals.ts (single source of truth). */
function loadRepoMap() {
  const src = readFileSync(join(ROOT, "app", "src", "lib", "vitals.ts"), "utf8");
  const map = {};
  const re = /^\s*([a-z0-9-]+):\s*\{\s*github:\s*"([^"]+)"/gm;
  let m;
  while ((m = re.exec(src))) map[m[1]] = m[2];
  return map;
}

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "prove-it-vitals-refresh",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${TOKEN}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 202) return { retry: true };
  if (res.status === 403) {
    console.error(`rate limited on ${path}, waiting 60s`);
    await new Promise((r) => setTimeout(r, 60000));
    return gh(path);
  }
  if (!res.ok) {
    console.error(`${path} -> ${res.status}`);
    return null;
  }
  return res.json();
}

function commits90d(weeks) {
  if (!Array.isArray(weeks)) return null;
  return weeks.slice(-13).reduce((s, w) => s + (w.total || 0), 0);
}

const repos = loadRepoMap();
const slugs = Object.keys(repos);
console.log(`refreshing ${slugs.length} repos`);

const cache = {};
let ok = 0;
for (const slug of slugs) {
  const repo = repos[slug];
  try {
    const info = await gh(`/repos/${repo}`);
    if (!info || info.retry) {
      console.error(`skip ${slug}: repo info unavailable`);
      continue;
    }
    let weeks = await gh(`/repos/${repo}/stats/commit_activity`);
    if (weeks && weeks.retry) {
      await new Promise((r) => setTimeout(r, 8000));
      weeks = await gh(`/repos/${repo}/stats/commit_activity`);
    }
    cache[slug] = {
      stars: info.stargazers_count ?? null,
      commits90d: commits90d(weeks && !weeks.retry ? weeks : null),
      partial: !weeks || weeks.retry ? true : false,
    };
    ok++;
  } catch (e) {
    console.error(`skip ${slug}: ${e.message}`);
  }
  // stay comfortably under rate limits
  await new Promise((r) => setTimeout(r, 300));
}

const out = {
  updatedAt: new Date().toISOString(),
  vitals: cache,
};
writeFileSync(join(ROOT, "app", "data", "vitals-cache.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote cache for ${ok}/${slugs.length} repos`);
