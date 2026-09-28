# Deployment (prepared, not yet live)

FieldCheck is a static website. After `npm run build`, publish the generated **`site/`** folder. Source files stay in Git; `site/` is gitignored and rebuilt in CI or before deploy.

## Recommended free hosts

### Cloudflare Pages (recommended)

1. Sign in at [Cloudflare Pages](https://pages.cloudflare.com/).
2. Create a project connected to `Marshall-Studio/FieldCheck`.
3. Build settings:
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `site`
   - **Node version:** `22`
4. Confirm `site/_headers` is present in the build output (security headers for CSP, clickjacking protection, MIME sniffing protection, referrer policy).
5. Deploy. Confirm `https://<your-project>.pages.dev` loads, sample data works, response headers match `_headers`, and **Send feedback** opens the published Tally form (after `FEEDBACK_FORM_URL` is set).

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

- [ ] Manual sample QA still passes on the public URL (validation + comparison + exports + light/dark).
- [ ] Live response includes CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a referrer policy.
- [ ] Feedback: set `FEEDBACK_FORM_URL` in `src/feedback.ts` to the published HTTPS Tally URL; rebuild; confirm the button opens the form and privacy copy mentions Tally.
- [ ] Feedback link opens the Tally form (not GitHub Issues); no vulnerability button on the public site.
- [ ] Web Analytics remains off unless CSP and privacy copy were updated together.
- [ ] No accounts, databases, paid APIs, or file-upload backend were added.
- [ ] README links to the live URL once it exists.
- [ ] Review `docs/SECURITY_REVIEW.md` and confirm residual risks are acceptable.
- [ ] Confirm commit authorship uses a GitHub `noreply` address for future commits (see privacy notes in the latest project log).

Do not claim a public site is live until this checklist is verified in a real browser.

## Connecting the Tally feedback form

1. In Tally, create a form with: Feedback type (Bug report / Feature idea / Other), required Description, optional Email for replies only, no mandatory sign-in, no file-upload field for spreadsheets.
2. Publish the form and copy its **https** share URL.
3. Set `FEEDBACK_FORM_URL` in `src/feedback.ts` to that URL (keep it empty until ready).
4. Rebuild (`npm run build`) and verify **Send feedback** appears and opens the form in a new tab.
5. Update privacy wording if needed (in-app Privacy details already disclose an external form when linked).
6. Commit, push, then deploy.
