/** Mirrors the Slice 2 response models; no client-side product assertions. */
export const topics = ["ai", "automation", "data", "identity", "architecture", "collaboration"] as const;
export type Topic = (typeof topics)[number];
export const kinds = ["product", "concept", "skill", "resource", "credential", "mission", "event"] as const;
export type NodeKind = (typeof kinds)[number];
export type Level = "explorer" | "builder" | "architect";
export type SourceStatus = "seed-review" | "verified";
export const relations = ["REQUIRES", "PART_OF", "ENABLES", "INTEGRATES_WITH", "USES", "GOVERNED_BY", "RELATED_TO"] as const;
export type Relation = (typeof relations)[number];
export interface GraphSource {
  url: string;
  publisher: string;
  source_status: SourceStatus;
  last_verified_at: string | null;
}
export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  topic: Topic;
  summary: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  source_status: SourceStatus;
  official_url: string | null;
  explanations: Partial<Record<Level, string>>;
  last_verified_at: string | null;
  sources: GraphSource[];
}
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: Relation;
  rationale: string;
  confidence: "editorial" | "officially-documented";
  source_status: SourceStatus;
  source_url: string | null;
  last_verified_at: string | null;
  sources: GraphSource[];
}
export interface GraphDataset {
  version: string;
  status: "editorial-seed-review" | "verified";
  nodes: GraphNode[];
  edges: GraphEdge[];
}
export interface Connections {
  node_id: string;
  incoming: GraphEdge[];
  outgoing: GraphEdge[];
  symmetric: GraphEdge[];
}
export const topicLabels: Record<Topic, string> = {
  ai: "AI", automation: "Automation", data: "Data", identity: "Identity",
  architecture: "Architecture", collaboration: "Collaboration",
};
export const relationLabels: Record<Relation, string> = {
  REQUIRES: "requires", PART_OF: "is part of", ENABLES: "enables",
  INTEGRATES_WITH: "integrates with", USES: "uses", GOVERNED_BY: "is governed by", RELATED_TO: "is related to",
};
export const relationMeanings: Record<Relation, string> = {
  REQUIRES: "The source depends on the target as a prerequisite in this authored graph. This is not automatically a Microsoft product requirement.",
  PART_OF: "The source belongs within the target. Membership does not imply a learning prerequisite.",
  ENABLES: "The source enables the target capability or use case.",
  INTEGRATES_WITH: "These nodes connect with one another. This relationship is symmetric.",
  USES: "The source uses the target capability or concept.",
  GOVERNED_BY: "The source is subject to the target governance topic.",
  RELATED_TO: "An editorial association, not a required learning step.",
};
const priorities: Record<Level, Relation[]> = {
  explorer: ["ENABLES", "PART_OF", "INTEGRATES_WITH", "REQUIRES", "USES", "GOVERNED_BY", "RELATED_TO"],
  builder: ["INTEGRATES_WITH", "USES", "ENABLES", "REQUIRES", "PART_OF", "GOVERNED_BY", "RELATED_TO"],
  architect: ["GOVERNED_BY", "REQUIRES", "USES", "INTEGRATES_WITH", "PART_OF", "ENABLES", "RELATED_TO"],
};
export function rankConnections(connections: Connections, level: Level): GraphEdge[] {
  return [...connections.incoming, ...connections.outgoing, ...connections.symmetric].sort(
    (a, b) => priorities[level].indexOf(a.type) - priorities[level].indexOf(b.type) || a.id.localeCompare(b.id),
  );
}
export function searchNodes(nodes: GraphNode[], query: string, topic: string): GraphNode[] {
  const words = query.toLowerCase().trim().split(/\s+/);
  return nodes.filter((node) => (topic === "all" || node.topic === topic) && words.every((word) =>
    [node.title, node.id, node.summary, node.kind, node.topic, ...node.tags].join(" ").toLowerCase().includes(word),
  )).sort((a, b) => a.title.localeCompare(b.title));
}
export function explanation(node: GraphNode, level: Level) {
  const text = node.explanations[level];
  return { text: text || node.summary, general: !text };
}
/** Positions depend only on node IDs and selected neighborhood, never on the lens. */
export function layoutGraph(graph: GraphDataset, selected: string | null) {
  const connected = graph.edges.filter((edge) => edge.from === selected || edge.to === selected);
  const neighbors = new Set(connected.flatMap((edge) => [edge.from, edge.to]));
  const nodes = [...graph.nodes].filter((node) => !selected || neighbors.has(node.id) || node.id === selected)
    .sort((a, b) => a.id.localeCompare(b.id));
  const other = nodes.filter((node) => node.id !== selected);
  const rows = Math.ceil(other.length / 2);
  return {
    nodes: nodes.map((node) => {
      const index = other.findIndex((item) => item.id === node.id);
      const topicIndex = topics.indexOf(node.topic);
      const topicRow = nodes.filter((n) => n.topic === node.topic).findIndex((n) => n.id === node.id);
      return { node, position: selected
        ? node.id === selected ? { x: 280, y: Math.max(0, (rows - 1) * 52) }
          : { x: index % 2 === 0 ? 0 : 560, y: Math.floor(index / 2) * 104 }
        : { x: topicIndex * 260, y: topicRow * 115 } };
    }),
    edges: selected ? connected : [],
  };
}
