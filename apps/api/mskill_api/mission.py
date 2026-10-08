"""Read-only mission content; learner evidence never enters this API."""

import json
from pathlib import Path
from typing import Literal

from pydantic import Field

from mskill_api.learning import LearningPath, LearningResource
from mskill_api.models import GraphDataset, GraphValidationIssue, Level, Slug, StrictModel, Text
from mskill_api.repository import reject_duplicate_keys
from mskill_api.validation import GraphValidationError


class MissionResource(LearningResource):
    id: Slug


class MissionTask(StrictModel):
    id: Slug
    title: Text
    done_when: Text
    phase_title: Text | None = None
    instructions: list[Text] = Field(default_factory=list)
    design_instructions: list[Text] = Field(default_factory=list)
    design_done_when: Text | None = None
    node_ids: list[Slug] = Field(default_factory=list)
    resource_ids: list[Slug] = Field(default_factory=list)


class TestScenario(StrictModel):
    id: Slug
    title: Text
    prompt: Text
    expected: Text


class Deliverable(StrictModel):
    id: Slug
    title: Text


class Mission(StrictModel):
    id: Slug
    title: Text
    difficulty: Level
    estimated_minutes: int | None = Field(default=None, ge=1)
    description: Text
    prerequisite_stage_ids: list[Slug]
    tasks: list[MissionTask]
    test_cases: list[Text]
    output: Text
    version: Text = "v1"
    path_id: Slug = "agent-builder"
    source_status: Literal["editorial-seed-review"] = "editorial-seed-review"
    objectives: list[Text] = Field(default_factory=list)
    requirements: list[Text] = Field(default_factory=list)
    node_ids: list[Slug] = Field(default_factory=list)
    resources: list[MissionResource] = Field(default_factory=list)
    test_scenarios: list[TestScenario] = Field(default_factory=list)
    deliverables: list[Deliverable] = Field(default_factory=list)


def validate_mission(mission: Mission, graph: GraphDataset, path: LearningPath) -> None:
    issues: list[GraphValidationIssue] = []

    def fail(code: str, location: str, message: str) -> None:
        issues.append(GraphValidationIssue(code=code, location=location, message=message))

    def unique(ids: list[str], location: str) -> None:
        if len(ids) != len(set(ids)):
            fail("duplicate_id", location, "IDs/references must be unique")

    def references(ids: list[str], known: set[str], location: str) -> None:
        unique(ids, location)
        for value in ids:
            if value not in known:
                fail("missing_reference", location, f"Unknown reference '{value}'")

    if mission.path_id != path.id:
        fail("missing_path", "path_id", f"Unknown learning path '{mission.path_id}'")
    if not any(stage.mission_id == mission.id for stage in path.stages):
        fail("missing_membership", "id", "Mission must be linked by the learning path")
    references(
        mission.prerequisite_stage_ids, {s.id for s in path.stages}, "prerequisite_stage_ids"
    )
    references(mission.node_ids, {n.id for n in graph.nodes}, "node_ids")
    for field, ids in (
        ("tasks", [t.id for t in mission.tasks]),
        ("resources", [r.id for r in mission.resources]),
        ("test_scenarios", [s.id for s in mission.test_scenarios]),
        ("deliverables", [d.id for d in mission.deliverables]),
    ):
        unique(ids, field)
    for index, task in enumerate(mission.tasks):
        references(task.node_ids, set(mission.node_ids), f"tasks[{index}].node_ids")
        references(
            task.resource_ids, {r.id for r in mission.resources}, f"tasks[{index}].resource_ids"
        )
    if issues:
        raise GraphValidationError(issues)


def load_mission(file: Path, graph: GraphDataset, path: LearningPath) -> Mission:
    text = file.read_text(encoding="utf-8")
    mission = Mission.model_validate_json(text)
    json.loads(text, object_pairs_hook=reject_duplicate_keys)
    validate_mission(mission, graph, path)
    return mission
