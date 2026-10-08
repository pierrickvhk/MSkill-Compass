import { RelatedEvents } from "../radar/related-events";
import { NodeMissionLink } from "../lab/node-mission-link";
import { NodePathLink } from "../learning/node-path-link";
import { useMemo } from "react";
import { explanation, rankConnections, relationLabels, relationMeanings, topicLabels, type Connections, type GraphDataset, type GraphEdge, type GraphNode, type GraphSource, type Level, type SourceStatus } from "../../lib/graph";
import { PixelIcon } from "../icons";

export function Verification({ status, date }: { status: SourceStatus; date?: string | null }) {
  return <span className={`verification ${status}`}>
    {status === "verified" ? "✓ Verified by MSkill" : "◇ Seed-review · not verified"}
    {status === "verified" && date && <small>Reviewed {date.slice(0, 10)}</small>}
  </span>;
}
export function safeSource(url: string | null): URL | null {
  if (!url) return null;
  try { const parsed = new URL(url); return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed : null; }
  catch { return null; }
}
export function SourceLinks({ url, sources, status, date }: { url: string | null; sources: GraphSource[]; status: SourceStatus; date: string | null }) {
  const direct = safeSource(url);
  return <div className="source-links">
    {url && !direct && <p>Source needs review: no safe HTTPS link is available.</p>}
    {direct && <div>
      <a href={direct.href} target="_blank" rel="noopener noreferrer">{direct.hostname === "microsoft.com" || direct.hostname.endsWith(".microsoft.com") ? "Microsoft reference" : "Linked reference"} ↗<small>{direct.hostname} · opens a new tab</small></a>
      <Verification status={status} date={date} />
    </div>}
    {sources.map((source, index) => {
      const link = safeSource(source.url);
      return <div key={`${source.url}-${index}`}>
        {link ? <a href={link.href} target="_blank" rel="noopener noreferrer">{source.publisher} ↗<small>{link.hostname} · opens a new tab</small></a> : <p>{source.publisher}: source needs review.</p>}
        <Verification status={source.source_status} date={source.last_verified_at} />
      </div>;
    })}
    {!url && !sources.length && <p>No source link has been supplied for this record.</p>}
  </div>;
}
export function RelationshipDetail({ edge, graph }: { edge: GraphEdge; graph: GraphDataset }) {
  const title = (id: string) => graph.nodes.find((node) => node.id === id)?.title ?? id;
  return <section tabIndex={-1} className="relationship-detail" aria-label="Relationship explanation">
    <p className="eyebrow">WHY THESE CONNECT</p>
    <h3>{title(edge.from)} <span>{relationLabels[edge.type]}</span> {title(edge.to)}</h3>
    <p>{relationMeanings[edge.type]}</p>
    <p className="edge-rationale">{edge.rationale}</p>
    <strong className="guidance-label">{edge.confidence === "editorial" ? "MSkill editorial guidance" : "Documented Microsoft relationship"}</strong>
    <Verification status={edge.source_status} date={edge.last_verified_at} />
    <SourceLinks url={edge.source_url} sources={edge.sources} status={edge.source_status} date={edge.last_verified_at} />
  </section>;
}
const lensNotes: Record<Level, string> = {
  explorer: "Start with the definition and three core connections.",
  builder: "Practical integrations, tools and uses come first.",
  architect: "Governance and dependencies come first; every connection is available.",
};
export function Inspector({ node, connections, graph, level, edgeId, onEdge, onSelect, showAll, onShowAll }: {
  node: GraphNode; connections: Connections; graph: GraphDataset; level: Level;
  edgeId: string | null; onEdge: (id: string | null) => void; onSelect: (id: string) => void;
  showAll: boolean; onShowAll: () => void;
}) {
  const copy = explanation(node, level);
  const ranked = useMemo(() => rankConnections(connections, level), [connections, level]);
  const limit = level === "explorer" ? 3 : level === "builder" ? 5 : ranked.length;
  const displayed = showAll ? ranked : ranked.slice(0, limit);
  const edge = ranked.find((item) => item.id === edgeId);
  return <>
    <div className={`inspector-node topic-${node.topic}`}>
      <span className="graph-symbol"><PixelIcon name={node.kind === "skill" ? "path" : "universe"} /></span>
      <div><p className="eyebrow">{topicLabels[node.topic]} / {node.kind}</p><h2 id="node-title" tabIndex={-1}>{node.title}</h2></div>
    </div>
    <Verification status={node.source_status} date={node.last_verified_at} />
    <div className="node-explanation">
      <p className="eyebrow">{copy.general ? "GENERAL EXPLANATION · LENS DETAIL UNAVAILABLE" : `${level.toUpperCase()} PERSPECTIVE`}</p>
      <p>{copy.text}</p>
    </div>
    <section className="node-sources" aria-label="Node sources">
      <h3>Go to the source</h3>
      <SourceLinks url={node.official_url} sources={node.sources} status={node.source_status} date={node.last_verified_at} />
    </section>
    <NodePathLink nodeId={node.id} />
    <NodeMissionLink nodeId={node.id} />
    <RelatedEvents nodeIds={[node.id]} context="node" />
    <section className="node-connections" aria-label="Node connections">
      <div className="connections-heading"><h3>Connect the dots</h3><span>{ranked.length}</span></div>
      <p className="lens-note">{lensNotes[level]} Ordering is MSkill guidance.</p>
      {!ranked.length && <p>No relationships are recorded for this node yet.</p>}
      <ul>
        {displayed.map((relation) => {
          const other = relation.from === node.id ? relation.to : relation.from;
          const neighbor = graph.nodes.find((item) => item.id === other);
          const direction = relation.type === "INTEGRATES_WITH" ? "↔" : relation.from === node.id ? "→" : "←";
          return <li key={relation.id} className={edgeId === relation.id ? "active-relation" : ""}>
            <button className="connection-button" aria-expanded={edgeId === relation.id} onClick={() => onEdge(edgeId === relation.id ? null : relation.id)}>
              <span>{direction} {relationLabels[relation.type]} <small>{relation.type === "INTEGRATES_WITH" ? "both ways" : relation.from === node.id ? "outgoing" : "incoming"}</small></span>
              <strong>{neighbor?.title ?? other}</strong>
            </button>
            <button className="neighbor-button" onClick={() => onSelect(other)} aria-label={`Explore ${neighbor?.title ?? other}`}>↗</button>
          </li>;
        })}
      </ul>
      {ranked.length > limit && <button className="text-control" onClick={onShowAll}>{showAll ? "Show key connections" : `Show all ${ranked.length} connections`}</button>}
    </section>
    {edge && <RelationshipDetail edge={edge} graph={graph} />}
  </>;
}
