# Changelog

All notable changes to FieldCheck are documented here.

## [1.0.0] — 2026-09-28

First public release on Cloudflare Pages: https://fieldcheck-710.pages.dev/

### Added
- Browser-local CSV validation and ID-based comparison
- Maintenance sample workflow with Inspect record and reconstructed CSV table previews
- Light/dark theme toggle with system preference and localStorage (theme choice only)
- Cloudflare Pages `_headers` (CSP, framing, MIME sniffing, referrer, Permissions-Policy, COOP)
- Public **Send feedback** link to https://tally.so/r/68aLbP (no embed script; CSV datasets never sent)
- Private vulnerability reporting via `SECURITY.md`

### Security / privacy
- Zero runtime npm dependencies; CSV values rendered with `textContent`
- Spreadsheet-formula neutralization on exported reports
- Cloudflare Web Analytics disabled for this initial release
- Commit author metadata on `main` uses GitHub noreply (history cleaned before launch)

### Notes
- CSV only (not Excel/Google Sheets editing). Limits: 8 MB / 30,000 rows / 80 columns per file.
- Direct Upload deployment from commit `a3ddaea`; production branch setting is `main`.
