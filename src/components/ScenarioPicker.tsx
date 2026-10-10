import { scenarios, scenarioNumber } from "../data/scenarios";
import { categories } from "../data/scenarios/helpers";
import type { Progress } from "../domain/types";
export interface ScenarioFilters {
  category: string;
  difficulty: string;
}
export function ScenarioPicker({
  progress,
  filters,
  onFilters,
  onStart,
  onBack,
}: {
  progress: Progress;
  filters: ScenarioFilters;
  onFilters: (f: ScenarioFilters) => void;
  onStart: (id: string) => void;
  onBack: () => void;
}) {
  const visible = scenarios.filter(
    (s) =>
      (!filters.category || s.category === filters.category) &&
      (!filters.difficulty || s.difficulty === Number(filters.difficulty)),
  );
  const solved = scenarios.filter((s) => progress.attempts[s.id]).length;
  const correct = scenarios.filter(
    (s) => progress.attempts[s.id]?.lastCorrect,
  ).length;
  const difficulty = ["", "Podstawy", "Łączenie zasad", "Złożona sytuacja"];
  return (
    <main className="scenario-picker page-enter">
      <button className="text-button back" onClick={onBack}>
        ← Wróć do startu
      </button>
      <span className="eyebrow">Twoja droga do pewności</span>
      <h1>Wybierz sytuację</h1>
      <p>Ucz się po kolei lub wybierz zasadę, którą chcesz przećwiczyć.</p>
      <p>
        Poznane:{" "}
        <strong>
          {solved} / {scenarios.length}
        </strong>{" "}
        · Poprawna ostatnia odpowiedź: <strong>{correct}</strong>
      </p>
      <progress
        value={solved}
        max={scenarios.length}
        aria-label="Postęp nauki"
      />
      <div className="picker-filters">
        <div>
          <label htmlFor="scenario-category">Kategoria</label>
          <select
            id="scenario-category"
            value={filters.category}
            onChange={(e) =>
              onFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scenario-difficulty">Trudność</label>
          <select
            id="scenario-difficulty"
            value={filters.difficulty}
            onChange={(e) =>
              onFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="">Każda trudność</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {difficulty[n]}
              </option>
            ))}
          </select>
        </div>
        <button
          className="button secondary"
          onClick={() => onFilters({ category: "", difficulty: "" })}
        >
          Wyczyść filtry
        </button>
      </div>
      <p role="status">
        Widoczne sytuacje: {visible.length} z {scenarios.length}
      </p>
      {!visible.length && (
        <p>
          Nie ma sytuacji spełniających te filtry. Wybierz inną kategorię lub
          trudność.
        </p>
      )}
      {categories.map((category) => {
        const group = visible.filter((s) => s.category === category);
        return (
          group.length > 0 && (
            <section key={category}>
              <h2>
                {category} <small>({group.length})</small>
              </h2>
              <div className="level-grid">
                {group.map((s) => {
                  const attempt = progress.attempts[s.id];
                  return (
                    <button
                      className="level-card"
                      key={s.id}
                      data-scenario-id={s.id}
                      onClick={() => onStart(s.id)}
                    >
                      <span className="level-number">
                        Poziom {scenarioNumber.get(s.id)}
                      </span>
                      <strong>{s.title}</strong>
                      <span>{difficulty[s.difficulty]}</span>
                      <span
                        className={
                          attempt
                            ? attempt.lastCorrect
                              ? "level-correct"
                              : "level-repeat"
                            : ""
                        }
                      >
                        {!attempt
                          ? "Nierozwiązany"
                          : attempt.lastCorrect
                            ? "✓ Poprawna ostatnia odpowiedź"
                            : "↻ Do powtórki"}
                      </span>
                      <span className="level-open">Otwórz sytuację →</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )
        );
      })}
    </main>
  );
}
