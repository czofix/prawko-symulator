import { writeFileSync } from "node:fs";
import type { Scenario } from "../src/domain/types";
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function writeVisualReview(scenarios: Scenario[], project: string) {
  const cards = scenarios
    .map(
      (s, i) =>
        `<article><h2>${i + 1}. ${escape(s.title)}</h2><p>${escape(s.category)} · trudność ${s.difficulty}</p><a href="scene-${s.id}-${project}.png"><img loading="lazy" src="scene-${s.id}-${project}.png" alt="${escape(s.title)}"></a><p>${escape(s.description)}</p><details><summary>Rozwiązanie i kontrola</summary><p>${escape(s.answerLabel)}</p><p>Etapy: ${s.steps.map((x) => escape(x.actors.join(" + ") || "oczekiwanie")).join(" → ")}</p><p>${s.sources.map((x) => escape(x.provision)).join("; ")}</p><code>${s.id}</code></details></article>`,
    )
    .join("");
  writeFileSync(
    `test-results/scene-review-${project}.html`,
    `<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>60 plansz — ${project}</title><style>body{background:#10202c;color:#e7f1f5;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{background:#1b303f;border-radius:16px;padding:18px}img{width:100%;border-radius:12px}h2{font-size:20px}summary{cursor:pointer}p{line-height:1.5}</style><h1>60 sytuacji — ${project}</h1><main>${cards}</main></html>`,
  );
}
