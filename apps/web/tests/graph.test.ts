import { afterEach, expect, test, vi } from "vitest";
import { graphApi, isGraph, isNode } from "../lib/api";
import { explanation, layoutGraph, rankConnections, searchNodes } from "../lib/graph";
import { GET } from "../app/api/v1/[...path]/route";
import { graph, connections, apiFetch } from "./graph-fixture";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
test("real seed maps to the complete API contract without promoting provenance", () => {
  expect(isGraph(graph)).toBe(true);
  expect(graph.nodes).toHaveLength(30); expect(graph.edges).toHaveLength(71);
  expect(graph.edges.every((edge) => edge.source_status === "seed-review" && edge.confidence === "editorial")).toBe(true);
  expect(isGraph({ ...graph, edges: [{ ...graph.edges[0], to: "missing" }] })).toBe(false);
  expect(isNode({ ...graph.nodes[0], kind: "invented" })).toBe(false);
  expect(isNode({ ...graph.nodes[0], explanations: { invented: "text" } })).toBe(false);
});
test("client uses all three versioned routes and handles 404", async () => {
  const fetch = vi.fn(apiFetch); vi.stubGlobal("fetch", fetch);
  expect(await graphApi.graph()).toEqual(graph);
  expect((await graphApi.node("copilot-studio")).id).toBe("copilot-studio");
  expect((await graphApi.connections("copilot-studio")).symmetric).toContainEqual(expect.objectContaining({ id: "e028" }));
  await expect(graphApi.node("missing")).rejects.toThrow("could not be found");
});
test("client surfaces unavailable and malformed responses rather than invented content", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(Response.json({}, { status: 502 })).mockResolvedValueOnce(Response.json({ nodes: [] })).mockResolvedValueOnce(new Response("not json")));
  await expect(graphApi.graph()).rejects.toThrow("could not be reached");
  await expect(graphApi.graph()).rejects.toThrow("unavailable");
  await expect(graphApi.graph()).rejects.toThrow("expected contract");
  await expect(graphApi.graph()).rejects.toThrow("unreadable");
});
test("search matches names and metadata, supports categories and honest empty results", () => {
  expect(searchNodes(graph.nodes, "pOwEr Automate", "all").map((node) => node.id)).toEqual(["cloud-flows", "power-automate"]);
  expect(searchNodes(graph.nodes, "authentication", "data").some((node) => node.id === "api-basics")).toBe(true);
  expect(searchNodes(graph.nodes, "", "identity").every((node) => node.topic === "identity")).toBe(true);
  expect(searchNodes(graph.nodes, "no-such-technology", "all")).toEqual([]);
});
test("lens priorities change order without losing relationships; missing authored text falls back honestly", () => {
  const c = connections("copilot-studio");
  expect(rankConnections(c, "explorer")[0].type).toBe("ENABLES");
  expect(rankConnections(c, "builder")[0].type).toBe("INTEGRATES_WITH");
  expect(rankConnections(c, "architect")[0].type).toBe("GOVERNED_BY");
  expect(rankConnections(c, "architect")).toHaveLength(10);
  expect(explanation({ ...graph.nodes[0], explanations: {} }, "builder")).toEqual({ text: graph.nodes[0].summary, general: true });
});
test("layout is deterministic and focuses only recorded one-hop neighbors", () => {
  const layout = layoutGraph(graph, "copilot-studio");
  expect(layout).toEqual(layoutGraph({ ...graph, nodes: [...graph.nodes].reverse() }, "copilot-studio"));
  expect(layout.nodes).toHaveLength(11); expect(layout.edges).toHaveLength(10);
  expect(layoutGraph(graph, null).nodes).toHaveLength(30);
  expect(layoutGraph(graph, null).edges).toHaveLength(0);
  expect(new Set(layout.nodes.map(({ position }) => `${position.x}:${position.y}`)).size).toBe(11);
});
test("gateway uses runtime configuration, preserves 404s, and bounds its route allowlist", async () => {
  vi.stubEnv("API_BASE_URL", "http://api:8000/");
  const fetch = vi.fn().mockResolvedValue(Response.json({ code: "not_found", message: "Unknown node" }, { status: 404 }));
  vi.stubGlobal("fetch", fetch);
  const call = (path: string[]) => GET(new Request("http://localhost/api/v1/graph"), { params: Promise.resolve({ path }) });
  expect((await call(["nodes", "missing"])).status).toBe(404);
  expect(fetch.mock.calls[0][0]).toBe("http://api:8000/api/v1/nodes/missing");
  expect((await call(["..", "health"])).status).toBe(404);
  expect(fetch).toHaveBeenCalledTimes(1);
  fetch.mockRejectedValueOnce(new Error("timeout"));
  const failed = await call(["graph"]);
  expect(failed.status).toBe(502);
  expect(await failed.json()).toEqual({ code: "upstream_unavailable", message: "The graph service is unavailable. Please retry." });
});
