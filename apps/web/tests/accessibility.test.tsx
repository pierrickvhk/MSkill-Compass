import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Home from "../app/page";
import { AppShell } from "../components/shell";
import UniverseExplorer from "../components/explorer/explorer";
import LearningCompass from "../components/learning/learning-compass";
import BuilderLab from "../components/lab/builder-lab";
import Radar from "../components/radar/radar";
import { apiFetch } from "./graph-fixture";

vi.mock("next/navigation", () => ({ usePathname: () => window.location.pathname }));
// Canvas geometry needs a real browser; the accessible list is audited here.
vi.mock("next/dynamic", () => ({ default: () => () => null }));
beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.title = "MSkill Compass";
  vi.stubGlobal("fetch", vi.fn(apiFetch));
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function audit() {
  const result = await axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    // jsdom has no layout, paint or canvas. Contrast is a separate manual check.
    rules: { "color-contrast": { enabled: false } },
  });
  expect(result.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(n => n.target) }))).toEqual([]);
}

test("homepage and open launcher have accessible semantics", async () => {
  render(<AppShell><Home /></AppShell>);
  await audit();
  fireEvent.click(screen.getByRole("button", { name: /Start exploring/ }));
  await audit();
});
test("Explorer list and inspector have accessible semantics", async () => {
  window.history.replaceState(null, "", "/explore");
  render(<AppShell><UniverseExplorer /></AppShell>);
  await screen.findByRole("heading", { name: "Microsoft Copilot Studio" });
  await audit();
});
test("learning roadmap has accessible semantics", async () => {
  render(<AppShell><LearningCompass /></AppShell>);
  await screen.findByRole("navigation", { name: "Learning milestones" });
  await audit();
});
test("mission forms have accessible semantics", async () => {
  render(<AppShell><BuilderLab /></AppShell>);
  await screen.findByRole("navigation", { name: "Mission phases" });
  await audit();
});
test("Radar filters and events have accessible semantics", async () => {
  render(<AppShell><Radar /></AppShell>);
  await screen.findByText(/events in this view/);
  await audit();
});
