import { useRef, useState } from "react";
import type { Attempt, Mode, Scenario } from "../domain/types";
import { gradeAnswer } from "../domain/grading";
import { usePlayback } from "../hooks/usePlayback";
import { RoadScene, actorColors } from "./RoadScene";
import { PlaybackControls } from "./PlaybackControls";
import { LegalDetails } from "./LegalDetails";
import { Icon } from "./Icon";
export function Exercise({
  scenario,
  mode,
  number,
  total,
  speed,
  onSpeed,
  onSubmit,
  onNext,
  onExit,
  review,
  onRetry,
}: {
  scenario: Scenario;
  mode: Mode;
  number: number;
  total: number;
  speed: 0.5 | 1;
  onSpeed: (s: 0.5 | 1) => void;
  onSubmit: (attempt: Attempt) => void;
  onNext: () => void;
  onExit: () => void;
  review?: Attempt;
  onRetry: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(review?.answer ?? []);
  const [submitted, setSubmitted] = useState<Attempt | null>(review ?? null);
  const [hint, setHint] = useState(false);
  const [routes, setRoutes] = useState(true);
  const guard = useRef(Boolean(review));
  const feedback = useRef<HTMLDivElement>(null);
  const reveal = Boolean(submitted) && (mode !== "exam" || Boolean(review));
  const playback = usePlayback(scenario, speed, reveal);
  const select = (id: string) => {
    if (guard.current) return;
    setSelected((old) =>
      scenario.question.kind === "single"
        ? [id]
        : old.includes(id)
          ? old.filter((value) => value !== id)
          : [...old, id],
    );
  };
  const complete =
    selected.length > 0 &&
    (scenario.question.kind !== "order" ||
      selected.length === scenario.question.options.length);
  const submit = () => {
    if (guard.current || !complete) return;
    guard.current = true;
    const attempt: Attempt = {
      scenarioId: scenario.id,
      answer: [...selected],
      correct: gradeAnswer(scenario.question, selected),
      at: new Date().toISOString(),
    };
    setSubmitted(attempt);
    onSubmit(attempt);
    requestAnimationFrame(() => feedback.current?.focus());
  };
  return (
    <main className="exercise page-enter">
      <div className="exercise-top">
        <button
          className="text-button back"
          aria-label={review ? "Wyniki ćwiczenia" : "Wróć do startu"}
          onClick={onExit}
        >
          ← <span>{review ? "Wyniki ćwiczenia" : "Wróć do startu"}</span>
        </button>
        <span className="muted">
          {review
            ? "Przegląd"
            : mode === "exam"
              ? "Ćwiczenie sprawdzające"
              : mode === "mistakes"
                ? "Powtórz błędy"
                : "Ucz się"}{" "}
          <b>
            {String(number).padStart(2, "0")} / {total}
          </b>
        </span>
      </div>
      <div className="session-track">
        <div style={{ width: `${(number / total) * 100}%` }} />
      </div>
      <div className="exercise-heading">
        <div>
          <span className="eyebrow">{scenario.category}</span>
          <h1>{scenario.title}</h1>
        </div>
        <span className="difficulty">
          {Array.from({ length: 3 }, (_, i) => (
            <i key={i} className={i < scenario.difficulty ? "active" : ""} />
          ))}{" "}
          {
            ["", "Podstawy", "Krok dalej", "Łączymy zasady"][
              scenario.difficulty
            ]
          }
        </span>
      </div>
      <div className="exercise-grid">
        <section className="scene-panel" aria-label="Rysunek sytuacji">
          <div className="scene-toolbar">
            <span>
              <i className="live-dot" /> Sytuacja{" "}
              {String(number).padStart(2, "0")}
            </span>
            <button
              className="route-toggle"
              aria-pressed={routes}
              onClick={() => setRoutes((r) => !r)}
            >
              {routes ? "Ukryj tory jazdy" : "Pokaż tory jazdy"}
            </button>
          </div>
          <RoadScene
            scenario={scenario}
            selected={selected}
            onSelect={select}
            showRoutes={routes}
            playback={reveal ? playback : undefined}
            interactive={!submitted}
          />
          <div className="scene-caption">
            <Icon name="layers" size={17} />
            <span>
              {reveal
                ? "Śledź wyjaśnienie krok po kroku."
                : "Kliknij samochód lub wybierz odpowiedź obok."}{" "}
              Dotknij znaku, aby odczytać opis.
            </span>
          </div>
          {reveal && (
            <div className="animation-section">
              <PlaybackControls
                playback={playback}
                speed={speed}
                onSpeed={onSpeed}
              />
              <div className="step-copy" aria-live="polite">
                <span className="step-number">
                  {playback.finished ? "✓" : playback.index + 1}
                </span>
                <p>
                  <strong>
                    {playback.finished
                      ? "Sytuacja wyjaśniona"
                      : `Krok ${playback.index + 1} z ${scenario.steps.length}`}
                  </strong>
                  {playback.finished
                    ? "Możesz odtworzyć rozwiązanie jeszcze raz lub przejść dalej."
                    : scenario.steps[playback.index].text}
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="question-panel" aria-label="Pytanie i odpowiedź">
          <p className="scenario-description">{scenario.description}</p>
          <details className="participants">
            <summary>Uczestnicy i kierunki jazdy</summary>
            <ul>
              {scenario.participants.map((p) => (
                <li key={p.id}>{p.description}</li>
              ))}
            </ul>
          </details>
          <div className="question-heading">
            <span className="eyebrow">Twoja decyzja</span>
            <h2>{scenario.question.prompt}</h2>
          </div>
          {scenario.question.kind === "order" && (
            <p className="small muted">
              Kliknij ponownie, aby usunąć z kolejności.
            </p>
          )}
          {scenario.question.kind === "multiple" && (
            <p className="small muted">
              Możesz wybrać więcej niż jedną odpowiedź.
            </p>
          )}
          <div className="answers">
            {scenario.question.options.map((option) => (
              <button
                key={option.id}
                className={`answer ${selected.includes(option.id) ? "selected" : ""}`}
                onClick={() => select(option.id)}
                disabled={Boolean(submitted)}
                aria-pressed={selected.includes(option.id)}
              >
                {option.actor && (
                  <span
                    className="actor-label"
                    aria-hidden="true"
                    style={{ background: actorColors[option.actor] }}
                  >
                    {option.actor}
                  </span>
                )}
                <span>{option.label}</span>
                <span className="answer-selector" aria-hidden="true">
                  {selected.includes(option.id) ? (
                    scenario.question.kind === "order" ? (
                      selected.indexOf(option.id) + 1
                    ) : (
                      <Icon name="check" size={14} />
                    )
                  ) : (
                    ""
                  )}
                </span>
              </button>
            ))}
          </div>
          {!submitted && (
            <>
              <button
                className="button primary confirm"
                disabled={!complete}
                onClick={submit}
              >
                Zatwierdź odpowiedź <Icon name="arrow" />
              </button>
              {mode !== "exam" && (
                <>
                  <button
                    className="hint-button"
                    aria-expanded={hint}
                    onClick={() => setHint((v) => !v)}
                  >
                    <Icon name="bulb" size={18} />
                    {hint ? "Ukryj podpowiedź" : "Potrzebuję podpowiedzi"}
                  </button>
                  {hint && <p className="hint">{scenario.hint}</p>}
                </>
              )}
            </>
          )}
          {submitted && (
            <div
              ref={feedback}
              tabIndex={-1}
              className="feedback"
              aria-live="polite"
            >
              {reveal ? (
                <>
                  <div
                    className={`result-label ${submitted.correct ? "correct" : "incorrect"}`}
                  >
                    <Icon name={submitted.correct ? "check" : "bulb"} />
                    {submitted.correct
                      ? "Tak, ten wariant pasuje."
                      : "Zatrzymajmy się przy tej sytuacji."}
                  </div>
                  <h3>
                    Prawidłowa odpowiedź{" "}
                    {scenario.verification === "draft" && (
                      <small>— wersja robocza</small>
                    )}
                  </h3>
                  <p>{scenario.answerLabel}</p>
                  <h3>Dlaczego?</h3>
                  <p>
                    {!submitted.correct &&
                      "W wybranej odpowiedzi brakuje uwzględnienia tej zależności: "}
                    {scenario.explanation}
                  </p>
                  <h3>Na co patrzeć następnym razem?</h3>
                  <p>{scenario.watchFor}</p>
                  <LegalDetails scenario={scenario} />
                </>
              ) : (
                <>
                  <div className="result-label">
                    <Icon name="check" />
                    Odpowiedź zapisana
                  </div>
                  <p>
                    Wynik, wyjaśnienia i animacje zobaczysz po zakończeniu
                    wszystkich 10 zadań.
                  </p>
                </>
              )}
              <button className="button primary" onClick={onNext}>
                {review
                  ? "Kolejna odpowiedź"
                  : number === total
                    ? "Zakończ ćwiczenie"
                    : "Następne zadanie"}
                <Icon name="arrow" />
              </button>
              {reveal && !review && (
                <button className="text-button retry" onClick={onRetry}>
                  <Icon name="reset" size={16} />
                  Rozwiąż ponownie
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      <p className="exercise-note">
        {scenario.verification === "draft"
          ? "Scenariusz roboczy — odpowiedź wymaga weryfikacji z aktualnymi przepisami."
          : "Ćwicz spokojnie. Zrozumienie jest ważniejsze od tempa."}
      </p>
    </main>
  );
}
