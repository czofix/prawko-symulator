# Przestrzenne plansze

Wygląd inspirowany przykładami użytkownika: dzienne światło, nawierzchnia asfaltowa, chodniki z krawężnikiem, zieleń, samochody i zielone strzałki planowanej jazdy. To własna, stylizowana grafika wektorowa, nie fotorealistyczny render ani kopia przesłanych obrazów. Nie wymaga WebGL, zewnętrznych modeli ani nowych zależności.

## Podział odpowiedzialności

- `projection.ts` — jedna kamera ortograficzna dla drogi, brył samochodów i elementów otoczenia.
- `VehicleModel.tsx` — nadwozie, koła, szyby, lusterka, światła i kierunkowskazy. Obrót odbywa się w układzie drogi przed rzutowaniem na ekran.
- `SceneMaterials.tsx`, `Scenery.tsx` — materiały i otoczenie bez obsługi interakcji.
- `RoadFurniture.tsx` — znaki i sygnalizatory z opisami, wspólne słupki dla znaków z tabliczkami. Etykiety „dla A/B/C” to pomoc dydaktyczna, nie dodatkowe znaki drogowe.
- `visibleRoute.ts` — wydłużenie wyłącznie ostatniego prostego odcinka do miejsca poza kadrem. Pozycje początkowe, skręty, tor pieszego oraz scenariusz źródłowy pozostają bez zmian.
- `directionArrow.ts`, `DirectionArrows.tsx` — krótkie wskazówki kierunku, oddzielone od pełnego toru animacji. Zaczynają się przed uczestnikiem i kończą pojedynczym grotem w kadrze; skręty obejmują cały łuk oraz krótki odcinek wyjazdu. Strzałki nie wydłużają się do krawędzi planszy razem z trasą animacji. Podczas odtwarzania ich początek przesuwa się przed autem zgodnie z przebytą odległością na pełnej trasie; przejechany fragment znika, a cel pozostaje nieruchomy. Grot maleje przy końcu wskazówki. Pauza, kolejne kroki i restart korzystają z tego samego stanu co ruch pojazdu.
- `RoadScene.tsx` — złożenie planszy i podłączenie istniejącego sterowania odpowiedzią oraz animacją.

Wszystkie strzałki przed zatwierdzeniem mają jednakowy kolor. Litery na autach pozostają czytelne niezależnie od kierunku obrotu i koloru nadwozia. Ograniczenie ruchu, sterowanie klawiaturą, zatwierdzanie odpowiedzi, zapamiętywanie postępu i tryb ćwiczenia korzystają z dotychczasowej logiki.

Weryfikacja: [VALIDATION.md](VALIDATION.md). Przegląd obejmuje Chromium na komputerowym i telefonicznym rozmiarze ekranu; nie zastępuje testów na fizycznych telefonach ani w innych silnikach przeglądarek.
