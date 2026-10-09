import { expect, test, type Page } from "@playwright/test";
import { scenarios } from "../src/data/scenarios";
const key = "prawko.progress.v1";
test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => {
    throw error;
  });
  page.on("console", (message) => {
    if (message.type() === "error") throw new Error(message.text());
  });
});
const fresh = {
  version: 1,
  attempts: {},
  sessions: [],
  speed: 1,
  introSeen: true,
};
async function open(page: Page) {
  await page.addInitScript(
    ({ key, fresh }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(fresh));
    },
    { key, fresh },
  );
  await page.goto("/");
}
async function leave(page: Page) {
  await page
    .getByRole("button", { name: "Wróć do startu", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Wróć do startu", exact: true })
    .click();
}
async function answer(page: Page, ids: string[]) {
  const title = await page.locator(".exercise-heading h1").innerText();
  const scenario = scenarios.find((s) => s.title === title)!;
  for (const id of ids) {
    await page
      .getByRole("button", {
        name: scenario.question.options.find((o) => o.id === id)!.label,
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Zatwierdź odpowiedź" }).click();
}
test("wprowadzenie pozwala wybrać odpowiedź i odtworzyć niezapisywaną próbę", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Samochód A", exact: true }).click();
  await dialog.getByRole("button", { name: "Zatwierdź próbę" }).click();
  await dialog.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Pauza", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Rozumiem, zaczynamy" }).click();
  expect(
    JSON.parse(await page.evaluate((k) => localStorage.getItem(k)!, key))
      .attempts,
  ).toEqual({});
});
test("pełna nauka: podpowiedź, błędna i poprawna odpowiedź, animacja, powtórka, zapis i reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(page);
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  await expect(
    page.getByRole("button", { name: "Zatwierdź odpowiedź" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Potrzebuję podpowiedzi" }).click();
  await expect(page.locator(".hint")).toContainText("kierowcy A");
  await page
    .getByRole("button", { name: "A: od dołu, jedzie prosto", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Samochód A", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Zatwierdź odpowiedź" }).click();
  await expect(
    page.getByText("Zatrzymajmy się przy tej sytuacji."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await expect
    .poll(async () =>
      Number(
        await page.locator('[data-actor="B"]').getAttribute("data-progress"),
      ),
    )
    .toBeGreaterThan(0.04);
  await page.getByRole("button", { name: "Pauza", exact: true }).click();
  const before = await page
    .locator('[data-actor="B"]')
    .getAttribute("data-progress");
  await page.waitForTimeout(200);
  expect(
    await page.locator('[data-actor="B"]').getAttribute("data-progress"),
  ).toBe(before);
  await page.getByRole("button", { name: "Od początku", exact: true }).click();
  await expect(page.locator('[data-actor="B"]')).toHaveAttribute(
    "data-progress",
    "0.000",
  );
  await page
    .getByRole("button", { name: "Następny krok", exact: true })
    .click();
  await expect(page.locator(".step-copy")).toContainText("Krok 2");
  await page.getByRole("button", { name: "0,5×", exact: true }).click();
  await page
    .getByRole("button", { name: "Następne zadanie", exact: true })
    .click();
  await answer(page, ["B"]);
  await expect(page.getByText("Tak, ten wariant pasuje.")).toBeVisible();
  await leave(page);
  await page.reload();
  await expect(page.locator(".stat").first()).toContainText("2");
  await page.getByRole("button", { name: /03 \/ Powtórz błędy/ }).click();
  await expect(page.locator(".exercise-heading h1")).toHaveText(
    "Spójrz w prawo",
  );
  await answer(page, ["B"]);
  await page
    .getByRole("button", { name: "Zakończ ćwiczenie", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Wróć do startu", exact: true })
    .click();
  await page.getByRole("button", { name: /03 \/ Powtórz błędy/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Nie ma jeszcze błędów");
  await page.getByRole("button", { name: "Zamknij", exact: true }).click();
  await page
    .getByRole("button", { name: "Resetuj postęp", exact: true })
    .click();
  await page.getByRole("button", { name: "Zachowaj postęp" }).click();
  await expect(page.locator(".stat").first()).toContainText("2");
  await page
    .getByRole("button", { name: "Resetuj postęp", exact: true })
    .click();
  await page.getByRole("button", { name: "Tak, resetuj postęp" }).click();
  const saved = JSON.parse(
    await page.evaluate((k) => localStorage.getItem(k)!, key),
  );
  expect(saved.attempts).toEqual({});
  expect(saved.sessions).toEqual([]);
  expect(errors).toEqual([]);
});
test("10 różnych pytań, brak rozwiązań przed końcem, wynik i przegląd", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /02 \/ Sprawdź się/ }).click();
  const titles = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const title = await page.locator(".exercise-heading h1").innerText();
    titles.add(title);
    const scenario = scenarios.find((s) => s.title === title)!;
    await expect(
      page.getByRole("button", { name: "Potrzebuję podpowiedzi" }),
    ).toHaveCount(0);
    await answer(page, scenario.question.accepted[0]);
    await expect(
      page.getByText("Odpowiedź zapisana", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Prawidłowa odpowiedź/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Odtwórz", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator(".legal")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: i === 9 ? "Zakończ ćwiczenie" : "Następne zadanie",
        exact: true,
      })
      .click();
  }
  expect(titles.size).toBe(10);
  await expect(page.locator(".score>strong")).toHaveText("10");
  await page.locator(".review-list button").first().click();
  await expect(
    page.getByRole("heading", { name: /Prawidłowa odpowiedź/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await page
    .getByRole("button", { name: "Wyniki ćwiczenia", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Wróć do startu", exact: true })
    .click();
  await page.reload();
  await expect(page.locator(".session-history")).toContainText("10 / 10");
  const saved = JSON.parse(
    await page.evaluate((k) => localStorage.getItem(k)!, key),
  );
  expect(saved.sessions).toHaveLength(1);
  expect(
    Object.values(saved.attempts).reduce(
      (sum: number, a: unknown) => sum + (a as { correct: number }).correct,
      0,
    ),
  ).toBe(10);
});
test("wszystkie scenariusze: odpowiedzi, znaki, etapy i brak poziomego przewijania", async ({
  page,
}, testInfo) => {
  await open(page);
  await page.screenshot({
    path: `test-results/home-${testInfo.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".draft-banner")).toHaveCount(0);
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  for (let index = 0; index < scenarios.length; index++) {
    const scenario = scenarios[index];
    await expect(page.locator(".exercise-heading h1")).toHaveText(
      scenario.title,
    );
    await page.locator(".road-scene").screenshot({
      path: `test-results/scene-${scenario.id}-${testInfo.project.name}.png`,
      animations: "disabled",
    });
    for (const sign of scenario.signs) {
      await page.getByRole("button", { name: sign.label, exact: true }).click();
      await expect(page.locator(".sign-detail")).toContainText(sign.label);
      await page.getByRole("button", { name: "Zamknij opis znaku" }).click();
    }
    for (const signal of scenario.signals) {
      await page
        .getByRole("button", { name: signal.label, exact: true })
        .click();
      await expect(page.locator(".sign-detail")).toContainText(signal.label);
      await page.getByRole("button", { name: "Zamknij opis znaku" }).click();
    }
    await answer(page, scenario.question.accepted[0]);
    await expect(page.getByText("Tak, ten wariant pasuje.")).toBeVisible();
    await page.locator(".legal summary").click();
    await expect(page.locator(".legal")).toContainText("09.10.2026");
    await expect(page.locator(".legal-warning")).toHaveCount(0);
    for (const source of scenario.sources)
      await expect(
        page.locator(`.legal a[href="${source.url}"]`),
      ).toBeVisible();
    for (let step = 0; step < scenario.steps.length; step++)
      await page
        .getByRole("button", { name: "Następny krok", exact: true })
        .click();
    await expect(page.locator(".step-copy")).toContainText(
      "Sytuacja wyjaśniona",
    );
    for (const actor of scenario.participants.filter(
      (p) =>
        p.kind === "car" &&
        scenario.steps.some((step) => step.actors.includes(p.id)),
    )) {
      const outsideFrame = await page
        .locator(`[data-actor="${actor.id}"]`)
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const frame = element.closest("svg")!.getBoundingClientRect();
          return (
            bounds.right < frame.left ||
            bounds.left > frame.right ||
            bounds.bottom < frame.top ||
            bounds.top > frame.bottom
          );
        });
      expect(
        outsideFrame,
        `${scenario.id}: ${actor.id} wyjeżdża całkowicie poza kadr`,
      ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      scenario.id,
    ).toBe(true);
    if (index === 0 || scenario.id === "priority-bends")
      await page.screenshot({
        path: `test-results/${scenario.id}-${testInfo.project.name}.png`,
        fullPage: true,
        animations: "disabled",
      });
    await page
      .getByRole("button", {
        name:
          index === scenarios.length - 1
            ? "Zakończ ćwiczenie"
            : "Następne zadanie",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Cała seria za Tobą." }),
  ).toBeVisible();
});
test("uszkodzony zapis oraz niedostępny localStorage nie blokują aplikacji", async ({
  page,
}) => {
  await page.addInitScript((k) => localStorage.setItem(k, "{bad"), key);
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText(
    "Nie udało się odczytać postępu",
  );
  await page.getByRole("button", { name: "Pomiń wprowadzenie" }).click();
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  await answer(page, ["B"]);
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Access denied", "SecurityError");
      },
    }),
  );
  await page.reload();
  await expect(page.getByRole("status")).toContainText(
    "Zapis w przeglądarce jest niedostępny",
  );
  await page.getByRole("button", { name: "Pomiń wprowadzenie" }).click();
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  await answer(page, ["B"]);
  await expect(page.getByText("Tak, ten wariant pasuje.")).toBeVisible();
});
test("szybkie kliknięcia i zmiana zadania podczas odtwarzania nie dublują wyniku", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  await page.getByRole("button", { name: "Samochód B", exact: true }).click();
  await page
    .getByRole("button", { name: "Zatwierdź odpowiedź" })
    .evaluate((button) => {
      for (let i = 0; i < 8; i++) (button as HTMLButtonElement).click();
    });
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await page
    .getByRole("button", { name: "Następne zadanie", exact: true })
    .click();
  await expect(page.locator('[data-actor="B"]')).toHaveAttribute(
    "data-progress",
    "0.000",
  );
  const saved = JSON.parse(
    await page.evaluate((k) => localStorage.getItem(k)!, key),
  );
  expect(saved.attempts["right-hand-south"].correct).toBe(1);
  expect(Object.keys(saved.attempts)).toHaveLength(1);
});
test("klawiatura, powiększenie tekstu i preferencja ograniczenia ruchu", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await page.getByRole("button", { name: "Zacznij naukę" }).focus();
  await page.keyboard.press("Enter");
  const car = page.getByRole("button", {
    name: "B: z prawej, jedzie prosto",
    exact: true,
  });
  await car.focus();
  await page.keyboard.press("Space");
  await expect(car).toBeFocused();
  await expect(car).toHaveCSS("outline-style", "solid");
  await expect(car).toHaveCSS("outline-width", "3px");
  await expect(car).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Zatwierdź odpowiedź" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Odtwórz", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Tryb bez ruchu • przechodź krokami"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Następny krok", exact: true })
    .click();
  await expect(page.locator('[data-actor="B"]')).toHaveAttribute(
    "data-progress",
    "1.000",
  );
  await expect(page.locator('[data-actor="A"]')).toHaveAttribute(
    "data-progress",
    "0.000",
  );
  await page.evaluate(() => {
    const sizes = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter(
        (element) => element.namespaceURI === "http://www.w3.org/1999/xhtml",
      )
      .map((element) => ({
        element,
        size: parseFloat(getComputedStyle(element).fontSize),
      }));
    for (const { element, size } of sizes)
      element.style.fontSize = `${size * 2}px`;
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("dotknięcie auta nie nakłada prostokątnego podświetlenia przeglądarki", async ({
  page,
}, testInfo) => {
  await open(page);
  await page.getByRole("button", { name: "Zacznij naukę" }).click();
  for (const index of [0, 1, 2]) {
    const scene = page.locator(".road-scene");
    for (const id of ["A", "B", "A"]) {
      const car = scene.locator(`[data-actor="${id}"]`);
      if (testInfo.project.name === "mobile") await car.tap();
      else await car.click();
      // Safari highlights a clickable SVG group's whole bounding rectangle.
      // Check the inherited property on the actual painted surface as well.
      await expect(car).toHaveCSS(
        "-webkit-tap-highlight-color",
        "rgba(0, 0, 0, 0)",
      );
      await expect(car.locator("polygon").last()).toHaveCSS(
        "-webkit-tap-highlight-color",
        "rgba(0, 0, 0, 0)",
      );
      if (index < 2) await expect(car).toHaveAttribute("aria-pressed", "true");
      else await expect(car).toHaveAttribute("role", "img");
      if (testInfo.project.name === "mobile") {
        await expect(car).toHaveCSS("filter", "none");
        await expect(car).toHaveCSS("outline-style", "none");
      }
    }
    await scene.screenshot({
      path: `test-results/tap-${index}-${testInfo.project.name}.png`,
    });
    if (index < 2) {
      await answer(page, scenarios[index].question.accepted[0]);
      await page
        .getByRole("button", { name: "Następne zadanie", exact: true })
        .click();
    }
  }
});
