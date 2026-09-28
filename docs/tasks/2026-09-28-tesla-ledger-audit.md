# Tesla Promise Ledger — Editorial Research Audit

**Date:** 2026-09-28
**Ledger:** `/tmp/pv-final/app/data/stocks/tesla-ledger.json` (read-only; no edits made)
**Scope:** 8 lineages, 29 events. Research only: primary-source verification, fulfillment-test proposals, correction recommendations.
**Method:** Web research with primary-source preference (Tesla IR, SEC EDGAR, full earnings-call transcripts). Secondary outlets (Motley Fool, Electrek, Teslarati, StockTitan, BotInfo, Gadgets360, Economy Watch, ESS News, Utility Dive, Tesla Oracle, TeslaNorth, a GitHub blog) were treated as leads, not evidence.

## Global findings

1. **Zero fulfillment tests stored.** Not one lineage has a predefined measurable test. Every assessment grades against an unstated bar — a direct violation of the ledger's own rule (test written *before* grading).
2. **Sources are overwhelmingly secondary.** The ledger cites Economy Watch, StockTitan, Motley Fool, Electrek, Teslarati, BotInfo, Gadgets360, ESS News, Utility Dive, Tesla Oracle, TeslaNorth, and a GitHub-hosted blog as if they were the record. For most facts, primary sources exist and are cited in this report.
3. **A dating error** (robotaxi evidence dated before the deadline passed).
4. **A missing revision event** (Model 3 5,000/week — the assessment refers to a reset target that never appears in the chain).
5. **Metric substitution in assessments** (Cybertruck graded on deliveries against a production-start claim; 2023 graded on deliveries against an originally production-framed target without recording the shift).
6. **One lineage likely fails the promise-qualification bar entirely** (Optimus — doubly-hedged aspirational wording, plus wrong venue/date attribution).

---

## Lineage 1: 2025-delivery-guidance — "2025 vehicle delivery guidance and revisions"

### Ledger says
Musk said 2025 deliveries could rise "as much as 30%" (Q3 2024 call, Oct 23, 2024); revised to "return to growth" (Q4 2024 deck, Jan 29, 2025); withdrawn (Q1 2025 release, Apr 22, 2025). Actual: 1,636,129 delivered in 2025, down 8.6%. Assessment: **missed**.

### Primary sources
- Q3 2024 earnings call transcript (Oct 23, 2024): Musk's "20–30%" 2025 growth figure. Best locator: full call transcript (ir.tesla.com webcast archive; transcript mirrors via Nasdaq/Shacknews).
- Q4 2024 shareholder deck (Jan 29, 2025): "With the advancements in vehicle autonomy and the introduction of new products, we expect the vehicle business to return to growth in 2025." (digitalassets.tesla.com TSLA-Q4-2024-Update.pdf)
- Q1 2025 earnings release (Apr 22, 2025): "It is difficult to measure the impacts of shifting global trade policy on the automotive and energy supply chains, our cost structure and demand for durable goods and related services. We will revisit our 2025 guidance in our Q2 update." (Tesla IR press release)
- Tesla Q4 2025 production & delivery report (Jan 2, 2026): 1,636,129 delivered in 2025 vs 1,789,226 in 2024, down 8.6%. (ir.tesla.com press release)

### Recommendation
The revision chain is sound, but the methodology needs an explicit rule: **a withdrawn claim is not the same as a missed claim.** The final operative statement was retracted mid-year and never reinstated. Recommend grading this lineage as **withdrawn** (promise retracted before the deadline) rather than "missed," with the outcome noted as context. If the ledger insists on grading the last operative claim, apply the test below.

### Proposed test
"Under the final operative claim (return to growth in 2025), Tesla delivers more vehicles in 2025 than the 1,789,226 delivered in 2024." Result: 1,636,129 → missed; claim itself withdrawn.

---

## Lineage 2: 2023-delivery-guidance — "2023 vehicle delivery guidance"

### Ledger says
Claim stated 2023-01-25 (Q4 2022 call): guided to ~1.8M vehicles **produced** in 2023; Musk "reiterated the 1.8M **delivery** target" on the Q3 2023 call (2023-10-18); assessed **fulfilled** on 1,808,581 deliveries.

