import type { Scenario } from "./types";
const officialHosts = new Set([
  "eli.gov.pl",
  "api.sejm.gov.pl",
  "isap.sejm.gov.pl",
  "dziennikustaw.gov.pl",
]);
export function validateScenario(scenario: Scenario): void {
  const assert = (condition: unknown, message: string) => {
    if (!condition) throw new Error(`${scenario.id}: ${message}`);
  };
  assert(/^[a-z0-9-]+$/.test(scenario.id), "niestabilny identyfikator");
  const actors = new Set(scenario.participants.map((p) => p.id));
  assert(actors.size === scenario.participants.length, "powtórzony uczestnik");
  assert(
    scenario.steps.length > 0 && scenario.sources.length > 0,
    "brak rozwiązania lub źródła",
  );
  const options = new Set(scenario.question.options.map((o) => o.id));
  assert(
    options.size === scenario.question.options.length,
    "powtórzona odpowiedź",
  );
  assert(
    scenario.question.accepted.length > 0,
    "brak akceptowanego rozwiązania",
  );
  for (const answer of scenario.question.accepted) {
    assert(
      answer.length > 0 &&
        answer.every((id) => options.has(id)) &&
        new Set(answer).size === answer.length,
      "niepoprawne rozwiązanie",
    );
    if (scenario.question.kind === "single")
      assert(
        answer.length === 1,
        "wielokrotna odpowiedź w pytaniu pojedynczym",
      );
    if (scenario.question.kind === "order")
      assert(answer.length === options.size, "niepełna kolejność");
  }
  const moving = new Set<string>();
  for (const step of scenario.steps) {
    assert(
      step.duration >= 1000 && step.duration <= 10000 && step.text.length > 0,
      "niepoprawny etap",
    );
    for (const id of step.actors) {
      assert(
        actors.has(id) && !moving.has(id),
        "nieznany lub ponownie przesuwany uczestnik",
      );
      moving.add(id);
    }
  }
  for (const participant of scenario.participants) {
    assert(participant.route.segments.length > 0, "brak toru jazdy");
    const coordinates = [
      ...participant.route.start,
      ...participant.route.segments.flatMap((s) =>
        s.type === "line" ? [...s.to] : [...s.c1, ...s.c2, ...s.to],
      ),
    ];
    assert(coordinates.every(Number.isFinite), "niepoprawna współrzędna");
  }
  for (const source of scenario.sources) {
    const url = new URL(source.url);
    assert(
      url.protocol === "https:" && officialHosts.has(url.hostname),
      "źródło spoza oficjalnego serwisu",
    );
    if (scenario.verification === "verified")
      assert(
        source.checkedAt && /^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt),
        "brak daty weryfikacji",
      );
  }
}
