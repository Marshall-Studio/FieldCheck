# QA test plan

| Case | Action | Expected result | Status (2026-09-28) |
|---|---|---|---|
| QA-01 | Load sample and run validation | Missing property and invalid cost flagged; separate maintenance-errors.csv covers duplicates | Pass (browser + automated sample-workflow test) |
| QA-02 | Compare sample files by work_order_id | 2 added IDs (WO-1006, WO-1007), 1 removed (WO-1004) and 2 changed (WO-1001, WO-1002) | Pass |
| QA-03 | Load maintenance-errors.csv as current and attempt comparison; then fix duplicate and retry | Comparison blocked on duplicate WO-1002; after fix, added/removed/changed identified independent of record order | Pass (duplicate block automated; manual retry optional) |
| QA-04 | Load CSV with blank/duplicate header | Clear rejection; no silently renamed columns | Pass (parser messages verified) |
| QA-05 | Load a malformed quoted record | Clear parsing error, no crash | Pass |
| QA-06 | Missing key in either file | Comparison blocked with specific line | Pass (unit tests) |
| QA-07 | Export a value starting = or + | Spreadsheet-injection prefix applied in exported report | Pass |
| QA-08 | Put HTML markup in CSV field | Text rendered literally, not executed | Pass (`textContent` rendering) |
| QA-09 | Load >8 MB file | Rejected with size-limit message | Pass (limit check in UI/parser) |
| QA-10 | Try with keyboard and narrow mobile viewport | Actions and tables usable, status announced | Partial — tables scroll horizontally after wrap fix; full keyboard pass still recommended |

Note: The default sample supports both validation and comparison; maintenance-errors.csv demonstrates why an ambiguous duplicate key must block reconciliation.

## Defects found and fixed (Phase 1 manual QA)

| ID | Severity | Steps | Expected | Actual | Fix |
|---|---|---|---|---|---|
| D-01 | Low | Load sample → Run validation (1 issue row) | Status says "1 row" | "1 rows" | `countLabel` helper + regression test |
| D-02 | Low | View Results stats with 1 issue row | Readable metric label | "ISSUE ROWS" looked wrong for count 1 | Label → "Rows with issues" |
| D-03 | Low | Scroll to feedback panel after GitHub publish | Copy matches live feedback button | Text still said link appears after publish | Updated footer copy in `index.html` |
| D-04 | Medium | Load a good CSV, then choose a malformed CSV | User knows previous data was kept | Error showed, but silent keep of prior dataset | Status now says previous dataset was kept |
| D-05 | Medium | Narrow/mobile viewport, open findings table | Issue codes and column names readable | `overflow-wrap: anywhere` broke words mid-string | `break-word` + table `min-width` with horizontal scroll |
| D-06 | Low | Fresh page empty result tables | Placeholder spans full table width | Single cell under first column only | `colSpan` on empty-state cells |
| D-07 | Low | Click sample load on slow network | Visible loading feedback | No status until finished | "Loading sample datasets…" + temporary button disable |

For every new bug found, record: environment, file type/size (not confidential contents), steps to reproduce, expected result, actual result, severity, fix, retest outcome and regression test.
