# Alex / Muse review — first task

**2026-09-24.** Add answers in the decision column. No need to answer in chat.
The adopted formula/constants stay unchanged until Alex records a decision.

## Progress

- [x] Record candidate criteria before arithmetic (`c957950`).
- [x] BAT: first primary-source pass, fulfillment/regression judgments and conditional arithmetic.
- [x] XRP: first primary-source pass, customer-use/exit judgments and conditional arithmetic.
- [x] Identify unresolved rules without silently selecting an interpretation.
- [ ] Resolve questions below; complete evidence gaps listed in each worksheet.
- [ ] Independently replicate research blind to the example scores.
- [ ] Accept the inputs and exact dated transitions.
- [ ] Implement the approved case-study pages and test them; no UI changes yet.
- [ ] Alex/Muse sign off both pages before moving to further features or BTC/LINK.

## Questions requiring a decision

| ID | Question and concrete consequence | Suggested treatment, not adopted | Alex decision / Muse evidence |
| --- | --- | --- | --- |
| Q1 | Does every fulfillment restore decayed allowance, including zero-reward tasks, a core event, or a same-lineage upgrade? BAT self-custody and XRP corridor expansion expose this | Explicitly enumerate qualifying reset events before scoring; never reset from an announcement | Pending |
| Q2 | What counts as one lineage? BAT payout upgrade may overlap ad rewards; multiple XRP customers may share one bridge-use promise | Group by promised outcome; record platform/customer coverage inside it; justify any separate award | Pending |
| Q3 | How does partial loss affect a lineage? iOS earning/tipping stopped; MoneyGram stopped while other XRP customers remained | Record scope loss without automatically retiring the whole lineage; define when the original acceptance criterion no longer holds | Pending |
| Q4 | What does reward fixed “at publication” mean for promises delivered before Prove-It existed? | Historical rewards should be explicitly retrospective and frozen at our assessment publication; never pretend assigned in 2017 | Pending |
| Q5 | Does the present-tense allowance refresh per assessment, and how is it reconstructed historically? | Require as-of checklist evidence; do not apply today's team/use status backward | Pending |
| Q6 | What evidence is enough for fulfillment and continuing use: issuer release, customer statement, functional test, actual payout? | Preserve evidence type; corroborate material claims; missing evidence stays unknown | Pending |
| Q7 | What proves the core, and can the finite reward inventory actually fill capacity? Current candidate inventories cannot fill their meters even with core success | Define measurable core criteria and coherent reward coverage without adding busywork or changing locked tiers | Pending |
| Q8 | Does “years” mean calendar anniversaries or a fixed day count? `floor(S−2)` makes the first loss at three years, not immediately after two | Specify UTC boundary semantics and accept boundary fixtures below | Pending |
| Q9 | Can this non-blinded first pass count as sufficient review, or is independent blinded replication required? | Preserve non-blinded label. A blinded brief must omit examples; this reviewer cannot unsee them | Pending |

## Paper tests for the existing formula

These are fictional inputs, not BAT/XRP ratings. They can be checked manually;
no test framework or application code has been added.

| Test | Input | Expected from the written formula |
| --- | --- | --- |
| Grace boundary | `A0=2`, earned 0, `S=2` | Allowance/filled 2 |
| Just beyond grace | Same, `S=2.9` | Still 2, because floor(0.9)=0 |
| First full decay step | Same, `S=3` | Allowance/filled 1 |
| Exhaustion | Same, `S=4` | Allowance/filled 0 |
| Fulfillment reset | Previously exhausted `A0=2`; new reward 1; `S=0` | Filled 3, including two restored allowance hearts |
| Zero-reward reset ambiguity | Same exhaustion; a zero-reward lineage newly fulfilled | Either 2 or 0 depending on Q1; test must remain unresolved until decided |
| Core clipping | Capacity 5, earned 4, allowance 1, core open | Filled 4 despite raw components totaling 5; show clipping explanation |
| Retirement | Allowance 0; one fulfilled reward-2 lineage retired at A | Earned 2 immediately before A; 0 at A; retain historical +2 and −2 events |
| Announcement | New partnership, no qualifying fulfillment | No reward and no recency reset |
| Unknown | Current evidence unavailable | Review-required/unavailable; never manufacture filled 0 |

## Handoff and testing boundaries

Worksheets contain sources, analyst judgments, date precision and gaps. They are
review inputs, not schema migrations, seed replacements or live app content.
The UI deliverable from the September 23 task remains open: earlier instructions
require planning before code, and these unresolved rules affect its numbers.
Do not lift conditional arithmetic into production as an accepted rating.

Muse can review sources and annotate this file now. Once decisions are recorded,
Codex can turn accepted transitions into reproducible backend fixtures and the
shared page/API contract. Assign cloud work only after choosing a bounded task
and avoiding overlapping files. No other agent has been contacted or assigned.
