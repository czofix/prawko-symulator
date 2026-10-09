import { expect, it } from "vitest";
import { scenarios } from "../src/data/scenarios";
import { maneuverEndProgress, poseAt, sampleRoute } from "../src/domain/routes";
import {
  localVertex,
  project,
  projectedPolygon,
} from "../src/components/scene/projection";
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
