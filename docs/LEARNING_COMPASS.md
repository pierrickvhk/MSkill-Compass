# Learning Compass contract — Slice 4

One curated path is available at `/learn/agent-builder`. The home **Find My Path**
action, main navigation and launcher open it. `?step=s3` selects a shareable
milestone; an absent query restores this browser’s last selected milestone.
The path is independent MSkill guidance, not a Microsoft syllabus or credential.

## Content and validation

`content/path.agent-builder.json` remains the source of truth. Its six stable
stage IDs, original node IDs, prerequisite stage IDs, exit criteria and optional
`mission_id` are preserved. The title now includes the requested “From”.
Additive fields are `version` (default `v1`) and, per stage, `why` (nullable),
`objectives`, `checkpoints`, `resources` (default empty arrays), and `source_status`
(default `seed-review`). Original seed-shaped files remain valid; missing metadata
has explicit UI fallbacks. Stage array order is meaningful and is not sorted.

The Pydantic domain types are `LearningPath`, `LearningStage`, `LearningResource`,
`MissionSummary` and `LearningPathResponse`. Existing strict graph models and
source URL/date rules are reused. A resource adds its checked title and an
authored usage note to `GraphSource`. Only attributed Microsoft HTTPS resources
are accepted here. Verified references require a UTC review timestamp. Stage
status is deliberately restricted to `seed-review`; path status remains
`editorial-seed-review` even when its references have been checked.

Validation rejects duplicate stage IDs/references/JSON properties, empty required
fields, unknown graph nodes, unknown prerequisites, self/cyclic prerequisites,
prerequisites after their dependent milestone, and unresolved mission IDs.
Cross-record errors contain codes, locations and actionable messages. Schema
errors retain Pydantic locations. Every request validates content against the
loaded graph; invalid content is never silently dropped. An empty stage list is
representable and produces a noninteractive empty state.

The optional mission is a deliberate read-only projection of
`content/mission.first-agent.json`: ID, title, description and prerequisite stage
IDs. Other existing mission fields are intentionally not served or interpreted
by this slice. No mission checklist, assessment, submission or Mission Lab is
implemented. The final milestone has its own practical checkpoint; the mission
brief is an optional extension.

## API

`GET /api/v1/paths/{path_id}` supports only `agent-builder` and returns:

```text
LearningPathResponse {
  path: { id, title, description, level, source_status, version, stages[] },
  mission: { id, title, description, prerequisite_stage_ids[] } | null
}
LearningStage {
  id, title, required, node_ids[], requires_stage_ids[], exit_criteria[],
  mission_id | null, why | null, objectives[], checkpoints[], resources[], source_status
}
LearningResource {
  title, note, url, publisher, source_status, last_verified_at | null
}
```

Examples against the custom local ports used for verification:

```sh
curl http://localhost:8001/api/v1/paths/agent-builder
curl http://localhost:3001/api/v1/paths/agent-builder
curl http://localhost:8001/api/v1/paths/missing
```

The first two return the same validated response, with `path.id: "agent-builder"`,
`path.version: "v1"`, six ordered stages and `mission.id: "first-agent"`.
The exact complete example is `apps/web/tests/fixtures/path.json`; the live smoke
check compares it to the API response so it cannot silently drift.
An unknown path returns HTTP 404:

```json
{"code":"not_found","message":"Unknown learning path 'missing'"}
```

Missing or invalid path/mission content returns HTTP 503:

```json
{"code":"http_error","message":"Learning path content is unavailable"}
```

Full validation details are logged for operators; file paths and malformed
content are not disclosed to browsers. The existing web gateway translates
upstream failures to its bounded 502 response. `/health` continues to measure
only graph availability. Path failures do not disable the graph. OpenAPI at
`/docs` documents the explicit response model and errors.

Path and mission files are resolved beside `CONTENT_PATH`. For a custom graph,
provide matching content there. The graph is loaded at startup; path content is
read and validated per request (small local JSON, no runtime Microsoft calls).
Restart after graph edits. Deterministic serialization preserves authored order;
no timestamps or random values are generated at request time.

## Browser progress

Only `mskill.learning-progress.v1.agent-builder` is written to localStorage:

```json
{
  "schema_version": 1,
  "path_id": "agent-builder",
  "content_version": "v1",
  "active_stage_id": "s3",
  "completed_stage_ids": ["s1", "s2"]
}
```

The typed parser checks versions, path identity, known stage IDs and duplicate
completion IDs. Missing storage starts empty. Corruption, obsolete content or
unknown versions show an explanatory notice and a fresh view; they are not
silently overwritten on a plain load. A deliberate step/deep-link selection or
completion change writes the new state. Denied access and quota errors retain
in-memory progress with an explicit visit-only message. Reset removes only this
path’s key after confirmation; failure warns that old state can return on reload.
No account, analytics, personal data, free-text evidence or credentials are stored.

Completion is self-attested. Any stage can be opened, completed or reopened.
Reopening a prerequisite does not erase completed downstream work. The next-step
function picks the first unfinished stage whose authored prerequisites are
completed, with no scoring or automatic recommendation. All content remains
available in all lenses. Lens context is inherited from the existing app shell;
it is not persisted on reload. Explanations come from existing graph nodes, with
a labelled summary fallback when the selected lens has no authored explanation.

Node membership links are derived from the path API. Step → node uses the existing
`/explore?node=...` contract; node → path uses `/learn/agent-builder?step=...`.
The graph canvas never imports or reads the progress module.

## Checked references — 2026-10-08

The following pages were opened manually during implementation. Destination,
visible title and relevance to the milestone were checked; no content was bulk
copied, catalog synchronized, account used or completion assessed.

| Step | Checked title and destination |
| --- | --- |
| s1 | [Introduction to AI concepts](https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/) |
| s1 | [Introduction to generative AI and agents](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| s2 | [Plan your Copilot Studio projects, an overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/plan-overview) |
| s3 | [Quickstart: Create and deploy an agent with the standard harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started) |
| s4 | [Get started with Power Automate](https://learn.microsoft.com/en-us/training/modules/get-started-flows/) |
| s5 | [Key concepts - Copilot Studio security and governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance) |
| s6 | [Test your agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) |

An older `/power-automate/guidance/planning/introduction` URL redirected to Power
Apps **Overview of plans** and was not retained under its old title. Resource
notes identify access/prerequisite constraints from the checked pages rather than
promising a free tenant or publishing capability. References will age; review
again before changing their scope or date. Verification applies to these seven
references only, not the unchanged graph, authored checkpoints, path ordering,
learner completion, or Microsoft certification.

## Limits

One hand-curated path; no automatic recommendations or skill assessment. Practical
work happens outside MSkill and can require Microsoft accounts, licenses and an
authorized practice environment. Design walkthroughs must be labelled simulated.
No cloud backup, cross-device synchronization or live multi-tab reconciliation;
concurrent tabs use last-write-wins behavior. Clearing browser data removes the
record. Version changes intentionally require review instead of speculative
progress migration. Graph explanatory depth is limited to its authored seed.


## Slice 5 integration

The optional brief in milestone s6 now opens `/lab/first-agent`. Mission progress
uses a separate key and never marks a path milestone complete. Returning from the
lab selects s6; graph links continue using existing node/stage membership. See
`BUILDER_LAB.md` for the independently validated mission and evidence contract.
