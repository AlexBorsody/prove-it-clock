# HYPE news explorer — Codex

Scope: HYPE source visualization and CODE tab beside HYPE. No scoring changes.

Implemented:
- Independent news API for eight configured projects; one-hour cached Google News RSS.
- Daily publication bars, publisher filters, linked headlines, project switcher and show more.
- Safe links, duplicate URL removal, rolling seven-day validation; failed feeds return 503.
- Source coverage clearly separates news from Reddit/Telegram audience sizes and unconnected X.
- OpenAPI contract and stable searchable section. Header heart and section search preserved.
- CODE added beside HYPE; narrow tab layout accommodates seven items.

Checks: TypeScript passed; three focused parser/aggregation/provider-error tests passed.
Real Bitcoin RSS returned 100 articles from 29 publishers. Production build passed. Browser verified real headlines, publisher/day filters and a 320px viewport with no horizontal overflow. Deployment verification pending.

Local issue: primary main is current but port 3101 was serving an older production build.
Its hearts API returns 503: no local SUPABASE_URL / publishable key configured, no env file
or Vercel CLI login available. This is separate from the news API, which needs no DB credentials.
Do not claim that a rebuild fixes missing database access. Muse: configure the approved read-only
Supabase environment in ignored app/.env.local, never in committed docs.

Limit: headline records are fetched live and cached, not persisted history; saved daily numeric
snapshots remain separate. Google RSS is a capped search sample, not comprehensive social volume.
