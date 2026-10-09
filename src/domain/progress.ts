import type { Attempt, Progress, SessionResult } from "./types";
export const STORAGE_KEY = "prawko.progress.v1";
export const emptyProgress = (): Progress => ({
  version: 1,
  attempts: {},
  sessions: [],
  speed: 1,
  introSeen: false,
});
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const count = (v: unknown): v is number =>
  Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= 1_000_000;
const date = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 40 && Number.isFinite(Date.parse(v));
export function parseProgress(
  raw: string | null,
  validIds: Set<string>,
): Progress {
  if (!raw) return emptyProgress();
  if (raw.length > 1_000_000) throw new Error("Zapis jest zbyt duży.");
  const value: unknown = JSON.parse(raw);
  if (
    !record(value) ||
    value.version !== 1 ||
    !record(value.attempts) ||
    !Array.isArray(value.sessions) ||
    typeof value.speed !== "number" ||
    ![0.5, 1].includes(value.speed) ||
    typeof value.introSeen !== "boolean"
  )
    throw new Error("Nieprawidłowy format postępu.");
  const progress = emptyProgress();
  for (const [id, item] of Object.entries(value.attempts)) {
    if (!validIds.has(id)) continue;
    if (
      !record(item) ||
      !count(item.correct) ||
      !count(item.incorrect) ||
      typeof item.lastCorrect !== "boolean"
    )
      throw new Error("Nieprawidłowy wynik zadania.");
    progress.attempts[id] = {
      correct: item.correct,
      incorrect: item.incorrect,
      lastCorrect: item.lastCorrect,
    };
  }
  for (const item of value.sessions.slice(-20)) {
    if (
      !record(item) ||
      typeof item.id !== "string" ||
      item.id.length > 100 ||
      !date(item.at) ||
      !Array.isArray(item.attempts) ||
      item.attempts.length !== 10
    )
      throw new Error("Nieprawidłowa sesja.");
    const attempts: Attempt[] = [];
    for (const attempt of item.attempts) {
      if (
        !record(attempt) ||
        typeof attempt.scenarioId !== "string" ||
        !validIds.has(attempt.scenarioId) ||
        !Array.isArray(attempt.answer) ||
        attempt.answer.length > 10 ||
        attempt.answer.some((v) => typeof v !== "string" || v.length > 80) ||
        typeof attempt.correct !== "boolean" ||
        !date(attempt.at)
      )
        throw new Error("Nieprawidłowa odpowiedź.");
      attempts.push({
        scenarioId: attempt.scenarioId,
        answer: attempt.answer as string[],
        correct: attempt.correct,
        at: attempt.at,
      });
    }
    if (new Set(attempts.map((a) => a.scenarioId)).size !== attempts.length)
      throw new Error("Powtórzone zadania w sesji.");
    progress.sessions.push({ id: item.id, at: item.at, attempts });
  }
  progress.speed = value.speed as 0.5 | 1;
  progress.introSeen = value.introSeen;
  return progress;
}
export function recordAttempt(progress: Progress, attempt: Attempt): Progress {
  const old = progress.attempts[attempt.scenarioId] ?? {
    correct: 0,
    incorrect: 0,
    lastCorrect: false,
  };
  return {
    ...progress,
    attempts: {
      ...progress.attempts,
      [attempt.scenarioId]: {
        correct: Math.min(1_000_000, old.correct + Number(attempt.correct)),
        incorrect: Math.min(
          1_000_000,
          old.incorrect + Number(!attempt.correct),
        ),
        lastCorrect: attempt.correct,
      },
    },
  };
}
export function recordSession(
  progress: Progress,
  session: SessionResult,
): Progress {
  return progress.sessions.some((item) => item.id === session.id)
    ? progress
    : { ...progress, sessions: [...progress.sessions, session].slice(-20) };
}
export function loadProgress(
  storage: Pick<Storage, "getItem">,
  ids: Set<string>,
): { progress: Progress; warning: string } {
  try {
    return {
      progress: parseProgress(storage.getItem(STORAGE_KEY), ids),
      warning: "",
    };
  } catch {
    return {
      progress: emptyProgress(),
      warning:
        "Nie udało się odczytać postępu. Możesz ćwiczyć dalej; zaczynamy od pustego zapisu.",
    };
  }
}
export function saveProgress(
  storage: Pick<Storage, "setItem">,
  progress: Progress,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
