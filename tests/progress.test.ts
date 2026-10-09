import { describe, expect, it } from "vitest";
import {
  emptyProgress,
  loadProgress,
  parseProgress,
  recordAttempt,
  recordSession,
  saveProgress,
} from "../src/domain/progress";
import type { Attempt, SessionResult } from "../src/domain/types";
const ids = new Set(["one", "two"]);
const attempt: Attempt = {
  scenarioId: "one",
  answer: ["A"],
  correct: false,
  at: "2026-10-09T12:00:00.000Z",
};
describe("zapis niezaufanych danych", () => {
  it("startuje bez zapisu, odrzuca uszkodzony format i przyszłe wersje", () => {
    expect(parseProgress(null, ids)).toEqual(emptyProgress());
    for (const raw of [
      "{",
      "[]",
      "null",
      JSON.stringify({ ...emptyProgress(), version: 2 }),
      JSON.stringify({
        ...emptyProgress(),
        attempts: { one: { correct: -3, incorrect: 0, lastCorrect: true } },
      }),
    ])
      expect(() => parseProgress(raw, ids)).toThrow();
  });
  it("usuwa nieaktualne identyfikatory bez przypisywania wyniku innemu zadaniu", () => {
    const saved = recordAttempt(emptyProgress(), attempt);
    expect(
      parseProgress(JSON.stringify(saved), new Set(["two"])).attempts,
    ).toEqual({});
  });
  it("przechowuje liczniki i usuwa zadanie z powtórek po poprawnej próbie", () => {
    const failed = recordAttempt(emptyProgress(), attempt);
    expect(failed.attempts.one).toEqual({
      correct: 0,
      incorrect: 1,
      lastCorrect: false,
    });
    const passed = recordAttempt(failed, { ...attempt, correct: true });
    expect(passed.attempts.one).toEqual({
      correct: 1,
      incorrect: 1,
      lastCorrect: true,
    });
    expect(parseProgress(JSON.stringify(passed), ids)).toEqual(passed);
  });
  it("obsługuje wyjątki magazynu i limit rozmiaru", () => {
    expect(
      saveProgress(
        {
          setItem() {
            throw new DOMException("QuotaExceededError");
          },
        },
        emptyProgress(),
      ),
    ).toBe(false);
    expect(
      loadProgress(
        {
          getItem() {
            throw new Error("SecurityError");
          },
        },
        ids,
      ).warning,
    ).not.toBe("");
    expect(() => parseProgress("x".repeat(1_000_001), ids)).toThrow();
  });
  it("nie zapisuje tej samej sesji dwa razy i ogranicza historię", () => {
    const session: SessionResult = {
      id: "session",
      at: attempt.at,
      attempts: [],
    };
    const first = recordSession(emptyProgress(), session);
    expect(recordSession(first, session).sessions).toHaveLength(1);
    let progress = emptyProgress();
    for (let i = 0; i < 30; i++)
      progress = recordSession(progress, { ...session, id: String(i) });
    expect(progress.sessions).toHaveLength(20);
  });
  it("odrzuca fałszywe typy, zbyt długie odpowiedzi i powtórzone zadania w sesji", () => {
    expect(() =>
      parseProgress(JSON.stringify({ ...emptyProgress(), speed: "1" }), ids),
    ).toThrow();
    expect(() =>
      parseProgress(
        JSON.stringify({
          ...emptyProgress(),
          sessions: [
            { id: "x", at: attempt.at, attempts: Array(10).fill(attempt) },
          ],
        }),
        ids,
      ),
    ).toThrow();
  });
});
