import { useRef, useState } from "react";
import { scenarios, scenarioById, scenarioNumber } from "./data/scenarios";
import { pickSession } from "./domain/grading";
import { emptyProgress, recordAttempt, recordSession } from "./domain/progress";
import type { Attempt, Mode, SessionResult } from "./domain/types";
import { useProgress } from "./hooks/useProgress";
import { ScenarioPicker, type ScenarioFilters } from "./components/ScenarioPicker";
import { Home } from "./components/Home";
import { Exercise } from "./components/Exercise";
import { Icon } from "./components/Icon";
import { Intro } from "./components/Intro";
import { Dialog } from "./components/Dialog";
const hasDraftScenarios = scenarios.some(
  (scenario) => scenario.verification === "draft",
);
interface Run {
  id: string;
  mode: Mode;
  ids: string[];
  index: number;
  attempts: Attempt[];
}
export default function App() {
  const { progress, update, warning } = useProgress();
  const [picker, setPicker] = useState(false);
  const [filters, setFilters] = useState<ScenarioFilters>({category:"",difficulty:""});
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [review, setReview] = useState<number | null>(null);
  const [intro, setIntro] = useState(!progress.introSeen);
  const [reset, setReset] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [retry, setRetry] = useState(0);
  const submittedIds = useRef(new Set<string>());
  const navigate = () => window.scrollTo({ top: 0, behavior: "instant" });
  const start = (mode: Mode, startId?: string) => {
    const pool =
      mode === "mistakes"
        ? scenarios.filter(
            (s) =>
              progress.attempts[s.id] && !progress.attempts[s.id].lastCorrect,
          )
        : scenarios;
    if (!pool.length) {
      setEmpty(true);
      return;
    }
    submittedIds.current.clear();
    setRun({
      id: crypto.randomUUID(),
      mode,
      ids: (mode === "exam" ? pickSession(pool) : pool).map((s) => s.id),
      index: startId ? Math.max(0, pool.findIndex(s=>s.id===startId)) : 0,
      attempts: [],
    });
    setPicker(false);
    setResult(null);
    setReview(null);
    setCompleted(false);
    setRetry(0);
    navigate();
  };
  const leave = () => {
    setRun(null);
    setPicker(false);
    setResult(null);
    setReview(null);
    setCompleted(false);
    navigate();
  };
  const submit = (attempt: Attempt) => {
    if (!run) return;
    const token = `${run.id}:${run.index}:${retry}`;
    if (submittedIds.current.has(token)) return;
    submittedIds.current.add(token);
    update((old) => recordAttempt(old, attempt));
    setRun((old) =>
      old
        ? {
            ...old,
            attempts: [
              ...old.attempts.filter(
                (a) => a.scenarioId !== attempt.scenarioId,
              ),
              attempt,
            ],
          }
        : old,
    );
  };
  const next = () => {
    if (!run) return;
    if (run.index + 1 < run.ids.length) {
      setRun({ ...run, index: run.index + 1 });
      setRetry(0);
      navigate();
    } else if (run.mode === "exam") {
      const session = {
        id: run.id,
        at: new Date().toISOString(),
        attempts: run.attempts,
      };
      update((old) => recordSession(old, session));
      setResult(session);
      setRun(null);
      navigate();
    } else {
      setRun(null);
      setCompleted(true);
      navigate();
    }
  };
  const closeIntro = () => {
    update((old) => ({ ...old, introSeen: true }));
    setIntro(false);
  };
  const current = run ? scenarioById.get(run.ids[run.index]) : undefined;
  const reviewing =
    review !== null && result
      ? scenarioById.get(result.attempts[review].scenarioId)
      : undefined;
  return (
    <>
      <a className="skip-link" href="#main-content">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => (run ? setExitConfirm(true) : leave())}
            aria-label="Prawko — strona główna"
          >
            <span className="brand-mark">
              <Icon name="road" size={25} />
            </span>
            <span>
              prawko<span className="brand-dot">.</span>
            </span>
          </button>
          <span className="header-divider" />
          <span className="header-description">
            Symulator sytuacji drogowych
          </span>
          <nav aria-label="Nawigacja główna">
            <button
              className={!run && !result ? "nav-active" : ""}
              onClick={() => (run ? setExitConfirm(true) : leave())}
            >
              Twoja nauka
            </button>
            <span className="category-pill">Kategoria B</span>
          </nav>
        </div>
      </header>
      {hasDraftScenarios && (
        <div className="draft-banner" role="note">
          <strong>Wersja robocza treści</strong>
          <span>
            Scenariusze czekają na sprawdzenie aktualnych przepisów — nie
            traktuj ich jeszcze jako zweryfikowanego materiału do nauki.
          </span>
        </div>
      )}
      {warning && (
        <div className="storage-warning" role="status">
          {warning}
        </div>
      )}
      <div id="main-content" tabIndex={-1}>
        {run && current ? (
          <Exercise
            key={`${run.id}:${current.id}:${retry}`}
            scenario={current}
            mode={run.mode}
            number={run.mode === "learn" ? scenarioNumber.get(current.id)! : run.index + 1}
            total={run.ids.length}
            speed={progress.speed}
            onSpeed={(speed) => update((p) => ({ ...p, speed }))}
            onSubmit={submit}
            onNext={next}
            onExit={() => setExitConfirm(true)}
            onList={run.mode === "learn" ? () => { leave(); setPicker(true); } : undefined}
            onPrevious={run.mode === "learn" && run.index > 0 ? () => start("learn",run.ids[run.index-1]) : undefined}
            onRetry={() => setRetry((v) => v + 1)}
          />
        ) : reviewing && result && review !== null ? (
          <Exercise
            key={`review:${reviewing.id}`}
            scenario={reviewing}
            mode="exam"
            number={review + 1}
            total={result.attempts.length}
            speed={progress.speed}
            onSpeed={(speed) => update((p) => ({ ...p, speed }))}
            onSubmit={() => {}}
            onNext={() => {
              setReview(
                review + 1 < result.attempts.length ? review + 1 : null,
              );
              navigate();
            }}
            onExit={() => {
              setReview(null);
              navigate();
            }}
            review={result.attempts[review]}
            onRetry={() => {}}
          />
        ) : result ? (
          <main className="summary page-enter">
            <span className="eyebrow">
              Sprawdź się • podsumowanie ćwiczenia
            </span>
            <h1>Każda próba to krok naprzód.</h1>
            <p>
              To ćwiczenie, nie oficjalny egzamin państwowy. Zajrzyj do
              wyjaśnień — to one pomagają zrozumieć zasady.
            </p>
            <div className="score">
              <strong>{result.attempts.filter((a) => a.correct).length}</strong>
              <span>
                / 10<small>trafnych odpowiedzi</small>
              </span>
            </div>
            <h2>Przyjrzyj się swoim odpowiedziom</h2>
            <div className="review-list">
              {result.attempts.map((attempt, i) => (
                <button
                  key={attempt.scenarioId}
                  onClick={() => {
                    setReview(i);
                    navigate();
                  }}
                >
                  <span className="review-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    {scenarioById.get(attempt.scenarioId)?.title}
                    <small>
                      {attempt.correct
                        ? "Poprawna odpowiedź"
                        : "Warto wrócić do tej sytuacji"}
                    </small>
                  </span>
                  <Icon name={attempt.correct ? "check" : "bulb"} />
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
            <button className="button primary" onClick={leave}>
              Wróć do startu <Icon name="arrow" />
            </button>
          </main>
        ) : picker ? <ScenarioPicker progress={progress} filters={filters} onFilters={setFilters} onStart={id=>start("learn",id)} onBack={leave}/> : completed ? (
          <main className="empty-state">
            <span className="large-icon">
              <Icon name="check" size={36} />
            </span>
            <span className="eyebrow">Dobra robota z ćwiczeniem</span>
            <h1>Cała seria za Tobą.</h1>
            <p>
              Możesz wrócić do trudniejszych sytuacji albo sprawdzić się w nowym
              zestawie.
            </p>
            <button className="button primary" onClick={leave}>
              Wróć do startu <Icon name="arrow" />
            </button>
          </main>
        ) : (
          <Home
            progress={progress}
            onStart={start}
            onPicker={()=>{leave();setPicker(true);}}
            onReset={() => setReset(true)}
            onIntro={() => setIntro(true)}
          />
        )}
      </div>
      {intro && <Intro onClose={closeIntro} />}
      {reset && (
        <Dialog title="Wyzerować postęp?" onClose={() => setReset(false)}>
          <p>
            Usuniemy wyniki zadań, listę powtórek i historię ćwiczeń z tej
            przeglądarki. Nie można tego cofnąć.
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() => setReset(false)}
            >
              Zachowaj postęp
            </button>
            <button
              className="button danger"
              onClick={() => {
                update(() => ({ ...emptyProgress(), introSeen: true }));
                setReset(false);
              }}
            >
              Tak, resetuj postęp
            </button>
          </div>
        </Dialog>
      )}
      {exitConfirm && (
        <Dialog title="Wrócić do startu?" onClose={() => setExitConfirm(false)}>
          <p>
            {run?.mode === "exam"
              ? "Przerwane ćwiczenie nie otrzyma końcowego wyniku. Zatwierdzone odpowiedzi pozostaną w Twoim postępie."
              : "Zatwierdzone odpowiedzi są zachowane. Możesz wrócić do nauki w dowolnej chwili."}
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() => setExitConfirm(false)}
            >
              Ćwicz dalej
            </button>
            <button
              className="button primary"
              onClick={() => {
                setExitConfirm(false);
                leave();
              }}
            >
              Wróć do startu
            </button>
          </div>
        </Dialog>
      )}
      {empty && (
        <Dialog
          title="Nie ma jeszcze błędów do powtórki"
          onClose={() => setEmpty(false)}
        >
          <p>
            Wszystkie dotychczasowe sytuacje są opanowane albo dopiero
            zaczynasz. Po niepoprawnej odpowiedzi zadanie pojawi się tutaj.
            Poprawna powtórka usunie je z listy.
          </p>
          <button
            className="button primary"
            onClick={() => {
              setEmpty(false);
              start("learn");
            }}
          >
            Przejdź do nauki
          </button>
        </Dialog>
      )}
    </>
  );
}
