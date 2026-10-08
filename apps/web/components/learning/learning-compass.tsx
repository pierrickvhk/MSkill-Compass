"use client";

import Link from "next/link";
import { RelatedEvents } from "../radar/related-events";
import { useEffect, useRef, useState } from "react";
import { graphApi } from "../../lib/api";
import { explanation, type GraphDataset, type Level } from "../../lib/graph";
import { fetchPath, pathHref, stageHref, validatePathNodes, type PathResponse } from "../../lib/learning";
import { freshProgress, nextStage, readProgress, resetProgress, saveProgress, toggleStage, type Progress, type StorageAccess } from "../../lib/progress";
import { LevelSelector, useLens } from "../shell";
import { MSkillTitleBar } from "../ui";
import "./learning.css";

// Access can itself throw (privacy settings); defer it until each storage operation.
const storage: StorageAccess = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: key => window.localStorage.removeItem(key),
};
type Loaded = { response: PathResponse; graph: GraphDataset; progress: Progress; notice: string };
export default function LearningCompass() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetchPath(controller.signal), graphApi.graph(controller.signal)]).then(([response, graph]) => {
      if (controller.signal.aborted) return;
      validatePathNodes(response.path, graph);
      const saved = readProgress(response.path, storage);
      const requested = new URLSearchParams(window.location.search).get("step");
      if (requested && response.path.stages.some(s => s.id === requested)) {
        saved.progress.active_stage_id = requested;
        const saveNotice = saveProgress(saved.progress, storage);
        if (saveNotice) saved.notice = saveNotice;
      }
      else if (requested) saved.notice = [saved.notice, "That step does not exist. Your last available step is shown."].filter(Boolean).join(" ");
      setLoaded({ response, graph, ...saved });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "The learning path is unavailable.");
    });
    return () => controller.abort();
  }, [attempt]);
  return <main id="main" className="learning-page">
    <header className="learning-heading"><div><p className="eyebrow">MY LEARNING COMPASS / PATH 01</p><h1>One step. Then the next.</h1><p>A little structure for your curiosity. A journey you make your own.</p></div><LevelSelector /></header>
    {!loaded && !error && <section className="learning-feedback" role="status">Loading your learning path…</section>}
    {error && <section className="learning-feedback" role="alert"><h2>Let’s find your bearings again.</h2><p>{error}</p><button className="button" onClick={() => { setError(""); setAttempt(a => a + 1); }}>Retry learning path</button></section>}
    {loaded && <PathView key={loaded.response.path.version} initial={loaded} />}
  </main>;
}
function PathView({ initial }: { initial: Loaded }) {
  const { response: { path, mission }, graph } = initial;
  const { lens } = useLens();
  const [progress, setProgress] = useState(initial.progress);
  const [notice, setNotice] = useState(initial.notice);
  const [confirmReset, setConfirmReset] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const milestones = useRef<HTMLElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const active = path.stages.find(s => s.id === progress.active_stage_id) ?? path.stages[0];
  const completed = progress.completed_stage_ids;
  const next = nextStage(path, progress);
  useEffect(() => {
    function history() {
      const id = new URLSearchParams(window.location.search).get("step");
      if (id && path.stages.some(s => s.id === id)) {
        setProgress(current => ({ ...current, active_stage_id: id }));
        requestAnimationFrame(() => heading.current?.focus());
      }
    }
    window.addEventListener("popstate", history);
    return () => window.removeEventListener("popstate", history);
  }, [path]);
  useEffect(() => { if (confirmReset) cancelButton.current?.focus(); }, [confirmReset]);
  function update(value: Progress) { setProgress(value); setNotice(saveProgress(value, storage)); }
  function select(id: string) {
    update({ ...progress, active_stage_id: id });
    window.history.pushState(null, "", stageHref(id));
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: window.innerWidth <= 700 ? "start" : "nearest", behavior: "instant" }); });
  }
  function cancelReset() { setConfirmReset(false); resetButton.current?.focus(); }
  if (!active) return <section className="learning-feedback"><h2>This path has no milestones yet.</h2><p>No progress can be recorded until content is available.</p><Link href="/explore">Explore the Universe →</Link></section>;
  const done = completed.includes(active.id);
  const activeIndex = path.stages.indexOf(active);
  return <>
    <section className="mskill-window learning-window" aria-label="My Learning Compass">
      <MSkillTitleBar title="MSkill Compass / Learning path" badge="CURATED JOURNEY" />
      <div className="path-intro"><div><p className="eyebrow">SIX MILESTONES · YOUR PACE</p><h2>{path.title}</h2><p>{path.description}</p></div><div className="path-progress"><strong>{completed.length} of {path.stages.length} complete</strong><progress aria-label="Self-reported path progress" max={path.stages.length} value={completed.length} /><span>Self-reported · this browser only</span></div></div>
      {notice && <p className="storage-notice" role="status">{notice}</p>}
      <div className="learning-layout">
        <nav ref={milestones} id="milestones" tabIndex={-1} className="milestone-nav" aria-label="Learning milestones"><p className="eyebrow">YOUR ROUTE</p><ol>{path.stages.map((stage, index) => <li key={stage.id}><button className={active.id === stage.id ? "current" : ""} aria-current={active.id === stage.id ? "step" : undefined} aria-controls="learning-step" onClick={() => select(stage.id)}><span className={`milestone-number ${completed.includes(stage.id) ? "complete" : ""}`} aria-hidden="true">{completed.includes(stage.id) ? "✓" : String(index + 1).padStart(2, "0")}</span><span><strong>{stage.title}</strong><small>{completed.includes(stage.id) ? "Completed · revisit anytime" : stage.required ? "Milestone" : "Optional milestone"}</small></span></button></li>)}</ol><p className="route-note">MSkill’s suggested order. Every step stays open, in every lens.</p></nav>
        <article id="learning-step" className="learning-step" aria-labelledby="step-title">
          <p className="eyebrow">MILESTONE {String(activeIndex + 1).padStart(2, "0")} / {String(path.stages.length).padStart(2, "0")}</p>
          <h2 id="step-title" ref={heading} tabIndex={-1}>{active.title}</h2>
          <p className="step-why">{active.why ?? "Explore the linked nodes and review this milestone’s checkpoint."}</p>
          <p className="editorial-note">◇ MSkill editorial guidance · seed-review, not verified</p>
          <section aria-label="Suggested prerequisites"><h3>Before this step</h3>{active.requires_stage_ids.length ? <ul className="prerequisite-links">{active.requires_stage_ids.map(id => <li key={id}><button className="text-control" onClick={() => select(id)}>{path.stages.find(s => s.id === id)?.title} {completed.includes(id) ? "✓" : "→"}</button></li>)}</ul> : <p>No earlier MSkill milestone is required. Check each official resource’s own prerequisites.</p>}</section>
          <section><h3>Your learning objectives</h3>{active.objectives.length ? <ul>{active.objectives.map(item => <li key={item}>{item}</li>)}</ul> : <p>No additional objectives have been authored. Use the checkpoint below.</p>}</section>
          <section className="learning-resources"><h3>Learn from the source</h3>{active.resources.length ? active.resources.map(resource => <div className="learning-resource" key={resource.url}><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} <span aria-hidden="true">↗</span><span className="sr-only"> (opens a new tab)</span></a><small>{resource.publisher} · {resource.source_status === "verified" ? `Reference checked ${resource.last_verified_at?.slice(0, 10)}` : "Seed-review · reference not verified"}</small><p>{resource.note}</p></div>) : <p>No official resource has been supplied for this milestone.</p>}<p className="resource-policy">Checked means the reference, title and relevance were reviewed by MSkill. It does not verify this path or your learning.</p></section>
          <section className="practical-checkpoint"><p className="eyebrow">PAUSE & TRY</p><h3>Your practical checkpoint</h3>{active.checkpoints.map(item => <p key={item}>{item}</p>)}<h4>Ready to move on?</h4><ul>{active.exit_criteria.map(item => <li key={item}>{item}</li>)}</ul><p>Decide for yourself when you are ready. No evidence is uploaded or assessed.</p></section>
          {active.mission_id && mission && <aside className="optional-mission"><p className="eyebrow">OPTIONAL BUILDER EXTENSION</p><h3>{mission.title}</h3><p>{mission.description}</p><p>Continue in the Builder Lab with five guided phases, manual test records and a downloadable project summary.</p><Link className="text-control" href="/lab/first-agent">Open Builder Lab →</Link></aside>}
          <div className="step-actions"><button className={`button ${done ? "button-secondary" : "button-primary"}`} onClick={() => { update(toggleStage(progress, active.id, path)); setAnnouncement(done ? `${active.title} reopened.` : `${active.title} marked complete by you.`); }}>{done ? "Reopen this step" : "Mark step complete"}</button>{next && next !== active.id && <button className="text-control" onClick={() => select(next)}>Next unfinished step →</button>}<button className="text-control" onClick={() => { const selected = milestones.current?.querySelector<HTMLButtonElement>('[aria-current="step"]'); selected?.focus({ preventScroll: true }); selected?.scrollIntoView({ block: "center", behavior: "instant" }); }}>Back to milestones ↑</button></div>
          {completed.length === path.stages.length && <p className="completion-note">You’ve marked every milestone complete. Revisit any step whenever you like. This is your record, not a Microsoft credential.</p>}
        </article>
        <aside className="learning-context" aria-label="Connected Universe nodes"><RelatedEvents nodeIds={active.node_ids} context="milestone" /><p className="eyebrow">IN THE UNIVERSE</p><h3>Connect the ideas.</h3><p className="context-lens">{lens} perspective · existing graph explanations</p>{active.node_ids.map(id => {
          const node = graph.nodes.find(n => n.id === id)!;
          const copy = explanation(node, lens.toLowerCase() as Level);
          return <div className={`learning-node topic-${node.topic}`} key={id}><Link href={`/explore?node=${encodeURIComponent(id)}`}>{node.title} ↗</Link><p>{copy.text}</p>{copy.general && <small>General explanation · lens detail unavailable</small>}<small>{node.source_status === "verified" ? "Verified graph record" : "Seed-review · not verified"}</small></div>;
        })}<p className="route-note">Your place is saved when you choose a milestone. Return here from its node’s learning-path link.</p></aside>
      </div>
      <footer className="learning-window-footer"><span>LOCAL PROGRESS / NO ACCOUNT</span><button ref={resetButton} className="text-control" onClick={() => setConfirmReset(true)}>Reset path progress</button></footer>
      {confirmReset && <section className="reset-confirmation" role="group" aria-label="Confirm progress reset" onKeyDown={event => { if (event.key === "Escape") cancelReset(); }}><h3>Reset this path on this browser?</h3><p>This clears your completed steps and saved place. It cannot affect Microsoft Learn records.</p><div><button className="button button-secondary" ref={cancelButton} onClick={cancelReset}>Keep my progress</button><button className="button" onClick={() => { setProgress(freshProgress(path)); setNotice(resetProgress(storage)); window.history.replaceState(null, "", pathHref); setAnnouncement("Path progress reset."); cancelReset(); }}>Confirm reset</button></div></section>}
    </section>
    <p className="learning-disclaimer">Independent MSkill guidance. Progress is self-attested, stored on this device and never synchronized with Microsoft Learn or a certification record.</p>
    <p role="status" className="sr-only">{announcement}</p>
  </>;
}
