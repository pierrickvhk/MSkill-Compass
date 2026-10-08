"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPath, stageHref, type PathResponse } from "../../lib/learning";

/** Membership comes from curated content; graph rendering never reads progress storage. */
export function NodePathLink({ nodeId }: { nodeId: string }) {
  const [response, setResponse] = useState<PathResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchPath(controller.signal).then(value => { if (!controller.signal.aborted) setResponse(value); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);
  if (failed) return <section className="node-learning-path"><p>Learning-path links are unavailable.</p><button className="text-control" onClick={() => { setFailed(false); setAttempt(a => a + 1); }}>Retry path links</button></section>;
  const stages = response?.path.stages.filter(stage => stage.node_ids.includes(nodeId)) ?? [];
  if (!stages.length) return null;
  return <section className="node-learning-path" aria-label="Associated learning path"><h3>Put this on your path.</h3><p>{response?.path.title}</p>{stages.map(stage => <Link key={stage.id} href={stageHref(stage.id)}>Continue: {stage.title} →</Link>)}</section>;
}
