# Slice 2 — Implementation and verification

Verified locally on 2026-10-08. Scope: validated, read-only knowledge graph backend.
Slice 1.1 remains the visual baseline. Slice 3 has not been started.

## Outcome

The unchanged seed loads all **30 nodes and 71 edges** into strict Pydantic models.
Invalid schemas, provenance inconsistencies, duplicate IDs/relationships, missing
endpoints, self-references and prerequisite cycles prevent startup with useful
errors. The repository provides deterministic graph snapshots and node adjacency.
All seven ontology node kinds and relationship types are supported.

Implemented `GET /api/v1/graph`, `GET /api/v1/nodes/{node_id}`, and
`GET /api/v1/nodes/{node_id}/connections`, with explicit response models, OpenAPI,
and consistent unknown-node 404 JSON. `/health` preserves its previous contract.
Source status and confidence remain distinct; no source was fetched or promoted.

The current user-approved scope supersedes the build plan's older `/v1` prefix
and path/radar deliverables. Those endpoints remain deferred. No dependency,
lockfile, Docker configuration, CI configuration, content or frontend source changes
were needed. Existing CI automatically discovers the tests and runs the expanded
HTTP smoke script.

## Files changed in this slice

New:

- `apps/api/mskill_api/models.py` — domain, validation issue and response schemas.
- `apps/api/mskill_api/validation.py` — cross-record integrity and iterative DAG checks.
- `apps/api/mskill_api/repository.py` — loader, canonical serialization and snapshots.
- `apps/api/mskill_api/routes.py` — three read-only routes.
- `apps/api/tests/test_graph.py` — 63 test cases including parameterized cases.
- `docs/GRAPH_ENGINE.md` — models, semantics, validation, API examples and source policy.
- `docs/SLICE_2_IMPLEMENTATION.md` — this record.

Updated:

- `apps/api/mskill_api/main.py` — full startup validation and route composition.
- `apps/api/tests/test_health.py` — custom-version fixture now supplies a complete
  valid empty graph; the original nine test behaviors remain.
- `scripts/smoke.mjs` — real HTTP graph/node/connections, ordering and 404 checks,
  plus homepage and Explorer rendering.
- `README.md` — current scope, API examples and verification links.
- `docs/GRAPH_ONTOLOGY.md` — additive source/review fields and implemented policy.
- `docs/TECHNICAL_ARCHITECTURE.md` — implemented route contracts versus future roadmap.
- `docs/CODEX_BUILD_PLAN.md` — approved Slice 2 scope clarification.

The workspace has no committed baseline and all project files are untracked;
`git status` therefore includes earlier slices too. The list above identifies this
slice's changes; nothing was committed or published.

## Verification results

| Check | Command | Result |
|---|---|---|
| Backend lint | `cd apps/api && .venv/bin/ruff check .` | PASS |
| Backend formatting | `.venv/bin/ruff format --check .` | PASS, 8 files |
| Strict Python types | `.venv/bin/mypy mskill_api tests` | PASS, 8 files |
| Backend tests | `.venv/bin/pytest` | PASS, 72 tests |
| Frontend lint, strict types, tests, production build | `cd apps/web && NEXT_TELEMETRY_DISABLED=1 npm run check` | PASS, 7 tests; `/` and `/explore` built |
| Docker rebuild/startup | `WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait --wait-timeout 180` | PASS, both containers healthy |
| Docker HTTP smoke | `WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs` | PASS |
| Visual baseline preservation | SHA-256 comparison with pre-edit source hashes | PASS, all 9 app/component/style files unchanged |
| Seed preservation | SHA-256 comparison with pre-edit seed | PASS, unchanged |

The `.venv/bin/` backend commands use the existing locked environment; the README
lists equivalent `uv run --frozen` commands for fresh checkouts. No GitHub Actions
run was triggered; the equivalent local checks above were executed.

Coverage includes all seven node and relation types, required fields, strict
value rejection, source verification behavior, duplicate JSON keys, duplicate IDs
and triples (including reversed integrations), missing endpoints, self-links,
cycles, a valid diamond DAG, a 1,500-node prerequisite chain, deterministic output,
snapshot mutation isolation, unknown-node lookups, application isolation, startup
failure and API/OpenAPI contracts. Existing CORS and health tests still pass.

The expanded smoke initially failed on an incorrect test expectation for the
existing Explorer title (`MSkill Explorer` instead of `Universe Explorer / visual
preview`). The assertion was corrected and the entire smoke script passed on
rerun. An initial Ruff line-length finding was fixed before the final clean run.
No remaining check failures.

Non-failing existing warnings: Starlette's TestClient/httpx deprecation and Vite's
future native config-loader warning. Dependencies were not changed to address
these unrelated warnings. No new screenshot or browser accessibility audit was
performed: the approved visual source is byte-identical, its seven interaction
tests pass, and both pages render successfully over Docker HTTP.

Seed SHA-256:
`59abc36708fb2c8647d83f61a2b30bce392d9d256a8384c6995dd22f88ec0246`.

## Run and inspect

From the repository root:

```sh
WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait
WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs
curl http://localhost:8001/api/v1/graph
curl http://localhost:8001/api/v1/nodes/copilot-studio/connections
```

Web: <http://localhost:3001>. Swagger: <http://localhost:8001/docs>.
The original default-port setup remains documented in README.

## Limitations and recommended next step

All seed content remains editorial and seed-review. Provenance validation is not
factual verification or URL availability checking. Data stays in memory until a
restart; specialized resource/event/credential/mission fields and path/radar APIs
are not implemented. Full constraints and examples are in `GRAPH_ENGINE.md`.

Recommended next slice, subject to approval: **Slice 3 — Universe Explorer**,
consuming the established API with a typed client, accessible mobile list and
source-aware inspector while preserving the approved visual identity.
