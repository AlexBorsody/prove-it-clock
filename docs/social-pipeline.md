# HYPE Pipeline: Prove-It's Own Attention Data

Our proprietary attention-metrics layer. Not a CoinGecko clone: we juxtapose
**hype** (observed attention) against **substance** (hearts earned). A project
with massive hype and few hearts reads as all sizzle, no steak. That
contrast is the differentiator; raw community numbers are not.

**Display only.** Hype metrics never feed the hearts scoring algorithm and
carry 0% weight in the Prove-It Index. Hype is context: observed attention,
never proof of support or adoption. Per [vision.md](vision.md), no trend
percentages publish until 8 complete weeks of snapshots exist; until then,
absolute mentions plus "baseline collecting, week N/8".

## What is shown

Per project, in the HYPE stat card:

- News mentions in the last 7 days (trend vs baseline once the baseline exists)
- Reddit subscribers (once credentials exist; the tile hides until then)
- Telegram members (best-effort; the tile hides when unavailable)
- A **hype-vs-substance read**: one plain-language line contrasting hype
  against hearts earned.

### The read rules

Hype is measured against the median 7-day news mentions across all tracked
projects in the latest collector batch (our own dataset, our own baseline):

- **high**: mentions at least 2x the cross-project median
- **low**: mentions at most half the median
- **moderate**: everything between

Then:

- high hype + under 40% of hearts filled: **"All sizzle, no steak."**
- low hype + at least 60% of hearts filled: **"Quietly proven."**
- anything else: neutral juxtaposition, no judgment.

No composite score is computed from hype. The two numbers sit side by side.
Hype needs at least 4 projects with news data in the batch; otherwise no
hype judgment is made.

## Architecture

```
GitHub Action (daily 06:30 UTC, manual via workflow_dispatch)
  -> app/scripts/collect-social.ts
    -> app/src/lib/social-collect.ts (Reddit OAuth, Telegram preview, News RSS)
    -> INSERT into public.social_snapshots (service role)
  -> app/src/app/api/social/[slug]/route.ts (anon key, RLS public read)
    -> latest 2 snapshots + cross-project median
  -> HYPE stat card + hype-vs-substance read
```

Scheduler choice: GitHub Actions over Vercel Cron. The collector fans out
to three free APIs per project with politeness delays and can run past
serverless duration limits. Runs are idempotent: one snapshot row per
project per run. A failed collection never renders as zero; the tile shows
the last good value marked stale, or hides.

## Data sources

| Source | Metric | Access | Notes |
|---|---|---|---|
| Reddit OAuth API | subreddit subscribers | Free app registration | Needs `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`; without them the metric is skipped, not faked |
| Telegram `t.me/s/` preview | channel members | None | Best-effort: only channels with public previews enabled expose a count; anything else yields null and the tile hides |
| Google News RSS | mentions, last 7d | None | Counts items with pubDate in the window |
| X/Twitter | followers, mentions | **Paywalled** | See upgrade path below. No scraper: unreliable and against ToS |

Per-project source handles live in `SOCIAL_SOURCES` in
`app/src/lib/social.ts`.

## Credentials and env vars (names only)

Collector / GitHub Action secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (writes only; reads go through RLS + anon key)
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` (optional; free at
  reddit.com/prefs/apps, type "script")

App runtime (already configured):

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`)

## Database

Migration `db/migrations/004_social_snapshots.sql` creates
`public.social_snapshots` (one row per project per run) with RLS: public
SELECT, writes via service role only. Apply via the Supabase dashboard SQL
editor; raw Postgres on 5432 is blocked from the build workspace.

## X/Twitter upgrade path (future, paid)

When hype becomes a paid-tier feature, X is the missing venue that
matters most (crypto conversation lives there). The path:

1. X API Basic tier (~$100+/mo at time of writing): `GET /2/users/by/username/:u`
   for follower counts; filtered stream or recent search for mention volume
   per project handle.
2. Add an `x_followers` / `x_mentions_7d` column pair to
   `social_snapshots` (new migration), a fetcher in `social-collect.ts`,
   and a tile in the HYPE card. The read rules stay unchanged;
   X mentions fold into the hype median.
3. Alternative: LunarCrush API (crypto-native social metrics, has a free
   tier but requires API-key signup) as a second paid/free source.

Until then, X is documented as absent, not approximated.

## Local verification

```bash
cd app
npm run social:collect -- --dry-run   # real sources, no DB write
npm run test:social
```
