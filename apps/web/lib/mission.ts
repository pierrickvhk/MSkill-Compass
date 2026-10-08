import { resource, type LearningPath, type LearningResource } from "./learning";
import type { GraphDataset, Level } from "./graph";
export const missionHref = "/lab/first-agent";
export type MissionTask = { id: string; title: string; done_when: string; phase_title: string | null; instructions: string[]; design_instructions: string[]; design_done_when: string | null; node_ids: string[]; resource_ids: string[] };
export type Mission = {
  id: string; title: string; difficulty: Level; estimated_minutes: number | null; description: string;
  prerequisite_stage_ids: string[]; tasks: MissionTask[]; test_cases: string[]; output: string;
  version: string; path_id: string; source_status: "editorial-seed-review"; objectives: string[];
  requirements: string[]; node_ids: string[]; resources: (LearningResource & { id: string })[];
  test_scenarios: { id: string; title: string; prompt: string; expected: string }[];
  deliverables: { id: string; title: string }[];
};
export const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const slug = (v: unknown): v is string => text(v) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const texts = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);
const ids = (v: unknown): v is string[] => Array.isArray(v) && v.every(slug) && new Set(v).size === v.length;
function task(v: unknown): v is MissionTask {
  return record(v) && slug(v.id) && text(v.title) && text(v.done_when) && (v.phase_title === null || text(v.phase_title))
    && texts(v.instructions) && texts(v.design_instructions) && (v.design_done_when === null || text(v.design_done_when)) && ids(v.node_ids) && ids(v.resource_ids);
}
export function isMission(v: unknown): v is Mission {
  if (!record(v) || v.id !== "first-agent" || !text(v.title) || !text(v.description) || !text(v.version)
    || v.path_id !== "agent-builder" || v.source_status !== "editorial-seed-review"
    || !["explorer", "builder", "architect"].includes(v.difficulty as string)
    || !(v.estimated_minutes === null || (Number.isInteger(v.estimated_minutes) && (v.estimated_minutes as number) > 0))
    || !ids(v.prerequisite_stage_ids) || !texts(v.objectives) || !texts(v.requirements) || !ids(v.node_ids)
    || !texts(v.test_cases) || !text(v.output) || !Array.isArray(v.tasks) || !v.tasks.every(task)
    || !Array.isArray(v.resources) || !v.resources.every(r => record(r) && slug(r.id) && resource(r))
    || !Array.isArray(v.test_scenarios) || !v.test_scenarios.every(s => record(s) && slug(s.id) && text(s.title) && text(s.prompt) && text(s.expected))
    || !Array.isArray(v.deliverables) || !v.deliverables.every(d => record(d) && slug(d.id) && text(d.title))) return false;
  const nodes = v.node_ids;
  const resources = v.resources;
  return [v.tasks, v.resources, v.test_scenarios, v.deliverables].every(items => new Set(items.map(i => i.id)).size === items.length)
    && v.tasks.every(t => t.node_ids.every(id => nodes.includes(id)) && t.resource_ids.every(id => resources.some(r => r.id === id)));
}
export function validateMissionReferences(mission: Mission, graph: GraphDataset, path: LearningPath) {
  if (mission.node_ids.some(id => !graph.nodes.some(n => n.id === id)) || mission.path_id !== path.id
    || mission.prerequisite_stage_ids.some(id => !path.stages.some(s => s.id === id)) || !path.stages.some(s => s.mission_id === mission.id))
    throw new Error("Mission references need review before this workshop can open.");
}
export async function fetchMission(signal?: AbortSignal): Promise<Mission> {
  const response = await fetch("/api/v1/missions/first-agent", { cache: "no-store", signal });
  if (!response.ok) throw new Error("The Builder Lab could not be loaded. Please try again.");
  const value: unknown = await response.json();
  if (!isMission(value)) throw new Error("Mission content does not match the expected contract.");
  return value;
}
