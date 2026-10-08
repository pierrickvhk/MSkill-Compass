# MSkill Radar — Slice 6 contract

Radar is a manually curated discovery catalog at `/radar`, connected to existing
graph nodes. It is not an event registration service, live availability monitor or
personal recommendation engine. No third-party API, scraper, account, worker or
notification service runs in the application.

## Domain and API

`content/radar.events.json` contains `version`, `updated_at` (UTC or null for an
unreviewed empty catalog), `explanation` and `events`. Original empty seed fields
remain supported. Pydantic `RadarCatalog`, `RadarEvent` and `EventSource` are in
`apps/api/mskill_api/radar.py`; routing is separate in `radar_routes.py`.

| Event field | Contract |
| --- | --- |
| `id` | Stable slug, based on publisher event ID; never derived from a title at runtime |
| `title`, `description`, `organizer` | Required nonblank strings; descriptions are original MSkill summaries |
| `event_type` | livestream, webinar, workshop, conference or meetup |
| `starts_at_utc`, `ends_at_utc` | Aware ISO datetimes in UTC; end strictly later than start |
| `original_timezone` | IANA timezone or UTC observed at the source; retained independently of display timezone |
| `format`, `location` | online, in-person or hybrid; physical/hybrid events require a location |
| `event_url` | Direct, reviewed HTTPS Microsoft event page |
| `node_ids` | Nonempty, unique references to existing graph nodes |
| `status` | scheduled or cancelled; never a manually maintained upcoming/past flag |
| `source` | URL, publisher Microsoft, catalog, verified status and UTC last_checked_at |
| `relevance_note` | Editorial explanation of why the event topic supports its graph associations |

Only reviewed events enter the published catalog. An incomplete candidate stays
outside the catalog until verified. The source URL must equal the event URL;
verified metadata cannot omit its check timestamp. Catalog `updated_at` must cover
every review timestamp. Unknown fields, malformed dates, duplicate IDs/JSON keys,
unknown zones, unsafe URLs, duplicate or missing graph references and reversed
time intervals are rejected, never silently discarded.

URL policy: HTTPS without credentials or surrounding whitespace, fragment or
custom port. Allowed official hosts are `reactor.microsoft.com`,
`developer.microsoft.com`, `events.microsoft.com`, `www.microsoft.com` and
`myevent.microsoft.com`. A host match is only a safety check, not factual verification.
Avoid shorteners and redirect URLs; a maintainer must review the actual destination.
New hosts require explicit policy review and tests.

```sh
curl http://localhost:8001/api/v1/radar
curl http://localhost:3001/api/v1/radar # same-origin Next.js gateway
```

`GET /api/v1/radar` returns the explicit `RadarCatalog` response model. It reads and
validates local content against the loaded graph per request, with stable ordering
by UTC start then ID. No request-time source calls or generated timestamps occur.
`apps/web/tests/fixtures/radar.json` is the complete response example and live-smoke
parity fixture. OpenAPI documents the endpoint at `/docs`. POST is 405. Unreadable
or invalid content returns bounded 503 `{code:"http_error",message:"Radar content
is unavailable"}` with details in server logs; the existing gateway maps upstream
service failures to 502. Graph/learning/mission endpoints remain independent.

## Time and status conventions

Store exact instants in UTC. Preserve the source timezone used to interpret them;
all six initial pages explicitly displayed UTC, so their original zone is UTC.
Do not invent midnight start/end times for date-only announcements. For future
local-time sources, use an IANA zone and resolve daylight-saving ambiguity against
the organizer before publishing. Missing/ambiguous schedules mean omission.

Classification uses current time: cancelled overrides every date; `now >= end`
is past; `start <= now < end` is in progress; otherwise upcoming. The upcoming
filter includes in-progress events, explicitly labelled. No expired record appears
as upcoming. The browser clock refreshes at start/end boundaries and on focus or
visibility changes; it is not a background fetch worker. The API returns stable
schedule facts, not a cached time-sensitive status. Accurate classification depends
on a correct device clock.

`Intl.DateTimeFormat` renders both ends in the browser's timezone and locale,
including the date when a session crosses midnight. The detected IANA zone appears
above the list; each record also labels its original zone. Original instants are
preserved in semantic `time` elements. Tests cover Brussels summer/winter offsets,
New York conversion, invalid dates, exact boundaries and expiry on an open page.

## Discovery and relevance

Filters cover period, exact graph topic and online/in-person/hybrid format. Past
items sort newest first; other lists sort chronologically, with stable ID tie-breaks.
`/radar?node=governance` is a shareable topic filter; browser history restores topic
selection. Unknown topic IDs produce a notice and all-topic fallback. Reset restores
the default upcoming/all-topic/all-format view. No local progress or telemetry is
written by Radar.

Event tags navigate to `/explore?node=...`. Graph inspectors show up to two upcoming
matching events plus Browse Radar. Learning Compass applies the same deterministic
intersection to its **active milestone's** node IDs, preserving the existing path
selection mechanism. These links are explicitly editorial topic relevance, not a
personal recommendation or a prerequisite. No graph node/edge was added or altered.
For example, no event is tagged Copilot Studio merely because it discusses agents.

