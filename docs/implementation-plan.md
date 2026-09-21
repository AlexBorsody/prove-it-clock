# Prove-It Clock — Implementation Plan

**Status:** 2026-09-21. Shipped: v0.2.0 seed live, fallback removed, visual QA passed. Technical only.
**Companion:** `implementation-spec.md` (history API, timeline chart, event pipeline specs).

## Non-goals

- No scoring-logic changes. No methodology version bump. No new data providers.
- No strategy, distribution, or monetization (those live in `strategy.md`, `top20-expansion.md` §10).
- No speculation. No price prediction. Algorithms calculate; AI explains; humans version methodology.

## Active model (hard rules)

- Methodology **v0.2.0**. Six scored: BTC, ETH, XRP, SOL, ADA, LINK.
- Other 14 top-20: score `null`, status `unavailable`. Never zero, never an estimate.
- Market cap controls membership and display rank only. Never touches scores.
- Nulls are returned as null and render as gaps — in API responses and charts.

## 0. Env wiring — blocked on Alex

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` → Vercel env (server-side only, never `NEXT_PUBLIC_*`) and local `app/.env.local` (gitignored).
- Verify: `GET /api/projects/bitcoin/history` returns 200 against the real DB.

## 1. History API — built locally, uncommitted

- `app/src/lib/supabase.ts`, `app/src/app/api/projects/[slug]/history/route.ts` (5-min cache, nulls preserved).
- Still to do: rerun typecheck directly (earlier pipeline may have masked the exit code), then commit.

## 2. v0.2.0 correction — production currently serves speculative v0.3.0

- DB reality (verified 2026-09-20): `methodology_versions` holds **0.1.0** (the six
  scored projects: btc, eth, xrp, sol, ada, link) and **0.3.0** (20 projects,
  provisional — the speculative set). No 0.2.0 row exists.
- Active reads use the six-project non-speculative dataset only — never the
  0.3.0 provisional rows. No row deletes — history is append-only.
- Open: the app calls the active model v0.2.0 but the DB labels that dataset
  0.1.0. Version label is Alex's call (humans version methodology).
- Homepage: 20 rows, live CoinGecko overlay, pagination envelope unchanged.
- `/methodology` shows 0.2.0.
- Detail pages: 6 scored render scores; 14 render market metadata + explicit score-unavailable state.

## 3. Timeline chart — per `implementation-spec.md` §2

- `components/timeline-chart.tsx`, hand-rolled SVG, zero new dependencies.
- Methodology-version markers on the axis; event annotations; nulls render as gaps.

## 4. Event pipeline — per `implementation-spec.md` §3

- `npm run events:check` (every event has `date`, `title`, `evidence_summary`).
- Backfill the 6 scored projects first, ≥5 events each.

## 5. Validation gates

- `tsc` clean (direct run). `next build` clean.
- `/api/projects`: 20 items, pagination total 20.
- Exactly 6 scored, 14 unavailable.
- Homepage: 20 rows. Unscored detail page: no chart lines, explicit unavailable state.
- History: null stretches are gaps, not zeros.

## 6. Ship — DONE 2026-09-21

- v0.2.0 seed inserted via Supabase SQL (84 genuine v0.2.0 snapshots; v0.3.0 retired as non-current, append-only history preserved).
- `activeDatasetVersionId` fallback removed (`app/src/lib/data.ts`): queries v0.2.0 exactly, fails loudly if missing.
- Production smoke test: 20 projects, 6 scored, 14 unavailable; Promise Gap / Potential Outlook values match seed.
- Visual QA: `/`, `/projects/btc`, `/projects/usdt`, `/methodology` all pass.
- Footer version corrected: v0.3.0 → v0.2.0 (remote `75ccf1da`), verified live.

## 7. Embeddable timeline widget — next

- Route `app/embed/projects/[slug]/timeline/page.tsx`: server-rendered SVG of the
  existing ScoreTimeline component, no JS dependency.
- Query params: `theme=light|dark`, `w`, `h`. Served with iframe-friendly headers
  (`X-Frame-Options` removed for this route), long cache TTL (5 min, same as API).
- Unscored projects render the explicit unavailable state, not an empty chart.
- Copy-paste embed snippet shown on each scored project page (static HTML
  `<iframe>` snippet; no JS loader).
- Gates: `tsc` clean, `next build` clean, iframe renders btc + usdt correctly in
  both themes.

## 8. SEO structured-data pass — queued

- Per project page: `<title>`, meta description, canonical URL, Open Graph +
  Twitter card tags.
- JSON-LD `WebPage` + `Article` blocks on project pages (scores as data points,
  methodology version referenced).
- `sitemap.xml`: all 20 project pages + `/methodology`.
- Gates: validate with a schema checker; no layout changes.

## 9. Promise-gap alerts feed — queued

- Daily job: diff latest snapshot against previous; emit rows where
  `promise_gap` or `potential_outlook` changed beyond epsilon.
- Output: append-only `alerts` table (Supabase) + `GET /api/alerts` endpoint
  (paginated, 5-min cache). Delivery channels (email/Telegram) are a separate
  decision — this task is the feed only.
- Gates: rerun against two snapshots, verify deltas computed correctly, no
  false alerts on unchanged rows.

## Blocked on Alex

- Telegram broadcast channel (needs his Telegram account).
- Next scoring-update cadence (his methodology call).
- Publisher disclosures (Dash/BAT/AVAX/LINK positions) still unconfirmed.

- Commit §1+§2, push, wait for Vercel, verify production: methodology 0.2.0, 6 scored, 20 rows.

## Build order

0 → 1 → 2 → 3 + 4 → 5 → 6
