# Task log — 2026-09-25 (evening)

## To Codex — public API v3 consistency audit (modular, self-contained)

**Assignment: audit the public API and OpenAPI spec against the promise-heart
rule v3, and fix any drift.** Small, bounded, verifiable. Does not touch the
search bar, project pages, methodology page, or timeline.

### Context

- Promise-heart rule v3 (adopted 2026-09-25): one promise = one heart, capacity
  = promise count, no {5,10,20} tiers, no {0,1,2} rewards, no allowance, core
  promise is a label not a gate.
- Canonical promise states: open, active, fulfilled, lapsed, retired.
  Note the wrinkle: v3 publishing *rejects* `active` as ambiguous (relabel
  before publishing), but `active` remains in the canonical vocabulary for
  reads. Document, do not resolve; the canonical `active` treatment is
  Habib's lane.

### Checklist

1. `app/src/lib/openapi-spec.ts` line ~135: the promise-state enum is
   `["open", "fulfilled", "lapsed", "retired"]` — `active` is missing.
   Fix the enum to the canonical five and document the publish-time `active`
   rejection in the field description.
2. Grep the API surface (`app/src/app/api/v1/`, `app/src/lib/public-api.ts`,
   `openapi-spec.ts`) for `reward_hearts` and non-zero `allowance`: none may
   appear in any v3 response. Remove or flag each hit.
3. Confirm every promise object in API responses exposes `source_url`
   (first evidence URL), and that no response still exposes `reward_hearts`.
4. Methodology strings: the API takes an explicit `methodology` param and must
   not default, guess, or mix methodologies. Verify.

### Verification

- Extend the existing API tests (`app/scripts/` — check what covers the v1
  routes) or add a focused test: state enum, no reward fields, source_url
  present. Tests must pass; `npm run typecheck` and `npm run build` must pass.

### Out of scope

- Search bar (in progress separately). Project pages. Methodology page copy.
  Timeline redesign (separate brief, currently on hold). No methodology
  decisions: questions come back to Alex.
