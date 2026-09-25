# Hearts: claim-type rule v2

**Adopted 2026-09-25 (Alex).** Amended 2026-09-25 (Alex): community-promise
rule for founderless protocols ("Where promises come from"). Amended
2026-09-25 (Alex): **unearned allowance removed**; scoring is earned-only.
Historical runs were recalculated without the allowance and republished under
the amended methodology string; original runs remain as an immutable audit
history. One meter per project: **filled / capacity**.
Live in production: append-only runs in Supabase, published via RPC, served by
the site. Methodology string: `hearts claim-type rule v2 (adopted 2026-09-25;
time decay removed; allowance removed 2026-09-25)`.

> Methodology update: free hearts removed. Historical scores recalculated.
> This is not a change in project performance.

## The idea

Capacity comes from the size of the ambition. A new project starts at zero:
every heart on the meter is earned by keeping a promise, one or two at a
time, each defined and evidenced beforehand. **A heart remains earned only while the evidence condition under
which it was awarded remains true**: milestone claims ("shipped mainnet")
are permanent once achieved; ongoing claims ("advertisers are buying ads")
must be revalidated. Scores change because evidence changes, not because time
passes. The meter reads full only when the core promise itself is kept.

## Constants (versioned, never per-project)

| Constant | Value |
|---|---|
| `CAPACITY_TIERS` | {5, 10, 20}: locked, no further debate |
| `MAX_ALLOWANCE` | REMOVED 2026-09-25: was min(3, floor(capacity / 5)) → 1, 2, 3 |
| `REWARDS` | {0, 1, 2}: 0 = tracked but trivial, 1 = kept promise, 2 = major promise declared upfront |

Time-based decay is deliberately absent: no grace period, no per-year drain.
(Adopted 2026-09-25: generic decay killed as arbitrary; see case-studies/review.md.)

## Per-project inputs (analyst-set, rationale required, versioned)

**Capacity**: tier nearest the ambition: **20** = rewire global infrastructure;
**10** = own a sector; **5** = niche or single-application promise. The tier
is assigned from the project's stated vision when its promises are first
carved, and the vision rationale is recorded in the case study. Capacity is
never a default: no project gets 20 by default.
**Starting allowance** `A0`: REMOVED 2026-09-25. Was: count 0/1 on each, capped at `MAX_ALLOWANCE`:
- working product used for its stated purpose, last 12 months
- identifiable team/entity actively shipping, last 12 months
- measurable economic activity tied to the promise

Present-tense evidence only. Labeled "unearned" in the UI.

**Promise lineages**: each lineage is typed at carving:
- **milestone**: "shipped X". Fulfillment is permanent; time cannot unship it.
- **ongoing**: "X is true" (activity, volume, participation). The heart exists
  only while the evidence condition is currently satisfied.

States: open / active / fulfilled / lapsed / retired. A milestone
goes open → fulfilled (permanent). An ongoing claim goes open → active →
fulfilled while the evidence condition holds, and lapses when evidence stops
supporting it: lapsing is reversible, so the graph
can fall and rise again on real events. A fulfilled-then-dead lineage
**retires** its hearts as a separate visible event: the graph rises at
fulfillment and falls at retirement; history is never rewritten. A replaced
promise is recorded as retired with a note pointing at the new lineage (no
double count). Subdivided busywork gets reward 0.
One lineage is the **core promise**: it earns nothing itself, it gates the
final heart.

Each lineage gets a reward {0,1,2} **before** fulfillment, with success
criteria and evidence requirement written down first; never raised
retroactively.

## Where promises come from

The default source is the issuer: the whitepaper, the launch announcement,
the claims the team put in writing. That is what the instrument holds the
project to.

Founderless protocols have no issuer, so the rule adapts: promises can be the
claims the community actually converged on, Schelling points rather than issuer
commitments. A community narrative counts as a promise only if all three hold:

1. **Dominant and long-standing:** the claim has been the shared story for
   years, not a passing meme.
2. **Measurable with real evidence:** there is data that shows the claim
   holding, not just people repeating it.
3. **Broad consensus:** the wider ecosystem converged on it, not one
   marketing team.

Hype alone never qualifies. The bar is deliberately high: the instrument
scores claims people actually rely on, whether an issuer wrote them down or a
community converged on them.

## Computation at time t

```
earned(t)    = Σ rewards of lineages satisfied at t
             = fulfilled milestones (not retired) + active ongoing claims
filled(t)    = min(capacity, earned(t))
if core open: filled(t) = min(filled(t), capacity − 1)
```
(allowance removed 2026-09-25; previously `filled(t) = min(capacity, earned(t) + allowance(t))`)

No clocks, no timers. Display `filled / capacity`, earned hearts only.
Every point carries provenance (observed / reconstructed / missing).

## Shitcoin Score: the verdict

The section keeps the name **Shitcoin Score**, but its output is
categorical, not numeric. It is a delivery-accountability rating, not a
fraud or investment-risk rating. Rule-based, from promise states:

- **No concern**: no retired or lapsed promise on record.
- **Watch**: reserved for verified overdue promises once deadline
  evidence has been researched. No v1 trigger.
- **Delivery concern**: a supporting promise retired or lapsed.
- **Core delivery failure**: the core promise retired or lapsed.

Humans resolve ambiguous evidence. Software picks the category and
templates the explanation from reviewed promise records. CODE and HYPE
never move the verdict directly; USE may support a promise state only
when it measures a predefined promise-specific condition.

## Gaming defenses

Open promises pay zero: only fulfillment pays. Subdivided tasks get reward 0,
set by the analyst. Abandoning a fulfilled lineage retires its hearts visibly
and can never improve the meter. Announcements change nothing: only evidence
does. Nothing can exceed capacity; the core gate holds the last heart.

## Valuation: postponed to v2

v1 shows the meter **beside** market cap and lets the market provide the
valuation. No fair-value calculation until the case studies survive scrutiny.

## Case studies

Scored assessments live in [case-studies/](case-studies/) ([BAT](case-studies/bat.md),
[XRP](case-studies/xrp.md)); the methodology decisions behind them are recorded in
[case-studies/review.md](case-studies/review.md). The illustrative sketches that
used to sit in this doc are retired: the case studies are the examples now.
