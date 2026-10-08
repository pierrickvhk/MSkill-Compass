"""Mission HTTP adapter. No endpoints for uploading learner evidence."""

import logging
from collections.abc import Callable
from pathlib import Path

from fastapi import APIRouter, HTTPException

from mskill_api.learning import load_path
from mskill_api.mission import Mission, load_mission
from mskill_api.models import ErrorResponse
from mskill_api.repository import GraphRepository

logger = logging.getLogger(__name__)


def mission_router(get_repository: Callable[[], GraphRepository], directory: Path) -> APIRouter:
    router = APIRouter(prefix="/api/v1/missions", tags=["Builder Lab"])

    @router.get(
        "/{mission_id}",
        response_model=Mission,
        responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    )
    def mission(mission_id: str) -> Mission:
        if mission_id != "first-agent":
            raise HTTPException(status_code=404, detail=f"Unknown mission '{mission_id}'")
        try:
            graph = get_repository().graph()
            file = directory / "mission.first-agent.json"
            path = load_path(directory / "path.agent-builder.json", graph, file).path
            value = load_mission(file, graph, path)
            if value.id != mission_id:
                raise ValueError("Mission ID must match its configured route")
            return value
        except (OSError, ValueError):
            logger.exception("Mission content failed validation")
            raise HTTPException(status_code=503, detail="Mission content is unavailable") from None

    return router
