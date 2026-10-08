"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { graphApi } from "../../lib/api";
import type { GraphDataset } from "../../lib/graph";
import { eventFormats, eventState, eventTime, fetchRadar, filterEvents, validateRadarReferences, type RadarCatalog, type RadarFilters } from "../../lib/radar";
import { MSkillTitleBar } from "../ui";
import { useEventClock } from "./use-event-clock";
import "./radar.css";

export function RadarSources() {
  return <aside className="radar-sources" aria-label="Official event catalogs"><h2>Keep exploring.</h2><p>A small, manually reviewed selection. For the full picture, visit the official catalogs.</p><a href="https://www.microsoft.com/en-us/events" target="_blank" rel="noopener noreferrer">Microsoft Events Catalog ↗<span className="sr-only"> (opens a new tab)</span></a><a href="https://reactor.microsoft.com/en-us/reactor/" target="_blank" rel="noopener noreferrer">Microsoft Reactor ↗<span className="sr-only"> (opens a new tab)</span></a><p>MSkill does not register you or monitor availability. Confirm the latest details with the organizer.</p></aside>;
}
export default function Radar() {
  const [data, setData] = useState<{ catalog: RadarCatalog; graph: GraphDataset; timezone: string } | null>(null);
  const [error, setError] = useState(""); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetchRadar(controller.signal), graphApi.graph(controller.signal)]).then(([catalog, graph]) => {
      validateRadarReferences(catalog, graph); if (!controller.signal.aborted) setData({ catalog, graph, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" });
    }).catch(() => { if (!controller.signal.aborted) setError("The event catalog could not be loaded. Official source links are still available below."); });
    return () => controller.abort();
  }, [attempt]);
  return <main id="main" className="radar-page"><header className="radar-heading"><p className="eyebrow">MICROSOFT RADAR / CURATED BY MSKILL</p><h1>Find your next signal.</h1><p>Live ideas. Real people. A new connection to your universe.</p><Link href="/explore">Explore the Universe →</Link></header>
    {!data && !error && <p role="status">Tuning into the event catalog…</p>}
    {error && <section role="alert" className="radar-empty"><h2>Radar is unavailable.</h2><p>{error}</p><button className="button" onClick={() => { setError(""); setAttempt(a => a + 1); }}>Retry Radar</button></section>}
    {data && <EventList {...data} />}<RadarSources />
  </main>;
}
function EventList({ catalog, graph, timezone }: { catalog: RadarCatalog; graph: GraphDataset; timezone: string }) {
  const [filters, setFilters] = useState<RadarFilters>({ period: "upcoming", format: "all", nodeId: "" });
  const [notice, setNotice] = useState("");
  const now = useEventClock(catalog.events.flatMap(e => [e.starts_at_utc, e.ends_at_utc]));
  useEffect(() => {
    const fromURL = () => {
      const id = new URLSearchParams(location.search).get("node") ?? "";
      const valid = !id || graph.nodes.some(n => n.id === id);
      setFilters(f => ({ ...f, nodeId: valid ? id : "" }));
      setNotice(valid ? "" : "That graph topic was not found. All topics are shown.");
    };
    fromURL();
    window.addEventListener("popstate", fromURL); return () => window.removeEventListener("popstate", fromURL);
  }, [graph]);
  const events = now === null ? [] : filterEvents(catalog.events, filters, now);
  function topic(id: string) { setFilters(f => ({ ...f, nodeId: id })); setNotice(""); window.history.pushState(null, "", id ? `/radar?node=${encodeURIComponent(id)}` : "/radar"); }
  return <section className="mskill-window radar-window" aria-label="MSkill Radar event catalog"><MSkillTitleBar title="MSkill Radar / Event frequency" badge="MANUALLY CURATED" />
    <div className="radar-toolbar"><label>When<select value={filters.period} onChange={e => setFilters(f => ({ ...f, period: e.target.value as RadarFilters["period"] }))}><option value="upcoming">Upcoming & in progress</option><option value="past">Past events</option><option value="cancelled">Cancelled events</option><option value="all">All events</option></select></label><label>Technology or skill<select value={filters.nodeId} onChange={e => topic(e.target.value)}><option value="">All topics</option>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}</select></label><label>Format<select value={filters.format} onChange={e => setFilters(f => ({ ...f, format: e.target.value as RadarFilters["format"] }))}><option value="all">All formats</option>{eventFormats.map(f => <option key={f} value={f}>{f === "in-person" ? "In person" : f === "hybrid" ? "Hybrid" : "Online"}</option>)}</select></label><button className="text-control" onClick={() => { setFilters({ period: "upcoming", format: "all", nodeId: "" }); topic(""); }}>Reset filters</button></div>
    <div className="radar-summary"><p role="status">{now === null ? "Checking event times…" : `${events.length} ${events.length === 1 ? "event" : "events"} in this view`}{notice && ` · ${notice}`}</p><p>Times shown in <strong>{timezone ?? "your browser timezone"}</strong>. Original timezone stays with each event.</p></div>
    {now !== null && timezone && (events.length ? <ol className="radar-events">{events.map(event => {
      const state = eventState(event, now);
      return <li key={event.id}><article aria-labelledby={`event-${event.id}`} className={`radar-event ${state}`}><div className="event-date"><span className={`event-state ${state}`}>{state === "ongoing" ? "In progress" : state}</span><time dateTime={event.starts_at_utc}>{eventTime(event.starts_at_utc, timezone)}</time><span>to <time dateTime={event.ends_at_utc}>{eventTime(event.ends_at_utc, timezone)}</time></span><small>Original zone: {event.original_timezone}</small></div><div className="event-content"><p className="eyebrow">{event.format === "in-person" ? "IN PERSON" : event.format.toUpperCase()} / {event.event_type.toUpperCase()}</p><h2 id={`event-${event.id}`}>{event.title}</h2><p>{event.description}</p>{event.location && <p>Location: {event.location}</p>}<p className="event-organizer">Organizer: {event.organizer}</p><ul className="event-topics" aria-label="Related graph topics">{event.node_ids.map(id => <li key={id}><Link href={`/explore?node=${encodeURIComponent(id)}`}>{graph.nodes.find(n => n.id === id)!.title} ↗</Link></li>)}</ul><details><summary>Why these topics?</summary><p>{event.relevance_note}</p><p>MSkill editorial topic matching, not a personal recommendation or new graph relationship.</p></details><div className="event-source"><span>Verified source · {event.source.publisher}<small>Last checked {eventTime(event.source.last_checked_at, timezone)}</small></span><a href={event.event_url} target="_blank" rel="noopener noreferrer">{state === "cancelled" ? "View cancellation source" : state === "past" ? "View past event" : "Details & registration"} ↗<span className="sr-only">: {event.title} (opens a new tab)</span></a></div></div></article></li>;
    })}</ol> : <div className="radar-empty"><span aria-hidden="true" className="radar-empty-icon">⌁</span><h2>No events in this view.</h2><p>{filters.period === "upcoming" ? "No verified upcoming events match these filters. Past events stay in the archive; dates are never rolled forward." : "No curated events match these filters."}</p><p>Try another topic or format, or explore the official catalogs below.</p></div>)}
    <footer className="radar-footer"><p>{catalog.explanation}</p><small>Catalog reviewed: {catalog.updated_at?.slice(0, 10) ?? "not yet reviewed"} · {catalog.events.length} records · {catalog.version}</small></footer>
  </section>;
}
