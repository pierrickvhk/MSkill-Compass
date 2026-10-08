# Slice 3 — Interactive Universe Explorer

Implemented and verified locally on 2026-10-08. Slice 4 has not been started.

## What shipped

`/explore` loads the actual **30 nodes and 71 relationships** from FastAPI. Users
can select nodes, search names and metadata, narrow the list by category, switch
lenses, inspect relationship meaning and rationale, and open attributed source
links. Shareable selections use `/explore?node=<seed-id>`; browser Back/Forward
updates the selection. No accounts, personal progress, AI, synchronization or
database changes were introduced. The homepage remains the approved visual design.

## Visualization architecture

`@xyflow/react` **12.12.0**, MIT-licensed, is the only added direct dependency. Its
React peer requirement is `>=17`, compatible with the installed React 19 stack.
React Flow attribution remains visible. Implementation follows the official
[custom node](https://reactflow.dev/learn/customization/custom-nodes),
[TypeScript](https://reactflow.dev/learn/advanced-use/typescript), and
[accessibility](https://reactflow.dev/learn/advanced-use/accessibility) APIs.

- `lib/graph.ts` contains the API types, category/relationship labels, deterministic
  search, lens priorities and layout projection. Seed identifiers remain identities.
- `components/explorer/graph-canvas.tsx` is a client-only React Flow adapter with
  typed custom nodes, read-only handles, pan/zoom/fit and edge selection. Node
  positions never depend on a lens or randomness. Keyboard node focus pans the
  node into view; Enter/Space activates native node buttons and focusable edges.
- `components/explorer/explorer.tsx` coordinates requests, selection, URL history,
  search, category, list/map controls and mobile detail navigation.
- `components/explorer/inspector.tsx` presents authored explanations, full typed
  relationships, provenance and safe source links.
- `components/explorer/explorer.css` scopes the new layout and category styling.

Initial desktop selection is Copilot Studio when present, otherwise the first
API node. Its one-hop neighborhood is shown, not all 71 edges. In the seed this
means 11 nodes and 10 connections. Reset shows all 30 nodes in deterministic topic
columns; edges appear after selecting a node. Directed edges retain `from → to`;
`INTEGRATES_WITH` has arrows at both ends. `RELATED_TO` is dashed. Active edges
are emphasized and labelled; the inspector provides a complete text alternative.
No edges, prerequisites, capabilities or explanations are generated.

## Frontend API integration and configuration

The backend schemas and routes are unchanged. `lib/api.ts` mirrors their response
models, checks runtime shapes, and calls all three endpoints:

- `/api/v1/graph` for navigation and the canvas;
- `/api/v1/nodes/{node_id}` for selected-node details;
- `/api/v1/nodes/{node_id}/connections` for the inspector's incoming, outgoing and
  symmetric relationships.

The browser uses same-origin URLs. `app/api/v1/[...path]/route.ts` forwards only
these GET routes to server-only **`API_BASE_URL`**, read at runtime. Native default:
`http://127.0.0.1:8000`. Compose: `http://api:8000`, independent of host port mapping.
There is no public build-time API URL and no CORS dependency between the browser
and gateway. Existing backend CORS remains intact. The gateway uses a 10-second
upstream timeout, disables caching, preserves unknown-node 404s, and returns a
bounded 502 message on upstream failures without exposing internal addresses.

The UI announces graph/detail loading and errors, with explicit Retry controls.
Empty datasets, empty searches, isolated nodes, missing sources and missing lens
text have honest states. No failed request falls back to a bundled seed or sample
network. Requests are cancelled when selection changes or the component unmounts;
stale responses cannot overwrite a newer selection. A failed detail request can
retry without reloading the graph. Unsafe source URLs are never rendered as links.

The test-only `tests/fixtures/graph.json` is a canonical repository export, not a
runtime fallback. Docker HTTP smoke compares it to the actual FastAPI response,
then compares every proxy route to its backend equivalent. When intentional seed
or schema changes occur, regenerate this fixture from `GraphRepository.canonical_json()`
and review the diff; never modify product content to satisfy an old fixture.

## Lenses and navigation

All lenses use `node.explanations[level]`, falling back to the summary with the
label **General explanation · lens detail unavailable**. They never generate
additional details or imply proficiency.

| Lens | Default connections | Ordering priority |
|---|---|---|
| Explorer | 3, with Show all | Enables, part of, integrations, then prerequisites and other relations |
| Builder | 5, with Show all | Integrations, uses, enables, then remaining relations |
| Architect | All | Governance, prerequisites, uses, then remaining relations |

Priorities are explicitly MSkill editorial ordering. The selected node, search,
category, graph coordinates and camera survive lens changes. Every relationship
remains available. Selected-edge details remain available even if lens ordering
moves that relationship below the default list limit.

Search matches every entered word across title, ID, summary, kind, topic and tags.
It filters the list without dropping the current map selection. Selecting a result
focuses its neighborhood and inspector. Category is a single native select; no
advanced filter system is added. Reset clears selection/search/category and fits
the overview. Fit view changes the camera only. Desktop List view provides the
same complete navigation without needing to operate a diagram.

## Responsive and accessible behavior

Desktop has a search list, graph canvas and right-hand inspector. At intermediate
widths the search list moves above the map. At **768px and below**, the map is hidden
and a searchable list is primary. Selecting a list entry opens the full-width,
in-flow inspector; its heading receives focus. Back to list restores the search
field, including its query and category. The existing mobile status bar stays in
flow at the requested 390px and 375px widths.

Controls use native buttons, radios, inputs and selects, with visible focus,
selection states and accessible names. Nodes and relationships can be operated
from the graph or the list. Category labels and arrow/direction text accompany
color. External links include publisher/domain, new-tab notice and
`rel="noopener noreferrer"`. Existing reduced-motion CSS remains; programmatic
camera and detail movement use zero-duration/instant behavior, with no animated
edges. The graph can be bypassed entirely using desktop List view or mobile.

## Verification and source policy

The UI labels seed-review as **not verified**, even if an official Microsoft URL
exists. `verified` is **Verified by MSkill**, with the recorded review date. The
edge's confidence independently determines “MSkill editorial guidance” versus
“Documented Microsoft relationship.” Nested sources keep their own status. URL
availability and factual claims are not automatically checked. Missing evidence
is shown as missing. The seed is byte-identical and every existing node/edge
remains seed-review; all existing relationships remain editorial.

## Verification results

| Check | Command/evidence | Result |
|---|---|---|
| Frontend lint | `npm --prefix apps/web run lint` (via `check`) | PASS |
| Strict TypeScript | `npm --prefix apps/web run typecheck` | PASS |
| Frontend tests | `npm --prefix apps/web test` | PASS, 23 tests / 3 files |
| Production build | `npm --prefix apps/web run build` | PASS: `/`, `/explore`, gateway route |
| Backend Ruff and formatting | `.venv/bin/ruff check .` / `.venv/bin/ruff format --check .` in `apps/api` | PASS |
| Backend strict typing | `.venv/bin/mypy mskill_api tests` | PASS, 8 files |
| Backend tests | `.venv/bin/pytest` | PASS, original 72 tests |
| Docker rebuild and startup | Alternate-port Compose command below | PASS, both services healthy |
| Live Docker HTTP smoke | Alternate-port smoke command below | PASS, backend routes, proxy parity, fixture parity, both pages |
| Production dependency audit | `npm audit --omit=dev --json` in `apps/web` | PASS, zero reported advisories |
| Responsive browser review | 1440×1000, 390×844, 375×812 | PASS, no horizontal overflow |

The full frontend command was `NEXT_TELEMETRY_DISABLED=1 npm run check` in
`apps/web`. Existing six homepage/launcher/button regression cases pass. The old
static Explorer test was replaced by live-client interaction coverage. New cases
cover API mapping/errors/404, gateway boundaries, deterministic layout, search,
lens ordering, selection, inspector rationale, missing content, safe source links,
verification badges, mobile return focus, deep links/history, empty states,
retries and stale-response cancellation. The canvas is mocked in DOM unit tests;
actual React Flow behavior was verified in the browser.

Browser evidence: search-result selection with Enter; selected node and exact
camera transform preserved across lens change; 30 overview nodes; 10 real
Copilot Studio edges; keyboard node and edge activation; relationship rationale;
pan transform change; zoom transform change and fit restoration; mobile search,
details and focus return. Screenshots and links are in [DESIGN.md](DESIGN.md).
Temporary responsive viewport overrides were reset after review.

Initial test runs caught a nullable DOM reference, asynchronous test queries that
ran before data loaded, and an overly narrow search assertion (Cloud flows also
mentions Power Automate). These were corrected. Final checks have no failures.
Existing Vite native-loader and Starlette TestClient deprecation warnings remain.
The install reported five development-tool high-severity advisories; production
package audit is clean. No unrelated dependency upgrades were applied. No hosted
GitHub Actions run, full screen-reader audit, axe scan or Lighthouse measurement
is claimed. Browser screenshots are manually reviewed, not automated visual diffs.

## Changed files

New: `apps/web/lib/{graph,api}.ts`, `apps/web/app/api/v1/[...path]/route.ts`,
`apps/web/components/explorer/{explorer,graph-canvas,inspector}.tsx`,
`apps/web/components/explorer/explorer.css`,
`apps/web/tests/{explorer.test.tsx,graph.test.ts,graph-fixture.ts,fixtures/graph.json}`,
this record and five `docs/screenshots/slice-3-*.png` files.

Updated: `apps/web/app/explore/page.tsx`, homepage availability copy in
`apps/web/app/page.tsx`, `apps/web/components/{shell,ui}.tsx`,
`apps/web/package.json`, lockfile, `apps/web/tests/page.test.tsx`,
`docker-compose.yml`, `.env.example`, `scripts/smoke.mjs`, README,
`docs/{DESIGN,GRAPH_ENGINE,TECHNICAL_ARCHITECTURE,CODEX_BUILD_PLAN}.md`.

Backend implementation, all backend tests, content JSON, homepage CSS, compass
art, dependencies other than React Flow and its transitive packages, and existing
CI configuration are unchanged. The workspace still has no committed baseline;
`git status` includes earlier slices. Nothing was committed or published.

## Run locally and limitations

```sh
WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait --wait-timeout 180
WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs
```

Open <http://localhost:3001/explore?node=copilot-studio>. API documentation remains
at <http://localhost:8001/docs>. Native setup and runtime API configuration are in
README. No keys or external Microsoft accounts are needed.

The graph is curated, small, and entirely seed-review. Some Builder/Architect
explanations are general authored guidance rather than detailed implementation
recipes; the UI renders them as supplied. Full overview nodes may need zoom or
list navigation. The layout is deterministic rather than an optimized graph
layout engine. No relationship-type filtering, graph editing, saved progress,
resource catalog or learning-path experience is included. Lenses reset on reload;
only the selected node is represented in the URL.

Recommended next step: review this Explorer with real learners, then authorize
**Slice 4 — First learning path**. No Slice 4 work was performed.
