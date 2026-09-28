# FieldCheck — V1 Product Specification

**Status:** Working first build. **Target:** a useful public CSV utility with no required accounts or paid services.

## User problem

People have an export and need a clear, reproducible answer to two questions: “Can I trust these records?” and “What changed between these two exports?” Row order should not matter.

## V1 user journeys

1. Open site; load sample or import a CSV. Choose unique key and optional required/numeric columns. Run validation. Review findings and export all issues.
2. Import an earlier baseline CSV. Compare by unique key. Get added, removed, changed, unchanged records. Export complete field-level differences.
3. Report a bug or request a feature (activate repository Issues link when published).

## Acceptance criteria

- Handles normal CSV, BOM, CRLF, quoted delimiters, escaped quotes, and quoted multiline values.
- Clear errors for malformed files, blank/duplicate headers, mismatched row widths, and size limits.
- Detects blank unique IDs, duplicate IDs, duplicate entire rows, missing selected required fields, and invalid selected numeric fields.
- Comparison uses ID matching independent of row position and fails safely on duplicate or missing IDs.
- Renders imported values as text, not HTML; exported values are guarded against spreadsheet formula injection.
- Core file processing remains local in the browser. No sign-in, uploaded file storage, or analytics in V1.
- Tests run without external accounts; CI can use `npm test`; sample data illustrates meaningful changes and errors.

## Intentional V1 limitations

- CSV only (not .xlsx), at most 8 MB, 30,000 data rows and 80 columns per file.
- Unique ID must be present in both files; key matching trims surrounding ID whitespace and is otherwise case-sensitive.
- CSV headers are matched case-insensitively; non-key comparison values are compared exactly (including whitespace).
- No schema transformation/mapping, multi-key matching, fuzzy matching, streaming of huge files, saved accounts, collaborative review, or persistent user data.
- “Exceptions” are currently findings in a report, not a hosted case-management queue.
- No server, database, Python, or SQL in the public V1. A future SQL-based version should be documented and tested if introduced.

## Privacy / security

Files are processed in browser memory, not sent to FieldCheck. No third-party analytics, cookies, or persistent file storage in this starter. The site can be hosted as static content. Don't include CSV row data in bug reports. Input sizes are bounded; issue rendering is capped at 250 entries (complete export available). CSV report cells guard against spreadsheet formulas.

## Future only if evidence justifies it

User-requested file-type support, column mapping, large-file performance, persistent review cases, local saved sessions, SQL-based querying, API endpoints, optional accounts, and paid hosted processing. Keep validation logic isolated from the UI; add a backend only for functions that actually require one.
