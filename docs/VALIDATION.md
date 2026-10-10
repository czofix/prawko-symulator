# Sprawdzenia techniczne

## Rozszerzenie do 60 sytuacji — 10.10.2026

Środowisko: Node.js 24.19.0, npm 11.9.0, Linux i systemowy Chromium. Wykonano ponownie na odtworzonej, zapisanej w Git wersji:

- `npm run typecheck` — bez błędów.
- `npm run lint` — bez błędów.
- `npm test` — **146 testów w 6 plikach**, wszystkie zaliczone.
- `npm run build` — pomyślny build produkcyjny.
- `npm run test:e2e` — **22 testy**, po 11 na desktopie 1440 × 1000 i w emulacji telefonu 390 × 844. Testy uruchamiają podgląd aktualnego builda produkcyjnego.

Testy sprawdzają dokładnie 60 unikalnych identyfikatorów, zachowanie 16 pierwotnych, podział kategorii, źródła i właściwe daty, dopuszczalne odpowiedzi oraz zgodność animowanej kolejności z ocenianiem. Dla wszystkich torów próbkowane są pozycje uczestników, także przy ruchu jednoczesnym i z uwzględnieniem przedłużonego wyjazdu poza kadr. Walidator odrzuca m.in. ruch na czerwonym, ruch zadeklarowanego nieruchomego auta i brak kierunku S-3.

Osobny test czasu symuluje klatki wszystkich 60 animacji przy 1× i 2×: czas jest o połowę krótszy, a sekwencja etapów identyczna. Przeglądarka sprawdza pozycję w połowie przejazdu, zakończenie, pauzę, restart, następny krok, powrót do 1×, następne zadanie i zachowanie 2× po odświeżeniu. Nowe animacje rowerów, ronda, posesji i grup równoczesnych odtworzono przy 2× na obu rozmiarach; czekający pozostają nieruchomi.

Test wyboru poziomu obejmuje 60 kart, filtrowanie, dowolny start, powrót z zachowanymi filtrami, poprzednie zadanie i stary zapis poprawnych/błędnych odpowiedzi. Pozostałe testy obejmują ćwiczenie 10 różnych zadań bez ujawniania odpowiedzi, powtórki, reset, niedostępny/uszkodzony magazyn, szybkie kliknięcia, klawiaturę, powiększenie tekstu, ograniczenie ruchu i brak błędów konsoli.

Przygotowano i obejrzano przegląd wszystkich 60 plansz na obu rozmiarach. Galerie można odtworzyć testami: `test-results/scene-review-desktop.html` i `test-results/scene-review-mobile.html`. Obejrzano także listę poziomów i zrzuty nowych typów w trakcie ruchu. Poprawiono m.in. położenie znaku D-6 przy zjeździe z ronda, aby nie zasłaniał pieszego, oraz spójność oznakowania i manewrów zadania z trzema autami na drogach o różnym statusie.

Ograniczenia: testy telefoniczne są emulacją Chromium, nie testem fizycznego telefonu ani Safari/Firefox. Przegląd prawny oparto na oficjalnych dokumentach; nie ma niezależnej certyfikacji instruktorskiej ani audytu czytnikiem ekranu. Niedokończona sesja nie jest wznawiana po odświeżeniu; zapisane próby, ukończone sesje i preferencje pozostają. Dostęp do domeny GitHub Pages z tego środowiska jest ograniczony; wynik publikacji należy odróżnić od lokalnych testów.

## Historia wcześniejszych sprawdzeń

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

## Krótkie strzałki kierunku

Pełna trasa ruchu i krótka wskazówka kierunku są teraz rysowane osobno. Każdy uczestnik ma jedną strzałkę rozpoczynającą się przed nim i kończącą widocznym grotem w obrębie planszy. Strzałki skrętu pokazują łuk; nie zmieniają toru przejazdu ani oceniania. W teście wszystkich 16 sytuacji na desktopie i przy 390 px dodano kontrolę liczby grotów, ich pełnej widoczności w kadrze oraz ukrywania i pokazywania strzałek. Po zmianie przeszły kontrola typów, lint, 51 testów logiki i 16 testów przeglądarkowych z buildem produkcyjnym; rozszerzony test wszystkich plansz wykonano dodatkowo na obu rozmiarach.

