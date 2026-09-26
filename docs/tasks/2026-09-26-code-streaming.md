# Fix: /code shows a blank page for seconds — Codex task brief

**2026-09-26, Alex's report:** opening the Metrics CODE tab pulls up blank
and takes visibly long to load.

## Diagnosis (verified 2026-09-26)

- `app/src/app/(site)/code/page.tsx` is a single async server component with
  **no `loading.tsx` and no Suspense boundaries**. It awaits Supabase
  rankings plus 16 GitHub API calls (8 projects x vitals + team) before
  streaming a single byte of HTML.
- Measured TTFB on production: ~6.3s cold, ~2.5s warm. The browser shows
  nothing until then.
- Worst-case amplifier: `ghCommitActivity` in `app/src/lib/vitals.ts`
  retries GitHub's 202 responses with 1.5s sleeps, up to 3 attempts per
  repo. The slowest repo gates the entire page.

## Fix

- Split the page into shell + data: render the title, description, and sort
  control immediately; wrap the rows fetch in a `<Suspense>` boundary with
  a skeleton fallback (row-shaped placeholders, matching the existing
  panel styling) so content streams in.
- Alternatively/additionally add a `loading.tsx` for the code route. Either
  way the user must never stare at a blank page.
- Make the commit-activity 202-retry non-blocking for first paint: shorten
  the sleeps, drop to fewer attempts, or let tiles render without the
  sparkline while it resolves in the background (the component already
  degrades: "tiles still show, sparkline hides").
- Do not change what the page shows once loaded: same rows, same sort
  control, same empty states.

## Acceptance

- Cold navigation to /code shows shell + skeleton in well under a second;
  rows stream in as data resolves.
- No blank page at any point during load.
- A slow or rate-limited GitHub API degrades the affected tiles only; the
  rest of the page still renders promptly.
- Build, typecheck, and relevant tests pass.
