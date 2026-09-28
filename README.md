# FieldCheck

**A free, local-first tool for checking CSV data and comparing exports.**

FieldCheck helps you answer two practical questions: **What's wrong with this file?** and **What changed since the previous export?** It runs in your browser without an account. CSV contents are not uploaded to a FieldCheck server.

## What you can do

- Load a CSV and check for blank or duplicate IDs, missing required values, invalid numbers, and duplicate rows.
- Compare an earlier and a newer CSV by a shared unique ID, even when rows have been reordered.
- See added, removed, and changed records, including field-level differences.
- Export findings and comparisons as CSV.
- Explore the included maintenance-workflow sample files.

**Current format:** CSV. Each file can contain up to 8 MB, 30,000 data rows, and 80 columns. Comparison needs an existing unique identifier present in both files; it does not guess relationships between ambiguous records. The first release has no user accounts, stored projects, or Excel `.xlsx` import.

## Run locally

Install Node.js 22 and npm, then run:

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:5173/ in your browser. For a production build, run `npm run build`; the generated static website is in `site/`. Source code lives in `src/`, with `index.html` and `styles.css` at the root. Do not edit generated `site/` files directly.

See [Deployment](docs/DEPLOYMENT.md), [Product Specification](docs/PRODUCT_SPEC.md), [Architecture](docs/ARCHITECTURE.md), [Development Plan](docs/DEVELOPMENT_PLAN.md), and [QA Test Plan](docs/QA_TEST_PLAN.md).

## Feedback

Visitor feedback uses a no-account [Tally form](https://tally.so/r/68aLbP) opened from **Send feedback** on the website (`src/feedback.ts`). FieldCheck never posts CSV datasets to Tally — only what a visitor types into the form is submitted there.

GitHub Issue templates remain available for maintainers and contributors inspecting the repository. Security reports use private advisories — see [SECURITY.md](SECURITY.md). Ordinary visitors are not directed to GitHub Issues or personal contact email from the public site.

## Privacy and security

FieldCheck processes imported files in browser memory. It does not require sign-in or send CSV contents to a FieldCheck API. Optional browser storage remembers column-check preferences and your light/dark theme choice only — never spreadsheet rows. The linked Tally feedback form receives only form-field answers (optional reply email if provided) — not uploaded spreadsheets. Optional host-level privacy-friendly visit analytics may be enabled later; they are **not** embedded in this release. Downloaded reports guard against spreadsheet formula interpretation, and imported text is rendered as text instead of HTML.

See [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) for the pre-release security review notes.

## License

A redistribution license has not yet been selected. The website may be free to use without granting permission to redistribute the source code.
