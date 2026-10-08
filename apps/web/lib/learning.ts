import type { GraphDataset, Level, SourceStatus } from "./graph";

export const pathHref = "/learn/agent-builder";
export type LearningResource = { title: string; url: string; publisher: string; source_status: SourceStatus; last_verified_at: string | null; note: string };
export type LearningStage = {
  id: string; title: string; required: boolean; node_ids: string[]; requires_stage_ids: string[];
  exit_criteria: string[]; mission_id: string | null; why: string | null; objectives: string[];
  checkpoints: string[]; resources: LearningResource[]; source_status: "seed-review";
};
export type LearningPath = {
  id: string; title: string; description: string; level: Level;
  source_status: "editorial-seed-review"; version: string; stages: LearningStage[];
};
export type PathResponse = { path: LearningPath; mission: { id: string; title: string; description: string; prerequisite_stage_ids: string[] } | null };
const object = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const slug = (v: unknown): v is string => text(v) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const texts = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);
const slugs = (v: unknown): v is string[] => Array.isArray(v) && v.every(slug) && new Set(v).size === v.length;
export function resource(v: unknown): v is LearningResource {
  if (!object(v) || !text(v.title) || !text(v.note) || v.publisher !== "Microsoft" || !text(v.url)
    || !["seed-review", "verified"].includes(v.source_status as string)
    || !(v.last_verified_at === null || (text(v.last_verified_at) && /(?:Z|\+00:00)$/.test(v.last_verified_at) && Number.isFinite(Date.parse(v.last_verified_at))))
    || (v.source_status === "verified" && v.last_verified_at === null)) return false;
  try { const u = new URL(v.url); return u.protocol === "https:" && !u.username && !u.password && (u.hostname === "microsoft.com" || u.hostname.endsWith(".microsoft.com")); }
  catch { return false; }
}
function stage(v: unknown): v is LearningStage {
  return object(v) && slug(v.id) && text(v.title) && typeof v.required === "boolean"
    && slugs(v.node_ids) && v.node_ids.length > 0 && slugs(v.requires_stage_ids)
    && texts(v.exit_criteria) && v.exit_criteria.length > 0 && (v.mission_id === null || slug(v.mission_id))
    && (v.why === null || text(v.why)) && texts(v.objectives) && texts(v.checkpoints)
    && Array.isArray(v.resources) && v.resources.every(resource) && v.source_status === "seed-review";
}
export function isPathResponse(v: unknown): v is PathResponse {
  if (!object(v) || !object(v.path)) return false;
  const p = v.path;
  if (!slug(p.id) || p.id !== "agent-builder" || !text(p.title) || !text(p.description) || !text(p.version)
    || !["explorer", "builder", "architect"].includes(p.level as string) || p.source_status !== "editorial-seed-review"
    || !Array.isArray(p.stages) || !p.stages.every(stage)) return false;
  const stages = p.stages;
  if (new Set(stages.map(s => s.id)).size !== stages.length) return false;
  if (v.mission !== null && (!object(v.mission) || !slug(v.mission.id) || !text(v.mission.title)
    || !text(v.mission.description) || !slugs(v.mission.prerequisite_stage_ids)
    || !v.mission.prerequisite_stage_ids.every(id => stages.some(s => s.id === id)))) return false;
  const mission = v.mission;
  return stages.every((s, i) => s.requires_stage_ids.every(id => stages.slice(0, i).some(previous => previous.id === id))
    && (s.mission_id === null || (object(mission) && mission.id === s.mission_id)));
}
export function validatePathNodes(path: LearningPath, graph: GraphDataset): void {
  const ids = new Set(graph.nodes.map(node => node.id));
  for (const stage of path.stages) for (const id of stage.node_ids)
    if (!ids.has(id)) throw new Error(`Learning step ${stage.id} references an unavailable node: ${id}.`);
}
export async function fetchPath(signal?: AbortSignal): Promise<PathResponse> {
  const response = await fetch("/api/v1/paths/agent-builder", { cache: "no-store", signal });
  if (!response.ok) throw new Error("The learning path could not be loaded. Please try again.");
  const value: unknown = await response.json();
  if (!isPathResponse(value)) throw new Error("The learning path response needs review before it can be displayed.");
  return value;
}
export const stageHref = (id: string) => `${pathHref}?step=${encodeURIComponent(id)}`;
