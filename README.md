# MSkill Compass

An independent, open-source Microsoft AI & Automation learning navigator.
**Explore. Learn. Build.**

## Current scope: Slice 7 — beta readiness

The existing product is undergoing public-beta review. Engineering gates pass, but
release acceptance is still **NO-GO**; see [the central checklist](docs/RELEASE_READINESS.md)
and [Slice 7 handoff](docs/SLICE_7_IMPLEMENTATION.md). No public deployment has occurred.

### Existing product experience

Microsoft Radar at `/radar` offers six manually verified official event records,
local-time dates, upcoming/past/cancelled views and topic/format filters. Events link
to existing graph nodes; Explorer and the active learning milestone show exact
topic matches. The catalog is maintained manually, with no runtime Microsoft API,
registration, notifications or personal recommendations. See
[Radar contracts and curation policy](docs/RADAR.md) and
[Slice 6 verification and screenshots](docs/SLICE_6_IMPLEMENTATION.md).

Builder Lab at `/lab/first-agent` guides **Build Your First Copilot Studio Knowledge
Agent** through five phases. Separate design-only and actual-build records keep
notes, four manual test scenarios and seven deliverables locally. Resume, reset
with confirmation, and export a Markdown project summary. All progress and evidence
are self-reported; MSkill never executes or verifies a Microsoft agent.
See [Builder Lab contracts](docs/BUILDER_LAB.md) and
[Slice 5 verification and screenshots](docs/SLICE_5_IMPLEMENTATION.md).

My Learning Compass at `/learn/agent-builder` offers **From Zero to Copilot Agent
Builder**: six curated milestones, official reference links, practical checkpoints
and browser-local, self-reported progress. Choose a step, explore its graph nodes,
return to the same stage, mark it complete or reopen it. Reset requires confirmation.
See [Learning Compass contracts](docs/LEARNING_COMPASS.md) and
[Slice 4 verification](docs/SLICE_4_IMPLEMENTATION.md).

The Universe Explorer at `/explore` now navigates the real FastAPI graph with
React Flow, search, a category selector, three lenses, relationship explanations,
and source-aware details. Mobile uses a searchable list and dedicated inspector.
Node URLs such as `/explore?node=copilot-studio` can be shared. The original
homepage design and its explicitly labelled illustration remain intact.
See [Slice 3 architecture and verification](docs/SLICE_3_IMPLEMENTATION.md) and
[visual decisions](docs/DESIGN.md).

The read-only graph engine validates the complete seed at startup: **30 nodes and
71 relationships**. Typed endpoints expose the graph, individual nodes and their
connections. `GET /health` retains its original response
`{"status":"ok","graph_version":"v1"}`.
See [Graph engine contracts](docs/GRAPH_ENGINE.md) and
[Slice 2 implementation and verification](docs/SLICE_2_IMPLEMENTATION.md).
The graph and authored path guidance remain **seed-review**; seven learning
reference titles and destinations were manually checked on 2026-10-08. No authentication, AI assistant,
database, telemetry, or external Microsoft API synchronization is implemented.

## Run with Docker (recommended)

Install Docker with Compose v2, then from the repository root:

```sh
cp .env.example .env
docker compose up --build --wait
```

Open <http://localhost:3000>, <http://localhost:8000/health>, or API documentation
at <http://localhost:8000/docs>. No keys or external accounts are needed.

Source edits under `apps/web/app`, `apps/web/components`, and `apps/api/mskill_api` reload automatically.
Restart the API after editing content JSON. Rebuild after dependency or config
changes. Ports bind to localhost only. To change ports, edit `.env`; if changing
the web port, also update `CORS_ORIGINS` to the browser origin.

```sh
node scripts/smoke.mjs  # optional host Node.js 24 required
# With custom ports: WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs
docker compose logs -f
docker compose down
```

If port 3000 is occupied, use:

```sh
WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait
WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs
```

## Read the graph

```sh
curl http://localhost:8000/api/v1/graph
curl http://localhost:8000/api/v1/nodes/copilot-studio
curl http://localhost:8000/api/v1/nodes/copilot-studio/connections
```

Unknown nodes return HTTP 404 with `{code,message}`. Use port 8001 if running
the custom-port commands above. The frontend calls these routes through its same-origin Next.js gateway.

## Native development

