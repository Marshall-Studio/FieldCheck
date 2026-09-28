# FieldCheck development log

## Initial starter — 2026-09-28

- Implemented browser-only, zero-runtime-dependency TypeScript utility.
- Added CSV parsing, validation, key-based comparison, safe CSV exports, and public sample data.
- Added 15 automated tests, GitHub Actions workflow, architecture, product spec and QA plan.
- Manual end-to-end browser testing and real deployment remain to be completed.

## Local verification + GitHub publish — 2026-09-28

- Installed Node.js 22; `npm install`, `npm run typecheck`, `npm run build`, and `npm test` (15/15) pass.
- Fixed Windows build path handling in `scripts/build.mjs` (`fileURLToPath` instead of `URL.pathname`).
- Initialized an independent Git repo (separate from Hollowfall) and published to https://github.com/Marshall-Studio/FieldCheck.
- Set feedback Issues URL to the live repository.

## Phase 1 manual QA — 2026-09-28

- Browser QA of sample workflow at http://127.0.0.1:5173/: validation found blank `property` + invalid `cost`; comparison reported 2 added / 1 removed / 2 changed; exports matched on-screen results.
- Fixed usability defects D-01–D-07 (plural status text, stats label, feedback copy, failed-load messaging, mobile table wrapping, empty-row colspan, sample loading status). See `docs/QA_TEST_PLAN.md`.
- Added `countLabel` helper, sample-workflow regression test, and `docs/DEPLOYMENT.md` (prepared; not deployed yet).

## Usability redesign (first-time clarity) — 2026-09-28

Creator hands-on review (U-01–U-05): sample load was easy to miss, spreadsheet contents were invisible, and validation/comparison results were hard to interpret.
- Added explicit Check vs Compare workflows, older/newer labeling, spreadsheet previews, load confirmation banner.
- Added safe column suggestions + optional localStorage remember (same headers only; never invents IDs).
- Reworked results into plain-language summaries, why-it-matters copy, and side-by-side older/newer comparison values.
- Kept browser-local processing, CSV exports, and injection/`textContent` protections.
- Not deployed — awaiting another hands-on walkthrough.

## Investigation UX (second review) — 2026-09-28

Creator review U2-01–U2-09: findings were hard to map back to a file/record, native “No file chosen” misled after sample load, and next steps were unclear.
- Active filename cards + hidden native picker; Open full preview (paged/searchable).
- Findings include file, record ID, CSV line vs data row, value, why; View affected record highlights the cell (WO-1007 sample path).
- Operation-specific summaries/stats, expandable added/removed values, softer numeric wording, clearer settings + save/clear prefs, next-steps panel.
- Not deployed — awaiting WO-1007 hands-on confirmation.

## Cognitive load & navigation (third review) — 2026-09-28

Creator review U3-01–U3-07: preview wording, clutter, awkward results scrolling, overlapping inspect actions.
- Clarified CSV table preview (reconstructed values, not Excel/Sheets).
- Collapsed secondary help into optional details; unified Inspect record.
- Instant check/compare scroll under sticky header; compare hides the prior check table so changes are in view.
- Modal locks page scroll (`position: fixed` + restore); highlights scroll inside the modal table wrap only.
- Browser desktop + mobile QA verified; typecheck/build/tests green. Not deployed.

## Release / bug log template

Date / release:

Observed user problem:

Steps to reproduce:

Expected behavior:

Actual behavior:

Root cause:

Change made:

Verification / regression test:

What I learned:
