"use client";
import { useEffect, useState } from "react";
/** Reclassify at actual start/end boundaries, and after a suspended tab regains focus. */
export function useEventClock(boundaries: string[]) {
  const [now, setNow] = useState<number | null>(null);
  const key = boundaries.join(",");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const time = Date.now(); setNow(time); clearTimeout(timer);
      const next = key.split(",").map(Date.parse).filter(t => t > time).sort((a, b) => a - b)[0];
      if (next !== undefined) timer = setTimeout(refresh, Math.min(next - time + 1, 2_147_483_647));
    };
    refresh(); window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { clearTimeout(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [key]);
  return now;
}
