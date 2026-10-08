from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from mskill_api.main import create_app


def test_health_uses_repository_seed() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "graph_version": "v1"}


def test_health_reports_loaded_version(tmp_path: Path) -> None:
    seed = tmp_path / "graph.json"
    seed.write_text(
        '{"version":"test-version","status":"editorial-seed-review","nodes":[],"edges":[]}',
        encoding="utf-8",
    )
    with TestClient(create_app(seed)) as client:
        assert client.get("/health").json()["graph_version"] == "test-version"


@pytest.mark.parametrize("payload", ["{}", '{"version":1}', '{"version":""}', "invalid"])
def test_invalid_seed_metadata_prevents_startup(tmp_path: Path, payload: str) -> None:
    seed = tmp_path / "graph.json"
    seed.write_text(payload, encoding="utf-8")
    with pytest.raises(ValidationError), TestClient(create_app(seed)):
        pass


def test_missing_seed_prevents_startup(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError), TestClient(create_app(tmp_path / "missing.json")):
        pass


def test_cors_allowlist(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")
    with TestClient(create_app()) as client:
        allowed = client.get("/health", headers={"Origin": "http://localhost:3000"})
        assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
        denied = client.get("/health", headers={"Origin": "https://untrusted.example"})
        assert "access-control-allow-origin" not in denied.headers


def test_wildcard_origin_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "*")
    with pytest.raises(ValueError, match="explicit origins"):
        create_app()
