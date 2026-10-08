# Public beta release readiness — Slice 7

**Decision: NO-GO for public beta.** Engineering verification passes; content and
release acceptance remain incomplete. Suitable for local/invited review with these
limitations disclosed. No public deployment or Slice 8 work was performed.

Reviewed 2026-10-09 Europe/Brussels. Source review times use UTC. Candidate branch: `codex/slice-7-beta-readiness` in
[pierrickvhk/MSkill-Compass](https://github.com/pierrickvhk/MSkill-Compass).
The remote initially contained only a README; local Git push access is available.
Hosted CI evidence is pending until the candidate is published and its jobs finish.

## Central checklist

| Gate | Status | Evidence / owner |
|---|---|---|
| Existing first journey preserved | PASS for executed scenarios | [Beta test plan](BETA_TEST_PLAN.md), screenshots. |
| 30 nodes / 71 edges structurally valid | PASS | Backend tests and HTTP fixture parity. |
| Graph content correction | IMPLEMENTED; human acceptance pending | [Content audit](CONTENT_AUDIT.md): 56 scoped rationales, 71 source links, 30 distinct lens explanations; Foundry Tools scope resolved with stable ID. No verification promotion. |
| Four overbroad graph relations | FIXED | e004/e009/e014/e016 qualified as RELATED_TO; IDs and seed-review status retained. |
| Prerequisite semantics | CLARIFIED | 11 REQUIRES rationales explicitly editorial learning order. |
| Six Radar listings | REVIEWED | Official titles/UTC times/topic relevance checked; 5 upcoming / 1 past, no cancellation notice. Review 2026-10-08T22:31:59Z. |
| Radar maintenance | DOCUMENTED | Weekly plus within 48h/event-day/source-unavailable procedure in RADAR.md. Content maintainer. |
| Frontend quality | PASS | 88 tests / 7 files, ESLint, strict typecheck and production build. |
| Backend quality | PASS | 129 pytest tests, Ruff lint/format, strict mypy (17 files). |
| Development Docker smoke | PASS | [Raw output](audits/development-smoke.txt); localhost 3001/8001. |
| Production Docker build/health/smoke | PASS | [Raw output](audits/production-smoke.txt); isolated localhost 3002/8002, non-root images. |
| Production recovery | PASS | Both services stopped/restarted healthy; full smoke passed again. API outage Retry recovered. [Lifecycle log](audits/production-lifecycle.txt). |
| Automated accessibility | PASS within scope | 5 axe tests / 6 states / zero reported violations; jsdom, no paint/contrast/canvas coverage. |
| Full accessibility acceptance | PENDING, medium | Screen reader, zoom/320px, all contrast/targets, actual reduced-motion preference. Accessibility reviewer. |
| Known input contrast defect | FIXED | Borders changed from 2.01:1 to 3.41:1 on white; rendered value verified. |
| Export serializer / Unicode / filename | PASS automated | Unit tests and browser plain-text preview; no uploads. |
| Actual downloaded file | PENDING, medium | Browser event timed out; manual filesystem acceptance required. Release tester. |
| Production npm advisories | PASS dated check | 0 in `npm audit --omit=dev`; see security audit. |
| Python advisories | PASS dated check | 0 known advisories across 28 installed distributions. |
| Development npm advisories | OPEN, high upstream / limited exposure | 5 entries / one unpatched braces advisory. Trusted inputs + CI timeout; maintainer recheck weekly. |
| MIT license | COMPLETE | Standard [LICENSE](../LICENSE): Copyright (c) 2026 Pierrick Van Hoecke. README and third-party notices distinguish project identity, ownership and third-party terms. |
| Third-party assets/licenses | REVIEWED with scope limits | [Notices](../THIRD_PARTY_NOTICES.md), inventories; native/OS binary redistribution acceptance pending. Release maintainer. |
| Contributor / security / PR & issue docs | ADDED | CONTRIBUTING.md, SECURITY.md, .github templates. |
| Private security reporting | BLOCKED, high process | GitHub API reports disabled; exact feature enablement approval requested. No private email supplied. |
| GitHub-hosted CI | PENDING | Repository and local Git push access confirmed. Record candidate SHA and all four hosted job results after publication. |
| Public deployment controls | PENDING | Domain/TLS, reverse proxy limits, logs, immutable digests, OS CVEs and rollback rehearsal. Release operator. |
| Public deployment approval | NOT REQUESTED / NOT DEPLOYED | This work prepares a candidate only. |

## Exact quality evidence

[Frontend log](audits/frontend-quality.txt): `npm run check` runs lint →
`next typegen && tsc --noEmit` → `vitest run` → `next build --webpack`.
Final: 88/88 passed, 0 failures. 7 test files. Build produces five product routes
plus the API gateway and framework not-found route.

[Backend log](audits/backend-quality.txt): `uv run --frozen ruff check .`,
`ruff format --check .`, `mypy mskill_api tests`, `pytest` in the API container.
Final: 129/129 passed; 17 files formatted/typechecked. One existing Starlette/httpx
TestClient deprecation warning. Frontend emits a future Vite config-loader warning;
neither warning is hidden or represented as a failure.

[npm full](audits/npm-audit.json) / [npm production](audits/npm-production-audit.json)
/ [Python audit](audits/python-audit.json) are dated snapshots, not promises about
future advisories. npm full audit exits nonzero because of the documented findings.

Initial checks found stale duplicate generated `.next/types/* 2.*` files; removed
only those generated duplicates and reran all frontend gates successfully. Initial
a11y test queried a nonexistent Radar searchbox; corrected the harness to wait for
the real event count. No application workaround was needed. Development smoke first
caught old copied Next config and startup-cached graph: rebuilt web/restarted API,
then both complete smoke suites passed. These are resolved verification failures.

## Recommended next step

Stay in release hardening: obtain human acceptance of corrected content,
configure private reporting, run hosted CI, and complete
manual download/accessibility acceptance. Then approve a specific immutable candidate
and its deployment plan. Suggested architecture: one small host, HTTPS reverse proxy,
Next.js, private FastAPI and baked JSON; see [deployment operations](DEPLOYMENT.md).
No authentication, AI, sync, database or new learning paths are needed for this gate.

## Explicit GO / NO-GO criteria

**GO for local invited review:** automated checks and Docker smoke pass, editorial
content limitations are disclosed, and only synthetic mission data is used.

**GO for broad public beta requires every item below:**

1. The content maintainer accepts the revised node/relationship ledger; mission
   build instructions are either exercised in an authorized synthetic tenant or
   remain explicitly marked untested with design-only use clearly available.
2. Web, API, development smoke and production smoke jobs pass on the exact
   GitHub candidate commit. Local passes alone are insufficient.
3. A private reporting channel is enabled, published and confirmed monitored by
   the owner; documented dependency risk is accepted or remediated.
4. Actual UTF-8 downloads pass in the supported browsers, with screen-reader,
   keyboard, zoom, reduced-motion and contrast/target acceptance recorded.
5. Deployment controls and image license/CVE obligations in DEPLOYMENT.md are
   accepted for the chosen environment, with a tested rollback.
6. The owner explicitly approves public deployment of that candidate.

**NO-GO if any required gate is failed, missing or merely assumed.** Current
status remains NO-GO. No application has been deployed publicly.
