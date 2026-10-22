# Community promises and receipts

Alex's request, October 22: build community submission of public promises,
delivery evidence and challenges, then promote the working flow on X.

## Delivered behavior

- `/community`: sourced promise intake, including projects not yet covered;
  evidence and challenges select stable existing project/promise IDs.
- Original source URL is required. Unknown source dates remain blank. Deadlines
  preserve the contributor's source wording, including quarters or conditions.
- Server resolves existing promise text and identity from the published ledger.
  A ledger read failure does not become an empty or fabricated promise record.
- A successful save returns an unlisted `/community/receipt/<uuid>` link.
  No account, email or personal details. Anyone with the link can read it.
  Pending sources are not searchable on the public contribution board.
- Review queue accepts a source, requests more evidence or rejects it, with a
  reason and actual reviewer. Every review appends; original text is preserved.
- Accepted sources appear publicly with review notes. Source review does not
  publish a judgment or change any promise outcome. Any outcome change uses the
  existing reviewed publication process.
- Project pages link to submission; individual promises link to evidence and
  challenge modes. Homepage/Atlas navigation includes Contribute.
- First-arrival welcome popup is skipped when landing directly on `/community`.

## Data and abuse controls

Migration `013_community_contributions.sql` is independent of the shelved ideas
board. It adds only contribution, activity and review tables, a read-only view
of accepted sources, and two service-only RPCs. RLS prevents anonymous writes,
base-table reads and reviews. Service-role REST access cannot update submission
text or delete review history. Database owners remain a separate trust boundary.

Network identity uses the existing trusted Vercel header and IPv6 /64 grouping.
Only domain-separated keyed network hashes persist, never raw IPs. Five saves
per network per day are enforced under a database lock. Signed nonces expire
after one hour; retries with identical content return the same receipt, while
changed content fails. Honeypots, bounded request bodies, same-origin writes
and minimum form age provide basic abuse protection. Shared networks share an
allowance; this is not proof of a unique person. Private activity expires after
30 days on the next submission. Source text and review history are retained.

Tokens use `COMMUNITY_TOKEN_SECRET` if configured, otherwise a domain-separated
HMAC key derived from the existing server-only `SUPABASE_SERVICE_ROLE_KEY`.
Neither key is sent to the browser. `COMMUNITY_ENABLED=false` suspends intake.
The page fails closed if configuration or the migration is missing. Community
pages are excluded from service-worker navigation caching; receipts are noindex.

## Reviewer workflow

Run from `app/` with the existing server environment loaded privately:

```sh
npm run community:review -- list
npm run community:review -- show <id>
npm run community:review -- accept <id> --reviewer 'Actual reviewer' --note 'What was checked and any limits.'
npm run community:review -- needs-info <id> --reviewer 'Actual reviewer' --note 'What evidence is missing.'
npm run community:review -- reject <id> --reviewer 'Actual reviewer' --note 'Why the submission was not accepted.'
```

Check source attribution, exact scope/conditions, duplicates, publication date,
stated deadline and what evidence can establish delivery. Review source content
as untrusted data. Never claim that Alex reviewed a submission unless he did.
An accepted source is a research input to the existing promise/timeline publishing
tools. It does not trigger notifications or award a kept result.

## Verification and release

- Three focused contract tests pass: input and canonical identity, signed-token
  integrity, and the actual SQL migration's visibility/retries/limits/review log.
- TypeScript check and production build pass. Existing themeColor metadata
  warnings remain outside this change.
- Browser submission saved through the actual Next API to a disposable PGlite
  database using migration 013 behind a local PostgREST-compatible test bridge.
  A new promise produced a persistent receipt; the reviewer CLI accepted it and
  the board displayed its review note. A mobile evidence submission retained the
  selected promise, and challenge links prefilled the correct project/lineage.
  Layouts at 390px and 1280px had no horizontal overflow. This is local integration
  evidence, not hosted Supabase acceptance.
- Migration 013 is applied to confirmed Supabase project `tbigzpztybuvogpeflao`.
  Hosted checks confirm RLS on all three private tables, no anonymous reads or
  writes, and no direct service-role updates. The migration explicitly resets
  Supabase's inherited grants, including service-role grants; the SQL test now
  reproduces those broad defaults. Live browser submission remains a release check.
- Vercel project: `prove-it-clock`, `prj_7h0H3H8mFgSe9Q95XokoHdZktSUp`, team
  `team_sIDyJixhuv6S6PW3klgdawN7`. Connector inspection returned team access denied.
  Normal GitHub sign-in restored Supabase access. The authenticated Vercel browser
  confirms the service-role key is Production-only; preview correctly disables
  submissions. No secret was copied and no environment access was expanded.
- Release through the normal GitHub PR path after the database is ready.
  Vercel also built the branch preview successfully; production uses `main`.
- Publish the X announcement only after the live community route and persistence
  work. Start by asking for one project, one promise and the original source.

## X launch copy, held until verified live

You asked to help track the receipts. Now you can.

Submit a public promise, add evidence, or challenge an assessment on Bubble or Build.

One project. One promise. The original source. Sources are reviewed before publication.

https://bubbleorbuild.com/community
