import { record, type Mission } from "./mission";
import type { StorageAccess } from "./progress";
export const missionProgressKey = "mskill.mission-progress.v1.first-agent";
export type BuildMode = "design" | "build";
export const outcomes = ["not-recorded", "met", "needs-work", "blocked"] as const;
export type Outcome = typeof outcomes[number];
export type ManualResult = { outcome: Outcome; notes: string };
export type MissionLane = { completed_task_ids: string[]; notes: Record<string, string>; results: Record<string, ManualResult>; deliverable_ids: string[]; repository_url: string; evidence: string };
export type MissionProgress = { schema_version: 1; mission_id: string; content_version: string; active_task_id: string | null; mode: BuildMode; lanes: Record<BuildMode, MissionLane> };
const freshLane = (): MissionLane => ({ completed_task_ids: [], notes: {}, results: {}, deliverable_ids: [], repository_url: "", evidence: "" });
export const freshMissionProgress = (m: Mission): MissionProgress => ({ schema_version: 1, mission_id: m.id, content_version: m.version, active_task_id: m.tasks[0]?.id ?? null, mode: "design", lanes: { design: freshLane(), build: freshLane() } });
export function repositoryURL(value: string): string | null {
  if (!value || value.length > 240 || value !== value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password || url.search || url.hash
      || !/^\/[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})\/[a-zA-Z0-9_.-]+\/?$/.test(url.pathname)) return null;
    const repo = url.pathname.split("/")[2];
    return repo === "." || repo === ".." || !repo ? null : url.href;
  } catch { return null; }
}
const bounded = (v: unknown, max = 2000): v is string => typeof v === "string" && v.length <= max;
function validLane(v: unknown, m: Mission): v is MissionLane {
  const refs = (value: unknown, valid: string[]): value is string[] => Array.isArray(value) && value.every(id => typeof id === "string" && valid.includes(id)) && new Set(value).size === value.length;
  const taskIds = m.tasks.map(t => t.id);
  return record(v) && refs(v.completed_task_ids, taskIds) && refs(v.deliverable_ids, m.deliverables.map(d => d.id))
    && bounded(v.evidence) && bounded(v.repository_url, 240) && (!v.repository_url || repositoryURL(v.repository_url) !== null)
    && record(v.notes) && Object.entries(v.notes).every(([id, note]) => taskIds.includes(id) && bounded(note))
    && record(v.results) && Object.entries(v.results).every(([id, result]) => m.test_scenarios.some(s => s.id === id)
      && record(result) && outcomes.some(o => o === result.outcome) && bounded(result.notes, 1000));
}
export function readMissionProgress(m: Mission, storage: StorageAccess): { progress: MissionProgress; notice: string } {
  const progress = freshMissionProgress(m);
  try {
    const raw = storage.getItem(missionProgressKey);
    if (raw === null) return { progress, notice: "" };
    try {
      const v: unknown = JSON.parse(raw);
      if (!record(v) || v.schema_version !== 1 || v.mission_id !== m.id || v.content_version !== m.version
        || !["design", "build"].includes(v.mode as string) || !(v.active_task_id === null || m.tasks.some(t => t.id === v.active_task_id))
        || !record(v.lanes) || !validLane(v.lanes.design, m) || !validLane(v.lanes.build, m)) throw new Error();
      return { progress: { schema_version: 1, mission_id: m.id, content_version: m.version, active_task_id: v.active_task_id as string | null, mode: v.mode as BuildMode, lanes: { design: v.lanes.design, build: v.lanes.build } }, notice: "" };
    } catch { return { progress, notice: "Saved mission data is invalid or from another version. It has not been overwritten. Your next edit will start a new local record." }; }
  } catch { return { progress, notice: "Browser storage is unavailable. Mission changes last only for this visit." }; }
}
export function saveMissionProgress(p: MissionProgress, storage: StorageAccess): string {
  try { storage.setItem(missionProgressKey, JSON.stringify(p)); return ""; }
  catch { return "Mission changes could not be saved. They last only for this visit."; }
}
export function resetMissionProgress(storage: StorageAccess): string {
  try { storage.removeItem(missionProgressKey); return ""; }
  catch { return "Reset applies to this visit only. Older mission notes may return on reload because storage could not be cleared."; }
}
export const recordedResults = (m: Mission, lane: MissionLane) => m.test_scenarios.filter(s => lane.results[s.id]?.outcome && lane.results[s.id].outcome !== "not-recorded" && lane.results[s.id].notes.trim()).length;
export function missionComplete(m: Mission, lane: MissionLane): boolean {
  return m.tasks.length > 0 && m.tasks.every(t => lane.completed_task_ids.includes(t.id))
    && m.deliverables.length > 0 && m.deliverables.every(d => lane.deliverable_ids.includes(d.id))
    && m.test_scenarios.length > 0 && recordedResults(m, lane) === m.test_scenarios.length;
}
export function projectStatus(p: MissionProgress): string {
  return p.mode === "design" ? "Design-only · no implemented agent claimed" : p.lanes.build.completed_task_ids.includes("m3") ? "Implemented · self-reported, unverified" : "Actual build · implementation not yet reported";
}
