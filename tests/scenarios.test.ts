import { describe, expect, it } from "vitest";
import { scenarios } from "../src/data/scenarios";
import { visibleRoute } from "../src/components/scene/visibleRoute";
import { legacy } from "../src/data/scenarios/legacy";
import { gradeAnswer } from "../src/domain/grading";
import { poseAt, sampleRoute } from "../src/domain/routes";
import { validateScenario } from "../src/domain/validateScenario";
// These checks validate internal consistency, not legal correctness.
const expectedMovement: Record<string, string[]> = {
  "opposite-right-turns": ["A+B"],
  "three-right-hand-chain": ["C", "B", "A"],
  "right-turn-shared-exit": ["A", "B"],
  "left-yields-two": ["C", "B", "A"],
  "stop-empty-road": ["", "A"],
  "priority-left-opposite": ["B", "A"],
  "priority-left-minor-right": ["A", "B"],
  "minor-stop-versus-yield": ["B", "A"],
  "stop-right-versus-left": ["A", "B"],
  "priority-three-levels": ["C", "B", "A"],
  "priority-independent-pair": ["A+B", "C"],
  "bend-follow-versus-minor": ["A", "B"],
  "bend-leave-versus-turn": ["A", "B"],
  "bend-right-hand-on-main": ["B", "A"],
  "bend-main-right-minor-left": ["A", "B"],
  "bend-two-minor": ["A", "B"],
  "bend-four-vehicles": ["A", "B", "C", "D"],
  "bend-north-west-conflict": ["B", "A"],
  "amber-safe-stop": [""],
  "red-amber-wait": [""],
  "green-right-opposite-left": ["A", "B"],
  "protected-left-signal": ["A"],
  "conditional-arrow-stop": ["", "A"],
  "green-blocked-exit": [""],
  "green-overrides-stop": ["A"],
  "conditional-arrow-yields": ["B", "A"],
  "roundabout-second-exit": ["B", "A"],
  "roundabout-exit-indicator": ["A"],
  "roundabout-exit-pedestrian": ["P", "A"],
  "roundabout-following": ["A", "B"],
  "roundabout-red-entry": ["B"],
  "roundabout-without-yield": ["A", "B"],
  "roundabout-independent-entries": ["A+B"],
  "pedestrian-entering": ["P", "A"],
  "cyclist-on-crossing": ["B", "A"],
  "right-turn-pedestrian": ["P", "A"],
  "left-turn-crossing": ["P", "A"],
  "left-turn-opposite-cyclist": ["B", "A"],
  "right-turn-cycle-track": ["B", "A"],
  "two-vulnerable-crossings": ["P+B", "A"],
  "lane-indicator-no-priority": ["B", "A"],
  "slow-traffic-no-closure": ["B", "A"],
  "driveway-join": ["B", "A"],
  "zipper-only-one": ["B", "A", "C", "D"],
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
  it("ma dokładnie 60 stabilnych, różnych identyfikatorów", () => {
    expect(scenarios.length).toBe(60);
    expect(legacy).toHaveLength(16);
    for (const old of legacy)
      expect(scenarios.some((s) => s.id === old.id)).toBe(true);
    expect(
      [...new Set(scenarios.map((s) => s.category))]
        .map((c) => scenarios.filter((s) => s.category === c).length)
        .sort(),
    ).toEqual([10, 10, 10, 6, 8, 8, 8].sort());
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
  });
  for (const scenario of scenarios)
    describe(scenario.id, () => {
      it("ma poprawny model, źródła, geometrię i uczciwy status weryfikacji", () => {
        expect(() => validateScenario(scenario)).not.toThrow();
        expect(scenario.verification).toBe("verified");
        expect(
          scenario.sources.every(
            (s) =>
              s.checkedAt ===
              (legacy.some((old) => old.id === scenario.id)
                ? "2026-10-09"
                : "2026-10-10"),
          ),
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
                  sampleRoute(visibleRoute(p)),
                  step.actors.includes(p.id) ? i / 100 : 0,
                ),
              }));
            for (let a = 0; a < poses.length; a++)
              for (let b = a + 1; b < poses.length; b++) {
                const min =
                  poses[a].kind !== "car" || poses[b].kind !== "car" ? 55 : 74;
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
