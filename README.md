# Prawko — symulator sytuacji drogowych

Responsywna aplikacja po polsku: React, TypeScript, Vite, przestrzenne plansze SVG. Samochody z bryłą nadwozia, szybami, kołami i światłami poruszają się po torach jazdy w otoczeniu asfaltu, chodników i zieleni. Bez backendu, kont, zewnętrznych fontów i usług analitycznych. Zapis postępu wyłącznie w przeglądarce.

> **60 pełnych sytuacji.** Nowe 44 zadania sprawdzono 10 października 2026 w oficjalnych tekstach i późniejszych nowelizacjach. Zachowano 16 pierwotnych identyfikatorów i ich datę sprawdzenia 09.10.2026. Każde zadanie ma przepis, link i datę. Szczegóły: [weryfikacja prawna](docs/LEGAL_REVIEW.md). To symulator edukacyjny, nie państwowa baza pytań egzaminacyjnych.

## Uruchomienie

Wymagany Node.js 22.12+ (środowisko testowe: 24.19.0, wersja w `.nvmrc`).

```sh
npm ci
npm run dev
```

Serwer deweloperski domyślnie nasłuchuje na porcie 5173. Nie są potrzebne sekrety ani zmienne środowiskowe aplikacji. W środowisku chmurowym, gdy katalog domowy jest tylko do odczytu, użyj `npm_config_cache=/workspace/.npm-cache npm ci`.

## Weryfikacja

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright uruchamia podgląd **produkcyjnego builda** na porcie 4173. Testuje desktop 1440 × 1000 oraz telefon 390 × 844. W chmurze korzysta z systemowego Chromium. Lokalnie można zainstalować przeglądarkę przez `npx playwright install chromium`; opcjonalna zmienna `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` wskazuje własną instalację.

Raport HTML: `playwright-report/index.html`; zrzuty ekranów i ślady niepowodzeń: `test-results/`. Pliki te są ignorowane przez Git. Lista sprawdzeń: [docs/VALIDATION.md](docs/VALIDATION.md).

## Build i wdrożenie

```sh
npm run build
npm run preview
```

Opublikuj **zawartość `dist/`** na dowolnym hostingu plików statycznych z HTTPS. Nie trzeba wdrażać Node.js ani bazy danych. Podgląd Vite służy do lokalnego sprawdzenia, nie jako serwer produkcyjny. Aplikacja nie używa tras URL, więc nie wymaga przekierowania wszystkich ścieżek na `index.html`. Względna baza zasobów pozwala wdrażać w podkatalogu.

Zalecane nagłówki hostingu: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` oraz CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`. `unsafe-inline` dotyczy tylko stylów dynamicznych SVG i wskaźników; skrypty inline nie są wymagane. Dla `index.html` ustaw rewalidację, dla haszowanych `assets/` długi cache immutable.

### GitHub Pages

Repozytorium zawiera automatyczną publikację w `.github/workflows/pages.yml`. Docelowy adres: **https://czofix.github.io/prawko-symulator/** (będzie dostępny po włączeniu Pages i pierwszym udanym wdrożeniu).

Jednorazowe włączenie:

1. Otwórz [Settings → Pages](https://github.com/czofix/prawko-symulator/settings/pages).
2. W sekcji **Build and deployment → Source** wybierz **GitHub Actions**. Nie trzeba tworzyć dodatkowego workflow proponowanego przez GitHuba.
3. Otwórz [workflow publikacji](https://github.com/czofix/prawko-symulator/actions/workflows/pages.yml), wybierz **Run workflow**, gałąź `main` i potwierdź **Run workflow**.
4. Poczekaj na zielony wynik zadań budowania i publikacji. Adres strony znajdziesz także przy wdrożeniu `github-pages`.

Kolejne zmiany wysłane na `main` uruchamiają publikację automatycznie. Przed publikacją wykonywane są kontrola typów, lint, testy logiki oraz testy przeglądarkowe produkcyjnego builda. Błąd tych kontroli zatrzymuje wdrożenie. Publikowane są wyłącznie pliki z `dist/`; nie trzeba dodawać własnych tokenów ani sekretów. GitHub Pages ustawia własne nagłówki HTTP i nie obsługuje dowolnej konfiguracji nagłówków opisanej powyżej.

## Struktura

- `src/data/scenarios.ts` — 60 stabilnych identyfikatorów, opisy, pytania, dopuszczone odpowiedzi, tory, kroki i wskazania źródeł.
- `src/domain/` — niezależna ocena odpowiedzi, geometria, walidacja scenariuszy i wersjonowanie zapisu.
- `src/hooks/` — bezpieczny zapis i odtwarzanie z `requestAnimationFrame`, czyszczeniem i `prefers-reduced-motion`.
- `src/components/` — plansza, pytanie, sterowanie, wprowadzenie i sekcja prawna.
- `src/components/scene/` — wspólna projekcja przestrzenna, model samochodu, materiały, zieleń, znaki i dopasowanie wyjazdu do kadru. Szczegóły: [docs/VISUAL_DESIGN.md](docs/VISUAL_DESIGN.md).
- `src/App.tsx` — przejścia między trybami i sesjami; osłona wielokrotnego naliczania wyników.
- `tests/`, `e2e/` — logika oraz rzeczywiste interakcje w przeglądarce.

## Dodawanie zadania

Dodaj obiekt typu `Scenario` do puli z nowym, stabilnym `id`. Określ `geometry`, uczestników, znaki, światła, pytanie oraz niepuste `accepted`. W pytaniu `order` kolejność ma znaczenie; w `multiple` wybór jest zbiorem. `steps` opisuje rzeczywisty przejazd wybranego poprawnego wariantu. Uczestnik może wystąpić w jednym etapie; pojazd stojący na czerwonym nie musi poruszać się wcale. Nie wszystkie sytuacje powinny kończyć się przejazdem wszystkich pojazdów.

Weryfikuj źródła i daty osobno od testów technicznych. `verification: 'verified'` wymaga rzeczywistego sprawdzenia obowiązującego prawa i daty `checkedAt` dla każdego źródła. Dodaj przypadek kontrolny kolejności ruchu w `tests/scenarios.test.ts` oraz sprawdź cały rysunek i animację.

## Zapis i prywatność

Klucz `prawko.progress.v1` zawiera wersję schematu, liczniki prób po identyfikatorach scenariuszy, ostatni wynik, do 20 sesji, wybraną prędkość i status wprowadzenia. Błędy parsowania, nieprawidłowe typy, zbyt duży zapis i odmowa dostępu nie blokują aplikacji. Nie używamy `dangerouslySetInnerHTML` ani nie wysyłamy postępu do sieci. Poprawna powtórka usuwa zadanie z bieżącej listy błędów, zachowując historyczne liczniki.

Odświeżenie zachowuje zatwierdzone próby i ukończone sesje, ale rozpoczyna widok od strony głównej. Niezakończone ćwiczenie 10 pytań nie jest wznawiane. Przegląd szczegółowych odpowiedzi jest dostępny po zakończeniu bieżącego ćwiczenia; historia na stronie głównej pokazuje wyniki.


## 60 sytuacji i wybór poziomu

Pula zawiera dokładnie 60 sytuacji: równorzędne i skręty **10**, znaki i pierwszeństwo **10**, łamane pierwszeństwo **8**, sygnalizacja **10**, ronda **8**, piesi i rowerzyści **8**, pasy i włączanie się **6**. [Katalog](docs/SCENARIO_CATALOG.md) podaje każde zadanie i podstawę prawną. Nowe 44 sytuacje sprawdzono w oficjalnych źródłach 10.10.2026; szczegóły i nowelizacje w [przeglądzie prawnym](docs/LEGAL_REVIEW.md).

„Wybierz sytuację” umożliwia filtrowanie kategorii i trudności, pokazuje poziomy 1–60 oraz status ostatniej odpowiedzi. Można zacząć dowolne zadanie, wrócić do listy z zachowanymi filtrami i przejść do poprzedniej sytuacji. Wszystkie tryby korzystają z całej puli; ćwiczenie losuje 10 różnych pytań.

Prędkości odtwarzania: **0,5× / 1× / 2×**. Tryb 2× skraca czas etapów i ruchu o połowę bez zmiany kolejności. Działają pauza, restart i kolejne kroki; wybór zapisuje się w localStorage. Preferencja ograniczania ruchu nadal włącza statyczne etapy.

Format `prawko.progress.v1` pozostaje w wersji 1. Zachowano wszystkie pierwotne identyfikatory; numer poziomu jest oddzielny od klucza zapisu. Stare wyniki i historia pozostają czytelne, dodano tylko akceptowanie prędkości 2.

Dane są podzielone na pliki tematyczne w `src/data/scenarios/`; `legacy.ts` zachowuje pierwotne 16 zadań. `src/data/scenarios.ts` składa i waliduje pulę. Świadome przyszłe rozszerzenie ponad 60 wymaga zmiany ograniczenia liczby i testu. Model wspiera rowerzystów, przejazdy, S-2/S-3, nieruchome pojazdy i wyjazd z posesji.

Po `npm run test:e2e` otwórz `test-results/scene-review-desktop.html` lub `test-results/scene-review-mobile.html`, aby obejrzeć komplet 60 plansz z opisami i rozwiązaniami. Pliki raportów są generowane i ignorowane przez Git.
