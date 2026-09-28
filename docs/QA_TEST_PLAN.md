# QA test plan

| Case | Action | Expected result | Status |
|---|---|---|---|
| QA-01 | Load sample and run validation | Missing property and invalid cost flagged; separate maintenance-errors.csv covers duplicates | Pass (logic + sample-workflow test); UX redesign pending hands-on retest |
| QA-02 | Compare sample files by work_order_id | 2 added (WO-1006, WO-1007), 1 removed (WO-1004), 2 changed (WO-1001, WO-1002) with older/newer values side by side | Pass (logic); UX redesign pending hands-on retest |
| QA-03 | Load maintenance-errors.csv as current and attempt comparison | Comparison blocked on duplicate WO-1002 | Pass |
| QA-04 | Load CSV with blank/duplicate header | Clear rejection; no silently renamed columns | Pass |
| QA-05 | Load a malformed quoted record | Clear parsing error, no crash | Pass |
| QA-06 | Missing key in either file | Comparison blocked with specific line | Pass |
| QA-07 | Export a value starting = or + | Spreadsheet-injection prefix applied in exported report | Pass |
| QA-08 | Put HTML markup in CSV field | Text rendered literally, not executed | Pass |
| QA-09 | Load >8 MB file | Rejected with size-limit message | Pass |
| QA-10 | Keyboard + narrow viewport | Workflow cards, previews, and result tables usable | Needs retest after UX redesign |
| QA-11 | First-time sample walkthrough | User sees loaded files, spreadsheet preview, plain-language findings, and clear next step | Redesign implemented — awaiting creator hands-on confirmation |
| QA-12 | Safe auto-config | Suggests existing ID / numeric / blank-prone columns; never invents IDs; user can override; optional local remember | Automated suggest/prefs tests + UI |

Note: The default sample supports both validation and comparison; maintenance-errors.csv demonstrates why an ambiguous duplicate key must block reconciliation.

## Usability findings from creator hands-on review (2026-09-28)

These are genuine product defects, not “nice to have” polish.

| ID | Severity | Observed problem | Expected | Actual (before redesign) | Response |
|---|---|---|---|---|---|
| U-01 | High | After clicking sample, unclear that files loaded | Immediate confirmation + visible data | Only a quiet status line; no spreadsheet preview | Load banner, loaded upload state, older/newer previews |
| U-02 | High | Could not see the actual spreadsheet contents | Preview headers + sample rows | File name/count only | Spreadsheet-style previews (first 8 rows) |
| U-03 | High | Hard to understand what validation/comparison meant | Ordinary-language summary + why findings matter | Technical codes / terse change strings | Summary card, plain titles, why-it-matters, older vs newer columns |
| U-04 | High | Workflow not obvious for a first-time visitor | Explicit “check one file” vs “compare two versions” | Single combined import screen | Workflow cards + mode-specific labels |
| U-05 | Medium | Configuration felt opaque | Safe suggestions with override | Silent ID guess + unchecked boxes | Suggest banner, highlighted suggestions, remember-on-device |

## Earlier Phase 1 defects (still relevant)

| ID | Severity | Fix |
|---|---|---|
| D-01–D-07 | Low–Medium | Plural status text, stats label, feedback copy, failed-load messaging, mobile wrap, empty-row colspan, sample loading status |

For every new bug found, record: environment, file type/size (not confidential contents), steps to reproduce, expected result, actual result, severity, fix, retest outcome and regression test.
