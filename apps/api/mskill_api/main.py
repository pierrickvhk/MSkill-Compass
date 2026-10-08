"""Application composition and startup validation."""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from mskill_api.learning_routes import learning_router
from mskill_api.mission_routes import mission_router
from mskill_api.models import ErrorResponse, HealthResponse
from mskill_api.radar_routes import radar_router
from mskill_api.repository import GraphRepository, load_graph
from mskill_api.routes import graph_router

DEFAULT_CONTENT_PATH = Path(__file__).resolve().parents[3] / "content" / "graph.seed.json"


def create_app(content_path: Path | None = None) -> FastAPI:
    seed_path = content_path or Path(os.getenv("CONTENT_PATH", str(DEFAULT_CONTENT_PATH)))
    repository: GraphRepository | None = None

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        nonlocal repository
        repository = GraphRepository(load_graph(seed_path))
        yield

    application = FastAPI(title="MSkill Compass API", version="0.1.0", lifespan=lifespan)
    origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    if "*" in origins:
        raise ValueError("CORS_ORIGINS must list explicit origins")
    application.add_middleware(
        CORSMiddleware, allow_origins=origins, allow_methods=["GET"], allow_credentials=False
    )

    def get_repository() -> GraphRepository:
        if repository is None:
            raise RuntimeError("Application lifespan has not started")
        return repository

    application.include_router(graph_router(get_repository))
    application.include_router(learning_router(get_repository, seed_path.parent))
    application.include_router(mission_router(get_repository, seed_path.parent))
    application.include_router(radar_router(get_repository, seed_path.parent))

    @application.exception_handler(HTTPException)
    async def http_error(_: Request, exc: HTTPException) -> JSONResponse:
        code = "not_found" if exc.status_code == 404 else "http_error"
        response = ErrorResponse(code=code, message=str(exc.detail))
        return JSONResponse(
            status_code=exc.status_code, content=response.model_dump(), headers=exc.headers
        )

    @application.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(graph_version=get_repository().version)

    return application


app = create_app()
