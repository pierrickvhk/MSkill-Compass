import radarFixture from "./fixtures/radar.json";
import missionFixture from "./fixtures/mission.json";
import pathFixture from "./fixtures/path.json";
import fixture from "./fixtures/graph.json";
import { isGraph } from "../lib/api";
import type { Connections } from "../lib/graph";
const response: unknown = fixture;
if (!isGraph(response)) throw new Error("Seed fixture does not match the API contract");
export const graph = response;
export function connections(id: string): Connections {
  return { node_id: id,
    incoming: graph.edges.filter((edge) => edge.to === id && edge.type !== "INTEGRATES_WITH"),
    outgoing: graph.edges.filter((edge) => edge.from === id && edge.type !== "INTEGRATES_WITH"),
    symmetric: graph.edges.filter((edge) => [edge.from, edge.to].includes(id) && edge.type === "INTEGRATES_WITH"),
  };
}
export async function apiFetch(input: string | URL | Request): Promise<Response> {
  const path = String(input);
  if (path.endsWith("/paths/agent-builder")) return Response.json(pathFixture);
  if (path.endsWith("/missions/first-agent")) return Response.json(missionFixture);
  if (path.endsWith("/radar")) return Response.json(radarFixture);
  if (path.endsWith("/graph")) return Response.json(graph);
  const parts = path.split("/");
  const id = decodeURIComponent(parts[4] ?? "");
  const node = graph.nodes.find((node) => node.id === id);
  return node ? Response.json(parts[5] === "connections" ? connections(id) : node) : Response.json({ code: "not_found", message: "Unknown node" }, { status: 404 });
}
