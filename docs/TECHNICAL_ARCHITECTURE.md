# Technical Architecture and Interfaces

## MVP architecture
```
Browser (Next.js App Router + TypeScript)
   ├── React Flow Universe Explorer (@xyflow/react)
   ├── static design system/components
   ├── fetch typed read-only JSON API
   └── localStorage: lens, saved nodes, learning checklist (anonymous device-local)
             │ HTTPS /api/v1
FastAPI (Python 3.12+; Pydantic v2)
   ├── graph repository/service with deterministic traversal
   ├── curriculum/path service
   ├── source normalization & validation
   └── version-controlled JSON content loaded at startup
       ├── graph.seed.json
       └── path.agent-builder.json
```

No Postgres yet. Versioned curated JSON is fastest, reviewable, forkable and reliable for ~30 nodes. Add relational persistence for multi-user accounts, editor workflows or larger datasets later. No Neo4j needed at this stage.

### Routes / read-only API contract (implemented in Slice 2)
- `GET /health` → `{status:'ok', graph_version:'v1'}`.
- `GET /api/v1/graph` → `{version,status,nodes:GraphNode[],edges:GraphEdge[]}`.
- `GET /api/v1/nodes/{node_id}` → `GraphNode`; unknown ID returns 404.
- `GET /api/v1/nodes/{node_id}/connections` → `{node_id,incoming,outgoing,symmetric}`;
  unknown ID returns 404. Each connection is a complete `GraphEdge`.

The approved Slice 2 request supersedes the original `/v1` draft. Path and radar
endpoints remain future work; they are not exposed in this slice. See
[GRAPH_ENGINE.md](GRAPH_ENGINE.md) for implemented models, ordering, validation,
source policy and exact examples. React Flow, the typed client and read-only Next.js gateway are implemented in
Slice 3; local progress and later acceptance tests remain the roadmap. The browser
uses same-origin `/api/v1` requests; Next.js forwards only the three allowed routes
to runtime `API_BASE_URL`. See [SLICE_3_IMPLEMENTATION.md](SLICE_3_IMPLEMENTATION.md).

### Data shape conventions
- Use slug IDs as stable identities; paths reference canonical node IDs.
- Public API is read-only, with no credential to acquire private Microsoft tokens.
- Errors: JSON `{code,message}` and correct HTTP status.
- Never expose stack traces on public API; structured logs should avoid PII.
- CORS allowlist from environment, no wildcard credentialed-origin policy.
- URLs external use `target=_blank` + `rel=noopener noreferrer` and explicit publisher.

### Folder topology after implementation
```
mskill-compass/
├── AGENTS.md
├── apps/
│   ├── web/                 # Next.js + TypeScript
│   │   ├── app/
│   │   ├── components/      # Shell, Graph, Inspector, Lens, Path, Mission
│   │   ├── lib/             # Typed API client, local state
│   │   └── tests/
│   └── api/                 # FastAPI + Pydantic + pytest
│       ├── mskill_api/
│       └── tests/
├── content/                 # Authored seeded graph + paths
├── docs/                    # Product, design, ontology, architecture, decisions
├── .github/workflows/ci.yml
├── docker-compose.yml
├── README.md
└── .env.example
```

### Data validation tests
- IDs unique and stable; every edge endpoint exists.
- Edge triple `(from,to,type)` unique; no self-loop; `REQUIRES` subgraph acyclic.
- All external references parse as HTTPS URIs.
- Learning path references valid graph nodes; required stages form no cycles.
- Every official link is verified editorially before the `verified` badge appears.
- Snapshot contract test matches TS types expectations.
- API unknown node returns 404 and does not dump stack trace.

### Frontend tests
- Node select opens inspector with correct detail.
- Lens switching keeps selected node and changes text.
- Search, filters, clear filters, deep link all behave consistently.
- Roadmap next-step algorithm skips completed stages, respects prerequisite order.
- LocalStorage corruption safely resets to defaults without crashing.
- Mobile list works with keyboard and touch.
- Radar empty state includes trustworthy organizer links.

### Tooling and deploy
- Frontend: Next.js, TypeScript strict, @xyflow/react, Tailwind (optional, avoid over-frameworking), Vitest, Testing Library, Playwright.
- Backend: FastAPI, Pydantic v2, pytest, Ruff, mypy (strict where practical), structured logging.
- `docker compose up --build` brings both services up locally; document required env vars.
- CI: backend tests+lint+types; frontend tests+lint+types+build; smoke tests optional on PR and required before public launch.
- Deploy web to Vercel and API to Render/Fly.io/Azure Container Apps (choose ONE). Configure server-only `API_BASE_URL`, API CORS, uptime/health, deployment README and no frontend secrets.

### Future integration boundaries
- `CatalogProvider` behind adapter; `FixtureCatalogProvider` in MVP, `LearnPlatformCatalogProvider` after onboarding + Entra auth.
- `DocsSearchProvider` behind adapter; future Microsoft Learn MCP implemented through supported MCP client/agent framework, not raw fetch masquerading as REST.
- `EventProvider` behind adapter; curated event set initially; later organizer-approved integration.
- `ProgressRepository`: localStorage in MVP; later account-backed persistent store with explicit privacy/consent.

### Risks and decisions
1. API onboarding not granted → app still usable via curated seed.
2. Content ages quickly → last verified field and CI/manual source audit cycle.
3. Graph clutter → progressive disclosure, cluster entry, explicit layout and mobile outline view.
4. Unclear source copyright → link and summarize in original MSkill words instead of copying docs.
5. XP aesthetic harms trust/readability → use it as detail, not UI foundation.
6. Scope growth → no auth, vector DB, AI mentor, gamified XP in MVP.

## Slice 4 implemented boundary

`LEARNING_COMPASS.md` specifies the curated read-only path API, backward-compatible
seed extensions, source policy and versioned localStorage contract. Path routing
and validation are separate from the graph engine. The web gateway additionally
allows `GET /api/v1/paths/{path_id}`. Graph visualization never reads progress.
The optional mission brief now links to the Slice 5 Builder Lab.


## Slice 5 implemented boundary

`BUILDER_LAB.md` specifies the extended mission schema, read-only
`GET /api/v1/missions/{mission_id}` endpoint, cross-reference validation and
browser-local evidence contract. `/lab/first-agent` reads the mission, path and
graph through the existing same-origin gateway. Graph content still loads at
startup; path and mission JSON are validated on request. Evidence has no API
write route. Separate design/build records prevent simulated work from becoming
an implementation claim when switching modes. The graph canvas remains independent
of progress. No new dependency or infrastructure is introduced.


## Slice 6 implemented boundary

`GET /api/v1/radar` serves a typed, validated local event catalog through the same
read-only web gateway. `radar.py` owns schedule/source validation and graph
references; `radar_routes.py` owns transport. The browser classifies schedule status
at boundaries and on focus, without external polling. `/radar` displays localized
times, filters and source attribution. Graph and active learning-milestone links use
exact node-ID intersection, independent of progress. See `RADAR.md` for maintenance,
API and timezone contracts. No worker, sync, notification or deployment was added.

## Slice 7 production readiness

The runtime architecture is unchanged: Next.js same-origin read-only gateway,
FastAPI domain validation and versioned JSON; anonymous browser-local progress.
`docker-compose.production.yml` rehearses non-root production targets without reload
or source mounts. See DEPLOYMENT.md for loopback ports, health limitations, logs,
restart/rollback, immutable release evidence and the proposed single-host HTTPS setup.
RELEASE_READINESS.md is authoritative for launch status; no public deployment exists.