## Manual curation and refresh policy

Official starting points: [Microsoft Events Catalog](https://www.microsoft.com/en-us/events)
and [Microsoft Reactor](https://reactor.microsoft.com/en-us/reactor/). Neither is
assumed to provide a supported public API. Browse public pages normally; do not call
private endpoints or bulk mirror content.

For each candidate, a maintainer must:

1. Open the official event page and confirm title, organizer, format, location if
   relevant, full start/end schedule and timezone. Check cancellation notices.
2. Link to the direct event/registration page; do not claim seats, free access,
   successful registration or recording availability without evidence.
3. Write a brief original description and only topic mappings supported by the
   agenda. Preserve the publisher event ID in the stable slug. Record why each
   group of mappings is justified in `relevance_note`.
4. Set source catalog, verified status and actual UTC `last_checked_at`; update
   catalog `updated_at`. Review every changed record as content plus code.
5. Regenerate the canonical web fixture using `load_radar(...).model_dump_json`,
   run backend/frontend gates and live smoke, and inspect local-time rendering.

Review the catalog manually before release and at least weekly while promoting
upcoming events; check near-term listings again before sharing them. There is no
scheduled process. Retain expired records in Past events instead of moving dates
forward. If an organizer cancels, set `status: cancelled`, update the checked date
and preserve the source record. If an event is rescheduled, update only from the
source and document the change. Remove records from publication if their facts can
no longer be established. An empty catalog is valid and retains both official links.
A stored verification date is a historical check, never a guarantee of current
availability or that later cancellations have already been discovered.

## Initial verification ledger — 2026-10-08T19:10:04Z

Each linked page was opened and reviewed for title, UTC interval, livestream format
and relevant agenda. All six use Microsoft Reactor as organizer/source and online
as format. Five were upcoming and one past at review time. No cancellation was
invented for demonstration. Test-only synthetic cancelled records exercise that UI.

| Stable ID / official page | UTC schedule | Supported graph concepts |
| --- | --- | --- |
| [reactor-27452](https://reactor.microsoft.com/en-us/reactor/events/27452/) | Oct 1, 2026, 16:00–17:00 | knowledge-sources, retrieval-grounding, agents |
| [reactor-27509](https://reactor.microsoft.com/en-us/reactor/events/27509/) | Oct 13, 2026, 15:00–16:00 | agents, actions-tools, azure-functions, entra-id, access-control |
| [reactor-27622](https://reactor.microsoft.com/en-us/reactor/events/27622/) | Oct 13, 2026, 17:00–18:00 | agents, alm |
| [reactor-27510](https://reactor.microsoft.com/en-us/reactor/events/27510/) | Oct 15, 2026, 15:00–16:00 | agents, monitoring-evals, governance, alm |
| [reactor-27455](https://reactor.microsoft.com/en-us/reactor/events/27455/) | Oct 15, 2026, 16:00–17:00 | agents, knowledge-sources, retrieval-grounding |
| [reactor-27577](https://reactor.microsoft.com/en-us/reactor/events/27577/) | Nov 2, 2026, 18:30–19:30 | agents, generative-ai, monitoring-evals |

Microsoft Events Catalog was also reviewed. Its featured announcements did not
establish precise start/end times suitable for these records, so no time was
invented to add a second publisher category. The initial selection is small,
English-language and Reactor-heavy; it is not comprehensive or balanced across
products. Physical and hybrid events are supported but none were added without a
reviewed complete schedule. Official event titles retain current product naming;
unchanged graph definitions retain their existing seed-review labels.

## Beta maintenance cadence (Slice 7)

Content maintainer: manually review the six official URLs weekly, and again within
48 hours of each upcoming event and on its event day. Also check before a release.
Compare title, start/end UTC, the listing's timezone, format, cancellation notice and
agenda against graph topic IDs. A “Cancel registration” link is not cancellation.
Do not invent replacement dates or events. If a page cannot be verified, retain its
last actual review time and record the uncertainty; do not refresh the timestamp.
For a materially uncertain listing, remove it from the published curated selection
until a review is possible, documenting the change rather than pretending it was
cancelled. Preserve event IDs when correcting schedules.

Update `last_checked_at` only after reading the source, plus catalog `updated_at`.
Use UTC timestamps, retain original timezone, validate with pytest, regenerate the
API fixture and run the HTTP smoke checks. Review local-time rendering across DST.
Keep summaries original and topic associations editorial; “verified” covers checked
listing metadata, not learner suitability or guarantees of availability.

Slice 7 rechecked all six listings at 2026-10-08T22:31:59Z: no metadata corrections;
one past and five upcoming. See CONTENT_AUDIT.md for the source ledger. This remains
a curated selection, not the complete Microsoft events catalog. No scheduled sync
or recurring automation has been introduced.
