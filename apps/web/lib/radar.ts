import { record } from "./mission";
import type { GraphDataset } from "./graph";

export const eventFormats = ["online", "in-person", "hybrid"] as const;
export type EventFormat = typeof eventFormats[number];
export type EventState = "upcoming" | "ongoing" | "past" | "cancelled";
export type RadarEvent = {
  id: string; title: string; description: string; organizer: string;
  event_type: "livestream" | "webinar" | "workshop" | "conference" | "meetup";
  starts_at_utc: string; ends_at_utc: string; original_timezone: string;
  format: EventFormat; location: string | null; event_url: string; node_ids: string[];
  status: "scheduled" | "cancelled"; relevance_note: string;
  source: { url: string; publisher: "Microsoft"; catalog: "microsoft-reactor" | "microsoft-events"; source_status: "verified"; last_checked_at: string };
};
export type RadarCatalog = { version: string; updated_at: string | null; explanation: string; events: RadarEvent[] };
const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const slug = (v: unknown): v is string => text(v) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
export function utcDate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(v)) return false;
  const date = new Date(v);
  // Date.parse normalizes invalid days (e.g. February 30), so compare the calendar too.
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 19) === v.slice(0, 19);
}
export function officialEventURL(v: unknown): v is string {
  if (!text(v) || v !== v.trim()) return false;
  try { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password && !u.port && !u.hash && ["reactor.microsoft.com", "developer.microsoft.com", "events.microsoft.com", "www.microsoft.com", "myevent.microsoft.com"].includes(u.hostname); } catch { return false; }
}
export function validTimezone(v: unknown): v is string {
  if (!text(v)) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: v }).format(); return true; } catch { return false; }
}
export function isRadarEvent(v: unknown): v is RadarEvent {
  return record(v) && slug(v.id) && text(v.title) && text(v.description) && text(v.organizer)
    && ["livestream", "webinar", "workshop", "conference", "meetup"].includes(v.event_type as string)
    && utcDate(v.starts_at_utc) && utcDate(v.ends_at_utc) && Date.parse(v.ends_at_utc) > Date.parse(v.starts_at_utc)
    && validTimezone(v.original_timezone) && eventFormats.some(f => f === v.format)
    && (v.location === null || text(v.location)) && (v.format === "online" || text(v.location))
    && officialEventURL(v.event_url) && Array.isArray(v.node_ids) && v.node_ids.length > 0 && v.node_ids.every(slug)
    && new Set(v.node_ids).size === v.node_ids.length && ["scheduled", "cancelled"].includes(v.status as string)
    && text(v.relevance_note) && record(v.source) && v.source.url === v.event_url && v.source.publisher === "Microsoft"
    && ["microsoft-reactor", "microsoft-events"].includes(v.source.catalog as string)
    && v.source.source_status === "verified" && utcDate(v.source.last_checked_at);
}
export function isRadarCatalog(v: unknown): v is RadarCatalog {
  return record(v) && text(v.version) && text(v.explanation) && (v.updated_at === null || utcDate(v.updated_at))
    && Array.isArray(v.events) && v.events.every(isRadarEvent) && new Set(v.events.map(e => e.id)).size === v.events.length
    && (v.events.length === 0 || (v.updated_at !== null && v.events.every(e => Date.parse(e.source.last_checked_at) <= Date.parse(v.updated_at as string))));
}
export function validateRadarReferences(catalog: RadarCatalog, graph: GraphDataset): void {
  const ids = new Set(graph.nodes.map(n => n.id));
  if (catalog.events.some(e => e.node_ids.some(id => !ids.has(id)))) throw new Error("Radar contains unknown graph references.");
}
export async function fetchRadar(signal?: AbortSignal): Promise<RadarCatalog> {
  const response = await fetch("/api/v1/radar", { signal, cache: "no-store" });
  if (!response.ok) throw new Error("The Radar catalog is unavailable. Please retry.");
  const v: unknown = await response.json();
  if (!isRadarCatalog(v)) throw new Error("Radar content does not match its expected contract.");
  return v;
}
export function eventState(event: RadarEvent, now: number): EventState {
  if (!Number.isFinite(now)) throw new Error("Classification needs a valid clock.");
  if (event.status === "cancelled") return "cancelled";
  if (now >= Date.parse(event.ends_at_utc)) return "past";
  return now >= Date.parse(event.starts_at_utc) ? "ongoing" : "upcoming";
}
export type RadarFilters = { period: "upcoming" | "past" | "cancelled" | "all"; format: EventFormat | "all"; nodeId: string; nodeIds?: string[] };
export function filterEvents(events: RadarEvent[], filters: RadarFilters, now: number): RadarEvent[] {
  return events.filter(e => {
    const state = eventState(e, now);
    return (filters.period === "all" || (filters.period === "upcoming" ? state === "upcoming" || state === "ongoing" : state === filters.period))
      && (filters.format === "all" || filters.format === e.format)
      && (!filters.nodeId || e.node_ids.includes(filters.nodeId))
      && (!filters.nodeIds || e.node_ids.some(id => filters.nodeIds?.includes(id)));
  }).sort((a, b) => (filters.period === "past" ? -1 : 1) * (Date.parse(a.starts_at_utc) - Date.parse(b.starts_at_utc)) || a.id.localeCompare(b.id));
}
export const radarHref = (id: string) => `/radar?node=${encodeURIComponent(id)}`;
export function eventTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, { timeZone: timezone, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date(value));
}
