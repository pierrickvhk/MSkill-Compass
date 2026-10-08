"""Load once, reject invalid data, and expose isolated read-only snapshots."""

import json
from pathlib import Path

from mskill_api.models import ConnectionsResponse, GraphDataset, GraphNode, GraphValidationIssue
from mskill_api.validation import GraphValidationError, validate_graph


def reject_duplicate_keys(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise GraphValidationError(
                [
                    GraphValidationIssue(
                        code="duplicate_json_key",
                        location=f"JSON.{key}",
                        message=f"Duplicate JSON property '{key}'; values cannot be overwritten",
                    )
                ]
            )
        result[key] = value
    return result


def load_graph(path: Path) -> GraphDataset:
    text = path.read_text(encoding="utf-8")
    # Pydantic supplies located errors for malformed JSON and schema failures.
    graph = GraphDataset.model_validate_json(text)
    json.loads(text, object_pairs_hook=reject_duplicate_keys)
    validate_graph(graph)
    return graph


class GraphRepository:
    def __init__(self, graph: GraphDataset) -> None:
        validate_graph(graph)
        # Never sort the caller's objects or the on-disk seed in place.
        self._graph = graph.model_copy(deep=True)
        self._graph.nodes.sort(key=lambda node: node.id)
        self._graph.edges.sort(key=lambda edge: edge.id)
        for node in self._graph.nodes:
            node.tags.sort()
            ordered_explanations = dict(sorted(node.explanations.items()))
            node.explanations.clear()
            node.explanations.update(ordered_explanations)
        for sources in [
            *(node.sources for node in self._graph.nodes),
            *(edge.sources for edge in self._graph.edges),
        ]:
            sources.sort(key=lambda source: source.model_dump_json())
        self._nodes = {node.id: node for node in self._graph.nodes}
        self._connections = {
            node_id: ConnectionsResponse(node_id=node_id, incoming=[], outgoing=[], symmetric=[])
            for node_id in self._nodes
        }
        for edge in self._graph.edges:
            if edge.type == "INTEGRATES_WITH":
                self._connections[edge.from_id].symmetric.append(edge)
                self._connections[edge.to].symmetric.append(edge)
            else:
                self._connections[edge.from_id].outgoing.append(edge)
                self._connections[edge.to].incoming.append(edge)

    @property
    def version(self) -> str:
        return self._graph.version

    def graph(self) -> GraphDataset:
        return self._graph.model_copy(deep=True)

    def node(self, node_id: str) -> GraphNode:
        return self._nodes[node_id].model_copy(deep=True)

    def connections(self, node_id: str) -> ConnectionsResponse:
        return self._connections[node_id].model_copy(deep=True)

    def canonical_json(self) -> str:
        return json.dumps(
            self._graph.model_dump(mode="json", by_alias=True),
            sort_keys=True,
            ensure_ascii=False,
            separators=(",", ":"),
        )
