# Home overview restructure — brief for Codex

Date: 2026-09-27. Status: spec only, NOT built. No commit/push without Alex's word.

## Goal
Subtract tabs, not add them. One home overview page per market. Compare and Metrics stop being tabs.

## Target structure

**Top-level nav:** market switcher, Crypto | Stocks, side by side as a segmented control with hard icons (one consistent SVG set, per standing UI rules). Crypto and Stocks stay FULLY separate — separate data paths, separate views. The switcher only chooses which market's existing views render. Never merge the datasets.

**Home overview page (per market), top to bottom:**
1. Market switcher (segmented, Crypto | Stocks, icons).
2. Stat strip: the Metrics tab's headline numbers as one compact row. Metrics tab is deleted. Deeper metric cuts live behind expand (progressive disclosure), not on a second screen.
3. Asset list: cards/list toggle, default view unchanged. Cards stay exactly as they are — heart meter, verdict, tap to expand. Promise categories live in the expanded detail only. List view may carry a one-line category summary since it scrolls.

**Compare becomes a mode, not a tab:**
- Checkboxes on cards / rows to select assets.
- Sticky compare bar slides up at the bottom once 2+ are selected (thumb-friendly on mobile).
- Tapping it opens the side-by-side compare view as a full overlay, REUSING the existing compare table component. The table needs width — it never gets squeezed into the overview scroll.
- Compare tab is deleted.

**Bottom tab bar:** gains a search icon (room freed by deleting Compare/Metrics tabs). Search behavior itself is Codex's build in progress — this brief only approves the icon placement, no interference.

## Anti-slop constraints (hard)
- This is a MOVE, not a rebuild. Reuse existing components in their new positions. No new components unless necessary, and flag each one.
- COPY FREEZE: no wording or microcopy changes ride along with this restructure. Layout move only.
- No em dashes anywhere. No timestamps, no count labels (standing rules).
- Desktop-first verification per standing rule (no mobile viewport emulation here — desktop render + mobile CSS inspection, Alex checks on his phone).

## Build slices (in order, each rendered and reviewed before the next)
1. Market switcher on home (Crypto | Stocks, separate data paths verified).
2. Metrics stat strip on overview + delete Metrics tab.
3. Compare mode (select → bottom bar → overlay reusing compare table) + delete Compare tab.
4. Final pass: full visible-copy re-read of every touched view before any push.

## Out of scope
- Tip + feature-request page (separate brief: docs/tasks/2026-09-27-tip-feature-request-page.md).
- Auth / user management (deferred; nullable user_id columns already reserved).
- Any new metrics, any new copy, any new tabs.
