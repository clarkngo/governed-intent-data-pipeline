# GIDP Lab

Interactive, fully client-side simulation of **Governed Intent-Driven Data Engineering: An Architectural Framework for AI-Assisted Data Pipelines Across the Analytics Lifecycle** by Clark Jason Ngo.

Natural-language intent is compiled into a structured plan, evaluated against defense-in-depth guardrails, then executed in the browser with DuckDB-Wasm. No warehouse, GPU, or model API is required. Synthetic identifiers never leave this tab.

## Run locally

GitHub Pages (and any static server) is the intended host. DuckDB-Wasm needs HTTP(S) for workers; opening the file from disk may fall back to the in-memory JS engine.

```bash
# Python 3
python3 -m http.server 8080

# or Node
npx --yes serve -p 8080
```

Open [http://localhost:8080](http://localhost:8080) for the lab and [http://localhost:8080/docs.html](http://localhost:8080/docs.html) for the knowledge base.

Use **Walkthroughs** in the header (or `?tour=retention`) for Back/Next spotlight tours. If a panel is still hidden (banner, HITL modal, results), the popup waits and offers **Retry**.

## GitHub Pages

This repository already includes `.github/workflows/static.yml`. Enable **Settings → Pages → GitHub Actions**, then push `main`. The lab is a static `index.html` + `app.js` pair (Tailwind and DuckDB load from CDNs). `.nojekyll` is present so GitHub Pages does not process the files as Jekyll.

## What to try

| Template | Role | Expected decision |
| --- | --- | --- |
| Weekly retention | Analyst | **Allow** — PII-stripped regional aggregate, artifact published |
| Regional SLA | Analyst | **Allow** — ticket volume / CSAT / TTR by region |
| Show everything | Analyst | **Clarify** — unbounded scope, no SQL dispatched |
| Export emails + SSN | Analyst | **Block** — escalate to Data Engineer |
| Export emails + SSN | Admin / DE | **Block** → HITL → substitute governed aggregate (SSN still stripped) |
| Prompt injection | Either | **Block** — override language is never honored; Admin HITL may only run the redacted retention report |

Keyboard: `⌘/Ctrl+Enter` compiles the current prompt.

## Architecture (maps to the paper)

1. **User interaction** — role binding (Analyst least-privilege vs Admin/DE), prompt templates, free-form intent.
2. **Planning & policy** — deterministic intent compiler (no remote LLM) emits Intent, Target Datasets, Identity Validation, Risk, Transformation Logic, and Quality Checks. Four guardrails run before any warehouse session: Identity/RBAC, Prompt Injection, Catalog Authorization & Classification, Tool Allowlists & Quotas.
3. **Execution** — DuckDB-Wasm (EH/MVP bundles, no SharedArrayBuffer) on mock `customers`, `subscriptions`, and `support_tickets`. Restricted columns (`ssn`) are non-overridable. If Wasm workers fail, an equivalent JS engine runs the same aggregations.
4. **Observability** — immutable audit/lineage log (timestamp, role, decision, guardrails, SQL, quality stats, artifact download). Session log is kept in `localStorage`.

Policy highlights:

- Analyst: `SELECT` + `AGGREGATE` only.
- Confidential PII (`name`, `email`): blocked for Analyst; Admin may break-glass a **substitute** aggregate, never a raw dump.
- Restricted (`ssn`): never projected, even under break-glass.
- Denied tools: `export.raw`, `COPY TO`, DDL/DML, outbound HTTP.

## Stack

- Static pages: `index.html` (lab), `docs.html` (knowledge base), `tour.js` / `tour.css` (walkthroughs)
- Guided scenarios: lab anatomy, approved retention, clarify, PII block, injection, HITL break-glass
- Tailwind CSS via CDN
- DuckDB-Wasm 1.29.0 via jsDelivr, with a JS fallback
- No build step, no backend, no GPU
