import type { Participant, Route } from "../../domain/types";
import { project } from "./projection";

// Extend only the final straight exit. The junction, turns and pedestrian path
// stay unchanged; a car must leave the angled camera frame before it is hidden.
export function visibleRoute({
  kind,
  route,
}: Pick<Participant, "kind" | "route">): Route {
  const last = route.segments.at(-1);
  if (kind !== "car" || !last || last.type !== "line") return route;
  const end = project(...last.to);
  const min = -90,
    max = 690;
  if (end.x < min || end.x > max || end.y < min || end.y > max) return route;
  const from = route.segments.at(-2)?.to ?? route.start;
  const origin = project(...from);
  const dx = end.x - origin.x,
    dy = end.y - origin.y;
  const timeToEdge = (value: number, delta: number) =>
    delta === 0 ? Infinity : ((delta > 0 ? max : min) - value) / delta;
  const extension =
    Math.min(timeToEdge(end.x, dx), timeToEdge(end.y, dy)) + 0.001;
  if (!Number.isFinite(extension)) return route;
  return {
    start: route.start,
    segments: [
      ...route.segments.slice(0, -1),
      {
        type: "line",
        to: [
          last.to[0] + (last.to[0] - from[0]) * extension,
          last.to[1] + (last.to[1] - from[1]) * extension,
        ],
      },
    ],
  };
}
