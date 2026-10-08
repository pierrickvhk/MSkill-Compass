"""Curated path invariants and HTTP isolation from graph exploration."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from mskill_api.learning import LearningPath, LearningPathResponse, load_path, validate_path
from mskill_api.main import DEFAULT_CONTENT_PATH, create_app
from mskill_api.repository import load_graph
from mskill_api.validation import GraphValidationError

CONTENT = DEFAULT_CONTENT_PATH.parent


def loaded() -> LearningPathResponse:
    return load_path(
        CONTENT / "path.agent-builder.json",
        load_graph(DEFAULT_CONTENT_PATH),
        CONTENT / "mission.first-agent.json",
    )


def test_complete_seed_and_determinism() -> None:
    response = loaded()
    assert len(response.path.stages) == 6
    assert [s.id for s in response.path.stages] == [f"s{i}" for i in range(1, 7)]
    assert response.mission is not None
    assert response.mission.id == "first-agent"
    assert response.path.source_status == "editorial-seed-review"
    assert all(s.source_status == "seed-review" for s in response.path.stages)
    assert all(s.objectives and s.checkpoints and s.resources for s in response.path.stages)
    assert response.model_dump_json() == loaded().model_dump_json()


@pytest.mark.parametrize(
    ("change", "code"),
    [
        ("duplicate", "duplicate_stage_id"),
        ("node", "missing_node"),
        ("stage", "missing_stage"),
        ("self", "prerequisite_cycle"),
        ("cycle", "prerequisite_cycle"),
        ("forward", "prerequisite_order"),
        ("mission", "missing_mission"),
        ("duplicate_ref", "duplicate_reference"),
    ],
)
def test_bad_references(change: str, code: str) -> None:
    response = loaded()
    data = response.path.model_dump(mode="json")
    if change == "duplicate":
        data["stages"][1]["id"] = "s1"
    elif change == "node":
        data["stages"][0]["node_ids"] = ["nonexistent"]
    elif change == "stage":
        data["stages"][0]["requires_stage_ids"] = ["missing"]
    elif change == "self":
        data["stages"][0]["requires_stage_ids"] = ["s1"]
    elif change in ("cycle", "forward"):
        data["stages"][0]["requires_stage_ids"] = ["s2" if change == "cycle" else "s5"]
    elif change == "mission":
        data["stages"][5]["mission_id"] = "unknown"
    else:
        data["stages"][0]["node_ids"] *= 2
    path = LearningPath.model_validate_json(json.dumps(data))
    with pytest.raises(GraphValidationError) as error:
        validate_path(path, load_graph(DEFAULT_CONTENT_PATH), response.mission)
    assert code in {issue.code for issue in error.value.issues}


@pytest.mark.parametrize("change", ["date", "unsafe", "publisher", "required", "status"])
def test_schema_and_source_policy(change: str) -> None:
    data = loaded().path.model_dump(mode="json")
    source = data["stages"][0]["resources"][0]
    if change == "date":
        source["last_verified_at"] = None
    elif change == "unsafe":
        source["url"] = "https://microsoft.com.evil.example/reference"
    elif change == "publisher":
        source["publisher"] = "Someone else"
    elif change == "required":
        del data["stages"][0]["node_ids"]
    else:
        data["stages"][0]["source_status"] = "verified"
    with pytest.raises(ValidationError):
        LearningPath.model_validate_json(json.dumps(data))


def test_original_schema_and_unverified_source_are_supported() -> None:
    data = loaded().path.model_dump(mode="json")
    del data["version"]
    for stage in data["stages"]:
        for field in ("why", "objectives", "checkpoints", "resources", "source_status"):
            del stage[field]
    original = LearningPath.model_validate_json(json.dumps(data))
    assert original.version == "v1"
    assert original.stages[0].resources == []
    data = loaded().path.model_dump(mode="json")
    data["stages"][0]["resources"][0].update(source_status="seed-review", last_verified_at=None)
    assert (
        LearningPath.model_validate_json(json.dumps(data)).stages[0].resources[0].source_status
        == "seed-review"
    )


def test_path_api_and_openapi() -> None:
    with TestClient(create_app()) as client:
        first = client.get("/api/v1/paths/agent-builder")
        assert first.status_code == 200
        assert first.json() == loaded().model_dump(mode="json")
        assert first.content == client.get("/api/v1/paths/agent-builder").content
        assert client.get("/api/v1/paths/missing").json() == {
            "code": "not_found",
            "message": "Unknown learning path 'missing'",
        }
        assert client.get("/api/v1/paths/missing").status_code == 404
        assert "/api/v1/paths/{path_id}" in client.get("/openapi.json").json()["paths"]


def test_bad_path_is_unavailable_but_graph_stays_healthy(tmp_path: Path) -> None:
    graph = tmp_path / "graph.seed.json"
    graph.write_text(DEFAULT_CONTENT_PATH.read_text())
    (tmp_path / "path.agent-builder.json").write_text('{"id":"agent-builder"}')
    with TestClient(create_app(graph)) as client:
        assert client.get("/health").status_code == 200
        assert client.get("/api/v1/graph").status_code == 200
        response = client.get("/api/v1/paths/agent-builder")
        assert response.status_code == 503
        assert response.json()["message"] == "Learning path content is unavailable"


def test_duplicate_json_property_rejected(tmp_path: Path) -> None:
    target = tmp_path / "path.json"
    text = (CONTENT / "path.agent-builder.json").read_text()
    target.write_text(text.replace('"id": "agent-builder"', '"id":"other", "id":"agent-builder"'))
    with pytest.raises(GraphValidationError, match="duplicate_json_key"):
        load_path(target, load_graph(DEFAULT_CONTENT_PATH), CONTENT / "mission.first-agent.json")
