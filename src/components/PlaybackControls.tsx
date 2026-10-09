import type { Playback } from "../hooks/usePlayback";
import { Icon } from "./Icon";
export function PlaybackControls({
  playback,
  speed,
  onSpeed,
}: {
  playback: Playback;
  speed: 0.5 | 1;
  onSpeed: (speed: 0.5 | 1) => void;
}) {
  return (
    <div className="playback-controls" aria-label="Sterowanie wyjaśnieniem">
      {!playback.reduced && (
        <button
          className="play-button"
          onClick={playback.toggle}
          aria-label={playback.playing ? "Pauza" : "Odtwórz"}
        >
          <Icon name={playback.playing ? "pause" : "play"} />
          <span>{playback.playing ? "Pauza" : "Odtwórz"}</span>
        </button>
      )}
      <button
        className="icon-button"
        onClick={playback.restart}
        aria-label="Od początku"
        title="Od początku"
      >
        <Icon name="reset" />
      </button>
      <button
        className="icon-button"
        onClick={playback.next}
        disabled={playback.finished}
        aria-label="Następny krok"
        title="Następny krok"
      >
        <Icon name="chevron" />
      </button>
      {!playback.reduced && (
        <div className="speed-control" aria-label="Prędkość animacji">
          {([0.5, 1] as const).map((value) => (
            <button
              key={value}
              onClick={() => onSpeed(value)}
              aria-pressed={speed === value}
            >
              {String(value).replace(".", ",")}×
            </button>
          ))}
        </div>
      )}
      {playback.reduced && (
        <span className="muted small">Tryb bez ruchu • przechodź krokami</span>
      )}
    </div>
  );
}
