"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphApi } from "../../lib/api";
import { searchNodes, topicLabels, topics, type Connections, type GraphDataset, type GraphNode, type Level } from "../../lib/graph";
import { LevelSelector, useLens } from "../shell";
import { MSkillTitleBar } from "../ui";
import { PixelIcon } from "../icons";
import { Inspector } from "./inspector";
const GraphCanvas = dynamic(() => import("./graph-canvas"), { ssr: false, loading: () => <p role="status" className="workspace-message">Preparing the map…</p> });
type Detail = { key: string; node?: GraphNode; connections?: Connections; error?: string };
const message = (error: unknown) => error instanceof Error ? error.message : "Unable to load graph data. Please retry.";

export default function UniverseExplorer() {
  const { lens } = useLens();
  const level = lens.toLowerCase() as Level;
  const [graph, setGraph] = useState<GraphDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailAttempt, setDetailAttempt] = useState(0);
  const [edgeId, setEdgeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [allConnections, setAllConnections] = useState(false);
  const [mobileDetails, setMobileDetails] = useState(false);
  const [listView, setListView] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const pendingFocus = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    graphApi.graph(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setGraph(data);
      const requested = new URLSearchParams(window.location.search).get("node");
      setSelected(requested || (data.nodes.some((node) => node.id === "copilot-studio") ? "copilot-studio" : data.nodes[0]?.id ?? null));
      if (requested) setMobileDetails(true);
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(message(reason)); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    function back() {
      setSelected(new URLSearchParams(window.location.search).get("node"));
      setEdgeId(null); setAllConnections(false); setMobileDetails(false);
    }
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const detailKey = `${selected}:${detailAttempt}`;
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    Promise.all([graphApi.node(selected, controller.signal), graphApi.connections(selected, controller.signal)]).then(([node, connections]) => {
      if (controller.signal.aborted) return;
      if (node.id !== selected || connections.node_id !== selected) throw new Error("The node response did not match the selection.");
      setDetail({ key: detailKey, node, connections });
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setDetail({ key: detailKey, error: message(reason) }); });
    return () => controller.abort();
  }, [selected, detailKey]);
  useEffect(() => {
    if (pendingFocus.current && detail?.key === detailKey) {
      const heading = inspectorRef.current?.querySelector<HTMLElement>("h2");
      heading?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 768px)").matches) inspectorRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      pendingFocus.current = false;
    }
  }, [detail, detailKey]);
  const select = useCallback((id: string) => {
    setSelected(id); setEdgeId(null); setAllConnections(false); setMobileDetails(true);
    pendingFocus.current = true;
    requestAnimationFrame(() => {
      const panel = inspectorRef.current;
      if (panel && panel.querySelector("h2")?.textContent === graph?.nodes.find((node) => node.id === id)?.title) {
        panel.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
        if (window.matchMedia("(max-width: 768px)").matches) panel.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    const url = new URL(window.location.href); url.searchParams.set("node", id);
    window.history.pushState(null, "", url);
  }, [graph]);
  const inspectEdge = useCallback((id: string | null) => {
    setEdgeId(id);
    if (id) {
      setMobileDetails(true);
      requestAnimationFrame(() => {
        const explanation = inspectorRef.current?.querySelector<HTMLElement>(".relationship-detail");
        explanation?.focus({ preventScroll: true });
        explanation?.scrollIntoView({ behavior: "instant", block: "nearest" });
      });
    }
  }, []);
  function overview() {
    setSelected(null); setEdgeId(null); setQuery(""); setTopic("all"); setAllConnections(false); setMobileDetails(false);
    const url = new URL(window.location.href); url.searchParams.delete("node"); window.history.pushState(null, "", url);
    setResetKey((value) => value + 1);
  }
  function backToList() { setMobileDetails(false); requestAnimationFrame(() => searchRef.current?.focus()); }
  const results = useMemo(() => searchNodes(graph?.nodes ?? [], query, topic), [graph, query, topic]);
  const activeDetail = detail?.key === detailKey ? detail : null;
  const selectedTitle = graph?.nodes.find((node) => node.id === selected)?.title;
  return <div className={`universe-engine ${mobileDetails ? "mobile-details-open" : ""}`}>
    <div className="explore-heading">
      <div><p className="eyebrow">YOUR LEARNING COORDINATES</p><h1>Room to explore.</h1><p>Find a technology. Follow a connection. See the bigger picture.</p></div>
      <LevelSelector />
    </div>
    <section className="mskill-window engine-window" aria-label="MSkill Universe Explorer">
      <MSkillTitleBar title="MSkill Explorer / Universe" badge="CURATED GRAPH" />
      {!graph && <div className="workspace-message">
        {error ? <><h2>We couldn’t open the universe.</h2><p role="alert">{error}</p><button className="button" onClick={() => { setError(null); setAttempt((value) => value + 1); }}>Retry graph</button></> : <p role="status">Loading the learning universe…</p>}
      </div>}
      {graph && !graph.nodes.length && <div className="workspace-message"><h2>The universe is empty for now.</h2><p>The API returned no nodes. No illustrative data has been substituted.</p></div>}
      {graph && graph.nodes.length > 0 && <>
        <div className="engine-toolbar">
          <span className="engine-address"><PixelIcon name="universe" /> universe / {selectedTitle || (selected ? "unknown node" : "all technologies")}</span>
          <div><button className="text-control" onClick={overview}>Reset view</button><button className="text-control desktop-control" aria-pressed={listView} onClick={() => setListView(!listView)}>{listView ? "Map view" : "List view"}</button></div>
        </div>
        <div className={`engine-body ${listView ? "prefer-list" : ""}`}>
          <section className="node-browser" aria-label="Searchable technology list">
            <label htmlFor="node-search">Find your next connection</label>
            <div className="search-input"><span aria-hidden="true">⌕</span><input ref={searchRef} id="node-search" type="search" placeholder="Search the universe…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <label htmlFor="topic-filter" className="sr-only">Technology category</label>
            <select id="topic-filter" value={topic} onChange={(event) => setTopic(event.target.value)}><option value="all">All categories</option>{topics.map((item) => <option key={item} value={item}>{topicLabels[item]}</option>)}</select>
            <div className="browser-result-count"><span role="status">{results.length} {results.length === 1 ? "result" : "results"}</span>{(query || topic !== "all") && <button className="text-control" onClick={() => { setQuery(""); setTopic("all"); }}>Clear search</button>}</div>
            {!results.length && <p className="empty-search">No matching technologies. Try a name, skill or topic, or clear your search.</p>}
            <ul className="node-results">{results.map((node) => <li key={node.id}>
              <button className={`node-result topic-${node.topic}`} aria-pressed={selected === node.id} onClick={() => select(node.id)}>
                <span className="category-dot" /><span><strong>{node.title}</strong><small>{topicLabels[node.topic]} · {node.kind}</small></span><span aria-hidden="true">{selected === node.id ? "◆" : "↗"}</span>
              </button>
            </li>)}</ul>
          </section>
          <section className="map-region" aria-label="Universe map">
            <div className="map-heading"><div><p className="eyebrow">{selected ? "FOCUSED NEIGHBORHOOD" : "UNIVERSE OVERVIEW"}</p><h2>{selectedTitle ?? "Make a connection"}</h2></div><button className="text-control" onClick={() => setResetKey((value) => value + 1)}>Fit view</button></div>
            <GraphCanvas graph={graph} selected={selectedTitle ? selected : null} edgeId={edgeId} onSelect={select} onEdge={inspectEdge} resetKey={resetKey} />
            <div className="map-key">{topics.map((item) => <span className={`topic-${item}`} key={item}><i className="category-dot" />{topicLabels[item]}</span>)}</div>
          </section>
          <aside ref={inspectorRef} className="live-inspector" aria-label="Technology inspector">
            <div className="live-inspector-caption"><span><PixelIcon name="layers" /> INSPECTOR</span><button className="text-control mobile-control" onClick={backToList}>← Back to list</button></div>
            {!selected ? <div className="inspector-empty"><PixelIcon /><h2>Where will you go?</h2><p>Select a technology from the map or list to discover its connections.</p></div> : !activeDetail ? <p role="status" className="workspace-message">Loading node details…</p> : activeDetail.error ? <div className="workspace-message"><h2 tabIndex={-1}>Details unavailable</h2><p role="alert">{activeDetail.error}</p><button className="button" onClick={() => setDetailAttempt((value) => value + 1)}>Retry details</button></div> : activeDetail.node && activeDetail.connections && <Inspector node={activeDetail.node} connections={activeDetail.connections} graph={graph} level={level} edgeId={edgeId} onEdge={inspectEdge} onSelect={select} showAll={allConnections} onShowAll={() => setAllConnections(!allConnections)} />}
          </aside>
        </div>
        <div className="engine-status"><span>{graph.nodes.length} nodes · {graph.edges.length} relationships · {graph.version}</span><span>{graph.status === "verified" ? "Reviewed by MSkill" : "Seed-review · independent editorial guidance"}</span></div>
      </>}
    </section>
    <p className="engine-footnote">A map of possibilities, not a prescribed path. Lens priorities are editorial; every recorded connection stays available.</p>
  </div>;
}
