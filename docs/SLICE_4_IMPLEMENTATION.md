# Slice 4 — My Learning Compass

Implemented 2026-10-08. Scope stops at one learning path; Slice 5 is not started.

## Outcome

`/learn/agent-builder` provides **From Zero to Copilot Agent Builder** using the
original six milestones, stable graph IDs, prerequisites and exit criteria.
Each milestone has an editorial rationale, objectives, a practical checkpoint,
checked official references and contextual graph nodes. The optional existing
FAQ-agent mission is shown only as a brief, not a Mission Lab.

Find My Path, My Path navigation and the launcher open the experience. A selected
step is shareable through `?step=s3`; node links preserve the existing Explorer
URL contract. Inspector membership links return to the associated milestone.
Local, versioned, self-attested progress supports completion, reopening, resume,
a next-unfinished-step suggestion and confirmed reset. Browser storage failures
and invalid content have explicit states. Every step remains open in every lens.

Implementation and source-review details: [Learning Compass contract](LEARNING_COMPASS.md).
Design rationale: [Design record](DESIGN.md).

## Verification

All final checks passed locally; no remote GitHub Actions run was initiated.

| Check | Command | Result |
| --- | --- | --- |
| Frontend lint, typecheck, tests, production build | `npm --prefix apps/web run check` | PASS; 39 tests in 4 files, all five routes generated |
| Backend lint | `cd apps/api && .venv/bin/ruff check .` | PASS |
| Backend formatting | `.venv/bin/ruff format --check .` | PASS; 11 files |
| Backend strict types | `.venv/bin/mypy mskill_api tests` | PASS; 11 files |
| Backend tests | `.venv/bin/pytest` | PASS; 90 tests |
| Docker rebuild/start/health | command below | PASS; web and API healthy |
| Live HTTP smoke | command below | PASS; old graph contracts plus path/page/gateway/fixture parity |
| Desktop | 1440px browser width | PASS; roadmap, step, graph context, no horizontal overflow |
| Mobile | 390px and 375px browser widths | PASS; compact roadmap, readable step/checkpoint, reachable controls, no horizontal overflow |

The existing 23 frontend and 72 backend tests remain included. New tests cover
path loading/schema/source validation, duplicate/cyclic/missing references,
backward-compatible seed defaults, unknown paths, invalid-content isolation,
serialization, progress round-trip/reopen/reset, corrupt/obsolete/denied storage,
step URLs and history, graph membership, lenses, focus, retry/empty/sparse states.
The Docker smoke compares both complete JSON fixtures to live API responses and
checks path nodes against the real graph. Existing CI automatically runs these
expanded suites and smoke checks; no workflow or dependency changes were needed.

Browser scenarios exercised: preliminary Explorer node and relationship selection;
all three lenses; mobile list → inspector → list and search focus; homepage CTA →
saved path step; step → Copilot Studio node → associated step on desktop/mobile;
completion → reload → retained count; reset cancellation with Escape and restored
focus; confirmed reset → reload → zero count; milestone selection focus, pointer
prerequisite activation and keyboard return to roadmap. Mobile completion labels
remain exposed to assistive technology. No Microsoft sign-in, exercise execution
or certification verification was performed.

An initial typecheck found duplicate generated `* 2.*` files under `.next/types`.
Only duplicate generated cache artifacts were removed; rerunning generation and
the complete check passed. No source files were discarded. Existing Vite native
config-loader and Starlette/httpx deprecation warnings remain non-fatal.

The graph seed is unchanged (30 nodes / 71 edges; every graph record seed-review):
`59abc36708fb2c8647d83f61a2b30bce392d9d256a8384c6995dd22f88ec0246` (SHA-256).
Mission and radar seeds, dependencies, lockfiles, Dockerfiles and CI are unchanged.

## Screenshots

- [Desktop, 1440px viewport](screenshots/slice-4-desktop-1440.png)
- [390px roadmap and focus](screenshots/slice-4-mobile-390-roadmap.png)
- [390px active step](screenshots/slice-4-mobile-390-step.png)
- [375px compact roadmap](screenshots/slice-4-mobile-375-roadmap.png)
- [375px checkpoint, optional brief and controls](screenshots/slice-4-mobile-375-checkpoint.png)

Screenshots show local verification state only. Test completion marks were reset;
the final app is left on the Copilot Studio milestone with zero completions.
Temporary viewport overrides were reset after capture. Captures use viewport
images: the browser’s full-page export produced a stitching artifact and was
replaced. Exported image pixels may be scaled by the browser tool; widths above
refer to the verified CSS viewport.

## Changed files

Added:
- `apps/api/mskill_api/{learning,learning_routes}.py`
- `apps/api/tests/test_learning.py`
- `apps/web/app/learn/agent-builder/page.tsx`
- `apps/web/components/learning/{learning-compass.tsx,learning.css,node-path-link.tsx}`
- `apps/web/lib/{learning,progress}.ts`
- `apps/web/tests/learning.test.tsx` and `apps/web/tests/fixtures/path.json`
- `docs/{LEARNING_COMPASS,SLICE_4_IMPLEMENTATION}.md` and five Slice 4 screenshots

Updated:
- `content/path.agent-builder.json` (additive metadata and requested title)
- `apps/api/mskill_api/main.py` (separate learning router)
- `apps/web/app/api/v1/[...path]/route.ts` (read-only path allowlist)
- `apps/web/app/page.tsx` (Find My Path destination)
- `apps/web/components/{shell,lens-guide}.tsx` (navigation and current-scope copy)
- `apps/web/components/explorer/{inspector.tsx,explorer.css}` (membership links)
- `apps/web/tests/{page.test.tsx,graph-fixture.ts}` (new destination and path fixture)
- `scripts/smoke.mjs`, `README.md`
- `docs/{DESIGN,CODEX_BUILD_PLAN,TECHNICAL_ARCHITECTURE,SOURCES_AND_DECISIONS}.md`

The workspace has no committed baseline; `git status` also includes earlier
slices. Nothing was committed or published.

## Run and handoff

```sh
WEB_PORT=3001 API_PORT=8001 CORS_ORIGINS=http://localhost:3001 docker compose up --build --wait --wait-timeout 180
WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs
```

Open <http://localhost:3001/learn/agent-builder> or use **Find My Path** on the
homepage. API docs: <http://localhost:8001/docs>. Default-port and native setup
remain in README. No keys or Microsoft account are required to use MSkill.

Limitations: one curated path, no automatic assessment or recommendations;
self-reported browser-local progress has no cloud backup or live cross-tab merge.
Microsoft exercises may require external access/licensing. Source verification
covers the seven reference destinations/titles/relevance, not the authored path or
graph claims. Node explanation depth remains limited to existing seed content.
This is browser/keyboard testing, not an independent assistive-technology audit.

Recommended next step: review the path with a learner, then explicitly authorize
**Slice 5 — First mission**. The existing mission brief is ready for that future
work; no mission checklist, submissions, AI, authentication or synchronization
were implemented here.
