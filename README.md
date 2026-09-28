# FieldCheck

A free, local-first CSV data-quality and reconciliation workbench. **Portfolio-led, but built as a real utility.**

## What it does

- Load a CSV, select a unique ID, required and numeric columns, and detect common data-quality issues.
- Load a baseline and current CSV; compare by ID (not row position) for added, removed and modified records.
- Inspect issues in-browser and export complete reports as CSV.
- Try a maintenance-workflow sample with intentionally planted errors.
- No accounts, server uploads, AI API costs or runtime dependencies.

## Open in Cursor and run

Install Node.js 22 and npm. Open this extracted folder in Cursor, then use the terminal:

```bash
npm install
npm test
npm run dev
```

Open **http://127.0.0.1:5173/**. If you change `.ts` files, run `npm run build` again and refresh the page. `npm test` builds the website and runs the tests. A TypeScript compiler dependency is included for reproducibility; the published site itself has no third-party runtime libraries.

`site/` is generated; don't edit it directly. Source lives in `src/`, HTML in `index.html`, styles in `styles.css`. To deploy to Cloudflare Pages or another static host, build with `npm run build` and publish the **site/** folder. See [Deployment](docs/DEPLOYMENT.md) for host settings and the pre-launch checklist. No paid hosting is required initially; check the hosting provider's then-current terms.

## Feedback

The app links to [GitHub Issues](https://github.com/Marshall-Studio/FieldCheck/issues/new) for bug reports and feature ideas. Do not include confidential CSV contents in an issue.

## Known limits and honest resume framing

See [Product Spec](docs/PRODUCT_SPEC.md), [Architecture](docs/ARCHITECTURE.md), [Development Plan](docs/DEVELOPMENT_PLAN.md), and [QA Test Plan](docs/QA_TEST_PLAN.md).

**Important:** The V1 is a TypeScript browser-based application. It does **not** use SQL, Python, FastAPI, persistent issue review, or a hosted backend. BugSift separately demonstrates backend/SQL skills. Only add those claims to FieldCheck after actually implementing them.

## Maintenance and privacy

The default processing path is local in the user's browser; files are not uploaded to a FieldCheck server. The sample dataset is public. No analytics, user accounts, storage or payments are included in the starter. Review user-reported defects, test changes, and periodically check security/dependency updates. Don't commit real client or employer data.

## License

No software license is included yet. Choose one intentionally before encouraging others to redistribute the source. The public website itself can be free to use without open-sourcing under an unrestricted license.
