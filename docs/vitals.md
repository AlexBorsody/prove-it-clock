# Project Vitals: the CODE pillar

Live ecosystem stats shown on each project page. **Display only.** Vitals never
feed the hearts scoring algorithm; they are the CODE pillar of
[vision.md](vision.md): are they building? GitHub activity is observable
activity, not proof of meaningful progress.

The main project page shows CODE statistics only; the tracked repo list lives
in the Evidence / Methodology section, auditable and challengeable. HYPE data
lives in [social-pipeline.md](social-pipeline.md). USE metrics are parked.

## What is shown

Per project, from the canonical development repo:

- Stars, forks, open issues, open pull requests
- Last commit (relative time plus the commit message)
- Commits in the last 30 and 90 days
- A 52-week commit-activity sparkline

## Data sources

**GitHub REST API** (public, no signup). Three requests per project:

1. `GET /repos/{owner}/{repo}` - stars, forks, open issues, last push
2. `GET /repos/{owner}/{repo}/commits?per_page=1` - latest commit date/message
3. `GET /repos/{owner}/{repo}/stats/commit_activity` - 52 weekly commit totals
4. `GET /search/issues?q=repo:{owner}/{repo}+type:pr+state:open` - open PR count (best-effort)

Canonical repos (verified 2026-09-25):

| Project | Repo | Note |
|---|---|---|
| BTC | bitcoin/bitcoin | |
| ETH | ethereum/go-ethereum | canonical client |
| XRP | xrplf/rippled | moved from ripple/rippled |
| SOL | anza-xyz/agave | dev moved from solana-labs/solana (stale since Jan 2025) |
| LINK | smartcontractkit/chainlink | |
| AVAX | ava-labs/avalanchego | |
| DASH | dashpay/dash | |
| BAT | brave/brave-browser | |

## Caching and rate limits

- GitHub allows 60 requests/hour unauthenticated per IP. Eight projects at
  3 requests each is 24 requests per refresh; upstream data is revalidated at
  most every 6 hours (`next: { revalidate: 21600 }`), and the API route sends
  `Cache-Control: public, s-maxage=21600, stale-while-revalidate=3600`, so real
  usage is far under the limit.
- Set a `GITHUB_TOKEN` env var to raise the limit to 5,000/hour. The code works
  without it.
- `stats/commit_activity` is computed asynchronously by GitHub and can return
  202 while it crunches; the fetcher retries, then degrades. If the series comes
  back all zeros while the repo was pushed in the last 14 days, the stats cache
  is stale and the UI shows n/a instead of a false zero.

## Degradation

The section is a client component that fetches `/api/vitals/[slug]` after page
load. Loading shows a skeleton; if GitHub is down or rate limiting, it shows a
short notice with a retry button. Partial data renders what is available and
hides what is not.

## Deliberately not included

Researched 2026-09-25. Nothing here is faked; if it is not freely and reliably
available, it is left out:

- **X/Twitter follower counts and mentions** - the X API is paywalled. No free
  route exists.
- **Social volume / sentiment** - LunarCrush has a crypto social API with a free
  tier, but it requires an API key signup. Nobody has signed up yet; this is the
  obvious next source when someone does.
- **Reddit subscribers** - reddit.com returns 403 to unauthenticated API
  requests.
- **CoinGecko community data** (twitter/reddit/telegram) - returns null on the
  free tier as of 2026-09.
