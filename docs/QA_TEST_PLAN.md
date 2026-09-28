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
| QA-13 | Open CSV table preview for loaded file | Paginated/searchable reconstructed CSV table named by source file | Pass — wording clarified in review 3 |
| QA-14 | Inspect record from finding | Opens newer sample at WO-1007 and highlights cell | Pass — unified Inspect record in review 3 |
| QA-15 | After check vs compare | Results / comparison headings scroll into a useful viewport position | Pass — header-offset instant scroll; compare hides prior check table |
| QA-16 | Inspect changed comparison record | Single Inspect record shows older+newer values with changed field highlighted | Pass — browser verified |
| QA-17 | Modal scroll isolation | Highlighting a cell does not move the underlying page; position restores on close | Pass |

Note: The default sample supports both validation and comparison; maintenance-errors.csv demonstrates why an ambiguous duplicate key must block reconciliation.

## Usability review 1 — first-time clarity (2026-09-28)

Confirmed observations fixed in the redesign (U-01–U-05): sample load feedback, spreadsheet previews, plain-language results, dual workflows, safer config suggestions.

## Usability review 2 — investigation clarity (2026-09-28)

Confirmed observations U2-01–U2-09 addressed (active filenames, full preview, jump-to-record, operation-specific results, expandable compare rows, softer wording, prefs clarity, next steps). Suggestions S2-01–S2-03 remain out of scope.

## Usability review 3 — cognitive load & navigation (2026-09-28)

### Confirmed observations

| ID | Severity | Observed problem | Expected | Actual | Response target |
|---|---|---|---|---|---|
| U3-01 | High | Full preview is easy to mistake for the original spreadsheet app | Clearly a reconstructed CSV table; no Excel/Sheets claim | Labeled like a full sheet without CSV caveat | Rename/clarify as CSV table preview |
| U3-02 | Medium | Too much persistent explanatory text | Concise labels; secondary help on demand | Long help paragraphs always visible | Collapse secondary help into optional details |
| U3-03 | High | Check for problems scrolls to an awkward low position | Results panel heading near top of viewport (under header) | Summary/card scroll felt bottom-heavy | Instant scroll to `#results-heading` under sticky header |
| U3-04 | High | Compare does not bring comparison findings into useful view | Comparison heading + changes visible without another blind scroll | Easy to miss the comparison block | Hide prior check table; scroll to comparison heading |
| U3-05 | High | Show values / Open in preview / Open newer record overlap | One clear Inspect record action | Multiple overlapping buttons | Unify on Inspect record |
| U3-06 | Medium | Results ↔ source files relationship still fuzzy | Filename, record ID, and location obvious in inspect views | Present but uneven across actions | Stronger file/record framing in inspect UI |
| U3-07 | Medium | Highlighting a cell can scroll the underlying page | Modal-local scroll only | `scrollIntoView` moved the page | Scroll inside modal table wrap only |

### Feature suggestions (out of scope this pass)

| ID | Note |
|---|---|
| S3-01 | Excel editing, Google Sheets auth, or live sync — out of scope |
| S3-02 | Accounts / subscriptions / backend — out of scope |

## Earlier Phase 1 defects

| ID | Severity | Fix |
|---|---|---|
| D-01–D-07 | Low–Medium | Plural status, stats label, feedback copy, failed-load messaging, mobile wrap, empty-row colspan, sample loading status |

For every new bug found, record: environment, file type/size (not confidential contents), steps to reproduce, expected result, actual result, severity, fix, retest outcome and regression test.
