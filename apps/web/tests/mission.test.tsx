import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import BuilderLab from "../components/lab/builder-lab";
import { NodeMissionLink } from "../components/lab/node-mission-link";
import { AppShell } from "../components/shell";
import { isMission, validateMissionReferences } from "../lib/mission";
import { freshMissionProgress, missionComplete, missionProgressKey, projectStatus, readMissionProgress, recordedResults, repositoryURL, resetMissionProgress, saveMissionProgress } from "../lib/mission-progress";
import { downloadSummary, missionMarkdown } from "../lib/mission-export";
import fixture from "./fixtures/mission.json";
import pathFixture from "./fixtures/path.json";
import { isPathResponse } from "../lib/learning";
import { apiFetch, graph } from "./graph-fixture";
import { progressKey } from "../lib/progress";
vi.mock("next/navigation", () => ({ usePathname: () => "/lab/first-agent" }));
const candidate: unknown = fixture;
const pathCandidate: unknown = pathFixture;
if (!isMission(candidate) || !isPathResponse(pathCandidate)) throw new Error("Invalid mission fixture");
const mission = candidate;
const learningPath = pathCandidate.path;
beforeEach(() => {
  localStorage.clear(); window.history.replaceState(null, "", "/lab/first-agent");
  vi.stubGlobal("fetch", vi.fn(apiFetch)); HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const phase = () => within(screen.getByRole("article"));
const phases = () => within(screen.getByRole("navigation", { name: "Mission phases" }));
async function open() { render(<AppShell><BuilderLab /></AppShell>); await screen.findByRole("navigation", { name: "Mission phases" }); }
const choose = (name: RegExp) => fireEvent.click(phases().getByRole("button", { name }));

test("mission contract and real graph/path references validate", () => {
  expect(isMission(fixture)).toBe(true);
  expect(() => validateMissionReferences(mission, graph, learningPath)).not.toThrow();
  expect(() => validateMissionReferences(mission, { ...graph, nodes: [] }, learningPath)).toThrow(/references/);
  const duplicate = structuredClone(mission); duplicate.tasks[1].id = duplicate.tasks[0].id;
  expect(isMission(duplicate)).toBe(false);
  const badSource = structuredClone(mission); badSource.resources[0].last_verified_at = null;
  expect(isMission(badSource)).toBe(false);
  const dangling = structuredClone(mission); dangling.tasks[0].resource_ids = ["missing"];
  expect(isMission(dangling)).toBe(false);
});
test.each(["javascript:alert(1)", "https://github.com.evil.example/user/repo", "https://user:secret@github.com/user/repo", "http://github.com/user/repo", "https://github.com/user/repo?token=secret", "https://github.com/user/repo#fragment", "https://github.com/user", "https://github.com/user/repo/issues"])('unsafe or non-repository evidence URL rejected: %s', url => expect(repositoryURL(url)).toBeNull());
test("valid GitHub URLs are only syntax checks", () => { expect(repositoryURL("https://github.com/example/demo")).toBe("https://github.com/example/demo"); });
test("separate mode records persist and do not promote a design to implemented", () => {
  const p = freshMissionProgress(mission); p.lanes.design.completed_task_ids = ["m3"]; p.lanes.design.notes.m3 = "Proposed fictional setup";
  expect(projectStatus(p)).toMatch(/Design-only/);
  p.mode = "build"; expect(projectStatus(p)).toMatch(/not yet reported/);
  saveMissionProgress(p, localStorage); expect(readMissionProgress(mission, localStorage).progress).toEqual(p);
  p.lanes.build.completed_task_ids = ["m3"]; expect(projectStatus(p)).toMatch(/self-reported, unverified/);
});
test.each(["{", "null", JSON.stringify({ schema_version: 2 }), JSON.stringify({ ...freshMissionProgress(mission), content_version: "old" })])("corrupt or obsolete records recover without overwrite: %s", raw => {
  localStorage.setItem(missionProgressKey, raw);
  expect(readMissionProgress(mission, localStorage).notice).toMatch(/invalid/);
  expect(localStorage.getItem(missionProgressKey)).toBe(raw);
});
test("untrusted stored notes, test ids and evidence URLs cannot bypass validation", () => {
  for (const modify of [
    (p: ReturnType<typeof freshMissionProgress>) => { p.lanes.build.repository_url = "javascript:alert(1)"; },
    (p: ReturnType<typeof freshMissionProgress>) => { p.lanes.design.notes.m1 = "x".repeat(2001); },
    (p: ReturnType<typeof freshMissionProgress>) => { p.lanes.design.results["missing-test"] = { outcome: "met", notes: "demo" }; },
  ]) { const p = freshMissionProgress(mission); modify(p); localStorage.setItem(missionProgressKey, JSON.stringify(p)); expect(readMissionProgress(mission, localStorage).notice).toMatch(/invalid/); }
});
test("denied storage degrades explicitly; reset never removes path progress", () => {
  const denied = { getItem: () => { throw Error(); }, setItem: () => { throw Error(); }, removeItem: () => { throw Error(); } };
  expect(readMissionProgress(mission, denied).notice).toMatch(/unavailable/);
  expect(saveMissionProgress(freshMissionProgress(mission), denied)).toMatch(/could not be saved/);
  expect(resetMissionProgress(denied)).toMatch(/Older mission notes may return/);
  localStorage.setItem(progressKey, "keep"); saveMissionProgress(freshMissionProgress(mission), localStorage); resetMissionProgress(localStorage);
  expect(localStorage.getItem(progressKey)).toBe("keep"); expect(localStorage.getItem(missionProgressKey)).toBeNull();
});
test("workshop completion needs manually marked checkpoints, deliverables and written assessments, not passing outcomes", () => {
  const lane = freshMissionProgress(mission).lanes.design;
  lane.completed_task_ids = mission.tasks.map(t => t.id); lane.deliverable_ids = mission.deliverables.map(d => d.id);
  expect(missionComplete(mission, lane)).toBe(false);
  for (const s of mission.test_scenarios) lane.results[s.id] = { outcome: "needs-work", notes: "Simulated limitation" };
  expect(recordedResults(mission, lane)).toBe(4); expect(missionComplete(mission, lane)).toBe(true);
});
test("Markdown labels mode, observations and verification and escapes learner input", () => {
  const p = freshMissionProgress(mission); p.lanes.design.notes.m1 = '<script>alert(1)</script>\n# Official certification\n[x](javascript:alert(1))';
  p.lanes.design.evidence = "Fictional design";
  const md = missionMarkdown(mission, p);
  expect(md).toContain("DESIGN-ONLY — simulated, not deployed"); expect(md).toContain("NOT executed tests");
  expect(md).not.toContain("<script>"); expect(md).not.toContain("\n# Official certification"); expect(md).not.toContain("[x](javascript:");
  expect(md).toContain("&lt;script&gt;"); expect(md).toContain("Final deliverable checklist");
  p.mode = "build"; expect(missionMarkdown(mission, p)).toContain("ACTUAL BUILD — learner-reported, not independently verified");
});
test("download creates a local Markdown artifact and never uploads", () => {
  vi.useFakeTimers(); const create = vi.fn().mockReturnValue("blob:local-summary"); const revoke = vi.fn();
  vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function(this: HTMLAnchorElement) { expect(this.download).toBe("mskill-first-agent-summary.md"); expect(this.href).toBe("blob:local-summary"); });
  downloadSummary("# demo"); expect(click).toHaveBeenCalledOnce(); expect(create).toHaveBeenCalledOnce();
  vi.runAllTimers(); expect(revoke).toHaveBeenCalledWith("blob:local-summary"); expect(fetch).not.toHaveBeenCalled(); vi.useRealTimers();
});
test("download Blob preserves UTF-8 learner text and declares Markdown encoding", async () => {
  const create = vi.fn().mockReturnValue("blob:utf8-summary");
  vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = vi.fn(); });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const p = freshMissionProgress(mission);
  p.lanes.design.evidence = "Fictional café — 日本語 🧭";
  const markdown = missionMarkdown(mission, p);
  downloadSummary(markdown);
  const blob: Blob = create.mock.calls[0][0];
  expect(blob.type).toBe("text/markdown;charset=utf-8");
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob, "UTF-8");
  });
  expect(text).toBe(markdown);
  expect(text).toContain("Fictional café — 日本語 🧭");
  expect(fetch).not.toHaveBeenCalled();
});
test("loads five phases and switches mode without carrying evidence or completion", async () => {
  await open(); expect(phases().getAllByRole("button")).toHaveLength(5);
  fireEvent.change(phase().getByLabelText(/Design-only notes/), { target: { value: "Fictional service desk" } });
  fireEvent.click(phase().getByRole("checkbox", { name: "I completed this design checkpoint" }));
  expect(screen.getByText("1 of 5 checkpoints")).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "Actual build" }));
  expect(screen.getByText("0 of 5 checkpoints")).toBeVisible(); expect(phase().getByLabelText(/Actual build notes/)).toHaveValue("");
  fireEvent.click(screen.getByRole("radio", { name: "Design-only" })); expect(phase().getByLabelText(/Design-only notes/)).toHaveValue("Fictional service desk");
  cleanup(); await open(); expect(phase().getByLabelText(/Design-only notes/)).toHaveValue("Fictional service desk");
});
test("manual tests persist per lane and are rendered as plain text", async () => {
  await open(); choose(/Test the agent/);
  const scenario = within(phase().getByRole("group", { name: "Expected question" }));
  fireEvent.change(scenario.getByRole("combobox"), { target: { value: "needs-work" } });
  fireEvent.change(scenario.getByRole("textbox"), { target: { value: "<img src=x onerror=alert(1)>" } });
  expect(document.querySelector('img[src="x"]')).toBeNull();
  expect(phase().getByText("1 of 4 scenarios have an assessment and written observation.")).toBeVisible();
  cleanup(); await open(); expect(phase().getByRole("heading", { name: "Simulated design test matrix" })).toBeVisible();
  expect(within(phase().getByRole("group", { name: "Expected question" })).getByRole("textbox")).toHaveValue("<img src=x onerror=alert(1)>");
  fireEvent.click(screen.getByRole("radio", { name: "Actual build" })); expect(within(phase().getByRole("group", { name: "Expected question" })).getByRole("textbox")).toHaveValue("");
});
test("evidence validates URLs, offers Markdown preview and links to actual graph nodes", async () => {
  await open(); choose(/Document the solution/);
  fireEvent.change(phase().getByLabelText(/Public GitHub/), { target: { value: "javascript:alert(1)" } });
  expect(phase().getByRole("button", { name: "Download Markdown summary" })).toBeDisabled();
  expect(phase().getByText(/Invalid input is not saved/)).toBeVisible();
  fireEvent.change(phase().getByLabelText(/Public GitHub/), { target: { value: "https://github.com/example/demo" } });
  expect(phase().getByRole("button", { name: "Download Markdown summary" })).toBeEnabled();
  fireEvent.click(phase().getByRole("button", { name: "Preview Markdown" }));
  expect((phase().getByLabelText(/Plain Markdown/) as HTMLTextAreaElement).value).toContain("DESIGN-ONLY");
  expect(within(screen.getByRole("complementary", { name: "Mission graph context" })).getByRole("link", { name: /Governance/ })).toHaveAttribute("href", "/explore?node=governance");
  expect(phases().getByRole("link", { name: /My Learning Compass/ })).toHaveAttribute("href", "/learn/agent-builder?step=s6");
});
test("reset is explicit, cancellable and returns focus; confirmed reset clears both records", async () => {
  await open(); fireEvent.change(phase().getByRole("textbox"), { target: { value: "Demo notes" } });
  const reset = screen.getByRole("button", { name: "Reset mission progress" }); fireEvent.click(reset);
  expect(screen.getByRole("button", { name: "Keep my mission" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "Keep my mission" }), { key: "Escape" });
  expect(reset).toHaveFocus(); expect(phase().getByRole("textbox")).toHaveValue("Demo notes");
  fireEvent.click(reset); fireEvent.click(screen.getByRole("button", { name: "Confirm mission reset" }));
  expect(phase().getByRole("textbox")).toHaveValue(""); expect(localStorage.getItem(missionProgressKey)).toBeNull(); expect(reset).toHaveFocus();
});
test("phase navigation focuses the reader, then returns focus to the selected interactive button", async () => {
  await open(); choose(/Prepare knowledge/);
  await waitFor(() => expect(phase().getByRole("heading", { name: "Prepare knowledge" })).toHaveFocus());
  expect(location.search).toBe("?phase=m2");
  fireEvent.click(phase().getByRole("button", { name: "Back to phases ↑" })); expect(phases().getByRole("button", { name: /Prepare knowledge/ })).toHaveFocus();
  window.history.replaceState(null, "", "?phase=m3"); act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(phase().getByRole("heading", { name: "Build the agent" })).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "Architect" })); expect(screen.getByText("Architect perspective · existing graph content")).toBeVisible();
});
test("error retries and empty missions do not fabricate controls", async () => {
  vi.stubGlobal("fetch", vi.fn(apiFetch).mockRejectedValueOnce(new Error("offline")));
  render(<AppShell><BuilderLab /></AppShell>); expect(screen.getByRole("status")).toHaveTextContent("Opening your workshop");
  await screen.findByRole("alert"); fireEvent.click(screen.getByRole("button", { name: "Retry mission" })); await screen.findByRole("navigation", { name: "Mission phases" }); cleanup();
  vi.stubGlobal("fetch", vi.fn(input => String(input).includes("/missions/") ? Promise.resolve(Response.json({ ...mission, tasks: [] })) : apiFetch(input)));
  render(<AppShell><BuilderLab /></AppShell>); expect(await screen.findByText("No mission phases are available yet.")).toBeVisible();
});
test("graph mission membership is real and excludes unrelated nodes", async () => {
  const { rerender } = render(<NodeMissionLink nodeId="copilot-studio" />);
  expect(await screen.findByRole("link", { name: /Build Your First Copilot Studio Knowledge Agent/ })).toHaveAttribute("href", "/lab/first-agent");
  rerender(<NodeMissionLink nodeId="teams" />); expect(screen.queryByRole("link")).not.toBeInTheDocument();
});


test("editorial examples never prefill or count as learner evidence in either record", async () => {
  const p = freshMissionProgress(mission);
  for (const mode of ["design", "build"] as const) {
    expect(recordedResults(mission, p.lanes[mode])).toBe(0);
    expect(p.lanes[mode].results).toEqual({});
    expect(missionMarkdown(mission, { ...p, mode })).toContain("Manual assessment: not-recorded");
  }
  await open(); choose(/Test the agent/);
  for (const mode of ["Design-only", "Actual build"]) {
    fireEvent.click(screen.getByRole("radio", { name: mode }));
    for (const scenario of mission.test_scenarios) {
      const group = within(phase().getByRole("group", { name: scenario.title }));
      expect(group.getByRole("combobox")).toHaveValue("not-recorded");
      expect(group.getByRole("textbox")).toHaveValue("");
      expect(group.getByText(scenario.prompt, { exact: false })).toBeVisible();
    }
    expect(phase().getByText("0 of 4 scenarios have an assessment and written observation.")).toBeVisible();
  }
});
