import { kinds, relations, topics, type Connections, type GraphDataset, type GraphEdge, type GraphNode, type GraphSource } from "./graph";

export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message); }
}
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const status = (value: unknown) => value === "seed-review" || value === "verified";
const nullableText = (value: unknown) => value === null || text(value);
const arrayOf = <T>(value: unknown, guard: (item: unknown) => item is T): value is T[] => Array.isArray(value) && value.every(guard);
const source = (value: unknown): value is GraphSource => object(value) && text(value.url) && text(value.publisher) && status(value.source_status) && nullableText(value.last_verified_at);
export function isNode(value: unknown): value is GraphNode {
  return object(value) && text(value.id) && text(value.title) && text(value.summary)
    && kinds.some((kind) => kind === value.kind) && topics.some((topic) => topic === value.topic)
    && [1, 2, 3].includes(value.difficulty as number) && arrayOf(value.tags, text)
    && status(value.source_status) && nullableText(value.official_url) && nullableText(value.last_verified_at)
    && arrayOf(value.sources, source) && object(value.explanations)
    && Object.entries(value.explanations).every(([key, item]) => ["explorer", "builder", "architect"].includes(key) && text(item));
}
export function isEdge(value: unknown): value is GraphEdge {
  return object(value) && text(value.id) && text(value.from) && text(value.to) && text(value.rationale)
    && relations.some((relation) => relation === value.type) && status(value.source_status)
    && ["editorial", "officially-documented"].includes(value.confidence as string)
    && nullableText(value.source_url) && nullableText(value.last_verified_at) && arrayOf(value.sources, source);
}
export function isGraph(value: unknown): value is GraphDataset {
  if (!object(value) || !text(value.version) || !["editorial-seed-review", "verified"].includes(value.status as string)
    || !arrayOf(value.nodes, isNode) || !arrayOf(value.edges, isEdge)) return false;
  const ids = new Set(value.nodes.map((node) => node.id));
  return ids.size === value.nodes.length && value.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to));
}
function isConnections(value: unknown): value is Connections {
  return object(value) && text(value.node_id) && arrayOf(value.incoming, isEdge)
    && arrayOf(value.outgoing, isEdge) && arrayOf(value.symmetric, isEdge);
}
async function get<T>(path: string, guard: (value: unknown) => value is T, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/v1/${path}`, { signal, cache: "no-store" }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("The graph service could not be reached. Please try again.");
  }
  if (!response.ok) throw new ApiError(response.status === 404 ? "This node could not be found." : "The graph service is unavailable. Please try again.", response.status);
  let value: unknown;
  try { value = await response.json(); }
  catch { throw new ApiError("The graph service returned unreadable data."); }
  if (!guard(value)) throw new ApiError("The graph response does not match the expected contract.");
  return value;
}
export const graphApi = {
  graph: (signal?: AbortSignal) => get("graph", isGraph, signal),
  node: (id: string, signal?: AbortSignal) => get(`nodes/${encodeURIComponent(id)}`, isNode, signal),
  connections: (id: string, signal?: AbortSignal) => get(`nodes/${encodeURIComponent(id)}/connections`, isConnections, signal),
};
