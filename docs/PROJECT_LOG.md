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

## Pre-release hardening (dark mode + security) — 2026-09-28

- Accessible light/dark theme toggle with system preference, localStorage theme key, and flash-avoiding boot script.
- Security review documented in `docs/SECURITY_REVIEW.md`; Cloudflare Pages `_headers` CSP/framing/nosniff/referrer; CI `npm ci` + least privilege.
- Issue templates, `SECURITY.md` private reporting, privacy copy updated; analytics prepared but not embedded.
- Not deployed — awaiting creator approval of the security-readiness report.

## Final pre-release polish — 2026-09-28

- Theme toggle shows “Dark mode” / “Light mode” with moon/sun; 220ms transitions after paint; respects `prefers-reduced-motion`.
- Public site feedback is a single Send feedback action prepared for Tally (`src/feedback.ts`); GitHub Issues / vulnerability buttons removed from the UI.
- Private vulnerability reporting remains in `SECURITY.md` only.
- Git author privacy: historical commits use a personal mailbox; future commits should switch to GitHub `noreply` (no history rewrite without approval).
- Not deployed — connect Tally URL and confirm email privacy steps first.

## Tally feedback connected — 2026-09-28

- Set `FEEDBACK_FORM_URL` to https://tally.so/r/68aLbP (external link only; CSP unchanged).
- Privacy docs disclose Tally; CSV datasets are not sent with feedback.
- Repo-local Git author set to GitHub noreply for future commits (history not rewritten).
- Not deployed — Cloudflare Pages release still awaiting final approval.

## First public deployment — 2026-09-28

- Cloudflare Pages project `fieldcheck` live at https://fieldcheck-710.pages.dev/ (Direct Upload from `a3ddaea`, production branch `main`).
- Live QA: sample validation/compare, Inspect record, exports, theme toggle, Tally feedback, security headers; Web Analytics off.
- README + CHANGELOG + `v1.0.0` release tag.

## GitHub Actions deploy pipeline — 2026-09-28

- Extended `.github/workflows/ci.yml`: PRs run typecheck/tests only; merges to `main` deploy `site/` to existing Pages project `fieldcheck` via `cloudflare/wrangler-action@v4`.
- Uses repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (never committed). Concurrency group prevents overlapping production deploys.

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
