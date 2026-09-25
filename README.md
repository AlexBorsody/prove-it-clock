# Prove-It

Did the project do what it said it would? One instrument per crypto project: a
**heart meter** (filled / capacity) plus its **history graph**. A heart remains
earned only while the evidence condition under which it was awarded remains
true — scores change because evidence changes, not because time passes.

[Live site](https://prove-it-clock.vercel.app) · Methodology: hearts claim-type rule v2.

## Read first

- [Game design](docs/game_design.md): product concept and adopted heart rules.
- [Hearts algorithm](docs/hearts-algorithm.md): the rule, precisely.
- [Implementation](docs/implementation.md): architecture and invariants.
- [Case studies](docs/case-studies/): BAT and XRP evidence worksheets; [review.md](docs/case-studies/review.md) records the methodology decisions.
- [Daily logs](docs/tasks/): outcomes, decisions, verification.

## Develop locally

```bash
cd app
npm ci
npm run dev
```

For DB reads, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in ignored
`app/.env.local`. The service-role key is for publishing runs only — never in
`NEXT_PUBLIC_*`, never in the repo.

## Checks

```bash
npm run test:hearts   # heart arithmetic
npm run test:db       # migration + publish RPC
npx tsc --noEmit
npm run build
```

## Publishing a run

1. Write the publication document (schema v2) and validate it dry-run.
2. Call `publish_heart_run(document)` — it validates and writes atomically, or raises.
3. The site serves the latest published run for the active methodology.

## Repository map

| Path | Purpose |
| --- | --- |
| `app/src/app/` | Pages (cards, project meter + graph, methodology) and `/api/hearts` routes |
| `app/src/components/` | Heart meter, hearts timeline, case-study renderer |
| `app/src/lib/` | Heart arithmetic (`hearts.ts`), publication schema, Supabase readers |
| `db/migrations/` | Schema history (`002_heart_publications.sql` is the live one) |
| `docs/` | Game design, algorithm, implementation, case studies, daily logs |
