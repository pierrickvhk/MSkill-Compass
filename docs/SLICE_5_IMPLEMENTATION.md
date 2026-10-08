# Slice 5 — Builder Lab implementation record

Date: 2026-10-08. Scope: Slice 5 only; Slice 6 has not started.

## Delivered

`/lab/first-agent` is a guided five-phase workshop with objectives/access guidance,
phase checkpoints and notes, four manual test scenarios, seven final deliverables,
evidence, an optional validated GitHub repository URL and local Markdown export.
Design-only and actual-build records are isolated and explicitly unverified.
Progress resumes locally and reset requires confirmation. Existing path and graph
navigation connect to the workshop without changing graph definitions/relationships.
The approved visual identity is retained; targeted focus and status-bar fixes apply
to the learning path and lab. No dependency or infrastructure was added.

## File inventory for this slice

The repository has no tracked baseline (all project files are untracked), so this
is the implementation inventory rather than a Git diff against an earlier commit.

| Area | Added/updated files |
| --- | --- |
| Seed | `content/mission.first-agent.json` |
| API | new `apps/api/mskill_api/mission.py`, `mission_routes.py`; updated `main.py` |
| API tests | new `apps/api/tests/test_mission.py` |
| Web route/gateway | new `apps/web/app/lab/first-agent/page.tsx`; updated `apps/web/app/api/v1/[...path]/route.ts` |
| Workshop | new `apps/web/components/lab/builder-lab.tsx`, `lab.css`, `node-mission-link.tsx` |
| Client/state/export | new `apps/web/lib/mission.ts`, `mission-progress.ts`, `mission-export.ts`; exported existing resource guard in `learning.ts` |
| Integration/focus | `apps/web/components/explorer/inspector.tsx`, `components/learning/learning-compass.tsx`, `components/learning/learning.css`, `components/shell.tsx`, `app/globals.css` |
| Web tests | new `apps/web/tests/mission.test.tsx`, `fixtures/mission.json`; updated `learning.test.tsx`, `graph-fixture.ts`, `fixtures/path.json` |
| Smoke | `scripts/smoke.mjs` |
| Documentation | new `docs/BUILDER_LAB.md`, this record; updated README, CODEX_BUILD_PLAN, TECHNICAL_ARCHITECTURE, DESIGN, LEARNING_COMPASS, SOURCES_AND_DECISIONS |
| Screenshots | five `docs/screenshots/slice-5-*.png` captures linked below |

Graph seed SHA-256 remains
`59abc36708fb2c8647d83f61a2b30bce392d9d256a8384c6995dd22f88ec0246`.
The complete graph remains 30 nodes/71 edges, with existing seed-review provenance.

## Automated verification — PASS

| Command | Result |
| --- | --- |
| `cd apps/api && .venv/bin/ruff check .` | PASS |
| `cd apps/api && .venv/bin/ruff format --check .` | PASS, 14 files |
| `cd apps/api && .venv/bin/mypy mskill_api tests` | PASS, 14 files |
| `cd apps/api && .venv/bin/pytest` | PASS, 108 tests |
| `npm --prefix apps/web run check` | PASS: ESLint, strict TypeScript, 66 Vitest tests, Next.js production build |
| `WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait --wait-timeout 180` | PASS, both services healthy |
| `WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs` | PASS, existing graph/path checks plus mission contract/fixture parity, 404, gateway and lab page |

The existing 90 backend and 39 frontend tests remain green. New coverage includes
mission/reference validation, legacy seed compatibility, malformed content and
HTTP handling; mode isolation, persistence/corruption/denied storage/reset, unsafe
URLs and escaped evidence, completion criteria, manual results, Markdown and Blob
download mechanics, navigation/history/lenses, keyboard focus and retry/empty states.
Existing CI picks up these suites and expanded Docker smoke; remote GitHub Actions
was not run from this local session.

Initial verification found generated duplicate `.next/types` artifacts; the generated
cache was moved to a temporary directory and regenerated. Type/test assertion issues
were corrected before the passing run. No unresolved test failures remain. Existing
Vite configuration-loader and Starlette/httpx deprecation warnings remain non-blocking.

## Browser verification

Tested the Docker-served application in the in-app browser:

- Saved a synthetic design phase note/checkpoint and all four scenario assessments;
  reload retained them. Switching to actual build showed a separate empty record.
- Inspected the Markdown preview including notes, failures, provenance and explicit
  design-only status. Invalid non-GitHub URL disabled export; clearing it restored export.
- Download button reported preparation, but the browser download-event API timed out.
  An actual file arriving on disk is **not claimed**. Selectable Markdown preview is
  the verified fallback; Blob generation/download invocation are unit tested.
- Lab → Governance inspector → related mission resumed the saved phase. Lab → path
  s6 → Open Builder Lab worked. No new graph edges were created.
- Desktop focused checkpoint bottom was about 579px with the status bar starting
  at 952px in a 1000px viewport. Mobile status bar stays in document flow; completion
  checkbox and previous/back controls were visible and unobstructed.
- Back-to-phase/milestone actions focused the selected button with a visible outline,
  including the Slice 4 learning path at 375px. Document width equalled viewport
  width at 1440, 390 and 375px.
- Confirmed reset and reloaded: zero mission checkpoints and a fresh design record.
  Only synthetic verification data was cleared; path completion remained unchanged.

## Screenshots

CSS viewport sizes are listed; browser export pixel dimensions may be scaled.
These are inspected viewport captures, not an automated visual regression suite.

- [Desktop overview — 1440×1000](screenshots/slice-5-desktop-1440-overview.png)
- [Desktop test workspace — 1440×1000](screenshots/slice-5-desktop-1440-tests.png)
- [Mobile phase focus — 390×844](screenshots/slice-5-mobile-390-focus.png)
- [Mobile completion controls — 375×812](screenshots/slice-5-mobile-375-controls.png)
- [Learning path focus correction — 375×812](screenshots/slice-5-path-mobile-375-focus.png)

## Run and handoff

Use the Docker command above, then open `http://localhost:3001/lab/first-agent`.
API contract: `http://localhost:8001/api/v1/missions/first-agent`; OpenAPI:
`http://localhost:8001/docs`. Standard ports and native instructions remain in README.
`BUILDER_LAB.md` documents schema, validation, state, completion and source policy.

Limitations: one hand-curated mission; local browser records without backup or
multi-tab reconciliation; all implementation/evidence is self-reported. No tenant
or agent was created, tested or deployed. Official references can change and require
future editorial review. In-app download-event confirmation is unavailable as noted.

Recommended next step: product review of the workshop and its synthetic-data flow,
then explicitly approve Slice 6 hardening/release work. No Slice 6 feature or public
deployment was implemented.
