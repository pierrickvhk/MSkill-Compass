import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import UniverseExplorer from "../components/explorer/explorer";
import { SourceLinks, Verification, Inspector } from "../components/explorer/inspector";
import { AppShell } from "../components/shell";
import { graph, connections, apiFetch } from "./graph-fixture";
vi.mock("next/navigation", () => ({ usePathname: () => "/explore" }));
vi.mock("next/dynamic", () => ({ default: () => () => <div>Canvas adapter tested in browser</div> }));
beforeEach(() => {
  window.history.replaceState(null, "", "/explore");
  vi.stubGlobal("fetch", vi.fn(apiFetch));
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const inspector = () => within(screen.getByRole("complementary", { name: "Technology inspector" }));
const browse = () => within(screen.getByRole("region", { name: "Searchable technology list" }));
async function open() {
  render(<AppShell><UniverseExplorer /></AppShell>);
  await screen.findByRole("complementary", { name: "Technology inspector" });
  await inspector().findByRole("heading", { name: "Microsoft Copilot Studio" });
}
test("loads real API data, renders inspector and preserves selection and search across lenses", async () => {
  await open();
  expect(screen.getByText("30 nodes · 71 relationships · v1")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Power Automate" } });
  fireEvent.click(browse().getByRole("button", { name: /Power Automate/ }));
  await inspector().findByRole("heading", { name: "Power Automate" });
  const node = graph.nodes.find((node) => node.id === "power-automate")!;
  fireEvent.click(screen.getByRole("radio", { name: "Builder" }));
  expect(inspector().getByText(node.explanations.builder!)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("radio", { name: "Architect" }));
  expect(inspector().getByText(node.explanations.architect!)).toBeInTheDocument();
  expect(screen.getByRole("searchbox")).toHaveValue("Power Automate");
  expect(new URLSearchParams(location.search).get("node")).toBe("power-automate");
});
test("search empty feedback and category clearing never fabricate records", async () => {
  await open();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "not-a-product" } });
  expect(screen.getByText(/No matching technologies/)).toBeInTheDocument();
  expect(inspector().getByRole("heading", { name: "Microsoft Copilot Studio" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "identity" } });
  expect(browse().getByText("2 results")).toBeInTheDocument();
});
test("relationship explanations preserve direction, rationale and editorial provenance", async () => {
  await open();
  fireEvent.click(inspector().getByRole("button", { name: /integrates with both ways Power Automate/ }));
  const detail = within(screen.getByRole("region", { name: "Relationship explanation" }));
  expect(detail.getByText(graph.edges.find((edge) => edge.id === "e028")!.rationale)).toBeInTheDocument();
  expect(detail.getByText("MSkill editorial guidance")).toBeInTheDocument();
  expect(detail.getAllByText(/Seed-review · not verified/)).toHaveLength(2);
  expect(detail.getByRole("link")).toHaveAttribute("href", graph.edges.find((edge) => edge.id === "e028")!.source_url);
  fireEvent.click(inspector().getByRole("button", { name: "Show all 10 connections" }));
  expect(inspector().getByRole("button", { name: /is governed by outgoing Governance/ })).toBeInTheDocument();
  fireEvent.click(inspector().getByRole("button", { name: "Explore Power Automate" }));
  await inspector().findByRole("heading", { name: "Power Automate" });
});
test("mobile alternative selects details and returns focus to the searchable list", async () => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  await open();
  const choose = browse().getByRole("button", { name: /Dataverse Data/ });
  choose.focus(); fireEvent.click(choose);
  await inspector().findByRole("heading", { name: "Microsoft Dataverse" });
  expect(document.querySelector(".universe-engine")).toHaveClass("mobile-details-open");
  await waitFor(() => expect(inspector().getByRole("heading", { name: "Microsoft Dataverse" })).toHaveFocus());
  fireEvent.click(screen.getByRole("button", { name: "← Back to list" }));
  expect(document.querySelector(".universe-engine")).not.toHaveClass("mobile-details-open");
  await waitFor(() => expect(screen.getByRole("searchbox")).toHaveFocus());
});
test("deep links, unknown nodes and browser history are explicit", async () => {
  window.history.replaceState(null, "", "/explore?node=missing");
  render(<AppShell><UniverseExplorer /></AppShell>);
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be found");
  window.history.replaceState(null, "", "/explore?node=dataverse");
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  await inspector().findByRole("heading", { name: "Microsoft Dataverse" });
  fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
  expect(inspector().getByText("Where will you go?")).toBeInTheDocument();
  expect(location.search).toBe("");
});
test("graph error retries successfully; empty response is honest", async () => {
  const fetch = vi.fn(apiFetch).mockRejectedValueOnce(new Error("offline"));
  vi.stubGlobal("fetch", fetch);
  render(<AppShell><UniverseExplorer /></AppShell>);
  expect(screen.getByRole("status")).toHaveTextContent("Loading the learning universe");
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Retry graph" }));
  await screen.findByRole("complementary", { name: "Technology inspector" });
  await inspector().findByRole("heading", { name: "Microsoft Copilot Studio" });
  cleanup(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ...graph, nodes: [], edges: [] })));
  render(<AppShell><UniverseExplorer /></AppShell>);
  expect(await screen.findByText("The universe is empty for now.")).toBeInTheDocument();
});
test("node failure can retry without reloading the graph", async () => {
  let fail = true;
  vi.stubGlobal("fetch", vi.fn((input: string) => input.endsWith("/nodes/copilot-studio") && fail ? Promise.resolve(Response.json({}, { status: 503 })) : apiFetch(input)));
  render(<AppShell><UniverseExplorer /></AppShell>);
  await screen.findByRole("alert"); fail = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry details" }));
  await screen.findByRole("complementary", { name: "Technology inspector" });
  await inspector().findByRole("heading", { name: "Microsoft Copilot Studio" });
});
test("stale node responses cannot overwrite the latest selection", async () => {
  let resolveOld!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((input: string) => input.endsWith("/nodes/copilot-studio") ? new Promise<Response>((resolve) => { resolveOld = resolve; }) : apiFetch(input)));
  render(<AppShell><UniverseExplorer /></AppShell>);
  await screen.findByRole("region", { name: "Searchable technology list" });
  await browse().findByRole("button", { name: /Dataverse Data/ });
  fireEvent.click(browse().getByRole("button", { name: /Dataverse Data/ }));
  await inspector().findByRole("heading", { name: "Microsoft Dataverse" });
  await act(async () => resolveOld(await apiFetch("/api/v1/nodes/copilot-studio")));
  expect(inspector().getByRole("heading", { name: "Microsoft Dataverse" })).toBeInTheDocument();
});
test("source badges never treat an official URL as verification and unsafe URLs are not links", () => {
  const { rerender } = render(<SourceLinks url="https://learn.microsoft.com/example" sources={[]} status="seed-review" date={null} />);
  const link = screen.getByRole("link", { name: /Microsoft reference/ });
  expect(link).toHaveAttribute("target", "_blank"); expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.getByText(/not verified/)).toBeInTheDocument();
  expect(screen.queryByText("✓ Verified by MSkill")).not.toBeInTheDocument();
  rerender(<SourceLinks url="javascript:alert(1)" sources={[]} status="seed-review" date={null} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText(/no safe HTTPS/)).toBeInTheDocument();
  rerender(<Verification status="verified" date="2026-01-01T00:00:00Z" />);
  expect(screen.getByText(/Verified by MSkill/)).toBeInTheDocument();
  expect(screen.getByText("Reviewed 2026-01-01")).toBeInTheDocument();
});
test("missing lens details are labelled as general, not generated", () => {
  const node = { ...graph.nodes[0], explanations: {}, official_url: null };
  render(<Inspector node={node} connections={connections(node.id)} graph={graph} level="builder" edgeId={null} onEdge={vi.fn()} onSelect={vi.fn()} showAll={false} onShowAll={vi.fn()} />);
  expect(screen.getByText("GENERAL EXPLANATION · LENS DETAIL UNAVAILABLE")).toBeInTheDocument();
  expect(screen.getByText(node.summary)).toBeInTheDocument();
});
