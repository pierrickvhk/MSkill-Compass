import type { LearningPath } from "./learning";
export const progressKey = "mskill.learning-progress.v1.agent-builder";
export type Progress = { schema_version: 1; path_id: string; content_version: string; active_stage_id: string | null; completed_stage_ids: string[] };
export type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const freshProgress = (path: LearningPath): Progress => ({ schema_version: 1, path_id: path.id, content_version: path.version, active_stage_id: path.stages[0]?.id ?? null, completed_stage_ids: [] });
export function readProgress(path: LearningPath, storage: StorageAccess): { progress: Progress; notice: string } {
  const fallback = freshProgress(path);
  let raw: string | null;
  try { raw = storage.getItem(progressKey); }
  catch { return { progress: fallback, notice: "Browser storage is unavailable. Changes will last only for this visit." }; }
  if (raw === null) return { progress: fallback, notice: "" };
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error();
    const p = v as Record<string, unknown>;
    const ids = new Set(path.stages.map(s => s.id));
    if (p.schema_version !== 1 || p.path_id !== path.id || p.content_version !== path.version
      || !(p.active_stage_id === null || (typeof p.active_stage_id === "string" && ids.has(p.active_stage_id)))
      || !Array.isArray(p.completed_stage_ids) || !p.completed_stage_ids.every(id => typeof id === "string" && ids.has(id))
      || new Set(p.completed_stage_ids).size !== p.completed_stage_ids.length) throw new Error();
    return { progress: { schema_version: 1, path_id: path.id, content_version: path.version, active_stage_id: p.active_stage_id as string | null, completed_stage_ids: p.completed_stage_ids as string[] }, notice: "" };
  } catch { return { progress: fallback, notice: "Saved progress could not be read or belongs to another content version. Starting a fresh view; your next change will replace it." }; }
}
export function saveProgress(progress: Progress, storage: StorageAccess): string {
  try { storage.setItem(progressKey, JSON.stringify(progress)); return ""; }
  catch { return "Progress could not be saved. Changes will last only for this visit."; }
}
export function resetProgress(storage: StorageAccess): string {
  try { storage.removeItem(progressKey); return ""; }
  catch { return "Progress reset for this visit only. Browser storage could not be cleared; older progress may return on reload."; }
}
export function toggleStage(progress: Progress, id: string, path: LearningPath): Progress {
  if (!path.stages.some(s => s.id === id)) return progress;
  const completed = new Set(progress.completed_stage_ids);
  if (completed.has(id)) completed.delete(id); else completed.add(id);
  return { ...progress, active_stage_id: id, completed_stage_ids: path.stages.filter(s => completed.has(s.id)).map(s => s.id) };
}
export function nextStage(path: LearningPath, progress: Progress): string | null {
  return path.stages.find(s => !progress.completed_stage_ids.includes(s.id) && s.requires_stage_ids.every(id => progress.completed_stage_ids.includes(id)))?.id ?? null;
}
