import { expect, it } from "vitest";
import {
  maneuverEndProgress,
  poseAt,
  routeFor,
  sampleRoute,
} from "../src/domain/routes";
import { scenarioById } from "../src/data/scenarios";
it("kończy sygnalizowanie po łuku skrętu, przed dalszą jazdą prostą", () => {
  const route = routeFor("south", "left");
  const end = maneuverEndProgress(route);
  expect(end).toBeGreaterThan(0);
  expect(end).toBeLessThan(1);
  const pose = poseAt(sampleRoute(route), end);
  expect(pose.x).toBeCloseTo(235);
  expect(pose.y).toBeCloseTo(258);
  expect(maneuverEndProgress(routeFor("south", "straight"))).toBe(0);
});
it("wyłącza kierunkowskaz dopiero po ostatnim łuku zjazdu z ronda", () => {
  const route = scenarioById.get("roundabout-yield")!.participants[1].route;
  const pose = poseAt(sampleRoute(route), maneuverEndProgress(route));
  expect(pose.x).toBeCloseTo(470);
  expect(pose.y).toBeCloseTo(342);
});
it("C na łamanym pierwszeństwie ma rzeczywisty konflikt z torami obu pojazdów", () => {
  const scenario = scenarioById.get("priority-bends")!;
  const c = sampleRoute(scenario.participants.find((p) => p.id === "C")!.route);
  for (const id of ["A", "B"]) {
    const other = sampleRoute(
      scenario.participants.find((p) => p.id === id)!.route,
    );
    const distance = Math.min(
      ...c.flatMap((a) =>
        other.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1])),
      ),
    );
    expect(distance, `C musi mieć kolizyjny tor z ${id}`).toBeLessThan(10);
  }
});
