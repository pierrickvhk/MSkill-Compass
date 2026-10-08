"""Read-only path endpoint; invalid content does not disable graph exploration."""

import logging
from collections.abc import Callable
from pathlib import Path

from fastapi import APIRouter, HTTPException

from mskill_api.learning import LearningPathResponse, load_path
from mskill_api.models import ErrorResponse
from mskill_api.repository import GraphRepository

logger = logging.getLogger(__name__)


def learning_router(get_repository: Callable[[], GraphRepository], directory: Path) -> APIRouter:
    router = APIRouter(prefix="/api/v1/paths", tags=["Learning paths"])

    @router.get(
        "/{path_id}",
        response_model=LearningPathResponse,
        responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
        summary="Read the curated path and optional mission summary",
    )
    def learning_path(path_id: str) -> LearningPathResponse:
        if path_id != "agent-builder":
            raise HTTPException(status_code=404, detail=f"Unknown learning path '{path_id}'")
        try:
            response = load_path(
                directory / "path.agent-builder.json",
                get_repository().graph(),
                directory / "mission.first-agent.json",
            )
            if response.path.id != path_id:
                raise ValueError("Learning path ID must match the configured route")
            return response
        except (OSError, ValueError):
            logger.exception("Learning path content failed validation")
            raise HTTPException(
                status_code=503, detail="Learning path content is unavailable"
            ) from None

    return router
