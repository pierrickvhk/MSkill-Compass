import json
from copy import deepcopy
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from mskill_api.main import DEFAULT_CONTENT_PATH, create_app
from mskill_api.models import GraphDataset
from mskill_api.repository import GraphRepository, load_graph
from mskill_api.validation import GraphValidationError, validate_graph


def node(node_id: str, **updates: Any) -> dict[str, Any]:
    return {
        "id": node_id,
        "kind": "concept",
        "title": node_id,
        "topic": "ai",
        "summary": "Synthetic test concept",
        "difficulty": 1,
        "tags": [],
        "source_status": "seed-review",
        **updates,
    }


def edge(
    edge_id: str, source: str, target: str, relation: str = "REQUIRES", **updates: Any
) -> dict[str, Any]:
    return {
        "id": edge_id,
        "from": source,
        "to": target,
        "type": relation,
        "rationale": "Synthetic editorial test relationship",
        "confidence": "editorial",
        "source_status": "seed-review",
        **updates,
    }


@pytest.fixture
def payload() -> dict[str, Any]:
    return {
        "version": "test-v1",
        "status": "editorial-seed-review",
        "nodes": [node("b"), node("a"), node("isolated")],
        "edges": [edge("e2", "a", "b", "INTEGRATES_WITH"), edge("e1", "b", "a")],
    }


def parse(payload: dict[str, Any]) -> GraphDataset:
    graph = GraphDataset.model_validate_json(json.dumps(payload))
    validate_graph(graph)
    return graph


def test_complete_seed_loads_without_content_changes() -> None:
    graph = load_graph(DEFAULT_CONTENT_PATH)
    assert len(graph.nodes) == 30
    assert len(graph.edges) == 71
    assert graph.version == "v1"
    assert all(node.source_status == "seed-review" for node in graph.nodes)
    assert all(edge.source_status == "seed-review" for edge in graph.edges)
    assert all(edge.confidence == "editorial" for edge in graph.edges)
    original = json.loads(DEFAULT_CONTENT_PATH.read_text())
    serialized = graph.model_dump(mode="json", by_alias=True)
    for field in ("nodes", "edges"):
        for actual, expected in zip(serialized[field], original[field], strict=True):
            assert {key: actual[key] for key in expected} == expected


@pytest.mark.parametrize(
    "kind", ["product", "concept", "skill", "resource", "credential", "mission", "event"]
)
def test_all_node_kinds(payload: dict[str, Any], kind: str) -> None:
    payload["nodes"][0]["kind"] = kind
    assert parse(payload).nodes[0].kind == kind


@pytest.mark.parametrize(
    "relation",
    ["REQUIRES", "PART_OF", "ENABLES", "INTEGRATES_WITH", "USES", "GOVERNED_BY", "RELATED_TO"],
)
def test_all_relations(payload: dict[str, Any], relation: str) -> None:
    payload["edges"] = [edge("e1", "a", "b", relation)]
    assert parse(payload).edges[0].type == relation


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("kind", "technology"),
        ("topic", "unknown"),
        ("title", "  "),
        ("difficulty", True),
        ("difficulty", "1"),
        ("difficulty", 0),
        ("difficulty", 4),
        ("id", "Bad ID"),
        ("tags", "ai"),
        ("source_status", "official"),
        ("official_url", "http://learn.microsoft.com/example"),
        ("official_url", "https://user:secret@learn.microsoft.com/example"),
        ("official_url", "not-a-url"),
        ("explanations", {"expert": "Text"}),
        ("last_verified_at", "2026-01-01"),
        ("last_verified_at", "2026-01-01T10:00:00+02:00"),
        ("unexpected_field", True),
    ],
)
def test_invalid_node_schema(payload: dict[str, Any], field: str, value: Any) -> None:
    payload["nodes"][0][field] = value
    with pytest.raises(ValidationError) as exc:
        parse(payload)
    assert exc.value.errors()[0]["loc"][:2] == ("nodes", 0)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("type", "DEPENDS"),
        ("rationale", ""),
        ("confidence", "certain"),
        ("source_url", "javascript:alert(1)"),
        ("source_status", "official"),
        ("extra", 1),
    ],
)
def test_invalid_edge_schema(payload: dict[str, Any], field: str, value: Any) -> None:
    payload["edges"][0][field] = value
    with pytest.raises(ValidationError) as exc:
        parse(payload)
    assert exc.value.errors()[0]["loc"][:2] == ("edges", 0)


