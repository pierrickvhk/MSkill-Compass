"""Cross-record rules. REQUIRES runs dependent -> prerequisite."""

from collections.abc import Iterator

from mskill_api.models import GraphDataset, GraphValidationIssue


class GraphValidationError(ValueError):
    def __init__(self, issues: list[GraphValidationIssue]) -> None:
        self.issues = tuple(issues)
        super().__init__("; ".join(f"{i.location}: {i.message} [{i.code}]" for i in issues))


def prerequisite_cycles(adjacency: dict[str, list[str]]) -> list[list[str]]:
    """Iterative DFS avoids recursion limits; report deterministic concrete cycle paths."""
    done: set[str] = set()
    cycles: list[list[str]] = []
    for root in sorted(adjacency):
        if root in done:
            continue
        path = [root]
        active = {root: 0}
        stack: list[Iterator[str]] = [iter(sorted(adjacency[root]))]
        while stack:
            child = next(stack[-1], None)
            if child is None:
                stack.pop()
                finished = path.pop()
                done.add(finished)
                del active[finished]
            elif child in active:
                cycles.append([*path[active[child] :], child])
            elif child not in done:
                active[child] = len(path)
                path.append(child)
                stack.append(iter(sorted(adjacency[child])))
    return cycles


def validate_graph(graph: GraphDataset) -> None:
    issues: list[GraphValidationIssue] = []

    def report(code: str, location: str, message: str) -> None:
        issues.append(GraphValidationIssue(code=code, location=location, message=message))

    nodes: set[str] = set()
    for index, node in enumerate(graph.nodes):
        if node.id in nodes:
            report("duplicate_node_id", f"nodes[{index}].id", f"Duplicate node ID '{node.id}'")
        nodes.add(node.id)
    edge_ids: set[str] = set()
    triples: set[tuple[str, str, str]] = set()
    adjacency: dict[str, list[str]] = {node_id: [] for node_id in nodes}
    for index, edge in enumerate(graph.edges):
        location = f"edges[{index}] ({edge.id})"
        if edge.id in edge_ids:
            report("duplicate_edge_id", location, f"Duplicate edge ID '{edge.id}'")
        edge_ids.add(edge.id)
        for field, endpoint in (("from", edge.from_id), ("to", edge.to)):
            if endpoint not in nodes:
                report("missing_endpoint", f"{location}.{field}", f"Unknown node '{endpoint}'")
        if edge.from_id == edge.to:
            report("self_reference", location, f"Edge cannot link '{edge.to}' to itself")
        first, second = edge.from_id, edge.to
        if edge.type == "INTEGRATES_WITH":
            first, second = sorted((first, second))
        triple = (first, second, edge.type)
        if triple in triples:
            report("duplicate_relationship", location, f"Duplicate relationship {triple}")
        triples.add(triple)
        if edge.type == "REQUIRES" and edge.from_id in nodes and edge.to in nodes:
            adjacency[edge.from_id].append(edge.to)
    for cycle in prerequisite_cycles(adjacency):
        report("prerequisite_cycle", "edges.REQUIRES", "Cycle: " + " -> ".join(cycle))
    if issues:
        raise GraphValidationError(issues)
