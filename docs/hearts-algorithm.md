# Prove-It — Hearts Algorithm v1

**v1, adopted 2026-09-23 (Alex).** Closes the open items in [game_design.md](game_design.md).
Constants are provisional starting defaults — tested by the BAT/XRP case studies,
not debated in the abstract. Nothing here is implemented; the v0.2.0 app is
untouched. When built, this ships as a new methodology version — append-only,
diffs public.

## The idea in one paragraph

Each project has a heart meter: **filled / capacity**. Capacity comes from the
size of the ambition. A new project starts with a small, explicitly unearned
allowance (team + real usage today). Keeping promises earns hearts, one or two
at a time, each defined and evidenced beforehand. Going quiet without delivering
drains the unearned allowance to zero — announcements can't refill it. Earned
hearts stick around: age alone never erases delivered value. The meter reads
full only when the core promise itself is kept.

## Global constants (versioned, never per-project)

| Constant | Value | Why |
|---|---|---|
| `CAPACITY_TIERS` | {5, 10, 20} | Only three meter sizes exist |
| `MAX_ALLOWANCE` | floor(capacity / 5) → 1, 2, 4 | The allowance is always modest next to the ambition |
| `GRACE_YEARS` | 2 | Two quiet years before anything drains |
| `DECAY_RATE` | 1 heart / year after grace | Linear, explainable, no curve-fitting |
| `REWARDS` | {0, 1, 2} | 0 = tracked but trivial, 1 = kept promise, 2 = major promise declared upfront |

Capacity tiers are locked — no further granularity debate. Grace and decay are
provisional defaults; the BAT/XRP case studies test them. Argue about evidence,
not constants.

## Per-project inputs (analyst-set, rationale required, versioned)

**Capacity** — pick the tier nearest the ambition:
- **20** — aims to replace or rewire global infrastructure (money, settlement, world computer)
- **10** — aims to own a sector (oracles, advertising, DeFi plumbing)
- **5** — a niche or single-application promise

Bigger ambition means a bigger meter to fill — never free hearts.

**Starting allowance** `A0` — count 0/1 on each, capped at `MAX_ALLOWANCE`:
- [ ] working product used for its stated purpose, in the last 12 months
- [ ] identifiable team or entity actively shipping, in the last 12 months
- [ ] measurable economic activity tied to the promise (fees, revenue, volume)

Present-tense evidence only. This is the "unearned" slice and it is labeled as such.

**Promise lineages** — reuse the milestone state machine (`open / fulfilled /
abandoned / superseded`, overdue derived). Each lineage gets a reward {0,1,2}
**at publication time**, with its success criteria and evidence requirement
written down first. Rewards are never raised retroactively. A lineage earns while
it is fulfilled. If a fulfilled lineage is later abandoned, its hearts are
retired as a separate visible event — the graph rises at fulfillment and falls
at retirement. History is never rewritten: what was delivered happened. This
keeps historical delivery distinct from current realized utility. Supersession
continues the lineage (no double count). Subdivided busywork gets reward 0 —
it stays on the record for accountability but earns nothing. One lineage is
marked the **core promise**; it earns no hearts itself, it is the gate below.

## Computation at time t

```
S(t)       = years since the last fulfillment (or since inception, if none)
allowance(t) = A0                              if S(t) ≤ 2
             = max(0, A0 − floor(S(t) − 2))     otherwise
earned(t)    = Σ rewards of lineages fulfilled-and-not-yet-retired at t
filled(t)    = min(capacity, earned(t) + allowance(t))
if core promise is not fulfilled: filled(t) = min(filled(t), capacity − 1)
```

A lineage fulfilled at F and abandoned at A contributes its reward on [F, A)
and zero after — two events, both visible: `+1 fulfilled — F`, `−1 retired — A`.

Display `filled / capacity`, with the earned-vs-allowance split visible.
Every point carries its provenance (observed / reconstructed /
methodology-change / missing) per the existing history semantics.

