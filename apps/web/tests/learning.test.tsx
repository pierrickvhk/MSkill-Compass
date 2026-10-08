import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import LearningCompass from "../components/learning/learning-compass";
import { NodePathLink } from "../components/learning/node-path-link";
import { AppShell } from "../components/shell";
import { isPathResponse, validatePathNodes, type PathResponse } from "../lib/learning";
import { freshProgress, nextStage, progressKey, readProgress, resetProgress, saveProgress, toggleStage } from "../lib/progress";
import fixture from "./fixtures/path.json";
import { apiFetch, graph } from "./graph-fixture";

vi.mock("next/navigation", () => ({ usePathname: () => "/learn/agent-builder" }));
const response: unknown = fixture;
if (!isPathResponse(response)) throw new Error("Invalid path fixture");
const path = response.path;
beforeEach(() => {
  window.localStorage.clear(); window.history.replaceState(null, "", "/learn/agent-builder");
  vi.stubGlobal("fetch", vi.fn(apiFetch));
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function open() {
  render(<AppShell><LearningCompass /></AppShell>);
  await screen.findByRole("navigation", { name: "Learning milestones" });
}
const roadmap = () => within(screen.getByRole("navigation", { name: "Learning milestones" }));
const detail = () => within(screen.getByRole("article"));
const choose = (name: RegExp) => fireEvent.click(roadmap().getByRole("button", { name }));

test("path contract rejects invalid metadata, duplicates, references and unsafe sources", () => {
  expect(isPathResponse(fixture)).toBe(true);
  expect(() => validatePathNodes(path, graph)).not.toThrow();
  for (const mutate of [
    (v: PathResponse) => { v.path.stages[0].resources[0].url = "javascript:alert(1)"; },
    (v: PathResponse) => { v.path.stages[0].resources[0].last_verified_at = null; },
    (v: PathResponse) => { v.path.stages[0].resources[0].url = "https://microsoft.com.attacker.example"; },
    (v: PathResponse) => { v.path.stages[1].id = "s1"; },
    (v: PathResponse) => { v.path.stages[0].requires_stage_ids = ["s2"]; },
    (v: PathResponse) => { v.path.stages[0].requires_stage_ids = ["missing"]; },
    (v: PathResponse) => { v.mission = null; },
  ]) { const altered = structuredClone(response); mutate(altered); expect(isPathResponse(altered)).toBe(false); }
  expect(() => validatePathNodes(path, { ...graph, nodes: [] })).toThrow("unavailable node");
});
test("progress round-trips, reopens independently and resets only its own storage key", () => {
  const fresh = freshProgress(path);
  expect(nextStage(path, fresh)).toBe("s1");
  const complete = toggleStage(fresh, "s1", path);
  expect(saveProgress(complete, localStorage)).toBe("");
  expect(readProgress(path, localStorage).progress).toEqual(complete);
  expect(nextStage(path, complete)).toBe("s2");
  expect(toggleStage(complete, "s1", path).completed_stage_ids).toEqual([]);
  expect(toggleStage(complete, "invalid", path)).toEqual(complete);
  localStorage.setItem("unrelated", "keep");
  resetProgress(localStorage);
  expect(readProgress(path, localStorage).progress).toEqual(fresh);
  expect(localStorage.getItem("unrelated")).toBe("keep");
});
test.each(["{", "null", JSON.stringify({ schema_version: 9 }), JSON.stringify({ ...freshProgress(path), completed_stage_ids: ["unknown"] }), JSON.stringify({ ...freshProgress(path), completed_stage_ids: ["s1", "s1"] }), JSON.stringify({ ...freshProgress(path), content_version: "future" })])("invalid storage recovers without silently overwriting: %s", raw => {
  localStorage.setItem(progressKey, raw);
  const saved = readProgress(path, localStorage);
  expect(saved.notice).toMatch(/could not be read/);
  expect(saved.progress.completed_stage_ids).toEqual([]);
  expect(localStorage.getItem(progressKey)).toBe(raw);
});
test("storage access and quota failures degrade to explicit visit-only state", () => {
  const unavailable = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); }, removeItem: () => { throw new Error(); } };
  expect(readProgress(path, unavailable).notice).toMatch(/unavailable/);
  expect(saveProgress(freshProgress(path), unavailable)).toMatch(/could not be saved/);
  expect(resetProgress(unavailable)).toMatch(/older progress may return/);
});
test("loads milestones, shows distinct provenance and keeps graph links meaningful", async () => {
  await open();
  expect(roadmap().getAllByRole("button")).toHaveLength(6);
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
  expect(detail().getByText(/MSkill editorial guidance/)).toBeVisible();
  const source = detail().getByRole("link", { name: /Introduction to AI concepts/ });
  expect(source).toHaveAttribute("href", "https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/");
  expect(source).toHaveAttribute("rel", "noopener noreferrer");
  const universe = within(screen.getByRole("complementary", { name: "Connected Universe nodes" }));
  expect(universe.getByRole("link", { name: /AI fundamentals/ })).toHaveAttribute("href", "/explore?node=fundamentals-ai");
  fireEvent.click(screen.getByRole("radio", { name: "Builder" }));
  expect(universe.getByText(graph.nodes.find(n => n.id === "fundamentals-ai")!.explanations.builder!)).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "Architect" }));
  expect(roadmap().getAllByRole("button").every(button => !button.hasAttribute("disabled"))).toBe(true);
});
test("completion and saved position survive remount; reopen preserves user control", async () => {
  await open();
  choose(/Discover Copilot Studio/);
  fireEvent.click(detail().getByRole("button", { name: "Mark step complete" }));
  expect(screen.getByText("1 of 6 complete")).toBeVisible();
  cleanup(); window.history.replaceState(null, "", "/learn/agent-builder");
  await open();
  expect(detail().getByRole("heading", { name: "Discover Copilot Studio" })).toBeVisible();
  fireEvent.click(detail().getByRole("button", { name: "Reopen this step" }));
  expect(screen.getByText("0 of 6 complete")).toBeVisible();
});
test("reset requires confirmation, Escape cancels with focus, confirm clears progress", async () => {
  await open();
  fireEvent.click(detail().getByRole("button", { name: "Mark step complete" }));
  const reset = screen.getByRole("button", { name: "Reset path progress" });
  fireEvent.click(reset);
  expect(screen.getByRole("button", { name: "Keep my progress" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "Keep my progress" }), { key: "Escape" });
  expect(reset).toHaveFocus(); expect(screen.getByText("1 of 6 complete")).toBeVisible();
  fireEvent.click(reset); fireEvent.click(screen.getByRole("button", { name: "Confirm reset" }));
  expect(screen.getByText("0 of 6 complete")).toBeVisible();
  expect(localStorage.getItem(progressKey)).toBeNull(); expect(reset).toHaveFocus();
});
test("step selection focuses details, shares URL and responds to browser history", async () => {
  await open(); choose(/Understand permissions/);
  await waitFor(() => expect(detail().getByRole("heading", { name: "Understand permissions and governance" })).toHaveFocus());
  expect(location.search).toBe("?step=s5");
  fireEvent.click(screen.getByRole("button", { name: "Back to milestones ↑" }));
  expect(roadmap().getByRole("button", { name: /Understand permissions/ })).toHaveFocus();
  window.history.replaceState(null, "", "?step=s2");
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(detail().getByRole("heading", { name: "Map the business problem" })).toBeVisible();
});
test("valid deep link overrides saved place and invalid step is explained", async () => {
  window.history.replaceState(null, "", "?step=s6"); await open();
  expect(detail().getByRole("heading", { name: "Ship the first mission" })).toBeVisible();
  expect(readProgress(path, localStorage).progress.active_stage_id).toBe("s6");
  expect(detail().getByRole("link", { name: "Open Builder Lab →" })).toHaveAttribute("href", "/lab/first-agent");
  cleanup(); window.history.replaceState(null, "", "?step=missing"); await open();
  expect(screen.getByText(/That step does not exist/)).toBeVisible();
});
test("loading, retry, empty content and missing resources are explicit", async () => {
  vi.stubGlobal("fetch", vi.fn(apiFetch).mockRejectedValueOnce(new Error("offline")));
  render(<AppShell><LearningCompass /></AppShell>);
  expect(screen.getByRole("status")).toHaveTextContent("Loading your learning path");
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Retry learning path" }));
  await screen.findByRole("navigation", { name: "Learning milestones" }); cleanup();
  const empty = { ...response, path: { ...path, stages: [] }, mission: null };
  vi.stubGlobal("fetch", vi.fn(input => String(input).includes("/paths/") ? Promise.resolve(Response.json(empty)) : apiFetch(input)));
  render(<AppShell><LearningCompass /></AppShell>);
  expect(await screen.findByText("This path has no milestones yet.")).toBeVisible(); cleanup();
  const sparse = structuredClone(response); sparse.path.stages[0].resources = []; sparse.path.stages[0].objectives = [];
  vi.stubGlobal("fetch", vi.fn(input => String(input).includes("/paths/") ? Promise.resolve(Response.json(sparse)) : apiFetch(input)));
  await open(); expect(detail().getByText(/No official resource/)).toBeVisible();
});
test("node membership links to the actual stage; unrelated nodes get no invented membership", async () => {
  const { rerender } = render(<NodePathLink nodeId="copilot-studio" />);
  expect(await screen.findByRole("link", { name: /Continue: Discover Copilot Studio/ })).toHaveAttribute("href", "/learn/agent-builder?step=s3");
  rerender(<NodePathLink nodeId="teams" />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
