"""Curated learning content. Stage order is authored; progress is never stored here."""

import json
from pathlib import Path
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from mskill_api.models import (
    GraphDataset,
    GraphSource,
    GraphValidationIssue,
    Level,
    Slug,
    StrictModel,
    Text,
    is_microsoft_url,
)
from mskill_api.repository import reject_duplicate_keys
from mskill_api.validation import GraphValidationError, prerequisite_cycles


class LearningResource(GraphSource):
    title: Text
    note: Text

    @model_validator(mode="after")
    def official_reference(self) -> Self:
        if self.publisher != "Microsoft" or not is_microsoft_url(self.url):
            raise ValueError("Learning resources must attribute an official Microsoft reference")
        return self


class LearningStage(StrictModel):
    id: Slug
    title: Text
    required: bool
    node_ids: list[Slug] = Field(min_length=1)
    requires_stage_ids: list[Slug]
    exit_criteria: list[Text] = Field(min_length=1)
    mission_id: Slug | None = None
    # Defaults preserve the original seed schema; the UI labels absent metadata explicitly.
    why: Text | None = None
    objectives: list[Text] = Field(default_factory=list)
    checkpoints: list[Text] = Field(default_factory=list)
    resources: list[LearningResource] = Field(default_factory=list)
    source_status: Literal["seed-review"] = "seed-review"


class LearningPath(StrictModel):
    id: Slug
    title: Text
    description: Text
    level: Level
    source_status: Literal["editorial-seed-review"]
    version: Text = "v1"
    stages: list[LearningStage]


class MissionSummary(BaseModel):
    """Deliberate projection of the existing mission seed, not a mission execution API."""

    model_config = ConfigDict(strict=True, extra="ignore", frozen=True)
    id: Slug
    title: Text
    description: Text
    prerequisite_stage_ids: list[Slug]


class LearningPathResponse(StrictModel):
    path: LearningPath
    mission: MissionSummary | None = None


def validate_path(path: LearningPath, graph: GraphDataset, mission: MissionSummary | None) -> None:
    issues: list[GraphValidationIssue] = []

    def report(code: str, location: str, message: str) -> None:
        issues.append(GraphValidationIssue(code=code, location=location, message=message))

    positions = {stage.id: index for index, stage in enumerate(path.stages)}
    nodes = {node.id for node in graph.nodes}
    seen: set[str] = set()
    adjacency: dict[str, list[str]] = {}
    for index, stage in enumerate(path.stages):
        loc = f"stages[{index}] ({stage.id})"
        if stage.id in seen:
            report("duplicate_stage_id", loc, f"Duplicate stage '{stage.id}'")
        seen.add(stage.id)
        for field, values in (
            ("node_ids", stage.node_ids),
            ("requires_stage_ids", stage.requires_stage_ids),
        ):
            if len(values) != len(set(values)):
                report("duplicate_reference", f"{loc}.{field}", "References must be unique")
        for node_id in stage.node_ids:
            if node_id not in nodes:
                report("missing_node", f"{loc}.node_ids", f"Unknown graph node '{node_id}'")
        adjacency[stage.id] = [ref for ref in stage.requires_stage_ids if ref in positions]
        for ref in stage.requires_stage_ids:
            if ref not in positions:
                report("missing_stage", loc, f"Unknown prerequisite '{ref}'")
            elif positions[ref] >= index:
                report("prerequisite_order", loc, f"Prerequisite '{ref}' must precede this stage")
        if stage.mission_id and (mission is None or stage.mission_id != mission.id):
            report("missing_mission", loc, f"Unknown mission '{stage.mission_id}'")
    for cycle in prerequisite_cycles(adjacency):
        report("prerequisite_cycle", "stages", "Cycle: " + " -> ".join(cycle))
    if mission:
        for ref in mission.prerequisite_stage_ids:
            if ref not in positions:
                report("missing_stage", "mission.prerequisite_stage_ids", f"Unknown stage '{ref}'")
    if issues:
        raise GraphValidationError(issues)


def load_path(path_file: Path, graph: GraphDataset, mission_file: Path) -> LearningPathResponse:
    text = path_file.read_text(encoding="utf-8")
    path = LearningPath.model_validate_json(text)
    json.loads(text, object_pairs_hook=reject_duplicate_keys)
    mission = None
    if any(stage.mission_id for stage in path.stages):
        mission_text = mission_file.read_text(encoding="utf-8")
        json.loads(mission_text, object_pairs_hook=reject_duplicate_keys)
        mission = MissionSummary.model_validate_json(mission_text)
    validate_path(path, graph, mission)
    return LearningPathResponse(path=path, mission=mission)
