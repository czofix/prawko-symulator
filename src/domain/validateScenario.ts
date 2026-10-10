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
  for (const value of [scenario.title,scenario.category,scenario.description,scenario.hint,scenario.explanation,scenario.watchFor,scenario.answerLabel,scenario.question.prompt]) assert(typeof value === "string" && value.trim().length > 0, "brak treści edukacyjnej");
  assert([1,2,3].includes(scenario.difficulty), "nieznana trudność");
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
  for(const option of scenario.question.options) assert(!option.actor || actors.has(option.actor), "nieznany uczestnik odpowiedzi");
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
      assert(!scenario.participants.find(p=>p.id===id)?.stationary, "ruch nieruchomego uczestnika");
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
  for (const signal of scenario.signals) {
    assert(!signal.actors || signal.actors.every(id=>actors.has(id)), "nieznany adresat sygnału");
    assert(!signal.kind || signal.kind === "S-1" || signal.direction, "brak kierunku strzałki");
    if(signal.color !== "green" && signal.kind !== "S-2")
      assert(!scenario.participants.some(p=>(signal.actors ? signal.actors.includes(p.id) : p.approach===signal.approach) && moving.has(p.id)), "ruch przy sygnale zabraniającym wjazdu");
  }
  for (const m of scenario.markings ?? []) assert([m.x,m.y,m.rotation].every(Number.isFinite), "niepoprawne oznakowanie");
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
