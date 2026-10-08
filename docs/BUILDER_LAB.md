# Builder Lab contract — Slice 5

`/lab/first-agent` is an independent, five-phase workshop, **Build Your First
Copilot Studio Knowledge Agent**. It guides planning, synthetic knowledge preparation,
configuration outside MSkill, manual evaluation and documentation. All phases are
open; prerequisites are guidance, never permission gates. No time promise is made.

## Content and API

`content/mission.first-agent.json` preserves ID `first-agent`, task IDs m1–m5,
original task titles/checkpoints, prerequisite stages s1–s3, legacy `test_cases` and
`output`. The display title is updated. Additive fields are:

- Mission: version, path_id, editorial source_status, objectives, requirements,
  node_ids, resources, test_scenarios and deliverables.
- Task: phase_title, instructions, design_instructions, design_done_when,
  node_ids and resource_ids.
- Resource: existing LearningResource contract plus a stable id. HTTPS/source
  metadata and verified timestamps follow existing path validation.
- TestScenario: id, title, prompt and expected editorial behavior.
- Deliverable: id and title.

Pydantic models reject unknown fields and malformed values. Additive defaults
allow the original mission seed shape to load; the current seed supplies the full
workshop. Arrays retain authored ordering. Duplicate JSON keys, task/resource/test/
deliverable IDs and reference entries are rejected. Path membership, prerequisite
stages, graph node membership and each task's resource/node references are checked.
Errors include codes, locations and the missing identifier.

`mission.py` owns models/loading/validation; `mission_routes.py` owns HTTP adaptation.
The configured JSON directory is the existing graph content directory. The route
validates the sibling path and mission against the loaded graph on each request.

```sh
curl http://localhost:8001/api/v1/missions/first-agent
curl http://localhost:3001/api/v1/missions/first-agent # same-origin web gateway
curl http://localhost:8001/api/v1/missions/unknown
```

Success is the explicit `Mission` response model (OpenAPI `/docs`). A shortened
example, omitting the remaining required fields for readability:

```json
{
  "id": "first-agent",
  "title": "Build Your First Copilot Studio Knowledge Agent",
  "version": "v1",
  "path_id": "agent-builder",
  "source_status": "editorial-seed-review",
  "estimated_minutes": null,
  "node_ids": ["copilot-studio", "agents", "knowledge-sources", "connectors", "governance", "monitoring-evals"]
}
```

Unknown IDs return 404 with `{code,message}`; invalid/unreadable configured content
returns bounded 503 without a stack trace. Details go to server logs. POST is 405.
The canonical complete response is `apps/web/tests/fixtures/mission.json`, checked
against the live API by smoke tests. No endpoint accepts learner evidence.

## Local progress and completion

Key: `mskill.mission-progress.v1.first-agent`. Top-level fields are schema_version
(1), mission_id, content_version, active_task_id, mode (`design` or `build`) and
lanes. Each lane independently stores completed_task_ids, notes keyed by task,
results keyed by scenario, deliverable_ids, repository_url and evidence. Result
outcomes are `not-recorded`, `met`, `needs-work` or `blocked`, with written notes.
Changing modes never promotes or copies design evidence into actual-build progress.
Phase deep links use `?phase=m1` through `m5`; reload resumes the saved phase unless
a valid URL phase overrides it. Browser history restores phase selection.

A workshop is complete only when all five checkpoints, all seven deliverables and
all four written assessments are recorded. A documented failure remains a valid
observation: completion never asserts that tests passed. Design-only is always
labelled simulated and not implemented. Actual-build implementation is “not yet
reported” until m3 is manually checked, then “self-reported, unverified.” It does
not imply deployment. Neither mode confers a Microsoft credential.

Corrupt, incompatible-version, oversized or unknown-reference records produce a
fresh view and a visible notice; the original is not overwritten until the next
edit. Denied/quota storage falls back to visit-only state with a notice. Reset
requires an inline confirmation, initially focuses Keep, supports Escape and
returns focus to its trigger. It removes both mission records only. Path progress
and lens preferences remain independent. Failed reset warns that old data may
return on reload. Concurrent tabs are last-write-wins; there is no cloud backup.

## Evidence and export

Notes/evidence are bounded to 2,000 characters, observations to 1,000, repository
URLs to 240. React renders text without HTML interpretation. Only HTTPS GitHub
owner/repository URLs are accepted, excluding credentials, query, fragment,
non-default port and extra path segments. URLs are not fetched or verified; the
application cannot establish repository existence, visibility or ownership. Invalid
drafts are not saved, and disable export until corrected or cleared.

Markdown includes mode, status, phase notes, manual outcomes, final checklist,
evidence, optional repository, graph identifiers and source provenance. Learner
text is escaped against HTML/Markdown interpretation. Download is a local Blob;
Preview Markdown provides a selectable, read-only text area as a copy fallback.
There is no upload or publishing action. Users are reminded to use synthetic data
and review the export before sharing. localStorage is not encrypted secure storage:
never enter credentials, personal details or confidential organizational content.

## Graph and source policy

The six associations are learning references to existing node IDs, not new graph
relationships. Phase context reads the same graph definitions and lens projections.
Associated node inspectors link to the mission; s6 links from My Learning Compass;
the lab links back to s6 and individual nodes. The graph canvas never reads progress.

Mission instructions and expected outcomes are original MSkill editorial seed-review.
Five linked official Microsoft references carry narrowly scoped reference checks;
see `SOURCES_AND_DECISIONS.md`. These checks do not verify the mission, learner,
implementation or evidence. Actual Microsoft work requires appropriate access,
licenses, policies and an authorized environment; instructions link to maintained
official UI guidance. Design-only work requires none of that access.

## Limits

One curated mission, no automated grading or Microsoft execution, no emulator,
authentication, storage server, repository integration, account sync or deployment.
No tenant workflow was executed during engineering verification. Browser-level
Blob download completion could not be confirmed by the in-app browser event API;
export generation/download mechanics are unit tested and the selectable preview
was inspected successfully. See `SLICE_5_IMPLEMENTATION.md` for exact evidence.
