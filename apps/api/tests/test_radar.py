"""Event integrity, clocks and the read-only API; no network source scraping."""

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from mskill_api.main import DEFAULT_CONTENT_PATH, create_app
from mskill_api.radar import RadarCatalog, RadarEvent, event_status, load_radar
from mskill_api.repository import load_graph
from mskill_api.validation import GraphValidationError

FILE = DEFAULT_CONTENT_PATH.parent / "radar.events.json"


def event_data() -> dict[str, Any]:
    return json.loads(FILE.read_text())["events"][0]  # type: ignore[no-any-return]


def test_catalog_stable_and_verified() -> None:
    graph = load_graph(DEFAULT_CONTENT_PATH)
    catalog = load_radar(FILE, graph)
    assert len(catalog.events) == 6
    assert catalog.model_dump_json() == load_radar(FILE, graph).model_dump_json()
    assert all(e.source.source_status == "verified" for e in catalog.events)
    assert [e.starts_at_utc for e in catalog.events] == sorted(
        e.starts_at_utc for e in catalog.events
    )


@pytest.mark.parametrize(
    "field,value",
    [
        ("starts_at_utc", "2026-02-30T12:00:00Z"),
        ("starts_at_utc", "2026-10-01T12:00:00"),
        ("starts_at_utc", "2026-10-01T12:00:00+02:00"),
        ("ends_at_utc", "2020-01-01T00:00:00Z"),
        ("original_timezone", "Mars/Olympus"),
        ("event_url", "javascript:alert(1)"),
        ("event_url", "http://reactor.microsoft.com/event"),
        ("event_url", "https://reactor.microsoft.com.evil.example/event"),
        ("event_url", "https://secret@reactor.microsoft.com/event"),
        ("event_url", "https://reactor.microsoft.com:444/event"),
        ("node_ids", ["agents", "agents"]),
        ("node_ids", []),
        ("format", "in-person"),
        ("status", "upcoming"),
        ("title", ""),
    ],
)
def test_invalid_event(field: str, value: Any) -> None:
    data = event_data()
    data[field] = value
    with pytest.raises(ValidationError):
        RadarEvent.model_validate_json(json.dumps(data))


def test_source_metadata_and_unique_ids() -> None:
    data = json.loads(FILE.read_text())
    data["events"][0]["source"]["source_status"] = "seed-review"
    with pytest.raises(ValidationError):
        RadarCatalog.model_validate_json(json.dumps(data))
    data = json.loads(FILE.read_text())
    data["events"].append(data["events"][0])
    with pytest.raises(ValidationError, match="unique"):
        RadarCatalog.model_validate_json(json.dumps(data))
    data = json.loads(FILE.read_text())
    data["updated_at"] = None
    with pytest.raises(ValidationError):
        RadarCatalog.model_validate_json(json.dumps(data))


def test_missing_graph_reference_located(tmp_path: Path) -> None:
    data = json.loads(FILE.read_text())
    data["events"][0]["node_ids"] = ["missing"]
    file = tmp_path / "radar.events.json"
    file.write_text(json.dumps(data))
    with pytest.raises(GraphValidationError) as error:
        load_radar(file, load_graph(DEFAULT_CONTENT_PATH))
    assert error.value.issues[0].location == "events[0].node_ids"
    assert "missing" in error.value.issues[0].message


def test_exact_boundaries_cancellation_and_aware_clock() -> None:
    event = RadarEvent.model_validate_json(json.dumps(event_data()))
    assert event_status(event, datetime(2026, 9, 1, tzinfo=UTC)) == "upcoming"
    assert event_status(event, event.starts_at_utc) == "ongoing"
    assert event_status(event, event.ends_at_utc) == "past"
    assert (
        event_status(event.model_copy(update={"status": "cancelled"}), event.starts_at_utc)
        == "cancelled"
    )
    with pytest.raises(ValueError):
        event_status(event, datetime(2026, 9, 1))


def test_empty_catalog_and_api_failures(tmp_path: Path) -> None:
    seed = tmp_path / "graph.seed.json"
    seed.write_text(DEFAULT_CONTENT_PATH.read_text())
    file = tmp_path / "radar.events.json"
    file.write_text('{"updated_at":null,"events":[],"explanation":"No verified events"}')
    with TestClient(create_app(seed)) as client:
        assert client.get("/api/v1/radar").json()["events"] == []
        file.write_text('{"events":[],"events":[]}')
        assert client.get("/api/v1/radar").status_code == 503
        assert client.get("/api/v1/graph").status_code == 200


def test_api_contract_read_only() -> None:
    with TestClient(create_app()) as client:
        r = client.get("/api/v1/radar")
        assert r.status_code == 200
        assert r.json() == load_radar(FILE, load_graph(DEFAULT_CONTENT_PATH)).model_dump(
            mode="json"
        )
        assert r.content == client.get("/api/v1/radar").content
        assert client.post("/api/v1/radar").status_code == 405
        assert "/api/v1/radar" in client.get("/openapi.json").json()["paths"]
