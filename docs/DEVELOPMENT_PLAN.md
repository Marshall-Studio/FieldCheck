# Development plan and learning checkpoints

## Phase 0 — Working skeleton (included)

- [x] Zero-runtime-dependency static TypeScript app, CSV parsing, validation, baseline comparison and downloadable reports.
- [x] Browser-only architecture, sample data, tests, README, design documentation.
- [x] Open in Cursor; run tests locally; create GitHub repository (https://github.com/Marshall-Studio/FieldCheck). Manual browser inspection of the sample flow still pending.

## Phase 1 — V1 correctness and usability

- [x] Manually test sample workflow in browser; add tests for real defects (see QA_TEST_PLAN defect log). Additional Chrome/Brave/mobile cross-check still welcome.
- [ ] Confirm line numbers for multiline CSV edge cases; improve feedback if needed.
- [ ] Validate a real *non-sensitive* operational dataset and document requirements.
- [ ] Add automated accessibility and basic UI smoke tests if warranted.
- [ ] Add file drag/drop, better filtered findings, sorting and export of changed records only if useful.
- [x] Write a QA case study: test matrix, defect, reproduction, fix, regression test (recorded in `docs/QA_TEST_PLAN.md` + sample-workflow test).

## Phase 2 — Public release

- [x] GitHub repo created; CI workflow present.
- [ ] Clean README screenshots/GIF, changelog, release tag.
- [x] Turn on feedback URL to the actual GitHub Issues/new page.
- [x] Set up GitHub Actions for `npm test` (`.github/workflows/ci.yml`).
- [ ] Deploy `site/` as a static website; verify a real browser can load it (guide in `docs/DEPLOYMENT.md` — not deployed yet).
- [ ] Record only observed outcomes: tests, real usage and reported feedback. Never invent metrics.

## Phase 3 — Technical walkthrough and maintainability

- [ ] Explain parser quote state, duplicate-key policy, and CSV injection guard.
- [ ] Walk through `validate` and `compareDatasets` with sample inputs.
- [ ] Reproduce a bug, write expected/actual result, patch, and regression-test it.
- [ ] Explain why V1 intentionally has no database/API and describe when you would add one.
- [ ] Update public documentation and release notes based on verified results.

## Potential upgrade for deeper SQL/data evidence

If real use cases require SQL-backed analysis, implement and test a SQLite/DuckDB-backed processing path or a measured Python/FastAPI integration. Do not duplicate logic gratuitously or document capabilities before they exist.
