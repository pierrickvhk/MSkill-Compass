# Slice 6 — Microsoft Radar implementation record

Date: 2026-10-08. Approved scope: curated Radar plus narrowly scoped Slice 5
pre-flight acceptance. Slice 7, public deployment and automatic integrations have
not started.

## Delivered

`/radar` serves a six-record curated catalog: five upcoming events and one past
session at review time. Each has an official Microsoft Reactor page, checked UTC
schedule, online format, source timestamp and justified links to existing graph
nodes. Microsoft Events Catalog and Reactor remain discovery links even when the
catalog is empty or unavailable. No date-only announcement was given invented times.

The UI supplies chronological upcoming/in-progress, past, cancelled and all views;
exact topic and format filters; local-time dates; organizer/provenance; original
source timezone; graph links; and external organizer-page actions. Graph inspectors
and the active learning milestone show up to two exact topic matches. Relevance is
explicitly editorial and is not a personal recommendation. The original graph and
approved visual identity remain intact. No dependency, worker or database was added.

## Slice 5 pre-flight

Code inspection found separate design/build records and initially empty result
fields. Editorial prompts/expected outcomes are explanatory content, never copied
into observations or assessments. Existing design labels distinguish simulated work
from an implemented-but-unverified build. A new regression test verifies both fresh
records have zero evidence, empty textboxes, `not-recorded` assessments and exports
that do not count the example prompts as learner evidence. No runtime change was
needed or made to Builder Lab.

The in-app browser download action was retried with a real click and a download
event listener. The application reported preparation, but the listener timed out
without a file path. Safari was attempted; native computer-use permissions remained
pending, so no Safari verification is claimed. A real downloaded file could not be
read or verified. This is still an explicit limitation, not a claimed pass.

The actual rendered, read-only Markdown textarea was inspected in the browser. It
contained the mission title, DESIGN-ONLY/simulated/not-deployed status, no executed
tests, all four manual assessments as not-recorded, incomplete checklists and the
reference ledger. This selectable fallback is verified. Existing Blob/download
invocation tests pass. No learner evidence was entered or reset during Slice 6.

## Changed files

There is no tracked Git baseline in this checkout; all project files remain
untracked. This is the scoped implementation inventory, not a fabricated Git diff.

| Area | Files |
| --- | --- |
| Catalog | updated `content/radar.events.json` |
| API | added `apps/api/mskill_api/radar.py`, `radar_routes.py`; updated `main.py` |
| Backend tests | added `apps/api/tests/test_radar.py` |
| Web route | added `apps/web/app/radar/page.tsx`; updated `app/api/v1/[...path]/route.ts` |
| Client | added `apps/web/lib/radar.ts` |
| Radar UI | added `apps/web/components/radar/radar.tsx`, `radar.css`, `related-events.tsx`, `use-event-clock.ts` |
| Integration | updated `apps/web/components/shell.tsx`, `components/explorer/inspector.tsx`, `components/learning/learning-compass.tsx`, `app/globals.css` |
| Web tests | added `apps/web/tests/radar.test.tsx`, `fixtures/radar.json`; updated `graph-fixture.ts`, `mission.test.tsx` |
| Smoke | updated `scripts/smoke.mjs` |
| Docs | added `docs/RADAR.md`, this record; updated README, CODEX_BUILD_PLAN, TECHNICAL_ARCHITECTURE, DESIGN, SOURCES_AND_DECISIONS |
| Images | five `docs/screenshots/slice-6-*.png` viewport captures |

`content/graph.seed.json` is unchanged: 30 nodes, 71 relationships, SHA-256
`59abc36708fb2c8647d83f61a2b30bce392d9d256a8384c6995dd22f88ec0246`.
Mission/path content and existing progress keys are unchanged.

## Automated verification

