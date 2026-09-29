# Deployment

FieldCheck is a static website. After `npm run build`, publish the generated **`site/`** folder. Source files stay in Git; `site/` is gitignored and rebuilt before deploy.

## Live production

- **URL:** https://fieldcheck-710.pages.dev/
- **Host:** Cloudflare Pages (free plan)
- **Project:** `fieldcheck` (reuse this project — do not create a second one)
- **Production branch setting:** `main`
- **Initial release commit:** `a3ddaea`
- **Web Analytics:** disabled for the initial release

## Release workflow (GitHub Actions)

FieldCheck uses **manual production releases**. Merging to `main` never publishes the website by itself.

### Recommended process

1. Develop on a feature branch.
2. Open a pull request — CI runs typecheck and tests (**no deploy**).
3. Review and merge the PR into `main` — CI runs typecheck and tests again (**no deploy**).
4. When you are ready to publish, manually run **FieldCheck production release** from branch `main` (Actions → workflow → Run workflow).

### What each workflow does

| Workflow | Trigger | Behavior |
|---|---|---|
| `FieldCheck CI` (`.github/workflows/ci.yml`) | Pull requests and pushes to `main` | `npm ci`, typecheck, tests only |
| `FieldCheck production release` (`.github/workflows/release.yml`) | Manual **workflow_dispatch** only | Guards that the selected branch is `main`, re-runs tests, builds `site/`, deploys to existing Pages project `fieldcheck` |

Deploys use **Wrangler Direct Upload** to the existing Pages project (not a second Cloudflare Git integration).

Required repository secrets (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

Never commit these values. Never print them in logs or documentation.

Deployment settings encoded in the release workflow:

- **Build command:** `npm run build`
- **Build output:** `site/`
- **Node.js:** `22`
- **Pages project:** `fieldcheck`
- **Production branch flag:** `--branch=main`
- **Branch guard:** refuses to deploy if the workflow is started on any branch other than `main`
- **Overlap control:** concurrency group `fieldcheck-pages-production` with `cancel-in-progress: false` so production deploys queue instead of racing

Action used: [`cloudflare/wrangler-action@v4`](https://github.com/cloudflare/wrangler-action).

After a manual release, confirm the Actions run is green and https://fieldcheck-710.pages.dev/ serves the expected build. Keep Cloudflare Web Analytics off unless CSP allowlists and privacy copy are updated together.

## Manual / one-off deploy (local machine)

From a clean checkout of `main` on Node 22:

```bash
npm ci
npm run build
npx wrangler pages deploy site --project-name=fieldcheck --branch=main
```

Prefer the GitHub Actions release workflow for production so the same tests run first.

### Optional Cloudflare Web Analytics (off by default)

Web Analytics can be enabled later from the Cloudflare dashboard **without** collecting CSV contents (page metrics only). Do **not** paste an unverified beacon snippet into this repository.

Before enabling analytics:

1. Decide whether Cloudflare will auto-inject the beacon for Pages.
2. Update `site/_headers` CSP to allow `https://static.cloudflareinsights.com` in `script-src` and the appropriate `connect-src` endpoint documented by Cloudflare.
3. Rebuild, redeploy, and verify the console shows no CSP violations.
4. Update the public privacy copy in `README.md` / the in-app Privacy details to state that privacy-friendly visit analytics are on.

Until those steps are done, keep analytics **off**. A strict `'self'` CSP is intentional for the first release.

### GitHub Pages (alternative host)

1. In the repository, enable Pages for GitHub Actions (or the `gh-pages` branch).
2. Add a workflow that builds with Node 22 (`npm ci` + `npm run build`) and uploads the `site/` artifact (do not commit `site/` to `main`).
3. Replicate equivalent security headers (GitHub Pages does not read Cloudflare `_headers`; use the host’s supported mechanism).
4. Confirm the Pages URL serves `index.html`, `assets/*.js`, `theme-boot.js`, and `sample-data/*.csv`.

## Pre-launch checklist

- [x] Manual sample QA still passes on the public URL (validation + comparison + exports + light/dark).
- [x] Live response includes CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a referrer policy.
- [x] Feedback: `FEEDBACK_FORM_URL` set to https://tally.so/r/68aLbP; **Send feedback** opens the form; privacy copy names Tally.
- [x] Feedback link opens the Tally form (not GitHub Issues); no vulnerability button on the public site.
- [x] Web Analytics remains off unless CSP and privacy copy were updated together.
- [x] No accounts, databases, paid APIs, or file-upload backend were added.
- [x] README links to the live URL once it exists.
- [x] Review `docs/SECURITY_REVIEW.md` and confirm residual risks are acceptable.
- [x] Confirm commit authorship uses a GitHub `noreply` address for future commits (see privacy notes in the latest project log).
- [ ] Manual production release via Actions **FieldCheck production release** (workflow_dispatch from `main`) verified when publishing.

## Connecting the Tally feedback form

Connected for release: `FEEDBACK_FORM_URL` = `https://tally.so/r/68aLbP` in `src/feedback.ts` (plain external link; no embed script).

Expected Tally fields: Feedback type (Bug report / Feature idea / Other), required Description, optional Email for replies only, no mandatory sign-in, no spreadsheet upload.

If the form URL ever changes, update `FEEDBACK_FORM_URL`, rebuild, and re-verify the button before deploy.