@pytest.mark.parametrize(
    ("collection", "field"),
    [
        ("nodes", "summary"),
        ("nodes", "tags"),
        ("nodes", "source_status"),
        ("edges", "from"),
        ("edges", "rationale"),
        ("edges", "confidence"),
    ],
)
def test_required_fields(payload: dict[str, Any], collection: str, field: str) -> None:
    del payload[collection][0][field]
    with pytest.raises(ValidationError):
        parse(payload)


@pytest.mark.parametrize("field", ["version", "status", "nodes", "edges"])
def test_required_dataset_fields(payload: dict[str, Any], field: str) -> None:
    del payload[field]
    with pytest.raises(ValidationError):
        parse(payload)


def test_integrity_errors_are_aggregated_and_located(payload: dict[str, Any]) -> None:
    payload["nodes"].append(node("a"))
    payload["edges"].extend(
        [
            edge("e1", "missing", "also-missing"),
            edge("self", "a", "a", "USES"),
            edge("duplicate", "b", "a"),
            edge("reverse", "b", "a", "INTEGRATES_WITH"),
        ]
    )
    with pytest.raises(GraphValidationError) as exc:
        parse(payload)
    codes = {issue.code for issue in exc.value.issues}
    assert codes == {
        "duplicate_node_id",
        "duplicate_edge_id",
        "missing_endpoint",
        "self_reference",
        "duplicate_relationship",
    }
    assert "missing" in str(exc.value)
    assert all(issue.location for issue in exc.value.issues)


def test_longer_prerequisite_cycle_reports_path(payload: dict[str, Any]) -> None:
    payload["edges"] = [
        edge("e1", "a", "b"),
        edge("e2", "b", "isolated"),
        edge("e3", "isolated", "a"),
    ]
    with pytest.raises(GraphValidationError, match="a -> b -> isolated -> a") as exc:
        parse(payload)
    assert exc.value.issues[0].code == "prerequisite_cycle"


def test_diamond_dag_and_non_prerequisite_cycles_are_valid(payload: dict[str, Any]) -> None:
    payload["nodes"].append(node("d"))
    payload["edges"] = [
        edge("e1", "a", "b"),
        edge("e2", "a", "isolated"),
        edge("e3", "b", "d"),
        edge("e4", "isolated", "d"),
        edge("e5", "d", "a", "RELATED_TO"),
    ]
    parse(payload)


def test_long_dag_does_not_depend_on_python_recursion_limit(payload: dict[str, Any]) -> None:
    payload["nodes"] = [node(f"n{i}") for i in range(1500)]
    payload["edges"] = [edge(f"e{i}", f"n{i}", f"n{i + 1}") for i in range(1499)]
    parse(payload)


@pytest.mark.parametrize("collection", ["nodes", "edges"])
def test_verified_record_needs_evidence_and_date(payload: dict[str, Any], collection: str) -> None:
    record = payload[collection][0]
    record["source_status"] = "verified"
    with pytest.raises(ValidationError):
        parse(payload)
    record["last_verified_at"] = "2026-01-01T00:00:00Z"
    with pytest.raises(ValidationError):
        parse(payload)
    record["official_url" if collection == "nodes" else "source_url"] = (
        "https://learn.microsoft.com/example"
    )
    parse(payload)


def test_sources_and_confidence_do_not_auto_promote_editorial_claims(
    payload: dict[str, Any],
) -> None:
    record = payload["edges"][0]
    record["sources"] = [
        {
            "url": "https://learn.microsoft.com/example",
            "publisher": "Microsoft",
            "source_status": "seed-review",
        }
    ]
    assert parse(payload).edges[0].confidence == "editorial"
    record["source_status"] = "verified"
    record["last_verified_at"] = "2026-01-01T00:00:00Z"
    with pytest.raises(ValidationError):
        parse(payload)
    record["sources"][0]["source_status"] = "verified"
    with pytest.raises(ValidationError):
        parse(payload)
    record["sources"][0]["last_verified_at"] = "2026-01-01T00:00:00Z"
    assert parse(payload).edges[0].confidence == "editorial"
    record["confidence"] = "officially-documented"
    assert parse(payload).edges[0].confidence == "officially-documented"
    record["sources"][0]["url"] = "https://microsoft.com.untrusted.example/page"
    with pytest.raises(ValidationError, match="Microsoft evidence"):
        parse(payload)


def test_officially_documented_requires_verified_evidence(payload: dict[str, Any]) -> None:
    payload["edges"][0]["confidence"] = "officially-documented"
    payload["edges"][0]["source_url"] = "https://learn.microsoft.com/example"
    with pytest.raises(ValidationError, match="Microsoft evidence"):
        parse(payload)


def test_verified_dataset_cannot_hide_seed_review(payload: dict[str, Any]) -> None:
    payload["status"] = "verified"
    with pytest.raises(ValidationError, match="seed-review"):
        parse(payload)


