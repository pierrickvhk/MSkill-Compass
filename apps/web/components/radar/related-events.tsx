"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchRadar, filterEvents, radarHref, type RadarCatalog } from "../../lib/radar";
import { useEventClock } from "./use-event-clock";

/** Exact curated node intersection, never inferred skills or personal recommendations. */
export function RelatedEvents({ nodeIds, context }: { nodeIds: string[]; context: "node" | "milestone" }) {
  const [catalog, setCatalog] = useState<RadarCatalog | null>(null);
  const [failed, setFailed] = useState(false); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchRadar(controller.signal).then(c => { if (!controller.signal.aborted) setCatalog(c); }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);
  const now = useEventClock(catalog?.events.flatMap(e => [e.starts_at_utc, e.ends_at_utc]) ?? []);
  if (failed) return <section className="node-learning-path related-events"><p>Related events are unavailable.</p><button className="text-control" onClick={() => { setFailed(false); setAttempt(a => a + 1); }}>Retry event links</button></section>;
  if (!catalog || now === null) return null;
  const events = filterEvents(catalog.events, { period: "upcoming", format: "all", nodeId: "", nodeIds }, now);
  return <section className="node-learning-path related-events" aria-label="Related Radar events"><h3>On your Radar.</h3><p>Upcoming events sharing this {context}’s graph topics. Topic relevance, not a personal recommendation.</p>{events.length ? <ul>{events.slice(0, 2).map(e => <li key={e.id}><Link href={radarHref(e.node_ids.find(id => nodeIds.includes(id))!)}>{e.title} →</Link></li>)}</ul> : <p>No verified upcoming events for these topics in this catalog.</p>}<Link href={nodeIds.length === 1 ? radarHref(nodeIds[0]) : "/radar"}>Browse Radar →</Link></section>;
}
