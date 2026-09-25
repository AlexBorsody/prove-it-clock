# Hearts Algorithm v1

**Adopted 2026-09-23 (Alex).** One meter per project: **filled / capacity**.
Partially implemented (arithmetic lib, review pages, DB migration); not in
production. v1 ships as a new methodology version — append-only, diffs public.

## The idea

Capacity comes from the size of the ambition. A new project starts with a
small, explicitly unearned allowance (team + real usage today). Keeping
promises earns hearts, one or two at a time, each defined and evidenced
beforehand. Going quiet without delivering drains the unearned allowance —
announcements can't refill it. Earned hearts never decay with age. The meter
reads full only when the core promise itself is kept.

## Constants (versioned, never per-project)

| Constant | Value |
|---|---|
| `CAPACITY_TIERS` | {5, 10, 20} — locked, no further debate |
| `MAX_ALLOWANCE` | floor(capacity / 5) → 1, 2, 4 |
| `GRACE_YEARS` | 2 (provisional — tested by case studies, not debated) |
| `DECAY_RATE` | 1 heart / year after grace (provisional) |
| `REWARDS` | {0, 1, 2}: 0 = tracked but trivial, 1 = kept promise, 2 = major promise declared upfront |

## Per-project inputs (analyst-set, rationale required, versioned)

**Capacity** — tier nearest the ambition: **20** = rewire global infrastructure;
**10** = own a sector; **5** = niche or single-application promise.

**Starting allowance** `A0` — count 0/1 on each, capped at `MAX_ALLOWANCE`:
- working product used for its stated purpose, last 12 months
- identifiable team/entity actively shipping, last 12 months
- measurable economic activity tied to the promise

Present-tense evidence only. Labeled "unearned" in the UI.

**Promise lineages** — states open / fulfilled / abandoned-retired / superseded.
Each lineage gets a reward {0,1,2} **before** fulfillment, with success criteria
and evidence requirement written down first; never raised retroactively.
A fulfilled-then-abandoned lineage retires its hearts as a separate visible
event — the graph rises at fulfillment and falls at retirement; history is
never rewritten. Supersession continues the lineage (no double count).
Subdivided busywork gets reward 0. One lineage is the **core promise**: it
earns nothing itself, it gates the final heart.

## Computation at time t

```
S(t)         = years since the last fulfillment (or inception, if none)
allowance(t) = A0                          if S(t) ≤ 2
             = max(0, A0 − floor(S(t) − 2)) otherwise
earned(t)    = Σ rewards of fulfilled-and-not-yet-retired lineages at t
filled(t)    = min(capacity, earned(t) + allowance(t))
if core open: filled(t) = min(filled(t), capacity − 1)
```

Display `filled / capacity` with the earned-vs-allowance split visible.
Every point carries provenance (observed / reconstructed / missing).

## Gaming defenses

Open promises pay zero — only fulfillment pays. Subdivided tasks get reward 0,
set by the analyst. Abandoning a fulfilled lineage retires its hearts visibly
and can never improve the meter. Announcements don't touch S(t). Nothing can
exceed capacity; the core gate holds the last heart.

## Valuation: postponed to v2

v1 shows the meter **beside** market cap and lets the market provide the
valuation. No fair-value calculation until the case studies survive scrutiny.

## Case studies

Scored assessments live in [case-studies/](case-studies/) ([BAT](case-studies/bat.md),
[XRP](case-studies/xrp.md)); open methodology questions in
[case-studies/review.md](case-studies/review.md). The illustrative sketches that
used to sit in this doc are retired — the case studies are the examples now.
