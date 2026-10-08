# Production rehearsal and operations

This is a local rehearsal, not permission to deploy. Release decision:
[RELEASE_READINESS.md](RELEASE_READINESS.md).

## Start / verify / stop

From the repository root, with Docker running:

```sh
docker compose -p mskill-beta-check -f docker-compose.production.yml up --build --wait --wait-timeout 180
API_URL=http://localhost:8002 WEB_URL=http://localhost:3002 node scripts/smoke.mjs
docker compose -p mskill-beta-check -f docker-compose.production.yml logs --tail=100
docker compose -p mskill-beta-check -f docker-compose.production.yml stop
docker compose -p mskill-beta-check -f docker-compose.production.yml up --no-build --wait
docker compose -p mskill-beta-check -f docker-compose.production.yml down
```

Open http://localhost:3002. Both published ports bind loopback. This standalone file
must not be merged with the development Compose file: no source mounts, reload or
dev command runs here. Both runtime images use non-root accounts, dropped Linux
capabilities and no-new-privileges. No paid infrastructure or database is needed.
`API_PORT` / `WEB_PORT` override 8002 / 3002; smoke URLs must match. Distinct browser
origins have distinct progress stores; moving from localhost to a beta domain will
not migrate progress. Export before moving origins.

## Suggested beta architecture

A small single host with Docker Compose: HTTPS reverse proxy → Next.js → internal
FastAPI → versioned JSON baked into the image. Expose only the TLS proxy publicly;
keep API private (the rehearsal loopback API port exists for smoke checks).
Configure a real domain, TLS renewal, request limits/timeouts and log rotation before
launch. Keep the existing same-origin gateway. CORS_ORIGINS is empty in production;
no browser needs direct API access. Do not use wildcard CORS or public dev servers.
No public host, domain or TLS configuration has been deployed or verified here.

## Configuration / reproducibility

`API_BASE_URL=http://api:8000` is server-only runtime configuration. No Microsoft API
keys or secrets are required. Never place secrets in NEXT_PUBLIC variables, image
layers or committed env files. `.dockerignore` excludes nested `.env*` except examples.
Frozen npm/uv lockfiles control application dependencies; base image tags can move.
Record immutable image digests and the Git commit for the approved release, and
retain the previous images for rollback. The current repository has no commit/remote;
therefore it is not yet a reproducible named release. Review container/base-OS CVEs
and binary redistribution notices before publishing images.

## Health, logs and failures

API `/health` confirms startup graph validation and reports graph version; it does
not prove mission/path/Radar validity. Run the full smoke suite after every content
change or restart. Web health confirms homepage availability; smoke verifies the
same-origin gateway and all catalogs. Container health failure does not itself
restart a running unhealthy process; inspect it rather than assuming automatic recovery.

Check `docker compose ... ps`, then service logs. A malformed graph fails startup;
bad path/mission/Radar content yields a bounded 503 response and operator diagnostics.
A missing/upstream API yields a bounded gateway error. Inspect JSON validation
locations, correct the content, rebuild and rerun smoke. Development graph changes also require
`docker compose restart api`: the graph is loaded at startup, not watched as Python code. Port conflicts require
changing the loopback port variables. Container output goes to stdout/stderr;
operators must restrict access and configure rotation. Do not log learner notes.

For rollback stop the failing candidate, restore the previously approved immutable
images/content version, restart and smoke. Browser progress may be rejected when
content versions change: retain export guidance and never silently migrate evidence.
Shutdown uses Compose's normal termination; there is no server-side learner database
to back up. Do not clear browser storage as part of deployment or rollback.
