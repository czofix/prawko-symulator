import type { Approach, Maneuver, Point, Route, Segment } from "./types";
const rotate = ([x, y]: Point, turns: number): Point => {
  for (let i = 0; i < turns; i++) [x, y] = [600 - y, x];
  return [x, y];
};
export function routeFor(approach: Approach, maneuver: Maneuver): Route {
  const turns = { south: 0, west: 1, north: 2, east: 3 }[approach];
  const segments: Segment[] =
    maneuver === "straight"
      ? [{ type: "line", to: [342, -60] }]
      : maneuver === "left"
        ? [
            { type: "line", to: [342, 365] },
            { type: "curve", c1: [342, 290], c2: [310, 258], to: [235, 258] },
            { type: "line", to: [-60, 258] },
          ]
        : [
            { type: "line", to: [342, 405] },
            { type: "curve", c1: [342, 365], c2: [365, 342], to: [405, 342] },
            { type: "line", to: [660, 342] },
          ];
  return {
    start: rotate([342, 515], turns),
    segments: segments.map((s) =>
      s.type === "line"
        ? { ...s, to: rotate(s.to, turns) }
        : {
            ...s,
            c1: rotate(s.c1, turns),
            c2: rotate(s.c2, turns),
            to: rotate(s.to, turns),
          },
    ),
  };
}
export const svgPath = (route: Route) =>
  `M ${route.start.join(" ")} ` +
  route.segments
    .map((s) =>
      s.type === "line"
        ? `L ${s.to.join(" ")}`
        : `C ${s.c1.join(" ")} ${s.c2.join(" ")} ${s.to.join(" ")}`,
    )
    .join(" ");
function bezier(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t;
  return [
    u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0],
    u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1],
  ];
}
const SAMPLES_PER_SEGMENT = 60;
export function sampleRoute(route: Route): Point[] {
  const points: Point[] = [route.start];
  let from = route.start;
  for (const segment of route.segments) {
    for (let i = 1; i <= SAMPLES_PER_SEGMENT; i++) {
      const t = i / SAMPLES_PER_SEGMENT;
      points.push(
        segment.type === "line"
          ? [
              from[0] + (segment.to[0] - from[0]) * t,
              from[1] + (segment.to[1] - from[1]) * t,
            ]
          : bezier(from, segment.c1, segment.c2, segment.to, t),
      );
    }
    from = segment.to;
  }
  return points;
}
export function poseAt(points: Point[], progress: number) {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance =
    Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const a = points[i],
        b = points[i + 1],
        fraction = lengths[i] ? distance / lengths[i] : 0;
      return {
        x: a[0] + (b[0] - a[0]) * fraction,
        y: a[1] + (b[1] - a[1]) * fraction,
        angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90,
      };
    }
    distance -= lengths[i];
  }
  return { x: points[0][0], y: points[0][1], angle: 0 };
}

// Indicators stop at the end of the final turning/merging curve (art. 22(5)).
export function maneuverEndProgress(route: Route): number {
  const lastCurve = route.segments.reduce(
    (last, segment, index) => (segment.type === "curve" ? index : last),
    -1,
  );
  if (lastCurve < 0) return 0;
  const points = sampleRoute(route);
  const lengths = points
    .slice(1)
    .map((point, i) =>
      Math.hypot(point[0] - points[i][0], point[1] - points[i][1]),
    );
  const end = (lastCurve + 1) * SAMPLES_PER_SEGMENT;
  const total = lengths.reduce((sum, length) => sum + length, 0);
  return total
    ? lengths.slice(0, end).reduce((sum, length) => sum + length, 0) / total
    : 0;
}