| Command | Result |
| --- | --- |
| `cd apps/api && .venv/bin/ruff check .` | PASS |
| `cd apps/api && .venv/bin/ruff format --check .` | PASS, 17 files |
| `cd apps/api && .venv/bin/mypy mskill_api tests` | PASS, 17 source files |
| `cd apps/api && .venv/bin/pytest` | PASS, 129 tests (108 existing + 21 Radar) |
| `npm --prefix apps/web run check` | PASS: ESLint, strict TypeScript, 82 tests and production build, including `/radar` |
| `WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait --wait-timeout 180` | PASS, both containers healthy |
| `WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs` | PASS, all graph/path/mission checks plus Radar schema/fixture parity, gateway and route |

New tests cover malformed dates, UTC requirements, unknown zones, unsafe links,
source metadata, duplicate IDs, missing graph references, stable responses, bounded
API failures, exact start/end boundaries, cancellation precedence, daylight-saving
time display, open-page expiry, filtering/reset, archive/empty/error states,
navigation/history, official link safety and exact related-event membership.
The one extra mission regression covers the pre-flight example/evidence concern.

Initial lint found Python formatting and a synchronous timezone state update in
a React effect. Formatting was applied and timezone detection moved into the
completed client-load result. Final verification has no failing gates. Existing
Vite loader and Starlette/httpx deprecation warnings remain non-blocking. No remote
GitHub Actions run, deployment or full assistive-technology audit is claimed; the
existing CI workflow runs these suites and expanded smoke without modification.

## Browser and visual verification

The Docker-served application was reviewed at 1440px, 390px and 375px CSS widths.
Document width equalled viewport width at each size. The browser exports scaled
viewport captures; screenshot pixel heights are not treated as CSS measurements.

- Default view contained five upcoming events; Past events contained the one
  October 1 record and used View past event rather than a registration claim.
- Local zone was Europe/Brussels: Oct 13 15:00 UTC displayed 17:00 CEST;
  Nov 2 18:30 UTC displayed 19:30 CET. Original UTC labels remained visible.
- Governance filtering produced the evaluation/governance event. In-person returned
  an honest zero-result view with official discovery links. Reset restored defaults.
- Keyboard focus traversed graph tags, expanded Why these topics, and reached
  Details & registration with a visible focus ring. At 375px that control's bottom
  was ~628px within the observed 764px content viewport; statusbar position was
  relative, so it did not overlay the control.
- Radar → Governance inspector → Browse Radar returned to the Governance filter.
  Graph seed-review labels were preserved. My Path's current s6 showed ALM/evaluation
  matches and retained its Builder Lab link. Lab opened and its Markdown fallback
  remained usable. No path checkpoint was changed.

Screenshots:

- [Desktop list, 1440px](screenshots/slice-6-desktop-1440.png)
- [Desktop past view, 1440px](screenshots/slice-6-desktop-past.png)
- [Mobile navigation/filters, 390px](screenshots/slice-6-mobile-390-filters.png)
- [Mobile event, 390px](screenshots/slice-6-mobile-390-event.png)
- [Mobile disclosure and keyboard focus, 375px](screenshots/slice-6-mobile-375-controls.png)

These are reviewed examples, not a pixel-diff regression suite. Production CSS was
rebuilt after the final surface refinement; no approved homepage redesign occurred.

## Run, maintain and next step

The local Docker services are available at `http://localhost:3001/radar` and
`http://localhost:8001/api/v1/radar`. Use the Docker command above to restart;
standard-port and native setup commands remain in README. OpenAPI is at
`http://localhost:8001/docs`. `RADAR.md` documents the complete schema, API response,
source ledger, verification criteria, timezone rules and manual refresh process.

Known limits: six English-language Reactor listings, all online; incomplete product
coverage; no live cancellation/availability monitoring; correct classification
requires an accurate browser clock. Source checks are historical, so maintainers
must revisit promoted listings manually. File-download verification remains
unavailable as detailed above; selectable Markdown is verified. No credentials,
registration, scraping, account sync, recommendation engine or notifications.

Recommended next step: review Radar's catalog selection and manual refresh ownership,
then explicitly scope and approve the next slice. Do not infer release/deployment
approval from this implementation.
