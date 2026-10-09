import { useRef, useState } from "react";
import { emptyProgress, loadProgress, saveProgress } from "../domain/progress";
import { scenarios } from "../data/scenarios";
import type { Progress } from "../domain/types";
const ids = new Set(scenarios.map((s) => s.id));
export function useProgress() {
  const [initial] = useState(() => {
    try {
      return loadProgress(window.localStorage, ids);
    } catch {
      return {
        progress: emptyProgress(),
        warning:
          "Zapis w przeglądarce jest niedostępny. Postęp zachowamy tylko w tej sesji.",
      };
    }
  });
  const [progress, setProgress] = useState(initial.progress);
  const [warning, setWarning] = useState(initial.warning);
  const current = useRef(progress);
  const update = (change: (old: Progress) => Progress) => {
    const next = change(current.current);
    current.current = next;
    setProgress(next);
    let saved = false;
    try {
      saved = saveProgress(window.localStorage, next);
    } catch {
      /* Storage access itself can throw. */
    }
    if (!saved)
      setWarning(
        "Zapis w przeglądarce jest niedostępny. Postęp zachowamy tylko w tej sesji.",
      );
  };
  return { progress, update, warning };
}
