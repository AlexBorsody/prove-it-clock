# The Prove-It Clock

The product is a simple graph of **promises kept** and **potential realized**,
working toward what the token should be worth. Potential sets the maximum
hearts; starting support fills a modest allowance; meaningful delivery earns
hearts and prolonged non-delivery erodes unearned value. The UI is a compact
8-bit heart meter and an ordinary line graph. Hearts are not yet a dollar valuation.

[Live site](https://prove-it-clock.vercel.app) · Active methodology **v0.2.0** ·
20 seeded projects, six scored (BTC, ETH, XRP, SOL, ADA, LINK).

## Read first

- [Game design](docs/game_design.md): product concept, adopted heart rules, and case-study scope.
- [Implementation](docs/implementation.md): architecture, schema/API contracts, integrity work, and technical delivery.
- [Daily logs](docs/tasks/): outcomes, decisions, verification, and blockers. Historical queues do not override the implementation plan.

Muse is the existing build teammate. Codex owns backend architecture, schemas,
ingestion, and frontend/API/DB contracts. Alex approves methodology changes.
The earlier multi-factor Promise/Context design is superseded by the current plan.

## Develop locally

With Node.js and npm available:

```bash
cd app
npm ci
npm run dev
npm run typecheck
npm run events:check
npm run build
```

The app runs at `http://localhost:3000`. Without Supabase, bundled speculative
scores are filtered out and the history API returns 503. Local mode is not a
complete offline demo.

For DB reads, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (or legacy
`SUPABASE_ANON_KEY`) in ignored `app/.env.local`, against a database with the
required read policies. The client also accepts and prefers
`SUPABASE_SERVICE_ROLE_KEY`; reserve privileged credentials for ingestion and
administration. Never expose privileged credentials through `NEXT_PUBLIC_*`.

## Pipeline commands

- `npm run pipeline`: fetch providers and write local metrics/scores/explanations.
- `npm run snapshot:load -- YYYY-MM-DD --dry-run`: validate existing artifacts without DB writes.
- `npm run snapshot:load -- YYYY-MM-DD`: load scores/explanations using server-side Supabase credentials.
- `npm run daily`: pipeline then loader. This command is not a scheduler.

The loader exists, but unattended operation is not yet verified. Reruns can
overwrite local artifacts; loader completeness and atomicity need work. Read
the [technical implementation plan](docs/implementation.md) before scheduling or running against production.

## Repository map

| Path | Purpose |
| --- | --- |
| `app/src/providers/` | Provider adapters |
| `app/src/pipeline/`, `app/scripts/` | Ingest, scoring, snapshot loader, event check |
| `app/src/methodology/`, `app/methodology/` | Engine and versioned configs |
| `app/data/` | Analyst seeds, disclosures, audit artifacts |
| `app/src/lib/` | Server readers, version policy, design mirrors |
| `app/src/app/`, `app/src/components/` | Pages, APIs, shared chart |
| `db/migrations/` | Schema history |
| `db/seed/` | Historical artifacts, not an ordered migration sequence |

Versioned, evidence-linked, append-only scores and explicit missing data are
product requirements. Legacy scores remain historical; the new valuation
method must be defined and versioned before replacing them.

## Case-study review build

Local draft review pages are available at `/case-studies` (BAT, XRP, questions,
and adopted rules). They render the Markdown in `docs/case-studies/`; edit those
files and rebuild to update the preview. These are research pages, not accepted
heart ratings. Legacy production scoring remains v0.2.0.

From `app/`, run `npm run test:hearts` for the isolated heart arithmetic and
Markdown-route checks. Then `npm run build` and
`npm run start -- --hostname 127.0.0.1 --port 3100` to review the built pages.
Questions and remaining evidence checks are in
[the review worksheet](docs/case-studies/review.md).
