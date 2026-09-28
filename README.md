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

## Feedback and bug reports

[Report a bug or request a feature](https://github.com/Marshall-Studio/FieldCheck/issues/new). Please describe the steps and expected behavior, and use a synthetic example instead of attaching confidential datasets.

## Privacy and security

FieldCheck processes imported files in browser memory. It does not require sign-in, send CSV contents to a FieldCheck API, or include analytics in the current version. Downloaded reports guard against spreadsheet formula interpretation, and imported text is rendered as text instead of HTML.

## License

A redistribution license has not yet been selected. The website may be free to use without granting permission to redistribute the source code.
