import type { Mode, Progress } from "../domain/types";
import { scenarios } from "../data/scenarios";
import { RoadScene } from "./RoadScene";
import { Icon } from "./Icon";
export function Home({
  progress,
  onStart,
  onReset,
  onIntro,
}: {
  progress: Progress;
  onStart: (mode: Mode) => void;
  onReset: () => void;
  onIntro: () => void;
}) {
  const solved = Object.keys(progress.attempts).length;
  const mistakes = Object.values(progress.attempts).filter(
    (a) => !a.lastCorrect,
  ).length;
  const correct = Object.values(progress.attempts).reduce(
    (sum, a) => sum + a.correct,
    0,
  );
  const attempts = Object.values(progress.attempts).reduce(
    (sum, a) => sum + a.correct + a.incorrect,
    0,
  );
  return (
    <main className="home page-enter">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span /> Twój pierwszy krok za kierownicą
          </div>
          <h1>
            Najpierw zrozum.
            <br />
            Potem <em>jedź.</em>
          </h1>
          <p className="hero-description">
            Pierwszeństwo nie musi być zagadką.
            <br />
            Zobacz sytuację, podejmij decyzję i odkryj,
            <br className="desktop-break" /> co z czego wynika.
          </p>
          <button
            className="button primary hero-cta"
            onClick={() => onStart("learn")}
          >
            Zacznij naukę <Icon name="arrow" />
          </button>
          <div className="hero-reassurance">
            <span>
              <Icon name="check" size={15} /> Bez presji czasu
            </span>
            <span>
              <Icon name="check" size={15} /> We własnym tempie
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-label">
            <span className="live-dot" /> Zobacz. Zrozum. Zapamiętaj.
            <span className="visual-index">01 / {scenarios.length}</span>
          </div>
          <RoadScene scenario={scenarios[0]} interactive={false} compact />
          <div className="visual-bottom">
            <span className="small-car">A</span>
            <span className="small-car blue">B</span>
            <p>
              Dwie drogi. Jedna zasada.
              <small>Od prostych sytuacji do pewnych decyzji.</small>
            </p>
            <span className="visual-arrow">
              <Icon name="arrow" size={18} />
            </span>
          </div>
          <span className="visual-corner">KAT. B</span>
        </div>
      </section>
      <section className="progress-strip" aria-label="Twój postęp">
        <div className="progress-label">
          <span
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--accent) ${(solved / scenarios.length) * 360}deg, #2a3542 0deg)`,
            }}
          >
            <Icon name="road" />
          </span>
          <div>
            <strong>Małe kroki, duży postęp</strong>
            <span>
              {solved
                ? "Wracaj do sytuacji, które potrzebują jeszcze chwili."
                : "Każda sytuacja to jedna zasada bliżej."}
            </span>
          </div>
        </div>
        <div className="stat">
          <strong>
            {solved}
            <small> / {scenarios.length}</small>
          </strong>
          <span>poznanych sytuacji</span>
        </div>
        <div className="stat">
          <strong>
            {attempts ? `${Math.round((correct / attempts) * 100)}%` : "—"}
          </strong>
          <span>trafnych odpowiedzi</span>
        </div>
        <div className="stat">
          <strong>{mistakes}</strong>
          <span>do powtórki</span>
        </div>
      </section>
      <section className="learning-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Ty wybierasz tempo</span>
            <h2>Jak dziś ćwiczymy?</h2>
          </div>
          <button className="text-button" onClick={onIntro}>
            Jak to działa? <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="mode-cards">
          <button
            className="mode-card featured"
            onClick={() => onStart("learn")}
          >
            <span className="mode-icon">
              <Icon name="book" size={24} />
            </span>
            <span className="mode-meta">01 / Ucz się</span>
            <h3>Zrozum każdą sytuację</h3>
            <p>
              Zacznij od podstaw. Korzystaj z podpowiedzi i oglądaj wyjaśnienia
              krok po kroku.
            </p>
            <span className="card-footer">
              {scenarios.length} sytuacji · bez limitu czasu{" "}
              <Icon name="arrow" />
            </span>
          </button>
          <button className="mode-card" onClick={() => onStart("exam")}>
            <span className="mode-icon blue">
              <Icon name="target" size={24} />
            </span>
            <span className="mode-meta">02 / Sprawdź się</span>
            <h3>Sprawdź, co już wiesz</h3>
            <p>
              10 różnych zadań, bez podpowiedzi. Wynik i omówienie czekają na
              końcu.
            </p>
            <span className="card-footer">
              Ćwiczenie, nie egzamin <Icon name="arrow" />
            </span>
          </button>
          <button className="mode-card" onClick={() => onStart("mistakes")}>
            <span className="mode-icon amber">
              <Icon name="reset" size={24} />
            </span>
            <span className="mode-meta">03 / Powtórz błędy</span>
            <h3>Daj sobie drugą próbę</h3>
            <p>
              Wróć do trudniejszych sytuacji. Błąd to dobra wskazówka, czego
              jeszcze się nauczyć.
            </p>
            <span className="card-footer">
              {mistakes
                ? `${mistakes} sytuacji do powtórki`
                : "Twoje miejsce na spokojną powtórkę"}{" "}
              <Icon name="arrow" />
            </span>
          </button>
        </div>
      </section>
      <section className="topics">
        <span className="eyebrow">Na drodze do zrozumienia</span>
        <div>
          {[
            "Prawa strona",
            "Znaki i pierwszeństwo",
            "Skręt w lewo",
            "Światła",
            "Rondo",
            "Piesi",
            "Jazda na suwak",
          ].map((topic, i) => (
            <span key={topic}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              {topic}
            </span>
          ))}
        </div>
      </section>
      {progress.sessions.length > 0 && (
        <section className="session-history">
          <h2>Ostatnie ćwiczenia</h2>
          {[...progress.sessions]
            .reverse()
            .slice(0, 5)
            .map((session) => (
              <div key={session.id}>
                <span>
                  {new Date(session.at).toLocaleDateString("pl-PL")} ·{" "}
                  {new Date(session.at).toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <strong>
                  {session.attempts.filter((a) => a.correct).length} / 10
                </strong>
              </div>
            ))}
        </section>
      )}
      <footer>
        <span className="footer-logo">
          <Icon name="road" size={17} /> prawko{" "}
          <span>Ucz się zrozumienia.</span>
        </span>
        <button className="text-button" onClick={onReset}>
          Resetuj postęp
        </button>
        <span>Postęp zapisujemy tylko w tej przeglądarce.</span>
      </footer>
    </main>
  );
}
