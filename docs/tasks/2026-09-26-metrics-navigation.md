# Metrics navigation

Alex: CODE, HYPE and Compare are supporting context. Group them behind one
Metrics bottom-nav entry; keep their existing pages, data and reusable components.
Project details remain the promise/evidence story.

Implementation: `MetricsNav` is a shared navigation shell above the three existing
routes. `/metrics` redirects to `/code` as the default. Existing deep links,
query sorting, section-search anchors and guided-tour routes stay valid. Metrics
is active in the bottom nav on all three routes; nested links identify their
active page. The shell does not appear on project details or the scoreboard.

No API, scoring, DB, chart or row changes. No page moves or duplicate view copies.
Primary nav is now Scores, Metrics, Methodology, API, Tour; the heart Home icon
and search header remain intact. Mobile tabs have full-width touch targets.

Validation: browser checked the /metrics redirect, CODE/HYPE/Compare switching,
active nested and primary links, hidden nested navigation on the scoreboard,
and 320px layout without horizontal overflow. Production build and type checks passed.
