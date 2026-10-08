import type { Mission } from "./mission";
import { missionComplete, projectStatus, type MissionProgress } from "./mission-progress";
// All authored and learner prose is escaped, never interpreted as HTML or Markdown links.
export const markdownText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([\\`*_{}\[\]()#+.!|~:\-])/g, "\\$1").replace(/\r\n?/g, "\n");
export function missionMarkdown(m: Mission, p: MissionProgress): string {
  const lane = p.lanes[p.mode];
  const text = (value: string) => markdownText(value || "Not recorded");
  return [
    `# ${text(m.title)}`, "", `Mode: ${p.mode === "design" ? "DESIGN-ONLY — simulated, not deployed" : "ACTUAL BUILD — learner-reported, not independently verified"}`,
    `Project status: ${projectStatus(p)}`, `Workshop checklist: ${missionComplete(m, lane) ? "complete (self-reported)" : "in progress"}`,
    "", "Independent MSkill exercise. Not a Microsoft credential. No tests were executed or assessed by MSkill.",
    "Review this file for credentials, secrets and confidential information before sharing. Downloading does not publish it.",
    "", "## Evidence summary", text(lane.evidence), "", "Repository (optional; not fetched or verified):", text(lane.repository_url),
    ...m.tasks.flatMap(t => ["", `## ${text(t.phase_title ?? t.title)}`, `Checkpoint: ${lane.completed_task_ids.includes(t.id) ? "self-marked complete" : "not complete"}`, text(lane.notes[t.id] ?? "")]),
    "", `## ${p.mode === "design" ? "Simulated design walkthroughs — NOT executed tests" : "Manual test observations — reported by learner"}`,
    ...m.test_scenarios.flatMap(s => ["", `### ${text(s.title)}`, `Prompt: ${text(s.prompt)}`, `Expected (MSkill editorial): ${text(s.expected)}`, `Manual assessment: ${lane.results[s.id]?.outcome ?? "not-recorded"}`, text(lane.results[s.id]?.notes ?? "")]),
    "", "## Final deliverable checklist", ...m.deliverables.map(d => `- [${lane.deliverable_ids.includes(d.id) ? "x" : " "}] ${text(d.title)}`),
    "", "## Related graph identifiers", ...m.node_ids.map(id => `- ${text(id)}`),
    "", "## Official references", ...m.resources.flatMap(r => [`- ${text(r.title)} — ${r.url}`, `  ${r.publisher}; ${r.source_status}; checked ${r.last_verified_at?.slice(0, 10) ?? "not verified"}`]),
    "", "Reference checks do not verify the editorial mission, submitted evidence, implementation or learner competence.", "",
  ].join("\n");
}
export function downloadSummary(markdown: string): void {
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "mskill-first-agent-summary.md";
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
