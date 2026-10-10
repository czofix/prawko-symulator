import { useState } from "react";
import { scenarios } from "../data/scenarios";
import { usePlayback } from "../hooks/usePlayback";
import { Dialog } from "./Dialog";
import { RoadScene } from "./RoadScene";
import { PlaybackControls } from "./PlaybackControls";
export function Intro({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const playback = usePlayback(scenarios[0], speed, confirmed);
  return (
    <Dialog title="Najpierw mała próba" onClose={onClose} wide>
      <div className="intro-grid">
        <RoadScene
          scenario={scenarios[0]}
          selected={selected}
          onSelect={(id) => setSelected([id])}
          playback={confirmed ? playback : undefined}
          interactive={!confirmed}
          compact
        />
        <div>
          <span className="eyebrow">30 sekund na dobry początek</span>
          <h3>
            {confirmed ? "Teraz zobacz wyjaśnienie" : "Dotknij samochodu"}
          </h3>
          <p>
            {confirmed
              ? "Po zatwierdzeniu możesz odtworzyć sytuację, zatrzymać ją i przechodzić krok po kroku. Ta próba nie zapisuje wyniku."
              : "Wybierz A lub B na rysunku albo poniżej. Możesz zmienić wybór, dopóki go nie zatwierdzisz."}
          </p>
          {!confirmed ? (
            <>
              <div className="intro-options">
                {["A", "B"].map((id) => (
                  <button
                    className={`answer ${selected.includes(id) ? "selected" : ""}`}
                    key={id}
                    onClick={() => setSelected([id])}
                    aria-pressed={selected.includes(id)}
                  >
                    Samochód {id}
                  </button>
                ))}
              </div>
              <button
                className="button primary"
                disabled={!selected.length}
                onClick={() => setConfirmed(true)}
              >
                Zatwierdź próbę
              </button>
            </>
          ) : (
            <>
              <p className="hint">
                B przejeżdża przed A, ponieważ nadjeżdża z jego prawej strony.
                Odtwórz przejazd i zobacz tę zależność.
              </p>
              <PlaybackControls
                playback={playback}
                speed={speed}
                onSpeed={setSpeed}
              />
              <p aria-live="polite">
                {playback.finished
                  ? "Gotowe. Tak działa wyjaśnienie."
                  : scenarios[0].steps[playback.index].text}
              </p>
              <button className="button primary" onClick={onClose}>
                Rozumiem, zaczynamy
              </button>
            </>
          )}
          <button className="text-button intro-skip" onClick={onClose}>
            Pomiń wprowadzenie
          </button>
        </div>
      </div>
    </Dialog>
  );
}
