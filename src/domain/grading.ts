import type { Scenario } from "./types";
export function gradeAnswer(
  question: Scenario["question"],
  answer: string[],
): boolean {
  const known = new Set(question.options.map((option) => option.id));
  if (
    !answer.length ||
    new Set(answer).size !== answer.length ||
    answer.some((id) => !known.has(id))
  )
    return false;
  return question.accepted.some(
    (accepted) =>
      accepted.length === answer.length &&
      (question.kind === "order"
        ? accepted.every((id, i) => answer[i] === id)
        : accepted.every((id) => answer.includes(id))),
  );
}
export function pickSession<T>(
  pool: readonly T[],
  count = 10,
  random = Math.random,
): T[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
