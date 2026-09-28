# First Cursor session prompt

We are building FieldCheck, a free, browser-only TypeScript CSV data-quality and reconciliation tool. The project already has working parser, validation, key-based comparison, export, sample data, and 15 Node tests. The primary goal is an honest, high-quality portfolio for entry-level QA, data-quality, and technical-operations jobs, and a genuinely useful free utility. Do not turn this into paid SaaS or add unnecessary cloud services yet.

Start by reading README.md, docs/PRODUCT_SPEC.md, docs/ARCHITECTURE.md, docs/QA_TEST_PLAN.md, and docs/DEVELOPMENT_PLAN.md. Run `npm install`, `npm test`, and `npm run dev`. Confirm the application opens at http://127.0.0.1:5173/ and try the sample dataset: validation should find missing property and invalid cost; comparison should show two added IDs, one removed ID, and two changed IDs. Inspect actual behavior rather than assuming tests prove the whole UI is correct.

For every change: explain the user problem, identify the relevant module, make a small patch, add a regression test for meaningful logic changes, run tests, and describe what changed in plain English. Before moving to another feature, ask me to explain the current behavior and why it works. Don't silently add third-party services, analytics, file uploads, accounts, AI APIs, payment systems or persistent cloud storage.

First tasks: manually QA the current sample flow, log and fix the first actual defect, polish loading/errors and table display, and prepare the GitHub repository and public static deployment. Keep claims on README and resume strictly consistent with working code.
