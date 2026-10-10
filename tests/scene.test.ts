import { expect, it } from "vitest";
import { scenarios } from "../src/data/scenarios";
import { maneuverEndProgress, poseAt, sampleRoute } from "../src/domain/routes";
import {
  localVertex,
  project,
  projectedPolygon,
} from "../src/components/scene/projection";
import {
  directionArrow,
  remainingArrow,
} from "../src/components/scene/directionArrow";
import { visibleRoute } from "../src/components/scene/visibleRoute";

it("rysuje model auta w tej samej perspektywie co droga, niezależnie od kierunku", () => {
  const anchor = project(342, 515);
  for (const angle of [0, 37, 90, 180, 270]) {
    const point = [12, -36, 15] as const;
    const local = localVertex(point, angle);
    const expected = project(342 + local[0], 515 + local[1], local[2]);
    const [x, y] = projectedPolygon([point], angle).split(",").map(Number);
    expect(anchor.x + x).toBeCloseTo(expected.x, 1);
    expect(anchor.y + y).toBeCloseTo(expected.y, 1);
  }
});

it("kieruje przód samochodu zgodnie z rzutem jego toru także podczas skrętu", () => {
  for (const scenario of scenarios)
    for (const actor of scenario.participants) {
      if (actor.kind !== "car") continue;
      const points = sampleRoute(visibleRoute(actor));
      for (const fraction of [0.12, 0.38, 0.67]) {
        const pose = poseAt(points, fraction);
        const next = poseAt(points, fraction + 0.00001);
        const front = localVertex([0, -1, 0], pose.angle);
        const a = project(pose.x, pose.y),
          b = project(next.x, next.y);
        const forward = project(pose.x + front[0], pose.y + front[1]);
        const dx = forward.x - a.x,
          dy = forward.y - a.y;
        expect(dx * (b.x - a.x) + dy * (b.y - a.y)).toBeGreaterThan(0);
        expect(dx * (b.y - a.y) - dy * (b.x - a.x)).toBeCloseTo(0, 5);
      }
    }
});

it("wyprowadza każdy samochód poza kadr z zapasem na całą bryłę", () => {
  for (const scenario of scenarios)
    for (const actor of scenario.participants) {
      if (actor.kind !== "car") continue;
      const end = poseAt(sampleRoute(visibleRoute(actor)), 1);
      const screen = project(end.x, end.y);
      expect(
        screen.x < -80 || screen.x > 680 || screen.y < -80 || screen.y > 680,
        `${scenario.id}: ${actor.id}`,
      ).toBe(true);
    }
});

it("nie zmienia pozycji startowych, łuków ani przejścia pieszego", () => {
  for (const scenario of scenarios)
    for (const actor of scenario.participants) {
      const before = JSON.stringify(actor.route);
      const result = visibleRoute(actor);
      expect(result.start).toEqual(actor.route.start);
      expect(result.segments.slice(0, -1)).toEqual(
        actor.route.segments.slice(0, -1),
      );
      expect(JSON.stringify(actor.route)).toBe(before);
      if (actor.kind === "pedestrian") expect(result).toBe(actor.route);
    }
});

it("po wydłużeniu wyjazdu wyłącza kierunkowskaz w tym samym miejscu drogi", () => {
  for (const scenario of scenarios)
    for (const actor of scenario.participants) {
      if (actor.maneuver === "straight") continue;
      const result = visibleRoute(actor);
      const before = poseAt(
        sampleRoute(actor.route),
        maneuverEndProgress(actor.route),
      );
      const after = poseAt(sampleRoute(result), maneuverEndProgress(result));
      expect(after.x).toBeCloseTo(before.x);
      expect(after.y).toBeCloseTo(before.y);
    }
});

it("usuwa przejechany odcinek strzałki bez przesuwania jej celu, także na łuku", () => {
  for (const scenario of scenarios)
    for (const actor of scenario.participants) {
      const cue = directionArrow(actor)!;
      if (actor.stationary) { expect(cue).toBeNull(); continue; }
      expect(cue).not.toBeNull();
      const initial = remainingArrow(cue, 0)!;
      const fullPath = sampleRoute(visibleRoute(actor));
      const length = fullPath
        .slice(1)
        .reduce(
          (sum, point, i) =>
            sum +
            Math.hypot(point[0] - fullPath[i][0], point[1] - fullPath[i][1]),
          0,
        );
      for (const ratio of [0.2, 0.5, 0.8]) {
        const travelled = (cue.end - cue.start - cue.headLength) * ratio;
        const remaining = remainingArrow(cue, travelled)!;
        const expected = poseAt(fullPath, (travelled + cue.start) / length);
        const [x, y] = remaining.path
          .match(/^M([^ ]+) ([^ ]+)/)!
          .slice(1)
          .map(Number);
        expect(x).toBeCloseTo(expected.x);
        expect(y).toBeCloseTo(expected.y);
        expect(remaining.tip).toEqual(initial.tip);
        expect(remaining.path).not.toEqual(initial.path);
      }
      expect(remainingArrow(cue, length)).toBeNull();
      expect(remainingArrow(cue, 0)).toEqual(initial);
    }
});

it("wygasza grot na końcu strzałki bez odwrócenia jej trzonu", () => {
  const cue = directionArrow(scenarios[0].participants[0])!;
  const last = remainingArrow(cue, cue.end - cue.start - 1)!;
  expect(last.headLength).toBe(1);
  expect(last.headWidth).toBeLessThan(2);
  const coordinates = last.path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  expect(coordinates[0]).toBe(coordinates[2]);
  expect(coordinates[1]).toBe(coordinates[3]);
  expect(remainingArrow(cue, cue.end - cue.start)).toBeNull();
});
