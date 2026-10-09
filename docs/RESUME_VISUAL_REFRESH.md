# Przerwa w pracach — 9 października 2026

Użytkownik poprosił o przerwę w celu zachowania limitu. Nie kontynuować bez jego polecenia.

## Cel

Bardziej realistyczne plansze na podstawie pięciu grafik użytkownika: przestrzenne samochody, asfalt, chodniki, zieleń, cienie i czytelne kierunki jazdy. Zachować istniejące scenariusze, ocenianie i sterowanie animacją.

## Zapisany etap roboczy

- Wspólna projekcja przestrzenna SVG dla drogi, aut i znaków (`src/components/scene/projection.ts`).
- Model samochodu z bryłą nadwozia, kołami, szybami, lampami, kierunkowskazami i cieniem; obrót jest zgodny z kierunkiem toru jazdy.
- Tekstury asfaltu i trawy, chodniki, krawężniki, drzewa i latarnie.
- Znaki i sygnalizatory na słupkach z opisem uczestnika, którego dotyczą; obsługa dotyku i klawiatury zachowana.
- Przebudowany `RoadScene` oraz `RoadSurface`; dane scenariuszy i logika odpowiedzi bez zmian.
- Kontrola typów przeszła po ostatnich zmianach. Lint przeszedł wcześniej, przed ostatnią korektą modelu i formatowaniem.
- Obejrzano pierwszy scenariusz na komputerze. Późniejsza korekta szyb, wielkości aut i materiałów nie była jeszcze sprawdzana wizualnie.

## Od czego wznowić

1. Otworzyć bieżącą planszę w działającej aplikacji (`npm run dev -- --port 5173 --strictPort`; jeśli serwer już działa, użyć go). Obejrzeć ostatnią korektę samochodów, w tym szyby i kolejność rysowania powierzchni.
2. Sprawdzić wszystkie 16 plansz na komputerze i przy 390 px: znaki i światła, nakładanie elementów, czytelność liter, tory i kierunkowskazy, kliknięcia i animacje. Zweryfikować oznakowanie poziome po zmianie rysunków. Istniejące testy zapisują zrzuty wszystkich plansz.
3. Wykonać lint, testy logiki, testy przeglądarkowe i produkcyjny build; naprawić konkretne znalezione problemy. Pełny zestaw nie został uruchomiony dla tej wersji.
4. Dopiero po weryfikacji przenieść zmiany na `main` i wysłać na GitHuba, co uruchomi publikację Pages.

To wersja robocza, nie ukończone wdrożenie. Obecna strona GitHub Pages nadal korzysta z poprzedniego wyglądu.
