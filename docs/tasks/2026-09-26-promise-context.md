# Promise stats and related news

Alex's direction: borrow the compact stats/timeline layout, use our own promise
instrument rather than another market-data dashboard. Built on cfc4d27, preserving
Muse's modular rows, ButtonLink styling and project-page work.

Components: `PromiseStats` and `PromiseNews`; shared domain helpers in
`lib/promise-context.ts`. Project sections: `project-{slug}-stats` and
`project-{slug}-recent`, with descriptive classes and search metadata. Existing
promise anchors are unchanged and now produced by the same helper as news links.
Full promise rows display matching P labels from existing lineage identifiers.

Data rules:
- Stats use the published record, retaining legacy state normalization.
- Retired is separate from lapsed; unknown states are not silently classified.
- Research date is not stored. Last research says Not recorded; assessment date
  has its own label. No guessed dates and no migration or live write.
- News uses the existing hourly cached Google News sample. Two shared topic words
  are needed, excluding project aliases and generic market words. Match words and
  the linked promise are inspectable. No heart awards or accepted-evidence writes.
- Auto-match is a suggestion, not semantic understanding; it can miss paraphrases
  and can be wrong. The UI labels this clearly. No broad firehose fallback.

Checks: four focused tests passed (topic links, false-positive boilerplate,
stable anchors/labels and legacy/unknown counts). Real published Bitcoin snapshot:
9 earned, 5 open, 1 lapsed, 1 retired, 16 tracked. Live feed matched a store-of-value
headline to P15. Why-this-match and direct anchor navigation verified locally.
320px phone layout checked without horizontal overflow. Production build and type checks passed. Deployment verification follows push. Temporary preview route removed before commit.

Muse: these sections are reusable; no competing refactor of CODE/HYPE rows. If a
review timestamp is added to the publication model later, pass it as researchAt.
