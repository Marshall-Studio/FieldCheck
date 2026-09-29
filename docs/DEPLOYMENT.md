# Deployment

FieldCheck is a static website. After `npm run build`, publish the generated **`site/`** folder. Source files stay in Git; `site/` is gitignored and rebuilt before deploy.

## Live production

- **URL:** https://fieldcheck-710.pages.dev/
- **Host:** Cloudflare Pages (free plan)
- **Project:** `fieldcheck`
- **Production branch setting:** `main`
- **Initial release commit:** `a3ddaea`
- **Web Analytics:** disabled for the initial release

## Recommended free hosts

### Cloudflare Pages (recommended)

**Initial V1 deploy used Wrangler Direct Upload** of the local `site/` build (Node 22, `npm run build`) so the cleaned Git history stayed intact.

To connect continuous Git builds later (optional):

1. Sign in at [Cloudflare Pages](https://pages.cloudflare.com/).
2. Connect `Marshall-Studio/FieldCheck` to the existing `fieldcheck` project (or create a Git-linked project).
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `site`
   - **Node version:** `22`
   - **Production branch:** `main`
4. Keep Web Analytics off unless CSP allowlists and privacy copy are updated together.

Confirm `site/_headers` is present in the build output (CSP, clickjacking protection, MIME sniffing protection, referrer policy).

#### Optional Cloudflare Web Analytics (off by default)

Web Analytics can be enabled later from the Cloudflare dashboard **without** collecting CSV contents (page metrics only). Do **not** paste an unverified beacon snippet into this repository.

Before enabling analytics:

1. Decide whether Cloudflare will auto-inject the beacon for Pages.
2. Update `site/_headers` CSP to allow `https://static.cloudflareinsights.com` in `script-src` and the appropriate `connect-src` endpoint documented by Cloudflare.
3. Rebuild, redeploy, and verify the console shows no CSP violations.
4. Update the public privacy copy in `README.md` / the in-app Privacy details to state that privacy-friendly visit analytics are on.

Until those steps are done, keep analytics **off**. A strict `'self'` CSP is intentional for the first release.

### GitHub Pages

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

## Connecting the Tally feedback form

Connected for release: `FEEDBACK_FORM_URL` = `https://tally.so/r/68aLbP` in `src/feedback.ts` (plain external link; no embed script).

Expected Tally fields: Feedback type (Bug report / Feature idea / Other), required Description, optional Email for replies only, no mandatory sign-in, no spreadsheet upload.

If the form URL ever changes, update `FEEDBACK_FORM_URL`, rebuild, and re-verify the button before deploy.
