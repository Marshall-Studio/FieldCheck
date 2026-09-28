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
