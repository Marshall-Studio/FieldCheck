# Security policy

## Supported versions

Security fixes target the current `main` branch of FieldCheck (static browser build).

## Reporting a vulnerability

Please **do not** open a public GitHub Issue for security vulnerabilities, and do not include confidential CSV datasets.

Use GitHub’s **private vulnerability reporting** for this repository:

1. Open the Security advisories page for `Marshall-Studio/FieldCheck` and create a new private report  
   (direct path: `/Marshall-Studio/FieldCheck/security/advisories/new` on github.com).
2. Describe the issue, impact, and reproduction steps with **synthetic** examples only.

Ordinary product feedback (bugs and ideas) belongs on the public FieldCheck website **Send feedback** link (Tally) — not through private security channels.

We aim to acknowledge security reports within a few business days.

## Scope notes

FieldCheck is a static website that processes CSV files in the visitor’s browser. There is no FieldCheck file-upload API, account database, or server-side processing of user spreadsheets in V1. Reports about third-party host configuration (for example Cloudflare dashboard settings) are welcome when they affect this project’s published headers or scripts.