## Dotykanie aut na telefonie

Po zgłoszeniu prostokątnego podświetlenia aut na nagraniu telefonu dodano test wielokrotnego wyboru A/B/A w pierwszych trzech pytaniach, w tym dotykania auta, które nie jest opcją odpowiedzi. Test przed poprawką wykrył nieprzezroczyste natywne podświetlenie SVG; po poprawce przeszedł na obu rozmiarach. Przezroczyste `-webkit-tap-highlight-color` jest dziedziczone przez całą planszę, a dodatkowy filtr CSS `brightness` na grupach SVG został usunięty. Własne zaznaczenie odpowiedzi i widoczny fokus klawiatury pozostały. Ponownie przeszły typy, lint, 51 testów logiki oraz 16 testów przeglądarkowych z buildem produkcyjnym. Obejrzano zrzut po dotknięciu auta w drugim pytaniu.

Dodatkowy przegląd wykazał też domyślny obrys `outline: auto` grupy SVG po dotknięciu. Usunięto go wyłącznie dla `:focus:not(:focus-visible)`; test klawiatury wymaga nadal widocznego obrysu o grubości 3 px. Test dotyku sprawdza brak zarówno natywnej nakładki, jak i domyślnego prostokątnego obrysu.

## Niewykonane / ograniczenia

Próba zainstalowania WebKit do dodatkowego odtworzenia problemu została zablokowana odpowiedzią 403 polityki sieciowej dla serwerów pobierania Playwright. Test regresji wykonano w Chromium z emulacją dotyku; nie potwierdza to testu na fizycznym iPhonie ani w Safari.

- Przegląd prawny wykonano osobno od testów technicznych, po przywróceniu dostępu do oficjalnych źródeł. Obejmuje 16 opisanych sytuacji i stan sprawdzony 09.10.2026, nie certyfikację ani wszystkie możliwe zdarzenia drogowe. Patrz [LEGAL_REVIEW.md](LEGAL_REVIEW.md).
- Nie wykonano testów na fizycznym telefonie, Safari ani Firefox. Test telefoniczny emuluje rozmiar i dotyk w Chromium.
- Nie wykonano zewnętrznego audytu WCAG ani testów z rzeczywistym czytnikiem ekranu.
- Poprzednia wersja została opublikowana przez GitHub Pages, co użytkownik potwierdził zrzutem udanego wdrożenia. Wysłanie aktualizacji na `main` uruchamia kolejne wdrożenie; lokalne testy nie potwierdzają jego zakończenia. Dostęp z tego środowiska do API GitHuba i domeny strony jest ograniczony.
- Pełna sesja w toku nie jest wznawiana po odświeżeniu; zachowane są zatwierdzone próby i ukończone sesje.


## Znikanie strzałki podczas przejazdu — 10.10.2026

Strzałka skraca się o rzeczywistą odległość przejechaną po torze animacji, również na łukach. Testy geometrii obejmują wszystkich uczestników we wszystkich scenariuszach: zgodność początku strzałki z pozycją na torze, stały cel, usunięcie po przejeździe, przywrócenie po restarcie i wygaszenie grotu bez odwrócenia trzonu. Test nauki na obu rozmiarach sprawdza skracanie strzałki B, niezmienioną strzałkę oczekującego A, pauzę, restart i zniknięcie po przejściu kroku. Obejrzano też zrzut telefonicznej planszy w trakcie przejazdu.

Przeszły: kontrola typów, lint, 53 testy logiki/geometrii oraz 16 testów przeglądarkowych z produkcyjnym buildem. Weryfikacja przeglądarkowa korzysta z Chromium, bez fizycznego iPhone’a.