### Primary sources
- Q4 2022 shareholder deck (Jan 25, 2023), Outlook/Volume section: *"For 2023, we expect to remain ahead of the long-term 50% CAGR with around 1.8 million vehicles for the year"* — placed in a paragraph about growing **production** as quickly as possible. (Tesla-hosted deck PDF; identical wording carried in later decks.)
- Q4 2022 earnings call, Jan 25, 2023 (transcript): analyst Rod Lache: *"it sounds like your 1.8 million unit volume indication for this year is somewhat more supply constrained than demand-constrained."* Musk: *"our internal **production potential** is actually closer to 2 million vehicles, but **we were saying 1.8 million** because, I don't know, there just always seems to be some freaking force majeure thing that happens somewhere on earth... if it's a smooth year, actually, without some big supply chain interruption or massive problem, we actually have the potential to do 2 million cars this year."*
- Q3 2023 earnings call, Oct 18, 2023 (transcript): Musk opening remarks: *"we continue to target expect to have **around 1.8 million vehicle deliveries** as stated earlier this year."*
- Q4 2023 earnings call, Jan 24, 2024 (transcript): Musk: *"We achieved a record **production and deliveries** of over 1.8 million vehicles, **in line with our official guidance**"* — Tesla itself framing both metrics as covered.
- Actuals (Q4 2023 deck operational summary, verified in the Tesla PDF at https://digitalassets.tesla.com/tesla-contents/image/upload/IR/TSLA-Q4-2023-Update.pdf): 2023 production **1,845,985**, deliveries **1,808,581**. Both clear 1.8M.

### Recommendation
The ledger's "guided to ~1.8M vehicles PRODUCED" is **correct for the original statement** — Musk anchored 1.8M to production potential, and the deck's sentence sits in a production paragraph. But the ledger then silently grades a production statement on deliveries. That is only defensible because **Tesla itself moved the target**: Musk re-framed it as 1.8M *deliveries* on Oct 18, 2023. Record the lineage evolution explicitly (production target Jan 2023 → restated as deliveries target Oct 2023 → met at 1,808,581 deliveries) instead of grading across an unrecorded shift. Either way the outcome stands — both metrics cleared 1.8M — so the fulfilled assessment is safe under either framing. Note in the ledger: Musk never said "commit" ("we're saying 1.8 million" + explicitly "not committing to [2M]") — the 1.8M was guidance, not a commitment. Caveat: the Tesla-hosted Q4 2022 deck PDF itself would not load directly during research; the deck sentence rests on verbatim quotes in coverage plus the identically-worded later decks, with the production framing independently confirmed by Musk's on-call words.

### Proposed test
"Tesla produces at least 1.8 million vehicles in 2023 (original framing), or delivers at least 1.8 million vehicles in 2023 (restated Oct 2023 framing)." Result: 1,845,985 produced / 1,808,581 delivered → fulfilled under both.

---

## Lineage 3: 2024-delivery-guidance — "2024 vehicle volume growth guidance"

### Ledger says
Claim stated 2024-01-24 (Q4 2023 deck/call): 2024 vehicle volume growth "may be notably lower" than 2023's ~38%. Actual: 1,789,226 delivered in 2024, down 1.1%. Assessment: **fulfilled** ("not just notably lower, it turned negative").

### Primary sources
- Q4 2023 shareholder deck, Outlook p.12, Jan 24, 2024 — verified directly in the Tesla PDF (https://digitalassets.tesla.com/tesla-contents/image/upload/IR/TSLA-Q4-2023-Update.pdf): *"Our company is currently between two major growth waves: the first one began with the global expansion of the Model 3/Y platform and the next one we believe will be initiated by the global expansion of the next-generation vehicle platform. **In 2024, our vehicle volume growth rate may be notably lower than the growth rate achieved in 2023, as our teams work on the launch of the next-generation vehicle at Gigafactory Texas.**"*
- It says **"vehicle volume,"** not "deliveries" — deliberately generic; in Tesla deck usage "volume" covers production and deliveries.
- Baselines (Tesla primary figures): 2022 deliveries 1,313,851 (Tesla P&D release, Jan 2, 2023); 2023 deliveries 1,808,581 (Q4 2023 deck) → 2023 delivery growth = **37.7%** (ledger's "~38%" checks out); 2023 production growth = 34.8%. 2024: production **1,773,443**, deliveries **1,789,226** (Tesla IR P&D release, Jan 2, 2025: http://ir.tesla.com/press-release/tesla-fourth-quarter-2024-production-deliveries-and-deployments) → 2024 delivery growth = **−1.07%**; production growth = −3.9%.

### Recommendation
The ledger's **fulfilled** assessment is fair: 2024 volume didn't just grow slowly, it shrank (−1.1% deliveries, −3.9% production), satisfying "notably lower" under any reasonable reading on either metric. Record these caveats:
- The statement was hedged ("**may** be notably lower") — a cautionary warning, not a firm target. Fine to grade per the qualification framework, but preserve the hedging word.
- "Notably" was never defined by Tesla, so the ledger must adopt its test definition explicitly and note it was applied retrospectively.
- "Vehicle volume" is ambiguous (production vs deliveries); the ledger grades on deliveries while citing "~38%" (the delivery growth rate) — internally consistent, but the metric must be stated in the test.

### Proposed test
"Tesla's 2024 full-year vehicle delivery growth rate is below 2023's 37.7% delivery growth rate by a notable margin — defined as a 2024 growth rate of less than half the 2023 rate (≤18.9%)." Result: −1.1% → fulfilled, by a wide margin.

---

## Lineage 4: robotaxi-one-million-2020 — "One million robotaxis by end of 2020"

### Ledger says
Claim stated 2019-04-22 (Autonomy Day): "over a million robotaxis on the road" by 2020 (sourced to The Drive). Evidence dated **2020-10-01**: "no robotaxi fleet existed by end of 2020" (sourced to a 2026 GitHub blog). `claim_revised` dated 2025-06: Austin pilot "restarted the lineage." Assessment: **missed**.

### Primary sources
- **Claim:** Tesla's official Autonomy Day recording: https://www.youtube.com/watch?v=Ucp0TTmvqOE (Tesla's channel; robotaxi prediction at ~3:14:03). Exact quote, contemporaneously transcribed at the event (TechCrunch, Apr 22, 2019, https://techcrunch.com/2019/04/22/tesla-plans-to-launch-a-robotaxi-network-in-2020/), Elon Musk: **"From our standpoint, if you fast forward a year, maybe a year and three months, but next year for sure, we'll have over a million robotaxis on the road. The fleet wakes up with an over the air update; that's all it takes."** Nuance: the formulation was OTA-enabled customer cars plus a Tesla-owned fleet, with regulatory caveats ("not in all jurisdictions because we won't have regulatory approval everywhere").
- **End-of-2020 negative evidence:** Tesla's own Q4/FY2020 earnings call webcast, **Jan 27, 2021** (full transcript: https://www.nasdaq.com/articles/tesla-tsla-q4-2020-earnings-call-transcript-2021-01-28). Musk described FSD as a **supervised beta with "almost 1,000 people in the beta,"** with investors asking for milestones "to evolve current FSD to a commercial Level 4, Level 5 ridesharing solution." A commercial robotaxi network plainly did not exist at end of 2020 — documented in Tesla's own post-deadline disclosure. (Note: Nasdaq/Barchart/MarketBeat transcripts are mirrors of Tesla's webcasts — primary-adjacent, acceptable.)
- **Austin launch:** **June 22, 2025.** Reuters dateline Austin (https://www.reuters.com/business/autos-transportation/tesla-tiptoes-into-long-promised-robotaxi-service-2025-06-22/): ~10–20 Model Ys, invite-only, geofenced South Austin, $4.20 flat fee, Tesla "safety monitor" in the front passenger seat, 6am–midnight. Announced via Musk's X post, not a Tesla IR press release; Reuters is the strongest dated contemporaneous record.
- **New 2025 targets (new claims, not revisions of 1M-by-2020):** (1) Q4 2024 call, Jan 29, 2025: "Unsupervised Full Self-Driving as a paid service in Austin in June" (met only in supervised form); (2) Q1 2025 call, Apr 22, 2025: "millions of Teslas operating fully autonomously in the second half of next year" (H2 2026); (3) Q2 2025 call, Jul 23, 2025: "autonomous ride-hailing in about half the population of the US by the end of the year" (end-2025).

### Recommendations
1. **Redate the evidence event to 2021-01-27** and re-source to Tesla's own Q4 2020 earnings call. The 2020-10-01 date is indefensible (the deadline had not yet passed), and the 2026 GitHub blog is not a source for a contemporaneous fact — drop it.
2. **Fix the claim event source:** swap The Drive for the Tesla official video URL + the TechCrunch contemporaneous quote.
3. **"Target revision" is the wrong semantics for June 2025.** Tesla never revised 1M-by-2020 into a new number + new deadline. The Austin launch is a partial, ~4.5-years-late fulfillment milestone (10–20 supervised, invite-only vehicles vs 1M). Record it as an **evidence/context event**, not `claim_revised`. The original 2019 claim stays **missed**.
4. **Start a new claim lineage** for the three 2025 targets above rather than folding them into the 2019 lineage as revisions.

### Proposed test
"At least 1,000,000 Tesla robotaxis are operating on public roads without a safety driver by 2020-12-31." Result: ~0 → missed.

---

## Lineage 5: model3-5000-per-week — "Model 3 at 5,000 vehicles per week"

### Ledger says
Claim stated 2017-08-02: 5,000 Model 3s/week by Q4 2017. Evidence 2018-07-02 (Tesla IR): 5,031 Model 3s in the final 7 days of Q2 2018. Assessment: **fulfilled, late** — "the reset end-of-Q2 2018 target was met." **No `claim_revised` event exists in the chain** — the assessment refers to a target that is absent from the record.

### Primary sources
- **Original claim:** Tesla "Second Quarter 2017 Update" shareholder letter, filed as **Exhibit 99.1 to 8-K on Aug 2, 2017** — SEC EDGAR: https://www.sec.gov/Archives/edgar/data/1318605/000156459017014920/tsla-ex991_90.htm — **"Based on our preparedness at this time, we are confident we can produce just over 1,500 vehicles in Q3, and achieve a run rate of 5,000 vehicles per week by the end of 2017."** (Ledger's 2017-08-02 date confirmed correct.)
- **Missing revised target (found):** Tesla "Fourth Quarter and Full Year 2017 Update" letter, published **Feb 7, 2018**; letter text quoted verbatim in Tesla's Feb 9, 2018 8-K — SEC EDGAR: https://www.sec.gov/Archives/edgar/data/1318605/000156459018001786/tsla-8k_20180209.htm — **"We continue to target weekly Model 3 production rates of 2,500 by the end of Q1 and 5,000 by the end of Q2. It is important to note that while these are the levels we are focused on hitting and we have plans in place to achieve them, our prior experience on the Model 3 ramp has demonstrated the difficulty of accurately forecasting specific production rates at specific points in time."**
- **Intermediate revision (ledger skips it):** Q3 2017 letter, Nov 1, 2017: "we currently expect to achieve a production rate of 5,000 Model 3 vehicles per week by late Q1 2018" (primary: Q3 2017 update letter / 8-K exhibit; verified via secondary case-study text only).
- **Outcome:** Tesla Q2 2018 production release, Jul 2, 2018 (Tesla IR): 5,031 Model 3s produced in the final 7 days of Q2 2018. (http://ir.tesla.com/press-release/tesla-q2-2018-vehicle-production-and-deliveries)

### Recommendations
1. **Add the missing `claim_revised` event: date 2018-02-07**, source Tesla Q4 & Full Year 2017 Update Letter (published via Tesla IR Feb 7, 2018; text on record in the Feb 9, 2018 8-K at the EDGAR URL above). New target: "5,000 Model 3s/week by end of Q2 2018," superseding the Aug 2017 "end of 2017" target.
2. **Optionally add the 2017-11-01 intermediate revision** ("late Q1 2018," Q3 2017 letter) so the chain reads end-of-2017 → late-Q1-2018 → end-of-Q2-2018 → met. It is the honest lineage; the current ledger skips a step.
3. **Keep the assessment** "fulfilled, late": 5,031 in the final 7 days of Q2 2018 meets the revised (Feb 2018) target, not the original (Aug 2017) one.

### Proposed test
"Original: Tesla produces at least 5,000 Model 3s in a rolling 7-day period by 2017-12-31. Revised (Feb 7, 2018): Tesla produces at least 5,000 Model 3s in a rolling 7-day period by 2018-06-30." Result: original missed; revised fulfilled (5,031 in the final 7 days of Q2 2018).

---

## Lineage 6: energy-storage-2025-growth — "Energy storage deployments to grow at least 50% in 2025"

### Ledger says
Claim stated 2025-01-29 (Q4 2024 call): storage deployments to grow "at least 50%" in 2025, from 31.4 GWh to ≥47.1 GWh. Actual: 46.7 GWh in 2025 (+48.7%). Assessment: **missed**, narrowly.

### Primary sources
- Q4 2024 earnings call, Jan 29, 2025 (transcript): Musk — "The company expects storage deployments will grow at least 50% this year." (Full transcript; ir.tesla.com webcast archive.)
- Tesla Q4 2025 production & delivery report (Jan 2, 2026): 46.7 GWh deployed in 2025. (ir.tesla.com press release)

### Recommendation
Chain is sound; the assessment is arithmetically correct (46.7 < 47.1). Only upgrades needed: replace the secondary sources (Utility Dive, StockTitan) with the primary call transcript and P&D release, and store the test below.

### Proposed test
"Tesla deploys at least 47.1 GWh of energy storage in calendar 2025 (at least 50% growth over 31.4 GWh in 2024)." Result: 46.7 GWh (48.7% growth) → missed, narrowly.

---

## Lineage 7: optimus-production-2023 — "Optimus robot production starting in 2023"

### Ledger says
Claim stated 2022-09-30 at Tesla AI Day: "Musk said Optimus production could start in 2023" (conditional "could"). Evidence 2026-01-28: still R&D phase, no useful work. Assessment: **missed**.

### Primary sources
- **Attribution problem.** At AI Day itself (Sept 30, 2022), Musk did **not** restate a 2023 production commitment — event coverage focuses on the prototype reveal and a "$20,000 at scale" / sale "in three to five years" horizon. The clean, quotable statement predates AI Day by nearly six months: at the **Cyber Rodeo (Giga Texas opening), April 7, 2022**, Musk said: **"I think we have a shot at being in production for version 1 of Optimus hopefully next year."** (via Electrek transcript, https://electrek.co/2022/04/07/tesla-production-optimus-humanoid-robot-2023/; corroborated by TheDrive. A full primary AI Day 2022 transcript containing a 2023-production commitment could not be located; TorqueNews paraphrased "production due to start in 2023" but that is a paraphrase, not a quote.)
- **Current status:** Q4 2025 earnings call, **January 28, 2026** — Musk: **"Well, we are still very much at the early stages of Optimus. It's still in the R&D phase. We have had Optimus do some basic tasks in the factory. But as we iterate on new versions of Optimus, we deprecate the old versions. It's not in usage in our factories in a material way. It's more so that the robot can learn. We wouldn't expect to have any kind of significant Optimus production volume until probably the end of this year."** (Full transcript: https://www.shacknews.com/article/147609/tesla-tsla-q4-2025-earnings-call-transcript.) The ledger's status fact is confirmed: no production in 2023, still R&D in Jan 2026.

### Recommendation — DOWNGRADE to "not-a-promise / insufficient commitment"
The verbatim statement is doubly hedged: "**a shot at**" + "**hopefully** next year." That is speculative optimism ("I hope this happens"), not a documentable commitment ("we will do X by date Y"). Under a methodology requiring durable, project-specific, documentable commitment, this fails the bar. Compare the Cybertruck lineage's "We do expect production to start sometime this summer" — still hedged, but a stated expectation. "I have a shot at it hopefully" is a wish, not a promise.
1. **Primary: downgrade to non-promise** — record as an aspirational statement with the exact quote and corrected date (2022-04-07, Cyber Rodeo — not AI Day 2022), excluded from scoring. The statement never met the commitment threshold.
2. Fallback (if kept): flag with a qualification caveat — "conditional wording; measured against a statement that was never a commitment" — and correct the venue/date.

### Proposed test (only if retained as a promise)
"If retained: Tesla begins Optimus production (at least one unit produced outside prototype/R&D use) in calendar 2023." Result: none → missed. (But the primary recommendation is to exclude it as a non-promise.)

---

## Lineage 8: cybertruck-production-2023 — "Cybertruck production starting summer 2023"

### Ledger says
Claim stated 2023-01-25 (Q4 2022 call): "production would start in summer 2023, with volume production in 2024." Evidence: first **customer deliveries** Nov 30, 2023. Assessment: **missed** — "the summer 2023 production start slipped."

### Primary sources
- **Original statement — verified.** Q4 2022 earnings call, Jan 25, 2023 (transcript, e.g. https://www.barchart.com/story/news/13613115/tesla-tsla-q4-2022-earnings-call-transcript). Investor: "Is Cybertruck production still on track for mid-year?" Musk: **"We do expect production to start, I don't know, maybe sometime this summer. But I always like try to downplay the start of production because the start of production is always very slow. It increases exponentially, but it's always very slow at first. I wouldn't put too much stock in start of production. It's kinda when does volume production actually happen, and that's next year."** Lars Moravy (VP Vehicle Engineering) added equipment installation was underway at Giga Texas with "the ramp will really come 2024." The shareholder deck stated "Cybertruck remains on track to begin production later this year." **Two distinct sub-claims:** (i) production start summer 2023, (ii) volume production in 2024.
- **First build — verified.** Tesla's official X account, **July 15, 2023: "First Cybertruck built at Giga Texas! 🤠"** (corroborated contemporaneously by AP: https://techxplore.com/news/2023-07-tesla-1st-electric-pickup-line.html). Summer 2023 = June 21 – September 22; July 15 is squarely inside it. First production unit off the line is the industry-standard measure of start of production.
- **Mid-2023 status per Tesla:** Q3 2023 shareholder deck (Oct 18, 2023): "At Gigafactory Texas, we began **pilot production** of the Cybertruck, which remains on track for initial deliveries this year"; installed annual capacity >125,000; first customer deliveries Nov 30, 2023.
- **Volume production 2024 — the follow-through:** Cox Automotive estimates ~**39,000** Cybertrucks delivered in 2024 (Tesla does not break out model-level deliveries) vs >125,000 installed annual capacity; 2025 fell to ~20,200. A March 2025 NHTSA recall filing covering 46,096 trucks built through March 21 corroborates the ramp never got far.

### Recommendations — three items
1. **The current "MISSED" assessment measures the wrong thing.** Two independent problems: (a) Musk himself said not to measure by start of production ("I wouldn't put too much stock in start of production") and did not promise a delivery date — he promised production start. Grading production-start against first-delivery (Nov 30) silently redefines the claim. (b) The claim's own primary test was satisfied: first production Cybertruck built July 15, 2023, within summer 2023.
2. **Split the sub-claims and assess separately:**
   - **Sub-claim 1 (production start summer 2023) → MET.**
   - **Sub-claim 2 (volume production in 2024) → define a test; evidence points to missed.** Musk gave no volume number, so this needs a defined threshold to be gradable. Proposed: *"By end of 2024, Cybertruck exits production ramp — operationally defined as either (a) Tesla declaring volume production in a shareholder letter/call, or (b) ≥100,000 units produced in calendar 2024, or (c) an exit quarterly run-rate ≥100,000/year."* Evidence (~39k delivered in 2024, no volume-production declaration, ~46k cumulative builds through Mar 2025) fails under any of these. Disclose honestly: sub-claim 2 is vaguer than sub-claim 1, and the threshold is the ledger's own instrument-design choice.
3. **Promise qualification:** "We do expect production to start, I don't know, maybe sometime this summer" is hedged, but "We do expect" is a genuine forward expectation on an official earnings call, repeated in the deck ("remains on track to begin production later this year") — it clears the documentable-commitment bar as a stated corporate expectation. **Keep as a promise.**

### Proposed tests
- "Tesla builds its first production Cybertruck at Giga Texas during summer 2023 (June 21 – September 22, 2023), as announced by the company." Result: met July 15, 2023.
- "By 2024-12-31, Cybertruck reaches volume production, operationally defined as: Tesla declares volume production in a shareholder letter/call, OR at least 100,000 units produced in calendar 2024, OR an exit quarterly run-rate of at least 100,000/year." Result: ~39,000 delivered in 2024, no declaration → missed.

---

## Proposed fulfillment tests — summary table

| Lineage | Test (one sentence) | Result under test |
|---|---|---|
| 2025-delivery-guidance | Under the final operative claim (return to growth in 2025), Tesla delivers more vehicles in 2025 than the 1,789,226 delivered in 2024. | Missed (1,636,129); claim withdrawn mid-year |
| 2023-delivery-guidance | Tesla produces ≥1.8M vehicles in 2023 (original framing), or delivers ≥1.8M in 2023 (restated Oct 2023). | Fulfilled (1,845,985 / 1,808,581) |
| 2024-delivery-guidance | 2024 vehicle delivery growth rate is notably lower than 2023's 37.7% — defined as ≤18.9% (less than half). | Fulfilled (−1.1%) |
| robotaxi-one-million-2020 | ≥1,000,000 Tesla robotaxis operating on public roads without a safety driver by 2020-12-31. | Missed (~0) |
| model3-5000-per-week | Original: ≥5,000 Model 3s in a rolling 7-day period by 2017-12-31. Revised (Feb 7, 2018): same rate by 2018-06-30. | Original missed; revised fulfilled (5,031) |
| energy-storage-2025-growth | ≥47.1 GWh deployed in 2025 (≥50% growth over 31.4 GWh in 2024). | Missed narrowly (46.7 GWh) |
| optimus-production-2023 | Downgrade recommended; if retained: ≥1 Optimus unit produced outside R&D use in 2023. | Non-promise (excluded) |
| cybertruck-production-2023 (start) | First production Cybertruck built at Giga Texas during summer 2023 (Jun 21 – Sep 22, 2023). | Met (Jul 15, 2023) |
| cybertruck-volume-2024 (new) | By 2024-12-31: Tesla declares volume production, or ≥100,000 units produced in 2024, or exit quarterly run-rate ≥100,000/yr. | Missed (~39k) |

## Primary source locator index

| Lineage | Best primary source | Locator |
|---|---|---|
| 2025 guidance | Q3 2024 earnings call transcript; Q4 2024 shareholder deck; Q1 2025 earnings release; Q4 2025 P&D press release | ir.tesla.com; digitalassets.tesla.com TSLA-Q4-2024-Update.pdf |
| 2023 guidance | Q4 2022 earnings call transcript ("internal production potential... we were saying 1.8 million"); Q3 2023 call ("around 1.8 million vehicle deliveries"); Q4 2023 deck (actuals) | Transcript mirrors (Barchart/MarketBeat); https://digitalassets.tesla.com/tesla-contents/image/upload/IR/TSLA-Q4-2023-Update.pdf |
| 2024 guidance | Q4 2023 shareholder deck, Outlook p.12 ("notably lower") | https://digitalassets.tesla.com/tesla-contents/image/upload/IR/TSLA-Q4-2023-Update.pdf |
| Robotaxi | Tesla Autonomy Day official video (~3:14:03); Tesla Q4 2020 earnings call webcast (Jan 27, 2021); Reuters Jun 22, 2025 (Austin launch) | https://www.youtube.com/watch?v=Ucp0TTmvqOE; https://www.nasdaq.com/articles/tesla-tsla-q4-2020-earnings-call-transcript-2021-01-28; https://www.reuters.com/business/autos-transportation/tesla-tiptoes-into-long-promised-robotaxi-service-2025-06-22/ |
| Model 3 | SEC EDGAR 8-K Ex. 99.1 (2017-08-02); SEC EDGAR 8-K (2018-02-09); Tesla Q2 2018 P&D release (2018-07-02) | https://www.sec.gov/Archives/edgar/data/1318605/000156459017014920/tsla-ex991_90.htm; https://www.sec.gov/Archives/edgar/data/1318605/000156459018001786/tsla-8k_20180209.htm; http://ir.tesla.com/press-release/tesla-q2-2018-vehicle-production-and-deliveries |
| Energy 2025 | Q4 2024 earnings call transcript; Tesla Q4 2025 P&D release | ir.tesla.com |
| Optimus | Cyber Rodeo Apr 7, 2022 ("a shot at... hopefully"); Q4 2025 earnings call transcript (Jan 28, 2026, R&D phase) | https://electrek.co/2022/04/07/tesla-production-optimus-humanoid-robot-2023/ (quote); https://www.shacknews.com/article/147609/tesla-tsla-q4-2025-earnings-call-transcript |
| Cybertruck | Q4 2022 earnings call transcript ("expect production to start... sometime this summer"); Tesla official X post Jul 15, 2023 ("First Cybertruck built at Giga Texas!"); Q3 2023 deck (pilot production) | Transcript mirrors (Barchart); AP contemporaneous: https://techxplore.com/news/2023-07-tesla-1st-electric-pickup-line.html |

## Caveats
- Earnings-call transcript mirrors (Nasdaq, Barchart, MarketBeat, Shacknews) are transcriptions of Tesla's own webcasts — primary-adjacent, not independent reporting. The underlying primary is the ir.tesla.com webcast.
- The Austin robotaxi launch was announced via Musk's X post, not a Tesla IR press release; Reuters' June 22, 2025 report is the strongest dated contemporaneous record.
- The Tesla-hosted Q4 2022 deck PDF would not load directly during research; the 1.8M sentence rests on verbatim quotes in coverage plus identically-worded later decks, with the production framing independently confirmed by Musk's on-call words.
- Research only; the ledger JSON was not modified. All proposed changes above are recommendations for the ledger's editor.
