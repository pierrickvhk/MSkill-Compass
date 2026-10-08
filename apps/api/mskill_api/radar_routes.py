"""Read-only Radar transport, separate from validation and source curation."""

import logging
from collections.abc import Callable
from pathlib import Path

from fastapi import APIRouter, HTTPException

from mskill_api.models import ErrorResponse
from mskill_api.radar import RadarCatalog, load_radar
from mskill_api.repository import GraphRepository

logger = logging.getLogger(__name__)


def radar_router(get_repository: Callable[[], GraphRepository], directory: Path) -> APIRouter:
    router = APIRouter(prefix="/api/v1", tags=["Radar"])

    @router.get("/radar", response_model=RadarCatalog, responses={503: {"model": ErrorResponse}})
    def radar() -> RadarCatalog:
        try:
            return load_radar(directory / "radar.events.json", get_repository().graph())
        except (OSError, ValueError):
            logger.exception("Radar content failed validation")
            raise HTTPException(status_code=503, detail="Radar content is unavailable") from None

    return router
