# Architecture and tradeoffs

```
User CSV files -> browser File.text -> TypeScript CSV parser
                                   -> validation engine -> issues -> report CSV
Baseline + current -> key-based comparison -> field-level differences -> report CSV
Static HTML UI -> DOM textContent; no unsafe innerHTML for file content
```

No login, database, backend, paid API, or file-storage service is required for V1. The only fetches are public sample CSVs from the website. JavaScript modules compile to `site/assets`. Publishing `site/` on a static host preserves the browser-only model.

**Why not React/SQL/FastAPI immediately?** The utility prioritizes safety, comprehensibility, and low operating costs. Zero runtime dependencies keep the initial app easy to audit and free to operate. A typed UI framework or SQL engine can be introduced behind documented boundaries when user needs justify it.

**Why comparison rejects duplicate identifiers:** choosing one of several conflicting records silently would produce misleading migration results. Validation identifies issues first; comparison refuses ambiguous IDs.

**Why exact value comparison:** spaces and case changes can matter in source-to-target data reconciliation. Key IDs are trimmed as a documented exception; ordinary cells are not. Header name matching ignores case.

**How optional future paid features fit:** isolate core validation/comparison from presentation. Future hosted accounts can store metadata and entitlement; move expensive processing behind explicitly opted-in server routes. Public local checks stay useful for free. Payments and stored data are out of scope until needed, and the application must disclose any change in data handling.
