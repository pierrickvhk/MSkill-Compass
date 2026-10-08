"""HTTP contract; storage and validation do not depend on FastAPI."""

from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from mskill_api.models import ConnectionsResponse, ErrorResponse, GraphDataset, GraphNode
from mskill_api.repository import GraphRepository


def graph_router(get_repository: Callable[[], GraphRepository]) -> APIRouter:
    router = APIRouter(prefix="/api/v1", tags=["Knowledge graph"])

    @router.get("/graph", response_model=GraphDataset, summary="Read the validated graph")
    def graph(repository: Annotated[GraphRepository, Depends(get_repository)]) -> GraphDataset:
        return repository.graph()

    @router.get(
        "/nodes/{node_id}",
        response_model=GraphNode,
        responses={404: {"model": ErrorResponse}},
        summary="Read one node",
    )
    def node(
        node_id: str, repository: Annotated[GraphRepository, Depends(get_repository)]
    ) -> GraphNode:
        try:
            return repository.node(node_id)
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Unknown node '{node_id}'") from None

    @router.get(
        "/nodes/{node_id}/connections",
        response_model=ConnectionsResponse,
        responses={404: {"model": ErrorResponse}},
        summary="Read directed and symmetric connections",
    )
    def connections(
        node_id: str, repository: Annotated[GraphRepository, Depends(get_repository)]
    ) -> ConnectionsResponse:
        try:
            return repository.connections(node_id)
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Unknown node '{node_id}'") from None

    return router
