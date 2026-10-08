"""Mission schema, graph membership and read-only HTTP contracts."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from mskill_api.learning import load_path
from mskill_api.main import DEFAULT_CONTENT_PATH, create_app
from mskill_api.mission import Mission, load_mission, validate_mission
from mskill_api.repository import load_graph
from mskill_api.validation import GraphValidationError

CONTENT = DEFAULT_CONTENT_PATH.parent


def loaded() -> Mission:
    graph = load_graph(DEFAULT_CONTENT_PATH)
    path = load_path(
        CONTENT / "path.agent-builder.json", graph, CONTENT / "mission.first-agent.json"
    )
    return load_mission(CONTENT / "mission.first-agent.json", graph, path.path)


def test_complete_mission_and_stable_serialization() -> None:
    mission = loaded()
    assert [t.id for t in mission.tasks] == [f"m{i}" for i in range(1, 6)]
    assert len(mission.test_scenarios) == 4
    assert len(mission.deliverables) == 7
    assert mission.estimated_minutes is None
    assert mission.source_status == "editorial-seed-review"
    assert all(
        t.instructions and t.design_instructions and t.design_done_when for t in mission.tasks
    )
    assert {
        "copilot-studio",
        "agents",
        "knowledge-sources",
        "connectors",
        "governance",
        "monitoring-evals",
    } <= set(mission.node_ids)
    assert mission.model_dump_json() == loaded().model_dump_json()


@pytest.mark.parametrize(
    "change",
    [
        "node",
        "task_node",
        "resource",
        "prerequisite",
        "path",
        "duplicate_task",
        "duplicate_test",
        "membership",
    ],
)
def test_invalid_references(change: str) -> None:
    data = loaded().model_dump(mode="json")
    if change == "node":
        data["node_ids"].append("missing")
    elif change == "task_node":
        data["tasks"][0]["node_ids"].append("teams")
    elif change == "resource":
        data["tasks"][0]["resource_ids"].append("missing")
    elif change == "prerequisite":
        data["prerequisite_stage_ids"].append("missing")
    elif change == "path":
        data["path_id"] = "missing"
    elif change == "duplicate_task":
        data["tasks"][1]["id"] = "m1"
    elif change == "duplicate_test":
        data["test_scenarios"][1]["id"] = data["test_scenarios"][0]["id"]
    else:
        data["id"] = "unlinked"
    graph = load_graph(DEFAULT_CONTENT_PATH)
    path = load_path(
        CONTENT / "path.agent-builder.json", graph, CONTENT / "mission.first-agent.json"
    )
    with pytest.raises(GraphValidationError) as error:
        validate_mission(Mission.model_validate_json(json.dumps(data)), graph, path.path)
    assert error.value.issues[0].location
    assert error.value.issues[0].message


@pytest.mark.parametrize(
    "change", ["verified_without_date", "url", "unknown_field", "missing_field", "time", "status"]
)
def test_schema_and_provenance(change: str) -> None:
    data = loaded().model_dump(mode="json")
    if change == "verified_without_date":
        data["resources"][0]["last_verified_at"] = None
    elif change == "url":
        data["resources"][0]["url"] = "https://learn.microsoft.com.evil.example/"
    elif change == "unknown_field":
        data["credentials_awarded"] = True
    elif change == "missing_field":
        del data["tasks"][0]["done_when"]
    elif change == "time":
        data["estimated_minutes"] = -1
    else:
        data["source_status"] = "verified"
    with pytest.raises(ValidationError):
        Mission.model_validate_json(json.dumps(data))


def test_original_seed_shape_remains_supported() -> None:
    data = loaded().model_dump(mode="json")
    original = {
        key: data[key]
        for key in (
            "id",
            "title",
            "difficulty",
            "estimated_minutes",
            "description",
            "prerequisite_stage_ids",
            "tasks",
            "test_cases",
            "output",
        )
    }
    original["tasks"] = [
        {key: task[key] for key in ("id", "title", "done_when")} for task in data["tasks"]
    ]
    parsed = Mission.model_validate_json(json.dumps(original))
    assert parsed.tasks[0].instructions == []
    assert parsed.resources == []


def test_mission_api_unknown_and_read_only() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/api/v1/missions/first-agent")
        assert response.status_code == 200
        assert response.json() == loaded().model_dump(mode="json")
        assert response.content == client.get("/api/v1/missions/first-agent").content
        assert client.get("/api/v1/missions/missing").status_code == 404
        assert (
            client.post("/api/v1/missions/first-agent", json={"evidence": "demo"}).status_code
            == 405
        )
        assert "/api/v1/missions/{mission_id}" in client.get("/openapi.json").json()["paths"]


def test_invalid_content_bounded_error_and_duplicate_keys(tmp_path: Path) -> None:
    for name in ("graph.seed.json", "path.agent-builder.json", "mission.first-agent.json"):
        (tmp_path / name).write_text((CONTENT / name).read_text())
    file = tmp_path / "mission.first-agent.json"
    file.write_text(
        file.read_text().replace('"id": "first-agent"', '"id":"duplicate","id":"first-agent"')
    )
    with TestClient(create_app(tmp_path / "graph.seed.json")) as client:
        response = client.get("/api/v1/missions/first-agent")
        assert response.status_code == 503
        assert response.json()["message"] == "Mission content is unavailable"
        assert client.get("/api/v1/graph").status_code == 200
