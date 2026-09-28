# Deployment (prepared, not yet live)

FieldCheck is a static website. After `npm run build`, publish the generated **`site/`** folder. Source files stay in Git; `site/` is gitignored and rebuilt in CI or before deploy.

## Recommended free hosts

### Cloudflare Pages (recommended)

1. Sign in at [Cloudflare Pages](https://pages.cloudflare.com/).
2. Create a project connected to `Marshall-Studio/FieldCheck`.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `site`
   - **Node version:** `22`
4. Deploy. Confirm `https://<your-project>.pages.dev` loads, sample data works, and the feedback button opens GitHub Issues.

### GitHub Pages

1. In the repository, enable Pages for GitHub Actions (or the `gh-pages` branch).
2. Add a workflow that builds with Node 22 and uploads the `site/` artifact (do not commit `site/` to `main`).
3. Confirm the Pages URL serves `index.html`, `assets/*.js`, and `sample-data/*.csv`.

## Pre-launch checklist

- [ ] Manual sample QA still passes on the public URL (validation + comparison + exports).
- [ ] Feedback link opens `https://github.com/Marshall-Studio/FieldCheck/issues/new`.
- [ ] No analytics, accounts, or file-upload backend were added.
- [ ] README links to the live URL once it exists.

Do not claim a public site is live until this checklist is verified in a real browser.
