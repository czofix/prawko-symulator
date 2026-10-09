# Weryfikacja scenariuszy względem oficjalnych przepisów

**Data sprawdzenia: 9 października 2026. Zakres: 16 scenariuszy aplikacji.**

Dostęp do oficjalnych źródeł przywrócono po zastosowaniu konfiguracji sieci i resecie środowiska. Odczytano metadane i pobrano teksty PDF z API ELI Sejmu. Sprawdzono przepisy rozstrzygające zadania oraz późniejsze nowelizacje, w tym akty ogłoszone w 2026 r. Status wszystkich scenariuszy to `verified`, a `checkedAt` wskazuje faktyczną datę tego przeglądu. Nie jest to certyfikacja ani państwowa baza pytań egzaminacyjnych.

## Źródła i metoda

- [Prawo o ruchu drogowym — tekst jednolity, Dz.U. 2024 poz. 1251](https://api.sejm.gov.pl/eli/acts/DU/2024/1251/text.pdf), załącznik: art. 2 pkt 23, art. 5, art. 13 ust. 1a, art. 22 ust. 1, 4, 4a i 5, art. 25, art. 26 ust. 1.
- [Znaki i sygnały drogowe — tekst jednolity, Dz.U. 2019 poz. 2310](https://api.sejm.gov.pl/eli/acts/DU/2019/2310/text.pdf), załącznik: § 5, § 21, § 36, § 43, § 47 ust. 1, § 88 ust. 1, § 89 ust. 1–2, § 95 i § 97 oraz wzory znaków.
- Listy powiązanych nowelizacji odczytano z metadanych aktów podstawowych: [ustawa](https://api.sejm.gov.pl/eli/acts/DU/1997/602) i [rozporządzenie](https://api.sejm.gov.pl/eli/acts/DU/2002/1393).

Dla tekstu jednolitego ustawy z 2024 r. sprawdzono wszystkie wskazane przez ELI późniejsze akty zmieniające, a dla rozporządzenia — zmiany po tekście jednolitym z 2019 r. Nie zakładano, że starszy tekst jednolity zawiera późniejsze zmiany. Zweryfikowano jednostki redakcyjne zmieniane przez nowelizacje i ich terminy wejścia w życie; przepisy z przyszłym terminem nie są traktowane jako obowiązujące dziś.

[Rejestr 17 pobranych dokumentów](legal/sources.json) zawiera oficjalne adresy PDF i metadanych, daty ogłoszenia, terminy wejścia w życie, uwagi o wyjątkach oraz SHA-256 pobranych plików. Każdy PDF można ponownie pobrać pod zapisanym adresem; w repozytorium nie umieszczamy wielomegabajtowych kopii aktów.

### Nowelizacje ustawy uwzględnione w przeglądzie

| Dz.U.                  | Zakres istotny dla kontroli zmian                             | Terminy / wynik dla scenariuszy                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2024 poz. 834, art. 8  | art. 20 ust. 5a — właściwość ministra                         | Od 01.07.2024; ujęte już w tekście jednolitym; bez zmiany użytych zasad pierwszeństwa.                                                                                                                              |
| 2025 poz. 820, art. 4  | art. 80c i 100ah                                              | Od 25.07.2025; dostęp do ewidencji, bez wpływu na zadania.                                                                                                                                                          |
| 2025 poz. 1006, art. 2 | art. 80c i 100ah                                              | Co do zasady od 09.08.2025; bez zmiany norm użytych w zadaniach.                                                                                                                                                    |
| 2025 poz. 1676, art. 1 | art. 6, 20, 32, 33, 33d, 53a i przepisy ewidencyjne/kontrolne | Terminy zróżnicowane, w tym 03.03, 03.06 i 03.09.2026. Nie zmienia art. 5, 13 ust. 1a, 22, 25 ani 26 użytych w zadaniach; sytuacje nie obejmują osób kierujących ruchem ani nowych ograniczeń dla rowerów/hulajnóg. |
| 2025 poz. 1734, art. 1 | rejestracja pojazdów i ewidencje                              | Część od 24.12.2025 i 10.06.2026, część dopiero 18.01.2027; bez wpływu na użyte zasady ruchu.                                                                                                                       |
| 2025 poz. 1843, art. 1 | pojazdy zautomatyzowane, badania, ewidencje, art. 148a        | Terminy 2025/2026, w tym 24.06 i 05.07.2026; nie zmienia użytych norm pierwszeństwa.                                                                                                                                |
| 2025 poz. 1872, art. 4 | art. 60 ust. 5, 65ja, 135 i 135a                              | Terminy 29.01 i 30.03.2026; drift, spotkania pojazdów i zatrzymanie prawa jazdy, bez wpływu na rozwiązania.                                                                                                         |
| 2026 poz. 180, art. 1  | art. 2 pkt 37, art. 6, 53 i 66                                | Art. 1 od 18.05.2026; pojazdy specjalne i osoby uprawnione do kierowania ruchem; poza warunkami zadań.                                                                                                              |
| 2026 poz. 982, art. 2  | art. 100aa i 100ac                                            | Dla art. 2 termin związany z komunikatem; dotyczy ewidencji kwalifikacji, nie użytych norm. Nie uznano automatycznie ogólnej daty wejścia aktu za datę wejścia art. 2.                                              |
| 2026 poz. 875, art. 4  | art. 53 — zezwolenia dla pojazdów uprzywilejowanych           | Od 01.01.2027; nie jest obowiązującą dziś podstawą rozwiązań.                                                                                                                                                       |
| 2026 poz. 1073, art. 2 | art. 80b i 80ba — zastawy rejestrowe                          | Od 11.05.2027; poza zakresem zadań, przyszła regulacja.                                                                                                                                                             |

Żadna z tych zmian nie zmienia rozstrzygających norm pierwszeństwa użytych w obecnych 16 scenariuszach. Nie jest to twierdzenie, że całe Prawo o ruchu drogowym pozostało niezmienione.

### Nowelizacje znaków i sygnałów

| Dz.U.          | Zakres                                                             | Wniosek                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2021 poz. 433  | § 20, § 65 i wzory znaków; od 13.03.2021                           | Naciski osi i oznaczenia dróg; nie zmienia użytych zasad.                                                                                                            |
| 2021 poz. 2065 | M.in. uchylenie § 47 ust. 4; zasadniczo od 02.12.2021              | Nie powołujemy uchylonego przepisu jako obowiązującego. Obowiązki wobec pieszego wywodzimy z art. 13 ust. 1a i art. 26 ust. 1 ustawy. D-6 opisuje nadal § 47 ust. 1. |
| 2022 poz. 2372 | § 53, 63, 67 i wzór D-39; od 06.12.2022                            | Postoje taksówek, informacja turystyczna i oznaczenie ograniczeń — poza zakresem zadań.                                                                              |
| 2026 poz. 133  | § 54, 62–67a, 77a–77b, 84, 86 ust. 4 i wzory znaków; od 19.02.2026 | Nowe/zmienione oznaczenia, m.in. F-23 i F-24 oraz P-3. Scenariusze nie używają P-3 ani nowych znaków; zmiana nie narusza § 5, 21, 36, 43, 95 i 97.                   |

## Przegląd każdego zadania

| Identyfikator          | Rozwiązanie i rozstrzygające warunki                                                                                            | Podstawa                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| right-hand-south       | B przed A; jednoczesne przybycie, B po prawej A, brak regulacji znakami/światłami                                               | art. 25 ust. 1                                                              |
| right-hand-north       | B przed A; prawa strona oceniana z miejsca kierowcy A jadącego od góry                                                          | art. 25 ust. 1                                                              |
| opposite-straight      | A i B mogą jechać jednocześnie po oddzielnych, nieprzecinających się torach                                                     | art. 25 ust. 1 w związku z art. 2 pkt 23                                    |
| left-versus-straight   | A skręca w lewo i ustępuje jadącemu prosto z przeciwka B                                                                        | art. 25 ust. 1                                                              |
| left-versus-right      | A skręca w lewo i ustępuje skręcającemu w prawo z przeciwka B; wspólny pas po skręcie                                           | art. 25 ust. 1                                                              |
| priority-before-right  | A na D-1 przed B z A-7, mimo że B nadjeżdża z prawej                                                                            | art. 5 ust. 1; § 5 ust. 5 i § 43 ust. 1                                     |
| yield-to-priority      | A z A-7 ustępuje B na D-1                                                                                                       | § 5 ust. 5 i § 43 ust. 1                                                    |
| stop-is-not-priority   | Zatrzymany A nadal ustępuje B; zatrzymanie samo nie daje pierwszeństwa                                                          | § 21 ust. 1–2; oznaczenie linii: § 89 ust. 1                                |
| two-valid-orders       | Dwa niekolizyjne przejazdy: akceptowane A→B i B→A; wyjaśnienie dopuszcza również przejazd razem                                 | art. 25 ust. 1 w związku z art. 2 pkt 23                                    |
| priority-bends         | C **skręca w lewo**, koliduje z oboma torami i ustępuje A i B. B na drodze z pierwszeństwem ustępuje A z prawej. Animacja A→B→C | art. 5 ust. 1, art. 25 ust. 1, art. 2 pkt 23; § 43 ust. 1–2 i § 5 ust. 5, 7 |
| green-and-red          | A jedzie na S-1 zielonym, B przez całą animację stoi na czerwonym; brak pieszych/rowerzystów i miejsce za skrzyżowaniem         | art. 5 ust. 3; § 95 ust. 1–2                                                |
| green-left             | Obaj mają zwykłe S-1 zielone; skręcający w lewo A ustępuje B jadącemu prosto; nie użyto S-3                                     | art. 25 ust. 1; § 95 ust. 1; porównanie z § 97 ust. 1, 3                    |
| roundabout-yield       | A ma **łącznie A-7 i C-12**, B już na rondzie; A ustępuje B                                                                     | § 36 ust. 1–2                                                               |
| pedestrian-on-crossing | P już na przejściu, przecina tor A; A zwalnia i zatrzymuje się, aby ustąpić                                                     | art. 13 ust. 1a i art. 26 ust. 1; D-6: § 47 ust. 1; P-10: § 88 ust. 1       |
| zipper-jam             | Znaczne spowolnienie, zanik pasa, A bezpośrednio przy zwężeniu; po B kierowca C wpuszcza jeden pojazd A: B→A→C                  | art. 22 ust. 4a                                                             |
| merge-free-flow        | Brak znacznego zmniejszenia prędkości; A zmieniając pas ustępuje B na pasie docelowym                                           | art. 22 ust. 4 w związku z ust. 4a                                          |

Na rysunkach skontrolowano przypisanie znaków i sygnalizatorów do wlotów, kierunki oraz tor skrętu. Tabliczki przy D-1 są opisane jako T-6a, przy A-7 jako T-6c i pokazują przebieg drogi z perspektywy właściwego wlotu. Linię przy A-7 poprawiono na trójkąty P-13 (§ 89 ust. 2). Kierunkowskaz gaśnie po zakończeniu łuku skrętu lub zmiany pasa (art. 22 ust. 5). W zadaniu z łamanym pierwszeństwem celowo określono skręt C w lewo: przy wcześniejszym przejeździe C prosto jego tor nie kolidowałby z A, co osłabiałoby jednoznaczność pytania „komu musi ustąpić”.

## Granice materiału

Rysunki są schematyczne; nie przedstawiają drogi hamowania, odległości ani prędkości w rzeczywistej skali. Przegląd obejmuje opisane warunki i wskazane przepisy, nie wszystkie możliwe sytuacje drogowe. Nie ma tramwajów, osób kierujących ruchem ani pojazdów uprzywilejowanych. Wynik ćwiczenia nie jest wynikiem egzaminu państwowego. Zmiana przepisów lub warunków scenariusza wymaga ponownego sprawdzenia treści i źródeł; same testy programu nie dowodzą poprawności prawnej.
