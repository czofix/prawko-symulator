# Prawko — symulator sytuacji drogowych

Responsywna aplikacja po polsku: React, TypeScript, Vite, rysunki SVG. Bez backendu, kont, zewnętrznych fontów i usług analitycznych. Zapis postępu wyłącznie w przeglądarce.

> **Treści sprawdzono 9 października 2026.** Wszystkie 16 scenariuszy porównano z oficjalnymi tekstami ustawy i rozporządzenia oraz późniejszymi nowelizacjami, także z 2026 r. Każde zadanie zawiera przepis, link i datę sprawdzenia. Zakres, uwzględnione zmiany i rejestr dokumentów: [docs/LEGAL_REVIEW.md](docs/LEGAL_REVIEW.md). Aplikacja służy ćwiczeniom; nie jest państwową bazą pytań egzaminacyjnych.

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

- `src/data/scenarios.ts` — 16 stabilnych identyfikatorów, opisy, pytania, dopuszczone odpowiedzi, tory, kroki i wskazania źródeł.
- `src/domain/` — niezależna ocena odpowiedzi, geometria, walidacja scenariuszy i wersjonowanie zapisu.
- `src/hooks/` — bezpieczny zapis i odtwarzanie z `requestAnimationFrame`, czyszczeniem i `prefers-reduced-motion`.
- `src/components/` — plansza, pytanie, sterowanie, wprowadzenie i sekcja prawna.
- `src/App.tsx` — przejścia między trybami i sesjami; osłona wielokrotnego naliczania wyników.
- `tests/`, `e2e/` — logika oraz rzeczywiste interakcje w przeglądarce.

## Dodawanie zadania

Dodaj obiekt typu `Scenario` do puli z nowym, stabilnym `id`. Określ `geometry`, uczestników, znaki, światła, pytanie oraz niepuste `accepted`. W pytaniu `order` kolejność ma znaczenie; w `multiple` wybór jest zbiorem. `steps` opisuje rzeczywisty przejazd wybranego poprawnego wariantu. Uczestnik może wystąpić w jednym etapie; pojazd stojący na czerwonym nie musi poruszać się wcale. Nie wszystkie sytuacje powinny kończyć się przejazdem wszystkich pojazdów.

Weryfikuj źródła i daty osobno od testów technicznych. `verification: 'verified'` wymaga rzeczywistego sprawdzenia obowiązującego prawa i daty `checkedAt` dla każdego źródła. Dodaj przypadek kontrolny kolejności ruchu w `tests/scenarios.test.ts` oraz sprawdź cały rysunek i animację.

## Zapis i prywatność

Klucz `prawko.progress.v1` zawiera wersję schematu, liczniki prób po identyfikatorach scenariuszy, ostatni wynik, do 20 sesji, wybraną prędkość i status wprowadzenia. Błędy parsowania, nieprawidłowe typy, zbyt duży zapis i odmowa dostępu nie blokują aplikacji. Nie używamy `dangerouslySetInnerHTML` ani nie wysyłamy postępu do sieci. Poprawna powtórka usuwa zadanie z bieżącej listy błędów, zachowując historyczne liczniki.

Odświeżenie zachowuje zatwierdzone próby i ukończone sesje, ale rozpoczyna widok od strony głównej. Niezakończone ćwiczenie 10 pytań nie jest wznawiane. Przegląd szczegółowych odpowiedzi jest dostępny po zakończeniu bieżącego ćwiczenia; historia na stronie głównej pokazuje wyniki.
