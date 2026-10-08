# Security and privacy audit — Slice 7

Review date 2026-10-09 Europe/Brussels. Scope: app source, npm lockfile and installed
Python environment; no penetration test or full container-OS vulnerability scan.

## Findings

| ID | Severity / state | Exposure and mitigation | Owner |
|---|---|---|---|
| S1 | High upstream, open; limited app exposure | npm reports 5 high entries in one `braces` ≤3.0.3 → micromatch → fast-glob → Next ESLint chain. Deep brace inputs can exhaust the stack. Development tooling only; production audit has zero entries. No published patch; suggested forced downgrade of eslint-config-next would cross incompatible framework versions. Keep lint inputs trusted, bound CI to 20 minutes, do not run PR code with secrets; recheck weekly. | Maintainer |
| S2 | Medium, fixed | Docker build context previously excluded only root `.env`. Nested `.env*` now excluded except documented examples. | Maintainer |
| S3 | Medium, fixed | Added anti-framing, nosniff, restrictive device-permission and referrer headers. CSP limits framing, objects and base URI; it is **not** a complete script/XSS CSP. | Maintainer |
| S4 | High release process, open | Repository pierrickvhk/MSkill-Compass is configured and local Git push access works. GitHub private reporting is disabled (API checked); approval to enable it is pending. Hosted CI results still need recording. | Project owner |
| S5 | Medium, accepted design limitation | Notes are plaintext browser-local data; another user of that profile or same-origin malicious code could read them. Clear notices, synthetic data, bounded validation, own-key reset and no upload. Markdown deliberately includes learner input; it is not a secret scanner. | Learner + maintainer |
| S6 | Medium, pending deployment | TLS, reverse proxy request controls, log rotation, base-image CVE review and binary notices are not verified. Local production rehearsal is not public infrastructure acceptance. | Release operator |

## Dependency evidence

- `npm audit --json`: **5 high**, one underlying advisory, no patched braces release.
- `npm audit --omit=dev --json`: **0 known advisories**.
- `docker compose exec -T api uv tool run pip-audit --path /app/apps/api/.venv/lib/python3.12/site-packages --format json`: **28 installed distributions, 0 known advisories** (includes development packages).
- Advisory reviewed: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- License inventories and obligations: [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md).

These are dated database checks, not a guarantee of safety. The audit utility is
transient tooling in the development container, not an application dependency.
Do not use `npm audit fix --force` to downgrade the framework's lint configuration.

## Source review

Pydantic models reject extra fields, invalid identifiers, unsafe URLs, dangling
references, duplicate records and prerequisite cycles. Frontend response guards and
localStorage readers reject corrupt versions, unknown IDs, oversized notes and
unsafe repository URLs. The gateway permits a small fixed route set, uses a bounded
timeout and server-only API_BASE_URL; learner notes never go to these APIs.

No raw HTML/Markdown rendering or eval exists in application components. React
renders text; exported Markdown escapes learner HTML, link syntax and headings.
External new-tab links use noopener/noreferrer. Repository evidence is syntax-checked
against public GitHub owner/repo URLs without credentials, query or fragment; it is
not fetched. This does not validate repository ownership or project quality.

CORS permits explicit origins only, GET and no credentials; production uses no
cross-origin browser access. Content load failures have bounded public responses;
operator diagnostics stay in logs. FastAPI runs without debug; unexpected errors
use generic server errors. No application secrets are required or embedded in export.
Environment/credential-pattern review is scoped to project source/configuration,
not the user's unrelated files or previously uncommitted Git history (none exists).
No secret finding was identified; this is not an exhaustive secret-detection guarantee.

## Export acceptance

Existing injection tests plus a UTF-8 Blob test cover escaped content, fixed filename,
Markdown MIME/charset, Unicode preservation, local URL cleanup and no fetch/upload.
The generated summary contains only mission content and learner records. No env,
credentials or application configuration are included by the serializer. **A learner
can still type a secret.** The app's review-before-sharing notice is essential.
Browser download-to-filesystem acceptance remains separately tracked in BETA_TEST_PLAN.
