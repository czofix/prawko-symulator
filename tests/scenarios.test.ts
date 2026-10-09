import { describe, expect, it } from "vitest";
import { scenarios } from "../src/data/scenarios";
import { gradeAnswer } from "../src/domain/grading";
import { poseAt, sampleRoute } from "../src/domain/routes";
import { validateScenario } from "../src/domain/validateScenario";
// These checks validate internal consistency, not legal correctness.
const expectedMovement: Record<string, string[]> = {
  "right-hand-south": ["B", "A"],
  "right-hand-north": ["B", "A"],
  "opposite-straight": ["A+B"],
  "left-versus-straight": ["B", "A"],
  "left-versus-right": ["B", "A"],
  "priority-before-right": ["A", "B"],
  "yield-to-priority": ["B", "A"],
  "stop-is-not-priority": ["B", "A"],
  "two-valid-orders": ["A", "B"],
  "priority-bends": ["A", "B", "C"],
  "green-and-red": ["A"],
  "green-left": ["B", "A"],
  "roundabout-yield": ["B", "A"],
  "pedestrian-on-crossing": ["P", "A"],
  "zipper-jam": ["B", "A", "C"],
  "merge-free-flow": ["B", "A"],
};
describe("spójność scenariuszy i animacji", () => {
  it("ma minimum 15 stabilnych, różnych identyfikatorów", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(15);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
  });
  for (const scenario of scenarios)
    describe(scenario.id, () => {
      it("ma poprawny model, źródła, geometrię i uczciwy status weryfikacji", () => {
        expect(() => validateScenario(scenario)).not.toThrow();
        expect(scenario.verification).toBe("verified");
        expect(
          scenario.sources.every((s) => s.checkedAt === "2026-10-09"),
        ).toBe(true);
        expect(scenario.steps.map((s) => s.actors.join("+"))).toEqual(
          expectedMovement[scenario.id],
        );
        for (const answer of scenario.question.accepted)
          expect(gradeAnswer(scenario.question, answer)).toBe(true);
        if (scenario.question.kind === "order")
          expect(
            gradeAnswer(
              scenario.question,
              scenario.steps.flatMap((s) => s.actors),
            ),
          ).toBe(true);
        if (
          scenario.question.kind === "single" &&
          scenario.question.options.every((o) => o.actor)
        )
          expect(gradeAnswer(scenario.question, scenario.steps[0].actors)).toBe(
            true,
          );
      });
      it("porusza pojazdy po ciągłych torach, bez kolizji z oczekującymi", () => {
        const completed = new Set<string>();
        for (const step of scenario.steps) {
          for (let i = 0; i <= 100; i++) {
            const poses = scenario.participants
              .filter((p) => !completed.has(p.id))
              .map((p) => ({
                id: p.id,
                kind: p.kind,
                ...poseAt(
                  sampleRoute(p.route),
                  step.actors.includes(p.id) ? i / 100 : 0,
                ),
              }));
            for (let a = 0; a < poses.length; a++)
              for (let b = a + 1; b < poses.length; b++) {
                const min =
                  poses[a].kind === "pedestrian" ||
                  poses[b].kind === "pedestrian"
                    ? 55
                    : 74;
                expect(
                  Math.hypot(poses[a].x - poses[b].x, poses[a].y - poses[b].y),
                  `${scenario.id}: ${poses[a].id}/${poses[b].id} at ${i}`,
                ).toBeGreaterThan(min);
              }
          }
          step.actors.forEach((id) => completed.add(id));
        }
        for (const p of scenario.participants) {
          const points = sampleRoute(p.route);
          expect(points[0]).toEqual(p.route.start);
          for (let i = 1; i < points.length; i++)
            expect(
              Math.hypot(
                points[i][0] - points[i - 1][0],
                points[i][1] - points[i - 1][1],
              ),
            ).toBeLessThan(15);
        }
      });
    });
});