Use Node.js **24.14.1** (`nvm use`), Python **3.12+** (CI uses 3.12), and
**uv 0.12.23**. Install uv using its official installation instructions:
<https://docs.astral.sh/uv/getting-started/installation/>.

Terminal 1, from the repository root:

```sh
cd apps/api
uv sync --frozen --python 3.12
uv run --frozen uvicorn mskill_api.main:app --reload
```

Terminal 2:

```sh
cd apps/web
npm ci
NEXT_TELEMETRY_DISABLED=1 npm run dev
```

Native processes use defaults without `.env`. Set `CORS_ORIGINS` explicitly in
the API shell when needed (comma-separated origins; wildcards rejected).
Optional `CONTENT_PATH` overrides the absolute seed path. The Next.js server uses
`API_BASE_URL` (default `http://127.0.0.1:8000`); for an API on 8001, start the web
with `API_BASE_URL=http://127.0.0.1:8001 NEXT_TELEMETRY_DISABLED=1 npm run dev`.
Compose sets `API_BASE_URL=http://api:8000` internally, regardless of host ports.
The browser always uses same-origin `/api/v1` routes. Production standalone Next.js
also reads this server-only variable at runtime; no public API URL or build-time
secret is required. Native processes do not automatically read the root `.env`.

## Automated checks

```sh
cd apps/web
npm run check  # ESLint, strict TypeScript, Vitest, production build
```

From a separate shell:

```sh
cd apps/api
uv run --frozen ruff check .
uv run --frozen ruff format --check .
uv run --frozen mypy mskill_api tests
uv run --frozen pytest
```

With both services running, execute `node scripts/smoke.mjs` from the root.
See `docs/SLICE_6_IMPLEMENTATION.md` for current results;
`docs/SLICE_0_IMPLEMENTATION.md` records foundation dependency advisories.
The same checks run in `.github/workflows/ci.yml`, including Docker HTTP smoke.
For container-only checks, use `docker compose exec web npm run check` and
`docker compose exec api uv run --frozen pytest` (or the Ruff/mypy commands above).

Both Dockerfiles also have a `production` target: the web uses Next.js standalone
output, and the API excludes development dependencies. Both run as non-root users.
Example: `docker build -f apps/web/Dockerfile --target production -t mskill-web .`.
Python's base image tracks the 3.12 patch line; package dependencies are locked.

## Repository map and contribution contract

- `apps/web/`: Next.js, strict TypeScript, Vitest and Testing Library.
- `apps/api/`: FastAPI, Pydantic, strict mypy, Ruff and pytest.
- `content/`: curated graph JSON and curated path, mission and event catalogs.
- `docs/`: product and engineering contracts plus implementation evidence.
- `scripts/smoke.mjs`: live graph/path/mission/Radar contracts, fixture parity, health and page checks.

Read `AGENTS.md` and all `docs/` before changing code. Work in one approved slice.
Commit lockfiles; use `npm ci` and `uv sync --frozen` for reproducible installs.
Invalid graph content prevents API startup with located validation errors.
Do not upgrade editorial claims to verified without source review.

Independent community project. Not affiliated with or endorsed by Microsoft.
Microsoft names belong to their respective owners. No Microsoft artwork is used.
Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Pierrick Van Hoecke.
MSkill Compass remains the project identity. Microsoft source content is not
implicitly licensed by this project.

## Public beta readiness (Slice 7)

This candidate is under release review, not a launched beta. Start with
[the release checklist](docs/RELEASE_READINESS.md), which distinguishes automated
checks, manual acceptance and known content limitations.

For an isolated production rehearsal, run from the repository root:

```sh
docker compose -p mskill-beta-check -f docker-compose.production.yml up --build --wait --wait-timeout 180
API_URL=http://localhost:8002 WEB_URL=http://localhost:3002 node scripts/smoke.mjs
```

Open http://localhost:3002. Stop with
`docker compose -p mskill-beta-check -f docker-compose.production.yml down`.
See [deployment and operations](docs/DEPLOYMENT.md) for configuration, health,
rollback and the proposed simple HTTPS architecture. No public deployment is included.

[Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md) ·
[Third-party attribution](THIRD_PARTY_NOTICES.md).
The original copyright holder is Pierrick Van Hoecke; the project is MSkill Compass.
Third-party components and linked Microsoft content retain their own licenses. Original MSkill compass branding, icons and illustrations belong to this
project; no Microsoft endorsement is implied.
