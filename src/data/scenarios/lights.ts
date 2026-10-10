import {
  car,
  choice,
  define,
  first,
  law,
  signal,
  sign,
  signsLaw,
  step,
} from "./helpers";
export const lights = [
  define(3, {
    id: "amber-safe-stop",
    title: "Żółte: możesz spokojnie zahamować",
    difficulty: 1,
    description:
      "A jedzie do wlotu od dołu, zapaliło się żółte S-1. Ma dość miejsca na łagodne zatrzymanie przed sygnalizatorem. B z prawej stoi na czerwonym.",
    participants: [car("A", "south"), car("B", "east")],
    signals: [signal("south", "amber"), signal("east", "red")],
    question: choice(
      "Co powinien zrobić A?",
      "Zatrzymać się przed sygnalizatorem",
      "Przyspieszyć, aby zdążyć",
    ),
    hint: "Wyjątek dla żółtego dotyczy niemożności zatrzymania bez gwałtownego hamowania.",
    answerLabel: "A zatrzymuje się.",
    explanation:
      "Żółte zabrania wjazdu, chyba że zatrzymanie wymagałoby gwałtownego hamowania. Tutaj ten wyjątek nie zachodzi.",
    watchFor: "Żółte nie jest zachętą do przyspieszania.",
    steps: [step([], "A zatrzymuje się; B również czeka.", "south")],
    sources: [signsLaw("§ 95 ust. 1 pkt 2")],
  }),
  define(3, {
    id: "red-amber-wait",
    title: "Jeszcze nie zielone",
    difficulty: 1,
    description:
      "A stoi przed sygnalizatorem nadającym jednocześnie czerwone i żółte. Skrzyżowanie jest puste.",
    participants: [car("A", "south")],
    signals: [signal("south", "red-amber")],
    question: choice(
      "Czy A może już wjechać?",
      "Nie, musi zaczekać na zielone",
      "Tak, żółte pozwala ruszać",
    ),
    hint: "Sygnał zapowiada zmianę, ale sprawdź czy zezwala na wjazd.",
    answerLabel: "A nadal czeka.",
    explanation:
      "Czerwone i żółte nadal zabraniają wjazdu. Dopiero zielone pozwoli ocenić możliwość przejazdu.",
    watchFor: "Zapowiedź zielonego nie jest zgodą na wjazd.",
    steps: [step([], "A pozostaje przed sygnalizatorem.", "south")],
    sources: [signsLaw("§ 95 ust. 1 pkt 4")],
  }),
  define(3, {
    id: "green-right-opposite-left",
    title: "Dwa zielone, wspólny wylot",
    difficulty: 2,
    description:
      "A od dołu skręca w prawo, B z przeciwka w lewo. Obaj mają zwykłe S-1 zielone. Wspólny pas jest wolny; brak pieszych i rowerzystów.",
    participants: [car("A", "south", "right"), car("B", "north", "left")],
    signals: [signal("south", "green"), signal("north", "green")],
    question: first(["A", "B"], "A"),
    hint: "Zielone S-1 nie rozstrzyga relacji dwóch skręcających z przeciwka.",
    answerLabel: "A przed B.",
    explanation:
      "B skręcając w lewo ustępuje A z przeciwka skręcającemu w prawo.",
    watchFor: "S-1 zielone nie oznacza bezkolizyjnego skrętu.",
    steps: [step(["A"], "A skręca w prawo."), step(["B"], "B skręca po A.")],
    sources: [law("art. 25 ust. 1"), signsLaw("§ 95 ust. 1 pkt 1")],
  }),
  define(3, {
    id: "protected-left-signal",
    title: "Zielona strzałka wewnątrz S-3",
    difficulty: 2,
    description:
      "A ma kierunkowy S-3 z zieloną strzałką w lewo. B z przeciwka stoi na czerwonym. Wylot jest wolny, brak pieszych i innych uczestników.",
    participants: [car("A", "south", "left"), car("B", "north")],
    signals: [signal("south", "green", "S-3", "left"), signal("north", "red")],
    question: choice(
      "Czy A może wykonać wskazany skręt?",
      "Tak, S-3 zezwala na bezkolizyjny lewy skręt",
      "Nie, musi poczekać aż B ruszy",
    ),
    hint: "Odróżnij S-3 od małej strzałki obok czerwonego.",
    answerLabel: "A skręca, B czeka.",
    explanation:
      "S-3 dotyczy kierunku strzałki. Zielone oznacza brak kolizji z innymi uczestnikami w tym kierunku.",
    watchFor: "Nie myl sygnalizatora kierunkowego S-3 z warunkowym S-2.",
    steps: [
      step(
        ["A"],
        "A skręca w kierunku wskazanym przez S-3. B pozostaje na czerwonym.",
        "south",
      ),
    ],
    sources: [signsLaw("§ 97 ust. 1–3")],
  }),
  define(3, {
    id: "conditional-arrow-stop",
    title: "Mała strzałka wymaga zatrzymania",
    difficulty: 2,
    description:
      "A dojeżdża do czerwonego S-2 z małą zieloną strzałką w prawo. Jeszcze się nie zatrzymał. Brak innych uczestników, cały wylot jest wolny.",
    participants: [car("A", "south", "right")],
    signals: [signal("south", "red", "S-2", "right")],
    question: choice(
      "Co musi zrobić A przed skrętem?",
      "Zatrzymać się przed sygnalizatorem i sprawdzić drogę",
      "Skręcić płynnie, bez zatrzymania",
    ),
    hint: "Warunkowy skręt ma obowiązkowy pierwszy krok.",
    answerLabel: "Najpierw zatrzymanie, potem ostrożny skręt.",
    explanation:
      "S-2 dopuszcza skręt dopiero po zatrzymaniu i pod warunkiem nieutrudniania ruchu innym.",
    watchFor: "Mała zielona strzałka nie zastępuje zwykłego zielonego.",
    steps: [
      step([], "A zatrzymuje się przed S-2.", "south"),
      step(["A"], "Po sprawdzeniu pustej drogi A skręca."),
    ],
    sources: [signsLaw("§ 96 ust. 1 i 3")],
  }),
  define(3, {
    id: "green-blocked-exit",
    title: "Zielone i zajęty wylot",
    difficulty: 2,
    description:
      "A ma zielone S-1, ale za skrzyżowaniem stoi kolejka zakończona samochodem B. Nie ma miejsca na całe A bez zablokowania skrzyżowania. B nie rusza.",
    sceneNote: "Wylot zajęty — brak miejsca na cały samochód A.",
    participants: [
      car("A", "south"),
      {
        ...car("B", "south"),
        stationary: true,
        description: "B: stoi w kolejce na wylocie",
        route: {
          start: [342, 160],
          segments: [{ type: "line", to: [342, -60] }],
        },
      },
    ],
    signals: [{ ...signal("south", "green"), actors: ["A"] }],
    question: choice(
      "Czy A powinien wjechać?",
      "Nie, czeka przed skrzyżowaniem na wolne miejsce",
      "Tak, zielone zawsze pozwala wjechać",
    ),
    hint: "Sprawdź nie tylko światło, ale też miejsce za skrzyżowaniem.",
    answerLabel: "A czeka, aż zwolni się wylot.",
    explanation:
      "Nie wolno wjechać, jeśli nie ma miejsca do kontynuowania jazdy. Zielone nie znosi tego zakazu.",
    watchFor:
      "Nie zatrzymuj się na środku skrzyżowania tylko dlatego, że było zielone.",
    steps: [step([], "A czeka; B nadal blokuje wylot.", "B")],
    sources: [law("art. 25 ust. 4 pkt 1"), signsLaw("§ 95 ust. 2 pkt 2")],
  }),
  define(3, {
    id: "green-overrides-stop",
    title: "Światło przed znakiem STOP",
    difficulty: 2,
    description:
      "A od dołu ma B-20 i działający S-1 zielony. B z prawej ma D-1, lecz czerwone. A jedzie prosto; wylot wolny, brak pieszych.",
    participants: [car("A", "south"), car("B", "east")],
    signs: [sign("south", "stop"), sign("east", "priority")],
    signals: [signal("south", "green"), signal("east", "red")],
    question: first(["A", "B"], "A"),
    hint: "Przypomnij sobie hierarchię sygnałów i znaków pierwszeństwa.",
    answerLabel: "A może jechać, B czeka.",
    explanation:
      "Działające sygnały świetlne mają pierwszeństwo przed znakami regulującymi pierwszeństwo. A stosuje się do zielonego, B do czerwonego.",
    watchFor: "D-1 nie pozwala przejechać przez czerwone.",
    steps: [
      step(["A"], "A jedzie na zielonym; B pozostaje na czerwonym.", "south"),
    ],
    sources: [law("art. 5 ust. 3"), signsLaw("§ 95 ust. 1")],
  }),
  define(3, {
    id: "conditional-arrow-yields",
    title: "Warunkowy skręt i pojazd na zielonym",
    difficulty: 3,
    description:
      "A od dołu już zatrzymał się przed czerwonym S-2 z małą strzałką w prawo. B z lewej jedzie prosto na zielonym. Obaj wjechaliby na wspólny pas. Brak pieszych.",
    participants: [car("A", "south", "right"), car("B", "west")],
    signals: [signal("south", "red", "S-2", "right"), signal("west", "green")],
    question: first(["A", "B"], "B"),
    hint: "Zatrzymanie to tylko pierwszy warunek S-2.",
    answerLabel: "B przed A.",
    explanation:
      "A nie może utrudnić ruchu B. Czeka na jego przejazd i dopiero potem wykonuje warunkowy skręt.",
    watchFor: "Po zatrzymaniu nadal trzeba ustąpić innym uczestnikom.",
    steps: [
      step(["B"], "B przejeżdża na zielonym; A czeka."),
      step(["A"], "A skręca bez utrudniania ruchu."),
    ],
    sources: [signsLaw("§ 96 ust. 1 i 3")],
  }),
];
