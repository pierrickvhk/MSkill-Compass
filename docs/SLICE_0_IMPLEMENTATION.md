# Slice 0 implementation record

## Scope and decisions

Implemented only repository foundation. The original `AGENTS.md`, six contract
documents, and four JSON content files were copied byte-for-byte from the supplied
starter into the working repository. The Downloads starter was not edited.

- Next.js App Router, React, strict TypeScript; a minimal semantic foundation page.
- FastAPI/Pydantic, Python 3.12, strict mypy. `/health` reads the seed's version at
  startup; missing files or invalid metadata fail startup. No graph API or graph
  schema validation is claimed. Those belong to Slice 2.
- npm and uv lockfiles; Compose development services with source reload and HTTP
  health checks; separate non-root production Docker stages.
- ESLint/Vitest/Testing Library, Ruff/mypy/pytest, live HTTP smoke, GitHub Actions.
- No database, authentication, assistant, external synchronization, or product
  features from subsequent slices.

The default Next.js 16 ESLint CLI setup follows the
[official Next.js ESLint documentation](https://nextjs.org/docs/app/api-reference/config/eslint).
The API uses a project-owned image following the
[FastAPI Docker guidance](https://fastapi.tiangolo.com/deployment/docker/).
Webpack is explicitly selected for the production build for a conventional,
repeatable build path; the development server uses Next.js defaults.

## Verification

Executed locally on 2026-10-08 using Node 24.14.1 and Python 3.12.13:

| Command / check | Result |
|---|---|
| `npm ci` | PASS, clean install from lockfile |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS, strict TypeScript |
| `npm test` | PASS, 1 test |
| `npm run build` | PASS, production Next.js build |
| `uv sync --frozen` | PASS |
| `uv run --frozen ruff check .` | PASS |
| `uv run --frozen ruff format --check .` | PASS |
| `uv run --frozen mypy mskill_api tests` | PASS, 3 files |
| `uv run --frozen pytest` | PASS, 9 tests |
| Original docs/content byte comparison | PASS |
| `docker compose config --quiet` | PASS |
| Compose build/start with `WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001` | PASS, both services healthy |
| `WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs` | PASS |
| Both Dockerfiles built with `--target production` | PASS |
| HTTP smoke against production containers on ports 3002/8002 | PASS, temporary containers removed |
| `npm audit --omit=dev` | PASS, zero reported production vulnerabilities |
| Full `npm audit` | FAIL, 5 high findings in the development lint dependency chain |

Ruff initially identified a long line; formatting corrected it before the passing
run. The initial Vitest 3 dependency findings were resolved by upgrading to
Vitest 5. Final tool versions retain ESLint 9 and jsdom 26 for peer/Node
compatibility. The remaining `braces` advisory propagates through `micromatch`,
`fast-glob`, `@next/eslint-plugin-next`, and `eslint-config-next`. npm's proposed
fix downgrades the Next.js lint configuration to a different major and is not
applied blindly. Track upstream fixes; do not feed untrusted glob patterns into
lint tooling. See [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Non-failing upstream warnings: Starlette deprecates its httpx TestClient backend;
ESLint 9 is deprecated; Vite signals a future config-loading default change.
GitHub-hosted CI has not run because this repository has not been pushed.
No browser accessibility or visual regression claims are made for Slice 0.
The first Compose startup failed because port 3000 was already allocated by
another service. The verified development services remain on ports 3001/8001;
no unrelated services were stopped. Use the environment overrides above to
reproduce that setup. The standard 3000/8000 defaults remain in the example.

## Files added

All implementation files are new in the initially empty workspace repository.

- Root: `.gitignore`, `.dockerignore`, `.nvmrc`, `.env.example`, `README.md`,
  `docker-compose.yml`.
- Automation: `.github/workflows/ci.yml`, `scripts/smoke.mjs`.
- Web: `apps/web/package.json`, `package-lock.json`, `tsconfig.json`,
  `next-env.d.ts`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`,
  `Dockerfile`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`,
  `tests/setup.ts`, `tests/page.test.tsx`.
- API: `apps/api/pyproject.toml`, `uv.lock`, `.python-version`, `Dockerfile`,
  `mskill_api/__init__.py`, `mskill_api/main.py`, `tests/test_health.py`.
- Imported unchanged: `AGENTS.md`, `docs/CODEX_BUILD_PLAN.md`,
  `docs/DESIGN_SYSTEM.md`, `docs/GRAPH_ONTOLOGY.md`, `docs/PRODUCT_BLUEPRINT.md`,
  `docs/SOURCES_AND_DECISIONS.md`, `docs/TECHNICAL_ARCHITECTURE.md`,
  `content/graph.seed.json`, `content/path.agent-builder.json`,
  `content/mission.first-agent.json`, `content/radar.events.json`.
- This implementation record: `docs/SLICE_0_IMPLEMENTATION.md`.

## View and next boundary

Use the root README for Docker and native setup. The homepage is at
`http://localhost:3000`; health and Swagger docs are at
`http://localhost:8000/health` and `http://localhost:8000/docs`.

The next suggested slice is **Slice 1 — Design shell and homepage**, only after
explicit approval. It has not been started. A software license remains a
maintainer decision before public distribution, as required by the starter.
