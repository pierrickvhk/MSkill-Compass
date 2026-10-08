import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Radar from "../components/radar/radar";
import { RelatedEvents } from "../components/radar/related-events";
import { useEventClock } from "../components/radar/use-event-clock";
import { AppShell } from "../components/shell";
import { eventState, eventTime, filterEvents, isRadarCatalog, isRadarEvent, officialEventURL, utcDate, validateRadarReferences } from "../lib/radar";
import fixture from "./fixtures/radar.json";
import { apiFetch, graph } from "./graph-fixture";
vi.mock("next/navigation", () => ({ usePathname: () => "/radar" }));
const candidate: unknown = fixture;
if (!isRadarCatalog(candidate)) throw new Error("Invalid Radar fixture");
const catalog = candidate;
const now = Date.parse("2026-10-08T19:10:04Z");
beforeEach(() => { window.history.replaceState(null, "", "/radar"); vi.spyOn(Date, "now").mockReturnValue(now); vi.stubGlobal("fetch", vi.fn(apiFetch)); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const open = async () => { render(<AppShell><Radar /></AppShell>); await screen.findByText("5 events in this view"); };
test("seed validates with canonical graph memberships", () => {
  expect(isRadarCatalog(fixture)).toBe(true); expect(() => validateRadarReferences(catalog, graph)).not.toThrow();
  expect(() => validateRadarReferences(catalog, { ...graph, nodes: [] })).toThrow(/references/);
  expect(isRadarCatalog({ ...catalog, events: [...catalog.events, catalog.events[0]] })).toBe(false);
  expect(isRadarEvent({ ...catalog.events[0], source: { ...catalog.events[0].source, last_checked_at: null } })).toBe(false);
  expect(isRadarEvent({ ...catalog.events[0], original_timezone: "Mars/Olympus" })).toBe(false);
  expect(isRadarEvent({ ...catalog.events[0], format: "in-person" })).toBe(false);
});
test.each(["javascript:alert(1)", "http://events.microsoft.com/demo", "https://events.microsoft.com.evil.example/demo", "https://user:pass@events.microsoft.com/demo", "https://reactor.microsoft.com:444/demo", "https://reactor.microsoft.com/demo#fragment"])("unsafe event URL rejected: %s", value => expect(officialEventURL(value)).toBe(false));
test("dates reject impossible or timezone-free input; display honors local DST", () => {
  expect(utcDate("2026-02-30T15:00:00Z")).toBe(false); expect(utcDate("2026-10-08T15:00:00")).toBe(false);
  expect(utcDate("2026-10-08T15:00:00Z")).toBe(true);
  expect(eventTime("2026-10-13T15:00:00Z", "Europe/Brussels")).toMatch(/17:00|5:00/);
  expect(eventTime("2026-11-02T18:30:00Z", "Europe/Brussels")).toMatch(/19:30|7:30/);
  expect(eventTime("2026-10-13T15:00:00Z", "America/New_York")).toMatch(/11:00/);
});
test("start/end boundaries and cancellation are never mislabeled upcoming", () => {
  const e = catalog.events[0];
  expect(eventState(e, Date.parse(e.starts_at_utc) - 1)).toBe("upcoming");
  expect(eventState(e, Date.parse(e.starts_at_utc))).toBe("ongoing");
  expect(eventState(e, Date.parse(e.ends_at_utc))).toBe("past");
  expect(eventState({ ...e, status: "cancelled" }, 0)).toBe("cancelled");
  expect(() => eventState(e, NaN)).toThrow();
  const filters = { period: "upcoming" as const, format: "all" as const, nodeId: "" };
  expect(filterEvents(catalog.events, filters, Date.parse("2027-01-01T00:00:00Z"))).toEqual([]);
  expect(filterEvents(catalog.events, { ...filters, nodeId: "monitoring-evals" }, now)).toHaveLength(2);
  expect(filterEvents(catalog.events, { ...filters, nodeIds: ["monitoring-evals", "alm"] }, now)).toHaveLength(3);
});
test("clock updates at expiry while the page remains open", async () => {
  vi.restoreAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-01T16:59:59Z"));
  function Clock() { const time = useEventClock([catalog.events[0].ends_at_utc]); return <p>{time === null ? "loading" : eventState(catalog.events[0], time)}</p>; }
  render(<Clock />); expect(screen.getByText("ongoing")).toBeVisible();
  await act(() => vi.advanceTimersByTimeAsync(1002)); expect(screen.getByText("past")).toBeVisible();
});
test("filters, provenance, graph links and official registration are accessible", async () => {
  await open(); expect(screen.getAllByRole("article")).toHaveLength(5);
  expect(screen.queryByRole("heading", { name: catalog.events[0].title })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "Technology or skill" }), { target: { value: "monitoring-evals" } });
  expect(screen.getByText("2 events in this view")).toBeVisible(); expect(location.search).toBe("?node=monitoring-evals");
  const event = within(screen.getAllByRole("article")[0]);
  expect(event.getByRole("link", { name: /Monitoring and evaluation/ })).toHaveAttribute("href", "/explore?node=monitoring-evals");
  expect(event.getByRole("link", { name: /Details & registration/ })).toHaveAttribute("rel", "noopener noreferrer");
  expect(event.getByText(/Verified source/)).toBeVisible();
  fireEvent.change(screen.getByRole("combobox", { name: "Format" }), { target: { value: "in-person" } });
  expect(screen.getByText("No events in this view.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" })); expect(screen.getAllByRole("article")).toHaveLength(5);
  fireEvent.change(screen.getByRole("combobox", { name: "When" }), { target: { value: "past" } });
  expect(screen.getAllByRole("article")).toHaveLength(1); expect(screen.getByRole("link", { name: /View past event/ })).toHaveAttribute("href", catalog.events[0].event_url);
});
test("cancelled events are isolated and use cancellation source action", async () => {
  vi.stubGlobal("fetch", vi.fn(input => String(input).endsWith("/radar") ? Promise.resolve(Response.json({ ...catalog, events: [{ ...catalog.events[1], status: "cancelled" }] })) : apiFetch(input)));
  render(<Radar />); await screen.findByText("No events in this view.");
  fireEvent.change(screen.getByRole("combobox", { name: "When" }), { target: { value: "cancelled" } });
  expect(screen.getByRole("link", { name: /View cancellation source/ })).toBeVisible();
});
test("empty catalog and request failure retain official discovery links", async () => {
  vi.stubGlobal("fetch", vi.fn(apiFetch).mockRejectedValueOnce(Error("offline")));
  render(<Radar />); await screen.findByRole("alert"); expect(screen.getByRole("link", { name: /Microsoft Events Catalog/ })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Retry Radar" })); await screen.findByText("5 events in this view"); cleanup();
  vi.stubGlobal("fetch", vi.fn(input => String(input).endsWith("/radar") ? Promise.resolve(Response.json({ ...catalog, events: [] })) : apiFetch(input)));
  render(<Radar />); expect(await screen.findByText("No events in this view.")).toBeVisible();
});
test("deep links and history preserve graph topic selection with an honest unknown fallback", async () => {
  window.history.replaceState(null, "", "/radar?node=knowledge-sources"); render(<Radar />);
  await screen.findByText("1 event in this view"); expect(screen.getByRole("combobox", { name: "Technology or skill" })).toHaveValue("knowledge-sources");
  window.history.replaceState(null, "", "/radar?node=missing"); act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(screen.getByText(/That graph topic was not found/)).toBeVisible();
});
test("node and current milestone event associations use exact graph ID intersection", async () => {
  const { rerender } = render(<RelatedEvents nodeIds={["monitoring-evals"]} context="milestone" />);
  await screen.findByRole("heading", { name: "On your Radar." });
  expect(screen.getByText(/not a personal recommendation/)).toBeVisible();
  expect(screen.getByRole("link", { name: /Production-Grade/ })).toHaveAttribute("href", "/radar?node=monitoring-evals");
  rerender(<RelatedEvents nodeIds={["copilot-studio"]} context="node" />);
  await waitFor(() => expect(screen.getByText(/No verified upcoming events/)).toBeVisible());
  expect(screen.getByRole("link", { name: "Browse Radar →" })).toHaveAttribute("href", "/radar?node=copilot-studio");
});
