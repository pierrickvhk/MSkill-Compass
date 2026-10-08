"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { graphApi } from "../../lib/api";
import { explanation, type GraphDataset, type Level } from "../../lib/graph";
import { fetchPath, stageHref, type PathResponse } from "../../lib/learning";
import { fetchMission, missionHref, validateMissionReferences, type Mission } from "../../lib/mission";
import { freshMissionProgress, missionComplete, outcomes, projectStatus, readMissionProgress, recordedResults, repositoryURL, resetMissionProgress, saveMissionProgress, type BuildMode, type MissionLane, type MissionProgress, type Outcome } from "../../lib/mission-progress";
import { downloadSummary, missionMarkdown } from "../../lib/mission-export";
import type { StorageAccess } from "../../lib/progress";
import { LevelSelector, useLens } from "../shell";
import { MSkillTitleBar } from "../ui";
import "../learning/learning.css";
import "./lab.css";
const storage: StorageAccess = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value), removeItem: key => window.localStorage.removeItem(key) };
type Loaded = { mission: Mission; graph: GraphDataset; path: PathResponse; progress: MissionProgress; notice: string };
export default function BuilderLab() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetchMission(controller.signal), graphApi.graph(controller.signal), fetchPath(controller.signal)]).then(([mission, graph, path]) => {
      if (controller.signal.aborted) return;
      validateMissionReferences(mission, graph, path.path);
      const saved = readMissionProgress(mission, storage);
      const requested = new URLSearchParams(location.search).get("phase");
      if (requested && mission.tasks.some(t => t.id === requested)) saved.progress.active_task_id = requested;
      else if (requested) saved.notice = "That phase does not exist. Your saved phase is shown.";
      setLoaded({ mission, graph, path, ...saved });
    }).catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Mission unavailable."); });
    return () => controller.abort();
  }, [attempt]);
  return <main id="main" className="learning-page lab-page"><header className="learning-heading"><div><p className="eyebrow">BUILDER LAB / MISSION 01</p><h1>Make the idea real.</h1><p>A guided workshop. Your decisions. Your evidence.</p></div><LevelSelector /></header>
    {!loaded && !error && <p className="learning-feedback" role="status">Opening your workshop…</p>}
    {error && <section role="alert" className="learning-feedback"><h2>The workshop couldn’t open.</h2><p>{error}</p><button className="button" onClick={() => { setError(""); setAttempt(a => a + 1); }}>Retry mission</button></section>}
    {loaded && <Workshop initial={loaded} />}
  </main>;
}
function Workshop({ initial }: { initial: Loaded }) {
  const { mission, graph, path } = initial;
  const { lens } = useLens();
  const [progress, setProgress] = useState(initial.progress);
  const [notice, setNotice] = useState(initial.notice);
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState(false);
  const [repositoryDraft, setRepositoryDraft] = useState(initial.progress.lanes[initial.progress.mode].repository_url);
  const [preview, setPreview] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const lane = progress.lanes[progress.mode];
  const task = mission.tasks.find(t => t.id === progress.active_task_id) ?? mission.tasks[0];
  const repoError = repositoryDraft !== "" && repositoryURL(repositoryDraft) === null;
  const modeLabel = progress.mode === "design" ? "Design-only" : "Actual build";
  const complete = missionComplete(mission, lane);
  useEffect(() => { if (reset) keepRef.current?.focus(); }, [reset]);
  useEffect(() => {
    const onHistory = () => {
      const id = new URLSearchParams(location.search).get("phase");
      if (id && mission.tasks.some(t => t.id === id)) setProgress(p => ({ ...p, active_task_id: id }));
    };
    window.addEventListener("popstate", onHistory);
    return () => window.removeEventListener("popstate", onHistory);
  }, [mission]);
  function update(p: MissionProgress) { setProgress(p); setNotice(saveMissionProgress(p, storage)); }
  function edit(change: Partial<MissionLane>) { update({ ...progress, lanes: { ...progress.lanes, [progress.mode]: { ...lane, ...change } } }); }
  function choose(id: string) {
    update({ ...progress, active_task_id: id });
    window.history.pushState(null, "", `${missionHref}?phase=${encodeURIComponent(id)}`);
    requestAnimationFrame(() => { titleRef.current?.focus({ preventScroll: true }); titleRef.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
  function switchMode(mode: BuildMode) {
    update({ ...progress, mode }); setRepositoryDraft(progress.lanes[mode].repository_url);
    setMessage(`${mode === "design" ? "Design-only" : "Actual-build"} record selected. Notes, tests and checkpoints stay separate.`);
  }
  function cancelReset() { setReset(false); resetRef.current?.focus(); }
  function toggle(ids: string[], id: string) { return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]; }
  if (!task) return <section className="learning-feedback"><h2>No mission phases are available yet.</h2><Link href={stageHref("s6")}>Return to My Learning Compass →</Link></section>;
  const index = mission.tasks.indexOf(task);
  const notes = lane.notes[task.id] ?? "";
  const resources = mission.resources.filter(r => task.resource_ids.includes(r.id));
  const markdown = missionMarkdown(mission, progress);
  return <>
    <section className="mskill-window learning-window" aria-label="Builder Lab workshop">
      <MSkillTitleBar title="MSkill Builder Lab / First agent" badge="LOCAL WORKSHOP" />
      <div className="path-intro"><div><p className="eyebrow">FIVE PHASES · ONE SMALL PROJECT</p><h2>{mission.title}</h2><p>{mission.description}</p></div><div className="path-progress"><strong>{lane.completed_task_ids.length} of {mission.tasks.length} checkpoints</strong><progress aria-label="Self-reported mission checkpoints" max={mission.tasks.length} value={lane.completed_task_ids.length} /><span>{complete ? "Workshop checklist complete · self-reported" : "Workshop in progress"}</span><span>{projectStatus(progress)}</span></div></div>
      <div className="lab-setup"><fieldset className="build-mode"><legend>Choose your workshop record</legend><label><input type="radio" name="build-mode" checked={progress.mode === "design"} onChange={() => switchMode("design")} />Design-only</label><label><input type="radio" name="build-mode" checked={progress.mode === "build"} onChange={() => switchMode("build")} />Actual build</label></fieldset><p>{progress.mode === "design" ? "Plan and simulate without Microsoft access. This record never claims a working or deployed agent." : "Configure and test in your own authorized environment. All implementation and test claims remain self-reported and unverified."} Records stay separate when you switch.</p>
      <details><summary>Before you build: objectives, preparation & access</summary><h3>Learning objectives</h3><ul>{mission.objectives.map(t => <li key={t}>{t}</li>)}</ul><h3>Tools and access</h3><ul>{mission.requirements.map(t => <li key={t}>{t}</li>)}</ul><h3>Suggested preparation</h3><ul>{mission.prerequisite_stage_ids.map(id => <li key={id}><Link href={stageHref(id)}>{path.path.stages.find(s => s.id === id)?.title} →</Link></li>)}</ul></details>
      <p className="lab-privacy">Stored only in this browser. Use synthetic examples. Do not enter credentials, secrets, personal details or confidential organizational data.</p></div>
      {notice && <p role="status" className="storage-notice">{notice}</p>}
      <div className="lab-layout"><nav ref={navRef} className="milestone-nav lab-phases" aria-label="Mission phases"><p className="eyebrow">YOUR WORKBENCH</p><ol>{mission.tasks.map((t, i) => <li key={t.id}><button aria-current={t.id === task.id ? "step" : undefined} className={t.id === task.id ? "current" : ""} onClick={() => choose(t.id)} aria-controls="mission-phase"><span className={`milestone-number ${lane.completed_task_ids.includes(t.id) ? "complete" : ""}`} aria-hidden="true">{lane.completed_task_ids.includes(t.id) ? "✓" : `0${i + 1}`}</span><span><strong>{t.phase_title ?? t.title}</strong><small>{lane.completed_task_ids.includes(t.id) ? "Self-marked complete" : "In progress"}</small></span></button></li>)}</ol><Link className="text-control" href={stageHref("s6")}>← My Learning Compass</Link><p className="route-note">All phases stay available. Checking a box does not verify your work.</p></nav>
      <article className="learning-step lab-phase" id="mission-phase" aria-labelledby="phase-title"><p className="eyebrow">PHASE {index + 1} / {mission.tasks.length} · {modeLabel.toUpperCase()}</p><h2 ref={titleRef} id="phase-title" tabIndex={-1}>{task.phase_title ?? task.title}</h2><p className="editorial-note">◇ MSkill editorial guidance · seed-review</p>
        <section><h3>{progress.mode === "design" ? "Design walkthrough" : "Build instructions"}</h3>{(progress.mode === "design" ? [...(task.id === "m3" || task.id === "m4" ? [] : task.instructions), ...task.design_instructions] : task.instructions).length ? <ol className="lab-instructions">{(progress.mode === "design" ? [...(task.id === "m3" || task.id === "m4" ? [] : task.instructions), ...task.design_instructions] : task.instructions).map(item => <li key={item}>{item}</li>)}</ol> : <p>No mode-specific instructions have been authored.</p>}</section>
        <section className="learning-resources"><h3>Official references</h3>{resources.length ? resources.map(r => <div className="learning-resource" key={r.id}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗<span className="sr-only"> (opens a new tab)</span></a><small>{r.publisher} · {r.source_status === "verified" ? `Reference checked ${r.last_verified_at?.slice(0, 10)}` : "Reference not verified"}</small><p>{r.note}</p></div>) : <p>No reference supplied for this phase.</p>}<p className="resource-policy">Reference checks cover the source, title and relevance. They do not verify this mission or your project.</p></section>
        {task.id === "m4" && <section aria-label="Manual test matrix"><h3>{progress.mode === "design" ? "Simulated design test matrix" : "Manual test matrix"}</h3><p>{progress.mode === "design" ? "Record intended behavior and a simulated walkthrough, not executed results." : "Run these examples yourself outside MSkill. Record observations, including failures or blockers."}</p>{mission.test_scenarios.length ? mission.test_scenarios.map(s => {
          const result = lane.results[s.id] ?? { outcome: "not-recorded" as Outcome, notes: "" };
          return <fieldset className="test-scenario" key={s.id}><legend>{s.title}</legend><p><strong>Try:</strong> {s.prompt}</p><p><strong>Expected · editorial:</strong> {s.expected}</p><label htmlFor={`result-${s.id}`}>Your manual assessment</label><select id={`result-${s.id}`} value={result.outcome} onChange={event => edit({ results: { ...lane.results, [s.id]: { ...result, outcome: event.target.value as Outcome } } })}>{outcomes.map(o => <option key={o} value={o}>{({ "not-recorded": "Not recorded", met: "Meets my expectation", "needs-work": "Needs work", blocked: "Blocked / unable to try" })[o]}</option>)}</select><label htmlFor={`observation-${s.id}`}>{progress.mode === "design" ? "Simulated observation" : "Observed result"} · {s.title}</label><textarea id={`observation-${s.id}`} maxLength={1000} rows={3} value={result.notes} onChange={event => edit({ results: { ...lane.results, [s.id]: { ...result, notes: event.target.value } } })} /><small>{result.notes.length}/1000 characters · local, unverified</small></fieldset>;
        }) : <p>No structured test scenarios have been supplied.</p>}<p>{recordedResults(mission, lane)} of {mission.test_scenarios.length} scenarios have an assessment and written observation.</p></section>}
        <section className="phase-notes"><label htmlFor="phase-notes">{modeLabel} notes · {task.phase_title ?? task.title}</label><p id="notes-help">Use synthetic information only. Notes are saved locally as you type, never submitted for verification.</p><textarea id="phase-notes" aria-describedby="notes-help" value={notes} maxLength={2000} rows={5} onChange={event => edit({ notes: { ...lane.notes, [task.id]: event.target.value } })} /><small>{notes.length}/2000 characters</small></section>
        {task.id === "m5" && <section aria-label="Final deliverables"><h3>Your project handoff</h3><p>Include each item in your notes or project, then mark it yourself.</p><div className="deliverable-checklist">{mission.deliverables.map(d => <label key={d.id}><input type="checkbox" checked={lane.deliverable_ids.includes(d.id)} onChange={() => edit({ deliverable_ids: toggle(lane.deliverable_ids, d.id) })} />{d.title}</label>)}</div><label htmlFor="evidence">Evidence summary · {modeLabel}</label><textarea id="evidence" maxLength={2000} rows={4} value={lane.evidence} onChange={event => edit({ evidence: event.target.value })} /><p className="resource-policy">Describe what you designed or actually configured, what remains untested, and where supporting demo evidence lives. This is not independently verified.</p>
        <label htmlFor="repository">Public GitHub repository URL (optional)</label><input id="repository" type="url" maxLength={240} value={repositoryDraft} aria-invalid={repoError} aria-describedby="repo-help" onChange={event => { const value = event.target.value; setRepositoryDraft(value); if (!value || repositoryURL(value)) edit({ repository_url: value }); }} /><p id="repo-help" className={repoError ? "field-error" : "resource-policy"}>{repoError ? "Use https://github.com/owner/repository without credentials, query or fragment. Invalid input is not saved." : "Optional public repository only. We do not fetch it or verify ownership, code or deployment."}</p>
        {lane.repository_url && !repoError && <a className="text-control" href={repositoryURL(lane.repository_url)!} target="_blank" rel="noopener noreferrer">Open your repository (unverified, new tab) ↗</a>}
        <div className="step-actions"><button className="button button-secondary" disabled={repoError} onClick={() => { try { downloadSummary(markdown); setMessage("Markdown download prepared. Review it before sharing; no upload was made."); } catch { setPreview(true); setMessage("Download unavailable. Copy the plain Markdown preview below instead."); } }}>Download Markdown summary</button><button className="text-control" aria-expanded={preview} onClick={() => setPreview(!preview)}>{preview ? "Hide Markdown preview" : "Preview Markdown"}</button></div>{preview && <label className="markdown-preview">Plain Markdown · select and copy<textarea readOnly rows={12} value={markdown} /></label>}
        <p className="completion-note">{complete ? "Workshop checklist complete — self-reported." : `Still in progress: ${lane.completed_task_ids.length}/${mission.tasks.length} checkpoints, ${recordedResults(mission, lane)}/${mission.test_scenarios.length} written assessments, ${lane.deliverable_ids.length}/${mission.deliverables.length} deliverables.`} {projectStatus(progress)}. No Microsoft credential or independent validation is implied.</p></section>}
        <section className="practical-checkpoint"><p className="eyebrow">YOUR CHECKPOINT</p><p>{progress.mode === "design" ? task.design_done_when ?? "Document your proposed approach; no implementation is claimed." : task.done_when}</p><label className="checkpoint-control"><input type="checkbox" checked={lane.completed_task_ids.includes(task.id)} onChange={() => { edit({ completed_task_ids: toggle(lane.completed_task_ids, task.id) }); setMessage("Checkpoint updated by you. This is not a verification of your work."); }} />I completed this {progress.mode === "design" ? "design" : "build"} checkpoint</label></section>
        <div className="step-actions">{index > 0 && <button className="text-control" onClick={() => choose(mission.tasks[index - 1].id)}>← Previous phase</button>}{index < mission.tasks.length - 1 && <button className="button button-primary" onClick={() => choose(mission.tasks[index + 1].id)}>Next phase →</button>}<button className="text-control" onClick={() => { const button = navRef.current?.querySelector<HTMLButtonElement>('[aria-current="step"]'); button?.focus({ preventScroll: true }); button?.scrollIntoView({ block: "center", behavior: "instant" }); }}>Back to phases ↑</button></div>
      </article>
      <aside className="learning-context" aria-label="Mission graph context"><p className="eyebrow">CONNECTED TO YOUR UNIVERSE</p><h3>Explore the building blocks.</h3><p className="context-lens">{lens} perspective · existing graph content</p>{task.node_ids.map(id => { const node = graph.nodes.find(n => n.id === id)!; const copy = explanation(node, lens.toLowerCase() as Level); return <div className="learning-node" key={id}><Link href={`/explore?node=${encodeURIComponent(id)}`}>{node.title} ↗</Link><p>{copy.text}</p><small>{copy.general ? "General explanation · " : ""}{node.source_status === "verified" ? "Verified graph record" : "Seed-review · not verified"}</small></div>; })}<p className="route-note">These are mission learning references, not new graph relationships.</p></aside></div>
      <footer className="learning-window-footer"><span>{modeLabel.toUpperCase()} / LOCAL, SELF-REPORTED</span><button ref={resetRef} className="text-control" onClick={() => setReset(true)}>Reset mission progress</button></footer>
      {reset && <section className="reset-confirmation" role="group" aria-label="Confirm mission reset" onKeyDown={e => { if (e.key === "Escape") cancelReset(); }}><h3>Clear both workshop records?</h3><p>This removes design and build notes, test results, repository links and checkmarks on this browser. Learning-path progress is kept. Export first if you want a copy.</p><div><button ref={keepRef} className="button button-secondary" onClick={cancelReset}>Keep my mission</button><button className="button" onClick={() => { setProgress(freshMissionProgress(mission)); setRepositoryDraft(""); setNotice(resetMissionProgress(storage)); window.history.replaceState(null, "", missionHref); setMessage("Mission records reset. Learning-path progress was not changed."); cancelReset(); }}>Confirm mission reset</button></div></section>}
    </section><p className="learning-disclaimer">Independent MSkill workshop. No Microsoft service is called, no tests are run, and no evidence is assessed or uploaded by this application.</p><p role="status" className="lab-message">{message}</p>
  </>;
}
