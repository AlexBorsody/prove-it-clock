# Readable, clickable CODE stats — 2026-09-26

- Updated shared CodeRow on project details and the CODE list: larger name/counts/team text, labeled Stars/Forks/Commits cards, and visible contributor link.
- Stars, forks, commit history and team details link to their respective GitHub pages. Project name and repo icon remain links; repo button now has a 44px tap target.
- At narrow phone widths, stars/forks sit side by side and commits use a full-width row. Checked 320px: no horizontal overflow or broken numbers; metric targets are at least 72px tall.
- Missing commit counts stay unknown rather than displaying zero.
- Used a temporary local preview for both ranked and unranked cards, removed before build. No database/API changes.
- Manual check: project CODE section and Metrics → CODE share this layout; keyboard focus highlights links.
- Validation passed: production build with lint/type checks, 320px visual review of ranked/unranked cards, GitHub link destinations, and `git diff --check`.

- Layout follow-up: moved the project HYPE summary directly below CODE, before Promises. Existing content, anchors and data are preserved.
- Layout follow-up: Market now sits last, after Evidence and methodology. Alex suggested a future Prove Value overlay on this chart; its data and design are still to be decided.
- Promise-first layout: hero/verdict → Promise stats → Promises → Recently happened → Evidence and methodology → CODE → HYPE → Market. Keeps the complete promise story together before supporting metrics.
