# Codex Build Plan — small verified vertical slices

## Working agreement
Codex is the implementation agent; the product blueprint, ontology, tokens, and acceptance tests are the contract. Work in one milestone at a time. Before code, state files to change and evidence for acceptance; after code, run checks and summarize meaningful changes.

### Slice 0 — Repository contract and setup
**Goal:** make the monorepo reproducible.  
**Deliverables:** Next.js App Router TS strict web app, FastAPI Python 3.12+ API, lockfiles, env example, Dockerfile(s), compose, READMEs, CI skeleton, health endpoint. Keep no-op screens minimal.  
**Verify:** fresh clone install, frontend build, API health, lint/typecheck/tests in CI.

### Slice 1 — Design shell and homepage
**Goal:** ship distinctive visual system without feature clutter.  
**Deliverables:** exact design tokens from DESIGN_SYSTEM, responsive nav, custom pixel compass using self-created SVG/CSS only, homepage H1+2 CTAs, lens switch state.  
**Verify:** snapshot at mobile/desktop, accessible buttons and focus, no horizontal scroll at 375px.

### Slice 2 — Seeded read-only graph API
**Goal:** canonical model before visualization.  
**Deliverables:** Pydantic models, JSON file loading, GET graph/node/connections/health, deterministic node adjacency, startup validator, Swagger docs. The approved Slice 2 request uses `/api/v1`; path and radar APIs are deferred. See `SLICE_2_IMPLEMENTATION.md`.  
**Verify:** >=30 nodes, >=55 edges, no duplicate/dangling/cyclic prerequisites, API 404 unit tests, zero fake credential/event source claims.

### Slice 3 — Universe Explorer
**Goal:** flagship experience. Implemented scope and evidence: `SLICE_3_IMPLEMENTATION.md`.  
**Deliverables:** @xyflow/react graph, stable layout, search, topic filters, 3 depth lenses, inspector, relation rationales, deep-link node selection, keyboard and mobile list alternative.  
**Verify:** selected node survives lens change; 3 lenses render different authored content; click edge explains relation; keyboard reaches node; mobile works.

### Slice 4 — First learning path
**Goal:** demonstrate navigation to action. Implemented scope and evidence: `SLICE_4_IMPLEMENTATION.md`.  
**Deliverables:** authored 6-stage Agent Builder path, per-stage complete/reopen controls, localStorage, explicit local-only privacy wording, next-step function.  
**Verify:** reload persists state; corrupted state recovers; dependencies show before dependent stages; user can reset progress.

### Slice 5 — First mission
**Goal:** connect learning to hands-on output. Implemented scope and evidence: `SLICE_5_IMPLEMENTATION.md`.  
**Deliverables:** FAQ Agent mission, synthetic-data safety notes, checklist, test cases, optional GitHub repo URL field only if no public storage.  
**Verify:** all checklist tasks reachable, progress persists, keyboard-only completion, no false auto-validation of code.

### Slice 6 — Microsoft Radar (approved scope)
The approved Slice 6 request narrows this milestone to curated event discovery,
Slice 5 pre-flight checks, integrations and engineering verification. It does not
authorize public deployment or further release features. Implemented record:
`SLICE_6_IMPLEMENTATION.md`; contract: `RADAR.md`.

The original broader release outline below is retained for roadmap context only.
**Goal:** public-quality vertical demo.  
**Deliverables:** Radar empty state + official links, verified events optional, source QA, custom favicon, contributor docs, app disclaimer, screenshots/demo, health logs, deploy.  
**Verify:** build/test/type/lint, smoke E2E Explorer→path→mission, visual regression QA, production health, links verified, accessibility pass.

## Codex prompts (run sequentially; do not issue all at once)

### Prompt A — contract and scaffold
"Read AGENTS.md and all docs. Implement ONLY Slice 0 from docs/CODEX_BUILD_PLAN.md. Keep architecture as specified (Next.js TS strict, FastAPI/Pydantic, curated JSON, no DB/auth). Add a reproducible setup, automated checks and small README. Report changed files, commands, results and tradeoffs. Do not continue to other slices."

### Prompt B — design shell
"Implement ONLY Slice 1 using docs/DESIGN_SYSTEM.md. Make the homepage premium, clean, retro-modern and responsive. All art must be original; do not fetch/copy Windows XP icons, wallpaper, or Microsoft logos. Add accessibility and interaction tests. Run checks; report screenshots or manual verification at 375px and 1440px."

### Prompt C — knowledge graph API
"Implement ONLY Slice 2. Parse content/graph.seed.json via strict Pydantic models, validate IDs and REQUIRES DAG, add the graph/node/connections /api/v1 endpoints from TECHNICAL_ARCHITECTURE.md. No Microsoft API calls. Add tests for malformed inputs, duplicates, cycles and 404. Keep seed-review status clearly visible."

### Prompt D — interactive Universe
"Implement ONLY Slice 3, respecting the blueprint and design system. Use @xyflow/react with custom nodes and stable layout. Implement 3 lens projections, search, inspector, typed edge explanations, a shareable node URL, and a functional mobile outline alternative. Keep graph state stable while changing lenses. Add tests for behavior and accessibility."

### Prompt E — learning to building
"Implement ONLY Slice 4 and Slice 5. Use the path and mission JSON, deterministic progress rules, resilient localStorage versioning, explicit local-only UI, and real checklist behaviors. Connect stage and mission back to node deep links. Add unit tests and E2E flow. No login, tracking, AI mentor or scoring."

### Prompt F — shippable release
"Implement ONLY Slice 6: Radar transparent empty state and trustworthy official event links, source/provenance display, production error handling, responsive QA, docs and CI hardening. Verify source destinations manually or leave review state. Deploy only after checks; document envs and actual production URL. Provide honest test and deployment results."

## Definition of done for every PR
1. Clearly scoped to one slice, no surprise features.
2. Working implementation with meaningful tests, not placeholder buttons.
3. Lint + frontend typecheck/build + backend Ruff/mypy/pytest.
4. Accessibility focus & mobile considered.
5. No undocumented external data collection or API key exposure.
6. README/architecture docs updated when interface contract changes.
7. Brief PR summary: changed paths, user-visible behavior, limitations, verification commands/results.

## Slice 7 — Public Beta Readiness (user-approved extension)

Release review of Slices 0–6 only: content/source audit, manual Radar maintenance,
journey/accessibility/security/export checks, contributor/license readiness and
local production rehearsal. No new feature slice or public deployment. The central
checklist is RELEASE_READINESS.md; implementation and exact verification are recorded
in SLICE_7_IMPLEMENTATION.md. Public-beta decision: NO-GO pending listed acceptance
gates. This extension does not authorize Slice 8.
