# Security review — pre-release (2026-09-28)

This document records what was inspected, what was verified in code/tests/browser, what was fixed, and what remains residual. Passing tests alone are **not** treated as proof of security.

## Inspected

| Area | What was reviewed |
|---|---|
| Repository contents | Tracked files only (no `node_modules`/`site` in Git); sample CSVs; docs; workflows |
| Commit history | Full `git log` for secret-like strings (`api_key`, `token`, `password`, `AKIA`, `ghp_`, private-key markers) via working-tree + history search |
| Dependencies | `package.json` / lockfile — TypeScript **devDependency only**; **zero runtime npm deps** |
| CI | `.github/workflows/ci.yml` install/test permissions |
| CSV parser | Size/row/column limits; malformed quote/header handling (`src/csv.ts`) |
| DOM rendering | All CSV/UI string sinks in `src/main.ts` use `textContent` / `createElement` (no `innerHTML` for file data) |
| Exports | `safeCsvCell` / `toCsv` formula neutralization |
| Storage | `localStorage` keys for column prefs + theme |
| Network | Sample `fetch('./sample-data/…')` only; feedback is a plain `https://tally.so/…` link (no embed script) |
| Host prep | Cloudflare Pages `_headers`, build copy into `site/` |

## Findings

### Verified protections (already present or confirmed)

- CSV values and filenames are rendered with `textContent`, not HTML parsing.
- Exported CSV cells neutralize leading `= + - @`, whitespace-prefixed formulas, tab/CR prefixes, and NUL.
- Parser enforces 8 MB / 30,000 rows / 80 columns and rejects many malformed CSVs.
- Comparison refuses duplicate/missing IDs rather than guessing.
- No runtime third-party JS libraries; no accounts/backends/upload APIs in app code.
- Column prefs store header fingerprints + chosen column names only — not row contents.
- Theme preference uses a separate localStorage key (`fieldcheck.theme.v1`) with values `light`/`dark` only.

### Weaknesses found and fixed in this pass

| ID | Severity | Issue | Fix |
|---|---|---|---|
| S-01 | Medium | CI used `npm install` with default token write scope | `npm ci`; `permissions: contents: read`; run typecheck |
| S-02 | Medium | No production security headers | `_headers` for Cloudflare Pages (CSP, framing, nosniff, referrer, permissions, COOP); copied into `site/` on build; local `dev` server applies the same headers |
| S-03 | Low | Formula guard missed NUL / some control prefixes | Tightened `safeCsvCell` |
| S-04 | Low | Unbounded column-pref layouts in localStorage | Cap at 20 entries |
| S-05 | Low | Privacy copy claimed “no analytics” while preparing host analytics | Docs/UI now describe browser-local files + optional host analytics (not enabled in shipped HTML) |
| S-06 | Low | Feedback Issues URL lacked templates / private vuln path | Issue templates + `SECURITY.md` + security advisory link |

### No exposed application secrets found

No API keys, Cloudflare tokens, `.env` files, or private keys were found in the tracked tree or in the searched commit history. **No secret rotation is required from this review.**

### Residual risks / recommendations (not claimed fixed)

| ID | Severity | Residual risk | Notes |
|---|---|---|---|
| R-01 | Low | Maintainer email appears in Git commit metadata | Public git authorship, not an app secret; optional future identity hygiene |
| R-02 | Medium | Browser memory can exceed the 8 MB file limit while parsing | Limit reduces risk but does not bound peak RAM; adversarial max-size files can still stress a tab |
| R-03 | Low | Unicode / exotic spreadsheet formula markers may bypass prefix neutralization | Classic ASCII markers covered; exotic vectors remain a residual export risk |
| R-04 | Medium | Enabling Cloudflare Web Analytics later requires CSP allowlisting | Shipped CSP is `'self'` only. Auto-injected Pages beacons can break CSP if analytics is turned on without updating `_headers` |
| R-05 | Low | Local preview CSP is only as strong as `scripts/dev.mjs` header application | Production enforcement depends on Cloudflare reading `site/_headers` |
| R-06 | Info | License still unset | Legal/redistribution risk, not a runtime vuln |
| R-07 | Low | Users can still paste confidential data into GitHub Issues | Templates warn; cannot prevent |

## What was tested

- `npm run typecheck`
- `npm test` (including theme helpers, header file presence, formula/NUL cases, prefs trim)
- Local build output includes `site/_headers` and `theme-boot.js`
- Manual desktop + mobile browser QA: light/dark toggle, modal CSV preview, Inspect record highlight, check + compare flows under CSP headers from the local server

## Release readiness (security)

**Conditionally ready for a first public static release** after you review this report: browser-local processing model is intact, XSS/formula/CI/header baselines are documented and tested, and no leaked credentials were found. Remaining items are residual host/config risks (especially analytics vs CSP) and operational hygiene — not open critical flaws in the app code reviewed here.

**Do not deploy until you approve.** After deploy, verify response headers on the live origin and confirm Web Analytics remains off unless `_headers` is intentionally updated.
