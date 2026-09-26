# Promise atlas: the special sauce build

Alex's locked direction (2026-09-26, late night): kill the single 1-10
leaderboard as the headline. The ranking layer becomes the promise atlas
plus per-category rankings, computed from the vector store. Hearts stay
dumb (promise in, heart out) and become drill-down/metadata.

Full background: `~/workspace/your_files/prove-value-index-sauce-question.md`
(the sauce spec, both addenda) and `prove-value-vision.md` (the Index and
the Atlas section, implementation steps 1-8). Read both before building.

## Standing rules (do not break)

- The ledger is sacred: every promise keeps its exact source link.
- No scoring changes. No new meters. No new tabs until the atlas view
  itself ships (this brief authorizes the atlas view only).
- Market data never feeds any score. HYPE is context only.
- No em dashes in public copy. Green = good/kept, red = bad/lapsed,
  grey = neutral/open. App UI, never web. No timestamps, no count labels.
- Everything as components going forward. No monolithic page code.
- Deterministic and reproducible: pin the embedding model, record the
  model version and projection parameters with the methodology string,
  fixed random seeds everywhere.

## What is blocked (do NOT build these yet)

These are methodology, not code. They are with Alex + ChatGPT review.
Build everything below so these can land later without a rebuild.

- Promise-type taxonomy (payments, store of value, inclusion, privacy,
  ...). Habib's lane. Until it lands, grouping is provisional (see phase 4).
- Promise weight definition (function-vector interaction x prominence).
  Until it lands, every promise has weight 1.0. The viz must read weight
  from the API so real weights flow in with no code change.
- The Index itself: I(p,t) = alpha*V + beta*P, alpha/beta, category
  anchors, fulfillment thresholds, time decay. Do not compute the index.
  Do not build the index line graph yet. Phase 5 below is explicitly
  parked pending the review.

## Phase 1: embeddings pipeline

For every promise in the ledger (all 8 published projects), generate one
embedding vector from the promise statement text. Store it server-side
(new Supabase table, e.g. promise_embeddings: promise_id, model,
model_version, vector, created_at). Script it so re-running is idempotent
and so a model change is a versioned migration, not a silent overwrite.
Pin the model; record model + version in the methodology string.

Validation: every scored promise has exactly one vector for the pinned
model version; re-run produces identical vectors.

## Phase 2: similarity + projection API

New read-only endpoint (e.g. /api/atlas) serving:

- nodes: one per promise. Fields: promise id, project, statement,
  state (kept/open/lapsed from the ledger), weight (1.0 provisional),
  source links (already in the ledger, pass through).
- positions: 2D coordinates from cosine similarity between promise
  vectors, projected deterministically (UMAP with fixed seed, or equivalent;
  record algorithm + seed + parameters with the methodology string).
  Promises that mean similar things must cluster together.
- cluster assignment per node from the same projection (provisional
  grouping until the taxonomy lands; label clusters neutrally, e.g.
  "Cluster A", never invented category names).

No scoring in this endpoint. It serves geometry and ledger facts only.

## Phase 3: the atlas view

New view (route of your choice, component-based): every promise in the
ledger as a node.

- Position from the phase 2 projection. Area = weight (uniform for now,
  so uniform circles; the sizing code must still be live for later).
  Color = state: green kept, red lapsed, grey open.
- No edges. No invented relationships. Position, size, and color carry
  all the meaning.
- Click a node: the promise, its source links, its state. Reuse the
  existing promise-detail presentation, do not invent a new one.
- This is the multi-dimensional view: what kinds of promises exist in
  crypto, how they relate, and how fulfilled each region is.

This view ships alongside the existing home view first. It does not
replace the headline yet; the headline swap waits for taxonomy + review.
No leaderboard removal in this phase.

Validation: production build and type checks pass; nodes render for all
8 projects; click-through reaches the exact source link; 320px layout
without horizontal overflow.

## Phase 4: per-project promise constellation (provisional grouping)

On each project page, a constellation: one circle per promise of that
project, area = weight, color = state, grouped by the phase 2 cluster
assignment (provisional; the taxonomy will replace grouping later with
no layout-code change if you key grouping off a `group` field from the
API). D3 circle packing or equivalent. This rhymes with the HYPE bubbles:
one visual language, two instruments.

## Phase 5: PARKED (do not build)

Index computation, the index line graph, per-category ranking views,
split-heart glyph, retiring the single leaderboard as the headline.
These unlock after the methodology review lands. The phases above must
not need rework when they do.

## Sequencing

Phase 1, then 2, then 3, then 4. Validate each phase before moving on.
If anything in the sauce spec or vision doc contradicts this brief, the
brief wins for build order but flag the contradiction in the phase's
validation notes.