def test_duplicate_json_properties_are_not_silently_overwritten(tmp_path: Path) -> None:
    path = tmp_path / "duplicate.json"
    path.write_text(
        '{"version":"bad","version":"v1","status":"editorial-seed-review","nodes":[],"edges":[]}'
    )
    with pytest.raises(GraphValidationError, match="duplicate_json_key"):
        load_graph(path)


def test_deterministic_order_and_defensive_snapshots(payload: dict[str, Any]) -> None:
    repository = GraphRepository(parse(payload))
    shuffled = deepcopy(payload)
    shuffled["nodes"].reverse()
    shuffled["edges"].reverse()
    assert repository.canonical_json() == GraphRepository(parse(shuffled)).canonical_json()
    assert [n.id for n in repository.graph().nodes] == ["a", "b", "isolated"]
    assert [e.id for e in repository.graph().edges] == ["e1", "e2"]
    snapshot = repository.graph()
    snapshot.nodes.clear()
    repository.node("a").tags.append("mutation")
    repository.connections("a").symmetric.clear()
    assert len(repository.graph().nodes) == 3
    assert repository.node("a").tags == []
    assert len(repository.connections("a").symmetric) == 1
    assert repository.node("isolated").id == "isolated"
    assert repository.connections("isolated").incoming == []
    with pytest.raises(KeyError):
        repository.node("unknown")


def test_connections_preserve_semantics_and_stored_orientation(payload: dict[str, Any]) -> None:
    repository = GraphRepository(parse(payload))
    a, b = repository.connections("a"), repository.connections("b")
    assert [e.id for e in a.incoming] == ["e1"]
    assert [e.id for e in b.outgoing] == ["e1"]
    assert a.outgoing == b.incoming == []
    assert a.symmetric == b.symmetric
    assert a.symmetric[0].from_id == "a"
    assert a.symmetric[0].to == "b"


def test_api_contract_and_openapi() -> None:
    with TestClient(create_app()) as client:
        graph_response = client.get("/api/v1/graph")
        assert graph_response.status_code == 200
        graph = graph_response.json()
        assert len(graph["nodes"]) == 30 and len(graph["edges"]) == 71
        assert graph_response.content == client.get("/api/v1/graph").content
        assert [n["id"] for n in graph["nodes"]] == sorted(n["id"] for n in graph["nodes"])
        node_response = client.get("/api/v1/nodes/copilot-studio")
        assert node_response.status_code == 200
        assert node_response.json() == next(
            n for n in graph["nodes"] if n["id"] == "copilot-studio"
        )
        connections = client.get("/api/v1/nodes/copilot-studio/connections").json()
        for field in ("incoming", "outgoing", "symmetric"):
            assert [e["id"] for e in connections[field]] == sorted(
                e["id"] for e in connections[field]
            )
        assert all(e["type"] == "INTEGRATES_WITH" for e in connections["symmetric"])
        assert any(e["id"] == "e028" for e in connections["symmetric"])
        assert "from" in graph["edges"][0] and "from_id" not in graph["edges"][0]
        for suffix in ("", "/connections"):
            missing = client.get(f"/api/v1/nodes/missing{suffix}")
            assert missing.status_code == 404
            assert missing.json() == {"code": "not_found", "message": "Unknown node 'missing'"}
        assert client.post("/api/v1/graph").status_code == 405
        schema = client.get("/openapi.json").json()
        assert schema["paths"]["/api/v1/graph"]["get"]["responses"]["200"]["content"][
            "application/json"
        ]["schema"]["$ref"].endswith("GraphDataset")
        assert "from" in schema["components"]["schemas"]["GraphEdge"]["properties"]
        assert "404" in schema["paths"]["/api/v1/nodes/{node_id}"]["get"]["responses"]


def test_startup_rejects_semantic_errors(tmp_path: Path, payload: dict[str, Any]) -> None:
    payload["edges"].append(edge("bad", "a", "missing"))
    path = tmp_path / "graph.json"
    path.write_text(json.dumps(payload))
    with pytest.raises(GraphValidationError, match="Unknown node"), TestClient(create_app(path)):
        pass


def test_independent_apps_do_not_share_content(tmp_path: Path, payload: dict[str, Any]) -> None:
    path = tmp_path / "graph.json"
    path.write_text(json.dumps(payload))
    with TestClient(create_app(path)) as small, TestClient(create_app()) as full:
        assert small.get("/health").json()["graph_version"] == "test-v1"
        assert len(small.get("/api/v1/graph").json()["nodes"]) == 3
        assert len(full.get("/api/v1/graph").json()["nodes"]) == 30