Read the states off the meter:
- **Full hearts** — `filled == capacity`, which requires the core promise kept.
- **Zero hearts** — `filled == 0`: the allowance drained and nothing was ever earned. The unsupported promise is exhausted.

## Worked examples (illustrative only — the case-study researcher works blind to
these numbers; if the methodology disagrees with them, the methodology wins)

**XRP — 2/20.** Capacity 20 (replace SWIFT-scale settlement). Checklist: ledger
live and used ✓, Ripple shipping ✓, measurable volume ✓ → A0 = 3 (cap 4).
Earned: early lineages fulfilled (ledger launch, early pilots) → 2 hearts.
S ≈ 12.7 years since the last kept promise → allowance = max(0, 3 − 10) = 0.
filled = 2 + 0 = **2/20**. Core promise open, so full is unreachable anyway.

**BAT — 3/10.** Capacity 10 (own the attention/advertising sector). Checklist:
Brave + BAT rewards live ✓, team shipping ✓, ad activity ✓ → A0 = 2 (cap 2).
Earned: browser launch, BAT integration → 2 hearts. S ≈ 3 years → allowance =
max(0, 2 − 1) = 1. filled = 2 + 1 = **3/10**.

**BTC (sketch).** Capacity 20. Allowance: product ✓, measurable fees ✓,
identifiable team — analyst call with rationale; say A0 = 2. Earned: fulfilled
lineages (launch, halvings-as-designed, Lightning, institutional rails) with
analyst-set rewards → e.g. 6. S small → allowance intact → **8/20**, core
("become money") open so the meter tops out at 19 until then.

**LINK (sketch).** Capacity 10 or 20 — analyst call (oracle sector vs. financial
infrastructure). Recent fulfillments → allowance intact, earned from kept
lineages (mainnet, staking, CCIP). The meter shows mostly *earned* hearts, which
is exactly the story the old design told with words.

**Newborn project.** S = 0, earned = 0 → filled = A0, all allowance, labeled
"starting allowance — unearned." No ranking bar needed; the split says it.

## Why the gaming defenses hold

- **Promise spam** earns nothing: open promises pay zero; only fulfillment pays.
- **Subdivided tasks** get reward 0, set by the analyst — not the project.
- **Abandoning** a fulfilled lineage retires its hearts as a visible event — the
  fall is on the record, and it can never improve the meter.
- **Announcements** don't touch S(t); only fulfillment resets the clock.
- **Farming** is capped: nothing can exceed capacity, and the core gate holds the last heart.
- **Reward inflation** is blocked: rewards are fixed at publication, in public, with criteria.

## Valuation: postponed to v2

No fair-value calculation in v1. The product shows the meter **beside** market
cap — `BAT — 3/10 delivered — $X market cap` — and lets the market provide the
valuation while Prove-It provides the evidence-based delivery measurement. A
`justified_mcap = (filled/capacity) × potential_value_usd` formula would look
scientific while `potential_value_usd` remains an analyst estimate; it spends
credibility the tape hasn't earned yet. Revisit only after the BAT/XRP case
studies survive scrutiny.

## Locked 2026-09-23

- Capacity tiers {5, 10, 20}: locked. No further granularity debate.
- Grace 2 years, decay 1 heart/year: provisional defaults. Tested by the BAT/XRP
  case studies, not debated in the abstract.
- Core-promise gate on the final heart: kept.
- Fulfilled-then-abandoned: visible rise and fall, never a history rewrite.
- Valuation: postponed to v2 (see above).

## Config mapping (for the build)

- Constants → new `app/src/lib/hearts-config.ts` (versioned with methodology)
- Capacity/allowance/lineage rewards → seed + DB records per the proposed
  `Promise revision` / `Assessment` / `Delivery event` / `Heart snapshot` tables
  in [implementation.md](implementation.md)
- State machine → existing `app/src/lib/milestone-states.ts` (extend lineages
  with `reward` and `is_core_promise`)
- Series provenance → existing `app/src/lib/history-semantics.ts`
- Replaces the v0.3.0 candidate Promise Score formula (`formula-candidate.ts`
  becomes historical)
