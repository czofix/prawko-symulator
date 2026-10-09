# Sprawdzenia techniczne

Wykonano 9 października 2026 w środowisku Linux, Node.js 24.19.0, npm 11.9.0 i systemowym Chromium.

## Wyniki

- `npm ci --no-fund --no-audit` — instalacja z lockfile, ponownie wykonana pomyślnie.
- `npm run typecheck` — TypeScript strict, bez błędów.
- `npm run lint` — ESLint, bez błędów.
- `npm test` — 51 zaliczonych testów w 5 plikach po zmianie wyglądu plansz.
- `npm run build` — pomyślny build Vite, pliki w `dist/`.
- `npm run test:e2e` — 16 zaliczonych testów: 8 ścieżek na desktopie i 8 na telefonicznym rozmiarze ekranu. Testy uruchamiają aktualny build produkcyjny.
- `npm audit` — w chwili sprawdzenia 0 znanych podatności w zależnościach produkcyjnych i deweloperskich. Nie jest to gwarancja bezpieczeństwa całego produktu.
- Start serwera developerskiego na porcie 5173, pobranie HTML i modułu wejściowego — pomyślne. Serwer po ponownym uruchomieniu odpowiada.

## Zakres

Testy logiki sprawdzają akceptowanie różnych poprawnych kolejności, odróżnienie sekwencji od zbioru odpowiedzi, odrzucenie duplikatów i nieznanych opcji, losowanie bez powtórzeń, walidację postępu, błędy magazynu, limit rozmiaru i historii, stabilność identyfikatorów oraz zapobieganie ponownemu zapisowi tej samej sesji.

Dla wszystkich 16 scenariuszy sprawdzono model danych, wskazania źródeł, daty i oznaczenie wykonanego przeglądu prawnego i zgodność ruchu z oczekiwaną kolejnością. Dla pytań o kolejność oraz o pierwszy pojazd animowany wariant jest również oceniany przez właściwy silnik oceniania. Próbkowanie torów sprawdza ciągłość ruchu i odstęp od pozostałych uczestników, z uwzględnieniem jednoczesnego przejazdu. Dodano testy zakończenia sygnalizowania po ostatnim łuku oraz rzeczywistej kolizji toru C z A i B przy łamanym pierwszeństwie. Testy przeglądarkowe sprawdzają daty i linki źródeł w każdym zadaniu. Przejrzano także komplet 16 rysunków: układ jezdni, znaki, światła, kierunkowskazy, pozycje i tory.

Testy w przeglądarce (1440 × 1000 i 390 × 844):

1. Wprowadzenie z próbnym wyborem i odtwarzaniem, bez zapisywania wyniku.
2. Początek nauki, brak zatwierdzenia pustej odpowiedzi, wybór na SVG i przyciskami, podpowiedź, poprawna i błędna odpowiedź.
3. Odtwarzanie rzeczywistego ruchu, pauza i zatrzymanie pozycji, restart, następny krok i zmiana prędkości.
4. Następne zadanie, ponowne załadowanie strony i zachowany postęp.
5. Powtórka błędów, usunięcie zadania z powtórek po poprawieniu odpowiedzi, pusty stan powtórek.
6. Reset z potwierdzeniem i anulowaniem.
7. Pełna sesja 10 różnych zadań, brak podpowiedzi, ocen i animacji przed końcem, podsumowanie i przegląd, brak naliczania wyniku podczas przeglądu.
8. Wszystkie 16 scenariuszy: dotykanie znaków, odpowiedzi i zakończenie etapów; brak poziomego przewijania.
9. Uszkodzony zapis i odmowa dostępu do `localStorage`; możliwość dalszego ćwiczenia.
10. Osiem szybkich kliknięć zatwierdzenia: naliczenie jednej próby; zmiana zadania podczas odtwarzania bez przenoszenia animacji.
11. Wybór i zatwierdzenie klawiaturą, statyczne kroki przy `prefers-reduced-motion`, dwukrotne powiększenie rozmiaru tekstu HTML bez poziomego przewijania.
12. Nasłuchiwanie błędów JavaScript i komunikatów `console.error` podczas każdej ścieżki — brak takich błędów.

