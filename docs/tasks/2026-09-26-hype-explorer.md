# HYPE news explorer — Codex

Scope: HYPE source visualization and CODE tab beside HYPE. No scoring changes.

Implemented:
- Independent news API for eight configured projects; one-hour cached Google News RSS.
- Daily publication bars, publisher filters, linked headlines, project switcher and show more.
- Safe links, duplicate URL removal, rolling seven-day validation; failed feeds return 503.
- Source coverage clearly separates news from Reddit/Telegram audience sizes and unconnected X.
- OpenAPI contract and stable searchable section. Header heart and section search preserved.
- CODE added beside HYPE; narrow tab layout accommodates seven items.

Checks: TypeScript passed; four focused parser/aggregation/provider-error tests passed.
Real Bitcoin RSS returned 100 articles from 29 publishers. Production build passed. Browser verified real headlines, publisher/day filters and a 320px viewport with no horizontal overflow. Deployment verification pending.

Local issue: primary main is current but port 3101 was serving an older production build.
Port 3101 has now been restarted from synced main using Next dev (hot reload), and its news API verified with 100 articles / 29 publishers plus a 404 for unknown projects. Its hearts API still returns 503: no local SUPABASE_URL / publishable key configured, no env file
or Vercel CLI login available. This is separate from the news API, which needs no DB credentials.
Do not claim that a rebuild fixes missing database access. Muse: configure the approved read-only
Supabase environment in ignored app/.env.local, never in committed docs.

Limit: headline records are fetched live and cached, not persisted history; saved daily numeric
snapshots remain separate. Google RSS is a capped search sample, not comprehensive social volume.

BAT browser check caught unrelated stories matched through publisher site navigation. The parser now requires a project name in the headline before counting a mention; this deliberately omits indirect mentions. Cache key bumped.

Muse owns the upcoming modular component refactor (per Alex). Reuse `/api/v1/mentions/{slug}`
and pure `hype-mentions.ts` aggregations for project-specific views; the current explorer owns
its selector state. Codex will review that refactor afterward; no competing refactor started.

Merge note: fc118a3 added the modular-card brief but also reversed the six tracked integration files from ea19b2d. Preserved its new brief and retained the HYPE explorer wiring, CODE tab, mobile styles and OpenAPI endpoint to avoid removing the shipped feature.

Sync follow-up: 38980f8 again removed the six HYPE/CODE integration changes while adding semantic-section guidance. Restored only those reviewed removals; retained all new task guidance. Please pull current main before committing shared UI files. Vercel deployment 408da0f had been verified with populated publisher/day charts and corrected BAT headlines.
