"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMission, missionHref, type Mission } from "../../lib/mission";
export function NodeMissionLink({ nodeId }: { nodeId: string }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchMission(controller.signal).then(m => { if (!controller.signal.aborted) setMission(m); }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);
  if (failed) return <section className="node-learning-path"><p>Mission links are unavailable.</p><button className="text-control" onClick={() => { setFailed(false); setAttempt(a => a + 1); }}>Retry mission links</button></section>;
  if (!mission?.node_ids.includes(nodeId)) return null;
  return <section className="node-learning-path" aria-label="Related Builder Lab"><h3>Try it in the Builder Lab.</h3><Link href={missionHref}>{mission.title} →</Link><p>Independent exercise · self-reported evidence</p></section>;
}
