import { expect, it } from "vitest";
import { advancePlayback, playbackPosition } from "../src/domain/playback";
import { scenarios } from "../src/data/scenarios";
import { legacy } from "../src/data/scenarios/legacy";
import { emptyProgress, parseProgress } from "../src/domain/progress";
import { gradeAnswer } from "../src/domain/grading";
import { validateScenario } from "../src/domain/validateScenario";
it("2x ma połowę czasu i identyczne etapy dla wszystkich 60 zadań", () => {
  for (const s of scenarios) {
    const simulate = (speed: 1 | 2) => {
      let time = 0,
        frames = 0;
      const sequence: number[] = [];
      const total = s.steps.reduce((n, x) => n + x.duration, 0);
      while (time < total) {
        const { index } = playbackPosition(s.steps, time);
        if (sequence.at(-1) !== index) sequence.push(index);
        time = advancePlayback(time, 16, speed, total);
        frames++;
      }
      return { frames, sequence };
    };
    const normal = simulate(1),
      fast = simulate(2);
    expect(fast.frames * 2).toBe(normal.frames);
    expect(fast.sequence).toEqual(normal.sequence);
    expect(fast.sequence).toEqual(s.steps.map((_, i) => i));
  }
});
it("zmiana prędkości zachowuje czas, pauza nie przesuwa, długa klatka jest ograniczona", () => {
  expect(advancePlayback(800, 16, 2, 6400)).toBe(832);
  expect(advancePlayback(832, 16, 1, 6400)).toBe(848);
  expect(advancePlayback(832, 0, 2, 6400)).toBe(832);
  expect(advancePlayback(800, 5000, 2, 6400)).toBe(1000);
  expect(playbackPosition(scenarios[0].steps, 0).fraction).toBe(0);
  expect(playbackPosition(scenarios[0].steps, 6400).finished).toBe(true);
});
it("stary zapis 16 identyfikatorów i prędkość 2 pozostają czytelne", () => {
  const old = {
    ...emptyProgress(),
    attempts: Object.fromEntries(
      legacy.map((s, i) => [
        s.id,
        { correct: i, incorrect: 1, lastCorrect: i % 2 === 0 },
      ]),
    ),
  };
  const ids = new Set(scenarios.map((s) => s.id));
  expect(parseProgress(JSON.stringify(old), ids)).toEqual(old);
  expect(parseProgress(JSON.stringify({ ...old, speed: 2 }), ids).speed).toBe(
    2,
  );
  expect(() =>
    parseProgress(JSON.stringify({ ...old, speed: 3 }), ids),
  ).toThrow();
});
it("niezależna para dopuszcza oba porządki, ale nie pierwszeństwo podporządkowanego", () => {
  const q = scenarios.find(
    (s) => s.id === "priority-independent-pair",
  )!.question;
  expect(gradeAnswer(q, ["A", "B", "C"])).toBe(true);
  expect(gradeAnswer(q, ["B", "A", "C"])).toBe(true);
  expect(gradeAnswer(q, ["C", "B", "A"])).toBe(false);
});
it("odrzuca ruch na czerwonym, brak strzałki S-3 i ruch zablokowanego pojazdu", () => {
  const red = structuredClone(scenarios.find((s) => s.id === "green-and-red")!);
  red.steps[0].actors.push("B");
  expect(() => validateScenario(red)).toThrow();
  const directional = structuredClone(
    scenarios.find((s) => s.id === "protected-left-signal")!,
  );
  directional.signals[0].direction = undefined;
  expect(() => validateScenario(directional)).toThrow();
  const blocked = structuredClone(
    scenarios.find((s) => s.id === "green-blocked-exit")!,
  );
  blocked.steps[0].actors = ["B"];
  expect(() => validateScenario(blocked)).toThrow();
});
