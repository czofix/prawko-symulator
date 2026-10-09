import type { Scenario } from "../domain/types";
export function LegalDetails({ scenario }: { scenario: Scenario }) {
  return (
    <details className="legal">
      <summary>Dlaczego? / Podstawa prawna</summary>
      {scenario.verification === "draft" && (
        <p className="legal-warning">
          Materiał roboczy. Nie zweryfikowano aktualnego brzmienia przepisów ani
          zmian obowiązujących w dniu 09.10.2026. Poniższe przepisy są
          wskazaniami do weryfikacji, a nie potwierdzoną podstawą odpowiedzi.
        </p>
      )}
      {scenario.verification === "verified" && (
        <p>
          Sprawdzono wskazane przepisy wraz z późniejszymi nowelizacjami. Źródła
          poniżej prowadzą do oficjalnych tekstów; nie są to pytania z
          państwowego egzaminu.
        </p>
      )}
      {scenario.sources.map((source) => (
        <div className="source" key={source.provision}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.title} ↗
          </a>
          <strong>{source.provision}</strong>
          <span>
            Data sprawdzenia:{" "}
            {source.checkedAt?.split("-").reverse().join(".") ??
              "nie sprawdzono"}
          </span>
        </div>
      ))}
    </details>
  );
}
