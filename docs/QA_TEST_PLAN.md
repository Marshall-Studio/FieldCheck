# QA test plan (initial)

| Case | Action | Expected result |
|---|---|---|
| QA-01 | Load sample and run validation | Missing property and invalid cost flagged; separate maintenance-errors.csv covers duplicates |
| QA-02 | Compare sample files by work_order_id | 2 added IDs (WO-1006, WO-1007), 1 removed and 2 changed |
| QA-03 | Load maintenance-errors.csv as current and attempt comparison; then fix duplicate and retry | Added/removed/changed identified independent of record order |
| QA-04 | Load CSV with blank/duplicate header | Clear rejection; no silently renamed columns |
| QA-05 | Load a malformed quoted record | Clear parsing error, no crash |
| QA-06 | Missing key in either file | Comparison blocked with specific line |
| QA-07 | Export a value starting = or + | Spreadsheet-injection prefix applied in exported report |
| QA-08 | Put HTML markup in CSV field | Text rendered literally, not executed |
| QA-09 | Load >8 MB file | Rejected with size-limit message |
| QA-10 | Try with keyboard and narrow mobile viewport | Actions and tables usable, status announced |

Note: The default sample supports both validation and comparison; maintenance-errors.csv demonstrates why an ambiguous duplicate key must block reconciliation.

For every bug found, record: environment, file type/size (not confidential contents), steps to reproduce, expected result, actual result, severity, fix, retest outcome and regression test.
