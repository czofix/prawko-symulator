import type { AnimationStep } from "./types";
export function advancePlayback(time: number, elapsed: number, speed: 0.5 | 1 | 2, total: number) {
  return Math.min(total, time + Math.max(0, Math.min(elapsed, 100)) * speed);
}
export function playbackPosition(steps: AnimationStep[], time: number) {
  const total = steps.reduce((sum, s) => sum + s.duration, 0);
  let start = 0, index = steps.length - 1;
  for (let i = 0; i < steps.length; i++) {
    if (time < start + steps[i].duration) { index = i; break; }
    if (i < steps.length - 1) start += steps[i].duration;
  }
  const finished = time >= total;
  const fraction = finished ? 1 : Math.min(1, Math.max(0, (time - start - 700) / (steps[index].duration - 700)));
  return { total, finished, start, index, fraction };
}
