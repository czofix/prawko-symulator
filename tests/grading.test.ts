import { describe, expect, it } from "vitest";
import { gradeAnswer, pickSession } from "../src/domain/grading";
import { scenarios, scenarioById } from "../src/data/scenarios";
describe("ocenianie odpowiedzi", () => {
  it("akceptuje obie legalne kolejności i odrzuca niepełne, nieznane lub podwójne odpowiedzi", () => {
    const question = scenarioById.get("two-valid-orders")!.question;
    expect(gradeAnswer(question, ["A", "B"])).toBe(true);
    expect(gradeAnswer(question, ["B", "A"])).toBe(true);
    for (const answer of [[], ["A"], ["A", "A"], ["B", "C"], ["A", "B", "C"]])
      expect(gradeAnswer(question, answer)).toBe(false);
  });
  it("wielokrotny wybór jest zbiorem, ale kolejność przejazdu jest sekwencją", () => {
    expect(
      gradeAnswer(scenarioById.get("priority-bends")!.question, ["B", "A"]),
    ).toBe(true);
    expect(
      gradeAnswer(scenarioById.get("priority-bends")!.question, ["A"]),
    ).toBe(false);
    expect(
      gradeAnswer(scenarioById.get("zipper-jam")!.question, ["B", "A", "C"]),
    ).toBe(true);
    expect(
      gradeAnswer(scenarioById.get("zipper-jam")!.question, ["A", "B", "C"]),
    ).toBe(false);
  });
  it("nie pozwala wybrać dwóch odpowiedzi w pytaniu pojedynczym", () => {
    expect(gradeAnswer(scenarios[0].question, ["A", "B"])).toBe(false);
  });
  it("losuje 10 różnych zadań bez modyfikowania puli", () => {
    const before = scenarios.map((s) => s.id);
    const session = pickSession(scenarios, 10, () => 0.4);
    expect(session).toHaveLength(10);
    expect(new Set(session.map((s) => s.id)).size).toBe(10);
    expect(scenarios.map((s) => s.id)).toEqual(before);
    expect(pickSession([], 10)).toEqual([]);
  });
});
