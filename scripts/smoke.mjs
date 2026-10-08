// Exercises the actual HTTP servers. Start Compose or both native servers first.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const apiUrl = process.env.API_URL ?? "http://localhost:8000";
const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
const health = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(10_000) });
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { status: "ok", graph_version: "v1" });
const home = await fetch(webUrl, { signal: AbortSignal.timeout(30_000) });
assert.equal(home.status, 200);
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "DENY");
assert.match(home.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
const html = await home.text();
assert.match(html, /<h1[^>]*>One universe\./);
assert.match(html, /Explore the Universe/);
assert.match(html, /seed-review/);
const get = (path) => fetch(`${apiUrl}${path}`, { signal: AbortSignal.timeout(10_000) });
const graphResponse = await get("/api/v1/graph");
assert.equal(graphResponse.status, 200);
const graphText = await graphResponse.text();
assert.equal(await (await get("/api/v1/graph")).text(), graphText);
const graph = JSON.parse(graphText);
assert.equal(graph.version, "v1");
assert.equal(graph.status, "editorial-seed-review");
assert.equal(graph.nodes.length, 30);
assert.equal(graph.edges.length, 71);
for (const records of [graph.nodes, graph.edges]) {
  assert.deepEqual(records.map(({ id }) => id), records.map(({ id }) => id).sort());
  assert.ok(records.every(({ source_status }) => source_status === "seed-review"));
}
const selected = graph.nodes.find(({ id }) => id === "copilot-studio");
assert.ok(selected);
const nodeResponse = await get(`/api/v1/nodes/${selected.id}`);
assert.equal(nodeResponse.status, 200);
assert.deepEqual(await nodeResponse.json(), selected);
const connectionsResponse = await get(`/api/v1/nodes/${selected.id}/connections`);
assert.equal(connectionsResponse.status, 200);
const connections = await connectionsResponse.json();
assert.equal(connections.node_id, selected.id);
assert.deepEqual(connections.incoming, graph.edges.filter((edge) => edge.to === selected.id && edge.type !== "INTEGRATES_WITH"));
assert.deepEqual(connections.outgoing, graph.edges.filter((edge) => edge.from === selected.id && edge.type !== "INTEGRATES_WITH"));
assert.deepEqual(connections.symmetric, graph.edges.filter((edge) => edge.type === "INTEGRATES_WITH" && [edge.from, edge.to].includes(selected.id)));
assert.ok(connections.symmetric.length > 0);
for (const suffix of ["", "/connections"]) {
  const unknown = await get(`/api/v1/nodes/unknown-node${suffix}`);
  assert.equal(unknown.status, 404);
  assert.deepEqual(await unknown.json(), { code: "not_found", message: "Unknown node 'unknown-node'" });
}
const explorer = await fetch(`${webUrl}/explore`, { signal: AbortSignal.timeout(30_000) });
assert.equal(explorer.status, 200);
assert.match(await explorer.text(), /MSkill Explorer \/ Universe/);
console.log("PASS: health, graph, node, connections, stable ordering, 404s, homepage and Explorer over HTTP");

const proxied = await fetch(`${webUrl}/api/v1/graph`, { signal: AbortSignal.timeout(15_000) });
assert.equal(proxied.status, 200);
assert.deepEqual(await proxied.json(), graph);
for (const suffix of ["", "/connections"]) {
  const response = await fetch(`${webUrl}/api/v1/nodes/copilot-studio${suffix}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200);
  const expected = await (await get(`/api/v1/nodes/copilot-studio${suffix}`)).json();
  assert.deepEqual(await response.json(), expected);
}
console.log("PASS: same-origin frontend gateway matches all three backend contracts");

const fixture = JSON.parse(await readFile(new URL("../apps/web/tests/fixtures/graph.json", import.meta.url), "utf8"));
assert.deepEqual(graph, fixture);
console.log("PASS: frontend test fixture matches the real backend response");

const pathResponse = await get("/api/v1/paths/agent-builder");
assert.equal(pathResponse.status, 200);
const learning = await pathResponse.json();
assert.equal(learning.path.stages.length, 6);
assert.equal(learning.path.source_status, "editorial-seed-review");
for (const stage of learning.path.stages) {
  assert.ok(stage.node_ids.every(id => graph.nodes.some(node => node.id === id)));
  assert.ok(stage.resources.length > 0);
  assert.ok(stage.resources.every(source => source.publisher === "Microsoft" && source.last_verified_at));
}
const pathProxy = await fetch(`${webUrl}/api/v1/paths/agent-builder`, { signal: AbortSignal.timeout(15_000) });
assert.equal(pathProxy.status, 200);
assert.deepEqual(await pathProxy.json(), learning);
const pathFixture = JSON.parse(await readFile(new URL("../apps/web/tests/fixtures/path.json", import.meta.url), "utf8"));
assert.deepEqual(pathFixture, learning);
const learningPage = await fetch(`${webUrl}/learn/agent-builder`, { signal: AbortSignal.timeout(30_000) });
assert.equal(learningPage.status, 200);
assert.match(await learningPage.text(), /One step\. Then the next\./);
assert.match(html, /href="\/learn\/agent-builder"/);
assert.equal((await get("/api/v1/paths/missing")).status, 404);
console.log("PASS: learning path, graph references, gateway/fixture parity, unknown path and Learning Compass page");

const missionResponse = await get("/api/v1/missions/first-agent");
assert.equal(missionResponse.status, 200);
const mission = await missionResponse.json();
assert.equal(mission.tasks.length, 5);
assert.equal(mission.test_scenarios.length, 4);
assert.equal(mission.deliverables.length, 7);
assert.equal(mission.source_status, "editorial-seed-review");
assert.equal(mission.estimated_minutes, null);
assert.ok(mission.node_ids.every(id => graph.nodes.some(node => node.id === id)));
assert.ok(mission.prerequisite_stage_ids.every(id => learning.path.stages.some(stage => stage.id === id)));
const missionProxy = await fetch(`${webUrl}/api/v1/missions/first-agent`, { signal: AbortSignal.timeout(15_000) });
assert.equal(missionProxy.status, 200);
assert.deepEqual(await missionProxy.json(), mission);
assert.deepEqual(JSON.parse(await readFile(new URL("../apps/web/tests/fixtures/mission.json", import.meta.url), "utf8")), mission);
assert.equal((await get("/api/v1/missions/missing")).status, 404);
const lab = await fetch(`${webUrl}/lab/first-agent`, { signal: AbortSignal.timeout(30_000) });
assert.equal(lab.status, 200);
assert.match(await lab.text(), /Make the idea real\./);
console.log("PASS: mission API, graph/path references, gateway/fixture parity, 404 and Builder Lab page");

const radarResponse = await get("/api/v1/radar");
assert.equal(radarResponse.status, 200);
const radar = await radarResponse.json();
assert.equal(radar.events.length, 6);
for (const event of radar.events) {
  assert.ok(Date.parse(event.ends_at_utc) > Date.parse(event.starts_at_utc));
  assert.ok(event.node_ids.every(id => graph.nodes.some(node => node.id === id)));
  assert.equal(event.source.source_status, "verified");
  assert.equal(event.source.url, event.event_url);
}
assert.deepEqual(radar, JSON.parse(await readFile(new URL("../apps/web/tests/fixtures/radar.json", import.meta.url), "utf8")));
const radarGateway = await fetch(`${webUrl}/api/v1/radar`, { signal: AbortSignal.timeout(10_000) });
assert.equal(radarGateway.status, 200);
assert.deepEqual(await radarGateway.json(), radar);
const radarPage = await fetch(`${webUrl}/radar`, { signal: AbortSignal.timeout(30_000) });
assert.equal(radarPage.status, 200);
assert.match(await radarPage.text(), /Find your next signal/);
console.log("Smoke passed: Radar catalog, source/date/graph contracts, fixture parity, gateway and page.");
