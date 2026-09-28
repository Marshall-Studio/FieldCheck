# QA test plan

| Case | Action | Expected result | Status |
|---|---|---|---|
| QA-01 | Load sample and run validation | Missing property and invalid cost flagged | Pass (logic); inspection UX in second review |
| QA-02 | Compare sample by work_order_id | 2 added, 1 removed, 2 changed with older/newer values | Pass (logic) |
| QA-03 | Compare with maintenance-errors.csv | Blocked on duplicate WO-1002 | Pass |
| QA-04–QA-09 | Malformed headers/quotes/keys, injection, HTML, size limit | Clear rejection / safe rendering | Pass |
| QA-10 | Keyboard + narrow viewport | Workflow, previews, findings, modal usable | Retest with inspection modal |
| QA-11 | First-time sample walkthrough | Loaded files, previews, plain findings | Pass from first redesign; further clarity in review 2 |
| QA-12 | Safe auto-config | Suggest existing columns only; override; local prefs | Pass |
| QA-13 | Open full preview for loaded file | Paginated/searchable sheet named by source file | Implemented — awaiting hands-on |
| QA-14 | View affected record from finding | Opens newer sample at WO-1007 and highlights cell | Implemented — awaiting hands-on |
| QA-15 | After check vs compare | Correct operation labeled; relevant section scrolled into view; no stale mixed stats | Implemented — awaiting hands-on |

Note: The default sample supports both validation and comparison; maintenance-errors.csv demonstrates why an ambiguous duplicate key must block reconciliation.

## Usability review 1 — first-time clarity (2026-09-28)

Confirmed observations fixed in the redesign (U-01–U-05): sample load feedback, spreadsheet previews, plain-language results, dual workflows, safer config suggestions.

## Usability review 2 — investigation clarity (2026-09-28)

Creator hands-on after the redesign. Distinguish **confirmed observations** (defects) from **suggestions** (optional enhancements).

### Confirmed observations (treat as defects)

| ID | Severity | Observed problem | Expected | Actual | Response target |
|---|---|---|---|---|---|
| U2-01 | High | Native picker still shows “No file chosen” after sample load | Active filename is obvious; native empty state is not misleading | Browser file input remains empty for samples | Custom file card + hidden native input |
| U2-02 | High | Hard to inspect the full loaded sheet | Open full preview with headers/records and search/locate | Compact first-N preview only | Full preview modal (paged, searchable) |
| U2-03 | High | Findings do not make file/record ownership obvious | File name, record ID, row/column, value, plain explanation | Finding text without clear file/ID jump | Enrich findings + “View affected record” |
| U2-04 | High | Cannot jump from a finding to the source cell | Selecting a WO-1007 finding highlights that cell in maintenance-current.csv | No navigation from finding → record | Open preview focused on highlighted cell |
| U2-05 | Medium | After running an action, unclear what just ran / where to look | Label the operation and scroll to its results; no stale mixed stats | Summary/stats can blend prior check with new compare | Operation-specific summary/stats + scroll |
| U2-06 | Medium | Added/removed rows lack inspectable values | Expand to see field values | Badge + ID only | Expandable added/removed detail |
| U2-07 | Medium | “Expected a finite number” is too technical | Ordinary spreadsheet wording | Engineer-oriented phrasing | Softer validation/explain copy |
| U2-08 | Medium | Settings / suggestions / remember button unclear | Explain ID/required/numeric; mark heuristics as suggestions; save/clear local prefs clearly | Sparse labels; “remember” sounds like file storage | Help text, rename save button, clear prefs |
| U2-09 | Medium | After findings, no obvious next step | Inspect → export → fix original sheet → reload | Ends at tables | Next-steps panel |

### Feature suggestions (not claimed as current defects)

| ID | Note |
|---|---|
| S2-01 | Full in-browser spreadsheet editor / auto-fix of source files — explicitly out of scope for now |
| S2-02 | Accounts, cloud sync, AI explanations, or a backend — out of scope |
| S2-03 | Drag/drop upload and richer filtering — backlog only if still needed after inspection UX |

## Earlier Phase 1 defects

| ID | Severity | Fix |
|---|---|---|
| D-01–D-07 | Low–Medium | Plural status, stats label, feedback copy, failed-load messaging, mobile wrap, empty-row colspan, sample loading status |

For every new bug found, record: environment, file type/size (not confidential contents), steps to reproduce, expected result, actual result, severity, fix, retest outcome and regression test.
