import { useEffect, useState, useSyncExternalStore } from "react";
import type { Scenario } from "../domain/types";
const query = "(prefers-reduced-motion: reduce)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
export function usePlayback(
  scenario: Scenario,
  speed: number,
  enabled: boolean,
) {
  const reduced = useReducedMotion();
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = scenario.steps.reduce((sum, step) => sum + step.duration, 0);
  const finished = time >= total;
  useEffect(() => {
    if (!enabled || !playing || reduced || finished) return;
    let frame: number;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null)
        setTime((t) => Math.min(total, t + Math.min(now - last!, 100) * speed));
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, playing, reduced, finished, speed, total]);
  let start = 0;
  let index = scenario.steps.length - 1;
  for (let i = 0; i < scenario.steps.length; i++) {
    if (time < start + scenario.steps[i].duration) {
      index = i;
      break;
    }
    if (i < scenario.steps.length - 1) start += scenario.steps[i].duration;
  }
  const fraction = finished
    ? 1
    : Math.min(
        1,
        Math.max(
          0,
          (time - start - 700) / (scenario.steps[index].duration - 700),
        ),
      );
  return {
    index,
    fraction: reduced ? 0 : fraction,
    finished,
    reduced,
    playing: playing && !finished && !reduced,
    toggle: () => {
      if (finished) setTime(0);
      setPlaying((p) => finished || !p);
    },
    restart: () => {
      setTime(0);
      setPlaying(false);
    },
    next: () => {
      setPlaying(false);
      setTime(Math.min(total, start + scenario.steps[index].duration));
    },
  };
}
export type Playback = ReturnType<typeof usePlayback>;
