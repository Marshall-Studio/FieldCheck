# Development plan and learning checkpoints

## Phase 0 — Working skeleton (included)

- [x] Zero-runtime-dependency static TypeScript app, CSV parsing, validation, baseline comparison and downloadable reports.
- [x] Browser-only architecture, sample data, tests, README, design documentation.
- [x] Open in Cursor; run tests locally; create GitHub repository (https://github.com/Marshall-Studio/FieldCheck). Manual browser inspection of the sample flow still pending.

## Phase 1 — V1 correctness and usability

- [x] Manually test sample workflow in browser; add tests for real defects (see QA_TEST_PLAN defect log). Additional Chrome/Brave/mobile cross-check still welcome.
- [x] First-time usability redesign from creator review (U-01–U-05): dual workflows, previews, plain-language results, safe suggestions, local prefs.
- [x] Second usability pass (U2-01–U2-09): file inspection, jump-to-record, clearer results/settings/next steps.
- [x] Third usability pass (U3-01–U3-07): reduce cognitive load, fix results scrolling, unify Inspect record, clarify CSV-table preview. Awaiting creator hands-on before deploy.
- [x] Pre-release dark mode + security hardening (theme toggle, `_headers` CSP, CI least privilege, security docs). Awaiting deployment approval.
- [ ] Confirm line numbers for multiline CSV edge cases; improve feedback if needed.
- [ ] Validate a real *non-sensitive* operational dataset and document requirements.
- [ ] Add automated accessibility and basic UI smoke tests if warranted.
- [ ] Add file drag/drop, better filtered findings, sorting and export of changed records only if useful.
- [x] Write a QA case study: test matrix, defect, reproduction, fix, regression test (recorded in `docs/QA_TEST_PLAN.md` + sample-workflow test).

## Phase 2 — Public release

- [x] GitHub repo created; CI workflow present.
- [x] Clean README with live URL, changelog, and `v1.0.0` release tag.
- [x] Turn on website Send feedback (Tally URL https://tally.so/r/68aLbP in `src/feedback.ts`).
- [x] Set up GitHub Actions for `npm ci` + typecheck + `npm test` with `contents: read`.
- [x] Document Cloudflare Pages headers / optional Web Analytics enablement path (`docs/DEPLOYMENT.md`, `docs/SECURITY_REVIEW.md`).
- [x] Deploy `site/` as a static website; verify a real browser can load it (https://fieldcheck-710.pages.dev/).
- [ ] Record only observed outcomes: tests, real usage and reported feedback. Never invent metrics.

## Phase 3 — Technical walkthrough and maintainability

- [ ] Explain parser quote state, duplicate-key policy, and CSV injection guard.
- [ ] Walk through `validate` and `compareDatasets` with sample inputs.
- [ ] Reproduce a bug, write expected/actual result, patch, and regression-test it.
- [ ] Explain why V1 intentionally has no database/API and describe when you would add one.
- [ ] Update public documentation and release notes based on verified results.

## Potential upgrade for deeper SQL/data evidence

If real use cases require SQL-backed analysis, implement and test a SQLite/DuckDB-backed processing path or a measured Python/FastAPI integration. Do not duplicate logic gratuitously or document capabilities before they exist.
