# Development plan and learning checkpoints

## Phase 0 — Working skeleton (included)

- [x] Zero-runtime-dependency static TypeScript app, CSV parsing, validation, baseline comparison and downloadable reports.
- [x] Browser-only architecture, sample data, tests, README, design documentation.
- [ ] Open in Cursor; run tests locally; inspect the website; create GitHub repository.

## Phase 1 — V1 correctness and usability

- [ ] Manually test in Chrome/Brave and on mobile; add tests for real defects.
- [ ] Confirm line numbers for multiline CSV edge cases; improve feedback if needed.
- [ ] Validate a real *non-sensitive* operational dataset and document requirements.
- [ ] Add automated accessibility and basic UI smoke tests if warranted.
- [ ] Add file drag/drop, better filtered findings, sorting and export of changed records only if useful.
- [ ] Write a QA case study: test matrix, defect, reproduction, fix, regression test.

## Phase 2 — Public release

- [ ] GitHub repo, clean README screenshots/GIF, changelog, release tag.
- [ ] Turn on feedback URL to the actual GitHub Issues/new page; test the button.
- [ ] Set up GitHub Actions for `npm test` (example included in .github/workflows/ci.yml).
- [ ] Deploy `site/` as a static website; verify a real browser can load it.
- [ ] Record only observed outcomes: tests, real usage and reported feedback. Never invent metrics.

## Phase 3 — Interview readiness

- [ ] Explain parser quote state, duplicate-key policy, and CSV injection guard.
- [ ] Walk through `validate` and `compareDatasets` with sample inputs.
- [ ] Reproduce a bug, write expected/actual result, patch, and regression-test it.
- [ ] Explain why V1 intentionally has no database/API and describe when you would add one.
- [ ] Refresh QA/Data Quality resume versions based on verified results.

## Potential upgrade for deeper SQL/data evidence

If primary job ads repeatedly require SQL and data reconciliation, implement a separate *genuinely working* SQLite/DuckDB-backed processing path or a measured Python/FastAPI integration. Do not duplicate logic gratuitously or claim it exists before completing and testing it.