Wykonano przegląd wizualny ekranu startowego na obu rozmiarach i widoku ćwiczenia. Poprawiono między innymi obszary dotykowe znaków, przypisanie tabliczek do wlotów, asfalt wokół wyspy ronda i ukrywanie linku pomijającego nawigację.

## Przestrzenny wygląd plansz

Po przebudowie SVG ponownie zaliczono kontrolę typów, lint, 51 testów logiki/geometrii oraz wszystkie 14 testów przeglądarkowych z produkcyjnym buildem. Obejrzano komplet plansz i ekran startowy, w tym układ znaków z tabliczkami oraz rondo na małym ekranie. Zachowano dane scenariuszy i ocenianie odpowiedzi.

Nowe testy sprawdzają wspólną projekcję drogi i auta, zgodność kierunku nadwozia z ruchem po łuku, wyjazd całej bryły poza kadr, zachowanie pozycji początkowych i toru pieszego oraz wyłączenie kierunkowskazu w tym samym miejscu drogi po wydłużeniu końcowego wyjazdu. W przeglądarce dla każdego scenariusza sprawdzane są też opisy sygnalizatorów i rzeczywiste położenie końcowe samochodów poza widoczną planszą.

## Niewykonane / ograniczenia

Po zgłoszeniu prostokątnego podświetlenia aut na nagraniu telefonu dodano test wielokrotnego wyboru A/B/A w pierwszych trzech pytaniach, w tym dotykania auta, które nie jest opcją odpowiedzi. Test przed poprawką wykrył nieprzezroczyste natywne podświetlenie SVG; po poprawce przeszedł na obu rozmiarach. Przezroczyste `-webkit-tap-highlight-color` jest dziedziczone przez całą planszę, a dodatkowy filtr CSS `brightness` na grupach SVG został usunięty. Własne zaznaczenie odpowiedzi i widoczny fokus klawiatury pozostały. Ponownie przeszły typy, lint, 51 testów logiki oraz 16 testów przeglądarkowych z buildem produkcyjnym. Obejrzano zrzut po dotknięciu auta w drugim pytaniu.

Dodatkowy przegląd wykazał też domyślny obrys `outline: auto` grupy SVG po dotknięciu. Usunięto go wyłącznie dla `:focus:not(:focus-visible)`; test klawiatury wymaga nadal widocznego obrysu o grubości 3 px. Test dotyku sprawdza brak zarówno natywnej nakładki, jak i domyślnego prostokątnego obrysu.

Próba zainstalowania WebKit do dodatkowego odtworzenia problemu została zablokowana odpowiedzią 403 polityki sieciowej dla serwerów pobierania Playwright. Test regresji wykonano w Chromium z emulacją dotyku; nie potwierdza to testu na fizycznym iPhonie ani w Safari.

- Przegląd prawny wykonano osobno od testów technicznych, po przywróceniu dostępu do oficjalnych źródeł. Obejmuje 16 opisanych sytuacji i stan sprawdzony 09.10.2026, nie certyfikację ani wszystkie możliwe zdarzenia drogowe. Patrz [LEGAL_REVIEW.md](LEGAL_REVIEW.md).
- Nie wykonano testów na fizycznym telefonie, Safari ani Firefox. Test telefoniczny emuluje rozmiar i dotyk w Chromium.
- Nie wykonano zewnętrznego audytu WCAG ani testów z rzeczywistym czytnikiem ekranu.
- Poprzednia wersja została opublikowana przez GitHub Pages, co użytkownik potwierdził zrzutem udanego wdrożenia. Wysłanie aktualizacji na `main` uruchamia kolejne wdrożenie; lokalne testy nie potwierdzają jego zakończenia. Dostęp z tego środowiska do API GitHuba i domeny strony jest ograniczony.
- Pełna sesja w toku nie jest wznawiana po odświeżeniu; zachowane są zatwierdzone próby i ukończone sesje.
