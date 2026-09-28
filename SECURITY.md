# Security policy

## Supported versions

Security fixes target the current `main` branch of FieldCheck (static browser build).

## Reporting a vulnerability

Please **do not** open a public GitHub Issue for security vulnerabilities.

Use GitHub private vulnerability reporting:

1. Open https://github.com/Marshall-Studio/FieldCheck/security/advisories/new
2. Describe the issue, impact, and reproduction steps.
3. Use **synthetic** CSV examples only — never attach confidential datasets.

If private advisories are unavailable for any reason, email the repository owner through the GitHub profile contact options and mark the message as a security report.

We aim to acknowledge reports within a few business days.

## Scope notes

FieldCheck is a static website that processes CSV files in the visitor’s browser. There is no FieldCheck file-upload API, account database, or server-side processing of user spreadsheets in V1. Reports about third-party host configuration (for example Cloudflare dashboard settings) are welcome when they affect this project’s published headers or scripts.
