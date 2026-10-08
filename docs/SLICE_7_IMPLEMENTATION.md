# Slice 7 engineering handoff

Result: release review and targeted hardening implemented. **Public beta NO-GO**;
see [RELEASE_READINESS.md](RELEASE_READINESS.md) for owners and acceptance gates.
No Slice 8, new product feature or public deployment.

## Changed files

- `content/graph.seed.json`: four overbroad relationships corrected, 11 prerequisite
  rationales clarified; 30 nodes/71 edge IDs and editorial provenance preserved.
- `content/radar.events.json`: all six listings re-reviewed; actual review timestamps
  refreshed, no invented events or schedule changes. Corresponding API fixtures updated.
- `apps/web/app/globals.css`: editable-field boundaries darkened for measured contrast.
- `apps/web/next.config.ts`: bounded security headers; no visual redesign.
- `apps/web/tests/accessibility.test.tsx`, `tests/mission.test.tsx`, package manifests:
  dev-only axe semantic checks and UTF-8 export regression coverage.
- `.dockerignore`, `docker-compose.production.yml`, `scripts/smoke.mjs`, CI workflow:
  exclude nested env files; production rehearsal; header checks; job timeouts and
  dedicated production smoke job. Existing development setup retained.
- README, CONTRIBUTING, SECURITY, THIRD_PARTY_NOTICES, issue/PR templates, Radar,
  deployment and the five required release/audit/acceptance documents. Raw evidence
  and dependency license inventories in `docs/audits`; screenshots in `docs/screenshots`.

The GitHub repository initially contained only its README. The candidate branch
imports the existing Slices 0–7 workspace; the list above isolates Slice 7 work,
while the first candidate commit necessarily includes the earlier implementation.

## Verification

PASS: ESLint, TypeScript strict, **88 frontend tests**, Next production build;
Ruff lint + format, strict mypy, **129 backend tests**; production build/health and
both development/production HTTP smoke suites. Axe: five tests/six rendered states,
zero reported violations within jsdom limitations. Browser: complete first journey,
persistence, reset isolation, unsafe URL error, Markdown preview, Radar link/filter,
375/390px and desktop checks, outage/recovery. No real Microsoft tenant work claimed.

Dependency audits: npm production 0; Python 0; npm development 5 high entries from
one unpatched braces advisory. See SECURITY_AUDIT for exposure and mitigation.
Actual file download acceptance remains pending: tool timeout, no filesystem proof.
Hosted GitHub CI results pending for the configured candidate branch. Full WCAG conformance not claimed.

## Run / inspect

Development: `API_PORT=8001 WEB_PORT=3001 docker compose up --build --wait` then
http://localhost:3001 (or README defaults 3000/8000). Graph edits require API restart.
Production: use the standalone Compose command in DEPLOYMENT.md; open
http://localhost:3002. Both use the same JSON contracts. Browser progress is origin-local.

## Remaining blockers

Human acceptance of corrected graph content, private reporting,
real hosted CI and manual export/accessibility/deployment acceptance. Original MSkill
assets are documented separately from third-party licenses; binary image redistribution
needs native/OS notice and source-obligation review. Do not market this as verified
Microsoft training or an independently assessed learner credential.

Next: finish the release checklist and obtain a GO decision before deployment.

## Release-blocker follow-up

- Added standard MIT LICENSE with the owner-confirmed notice: Copyright (c) 2026
  Pierrick Van Hoecke. README and THIRD_PARTY_NOTICES preserve MSkill Compass identity.
- Replaced 56 edge placeholders, added contextual source links to all 71 edges,
  and authored distinct Builder/Architect guidance for all 30 nodes. All remain
  editorial/seed-review. e015 is now RELATED_TO, reflecting optional tools.
- Renamed the stable `azure-ai` node to Foundry Tools using Microsoft's explicit
  former-name mapping; legacy search alias and existing links remain valid.
- Updated graph API fixture and its inspector source/provenance test.
- Connected origin to the owner-supplied GitHub repository and prepared
  `codex/slice-7-beta-readiness`; no public deployment.
