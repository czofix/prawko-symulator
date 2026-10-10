import {
  bentSigns,
  car,
  define,
  first,
  law,
  order,
  signsLaw,
  step,
} from "./helpers";
const sources = [
  law("art. 5 ust. 1; art. 25 ust. 1"),
  signsLaw("§ 43 ust. 1–2; § 5 ust. 5 i 7"),
];
export const bends = [
  define(2, {
    id: "bend-follow-versus-minor",
    title: "Pierwszeństwo prowadzi w lewo",
    difficulty: 2,
    description:
      "Droga z pierwszeństwem łączy dolny i lewy wlot. A od dołu skręca w lewo po jej przebiegu. B z góry ma A-7 i jedzie prosto. Brak świateł.",
    participants: [car("A", "south", "left"), car("B", "north")],
    signs: bentSigns(["south", "west"]),
    question: first(["A", "B"], "A"),
    hint: "Prześledź grubą linię na tabliczce.",
    answerLabel: "A przed B.",
    explanation:
      "A jedzie drogą z pierwszeństwem. B ustępuje mimo jazdy prosto z przeciwka.",
    watchFor:
      "Skręt w lewo nie odbiera pierwszeństwa wobec drogi podporządkowanej.",
    steps: [
      step(["A"], "A skręca po drodze z pierwszeństwem."),
      step(["B"], "B jedzie po A."),
    ],
    sources,
  }),
  define(2, {
    id: "bend-leave-versus-turn",
    title: "Prosto poza drogę z pierwszeństwem",
    difficulty: 2,
    description:
      "Pierwszeństwo łączy dolny i lewy wlot. A od dołu jedzie prosto, opuszczając tę drogę. B z lewej skręca w lewo ku górze. Obaj wjeżdżają z D-1.",
    participants: [car("A", "south"), car("B", "west", "left")],
    signs: bentSigns(["south", "west"]),
    question: first(["A", "B"], "A"),
    hint: "Gdzie A znajduje się względem kierowcy B przed wjazdem?",
    answerLabel: "A przed B.",
    explanation:
      "Obaj są na drodze z pierwszeństwem. B ma A po prawej, więc mu ustępuje. Opuszczenie drogi z pierwszeństwem nie zmienia statusu wlotu A.",
    watchFor:
      "Oceniaj drogę, z której pojazd nadjeżdża, nie tylko wybrany wylot.",
    steps: [step(["A"], "A jest z prawej B."), step(["B"], "B skręca po A.")],
    sources,
  }),
  define(2, {
    id: "bend-right-hand-on-main",
    title: "D-1 po obu stronach łuku",
    difficulty: 2,
    description:
      "Pierwszeństwo łączy dolny i prawy wlot. A od dołu jedzie prosto, B z prawej skręca w prawo ku górze. Oba tory prowadzą na wspólny pas.",
    participants: [car("A", "south"), car("B", "east", "right")],
    signs: bentSigns(["south", "east"]),
    question: first(["A", "B"], "B"),
    hint: "Znaki dają obu równy status. Sprawdź prawą stronę A.",
    answerLabel: "B przed A.",
    explanation:
      "A ma B po prawej. B przejeżdża pierwszy, a A czeka, aż wspólny pas będzie wolny.",
    watchFor: "Dwa znaki D-1 nie pozwalają wjechać jednocześnie na jeden pas.",
    steps: [step(["B"], "B jest z prawej A."), step(["A"], "A jedzie po B.")],
    sources,
  }),
  define(2, {
    id: "bend-main-right-minor-left",
    title: "Dwa skręty na łamanym pierwszeństwie",
    difficulty: 2,
    description:
      "Pierwszeństwo łączy dolny i prawy wlot. A od dołu skręca w prawo, B z góry na A-7 skręca w lewo na ten sam pas. Brak świateł.",
    participants: [car("A", "south", "right"), car("B", "north", "left")],
    signs: bentSigns(["south", "east"]),
    question: first(["A", "B"], "A"),
    hint: "Porównaj status wlotów, zanim ocenisz skręty.",
    answerLabel: "A przed B.",
    explanation:
      "B wjeżdża z drogi podporządkowanej i musi ustąpić A na drodze z pierwszeństwem.",
    watchFor: "Wspólny wylot wymaga zachowania kolejności.",
    steps: [
      step(["A"], "A jedzie po łuku pierwszeństwa."),
      step(["B"], "B zajmuje pas po A."),
    ],
    sources,
  }),
  define(2, {
    id: "bend-two-minor",
    title: "Dwa auta poza grubą linią",
    difficulty: 3,
    description:
      "Pierwszeństwo łączy dolny i lewy wlot; te wloty są puste. A z góry skręca w lewo, B z prawej jedzie prosto. Obaj mają A-7.",
    participants: [car("A", "north", "left"), car("B", "east")],
    signs: bentSigns(["south", "west"]),
    question: first(["A", "B"], "A"),
    hint: "Obaj są podporządkowani. Kogo B ma z prawej?",
    answerLabel: "A przed B.",
    explanation:
      "B ma A po prawej i mu ustępuje. A nie musi ustępować B tylko dlatego, że skręca w lewo: B nie jedzie z przeciwka.",
    watchFor: "Lewy skręt nie oznacza ustąpienia wszystkim pojazdom.",
    steps: [
      step(["A"], "B ustępuje A z prawej."),
      step(["B"], "B przejeżdża po A."),
    ],
    sources,
  }),
  define(2, {
    id: "bend-four-vehicles",
    title: "Cztery wloty bez zgadywania",
    difficulty: 3,
    description:
      "Pierwszeństwo łączy dolny i lewy wlot. A od dołu skręca w lewo; B z lewej, C z góry i D z prawej jadą prosto. C i D mają A-7.",
    participants: [
      car("A", "south", "left"),
      car("B", "west"),
      car("C", "north"),
      car("D", "east"),
    ],
    signs: bentSigns(["south", "west"]),
    question: order(["A", "B", "C", "D"], [["A", "B", "C", "D"]]),
    hint: "Rozwiąż najpierw parę na D-1, potem parę na A-7.",
    answerLabel: "A → B → C → D.",
    explanation:
      "Na drodze z pierwszeństwem B ustępuje A z prawej. Potem podporządkowany D ustępuje C z prawej. Nie powstaje sytuacja wzajemnego blokowania czterech równych wlotów.",
    watchFor: "Zasada prawej strony działa wewnątrz grupy o równym statusie.",
    steps: [
      step(["A"], "A przed B na drodze z pierwszeństwem."),
      step(["B"], "B przejeżdża przed podporządkowanymi."),
      step(["C"], "C jest z prawej D."),
      step(["D"], "D rusza ostatni."),
    ],
    sources,
  }),
  define(2, {
    id: "bend-north-west-conflict",
    title: "Przecięcie torów na górnym łuku",
    difficulty: 3,
    description:
      "Pierwszeństwo łączy górny i lewy wlot. A z góry jedzie prosto, B z lewej skręca w lewo ku górze. Obaj mają D-1, brak innych uczestników.",
    participants: [car("A", "north"), car("B", "west", "left")],
    signs: bentSigns(["north", "west"]),
    question: first(["A", "B"], "B"),
    hint: "Usiądź myślami w A i wskaż jego prawą stronę.",
    answerLabel: "B przed A.",
    explanation:
      "B znajduje się po prawej stronie kierowcy A. Przy równym statusie A mu ustępuje, mimo że B skręca w lewo.",
    watchFor: "B nie jest pojazdem nadjeżdżającym z przeciwka A.",
    steps: [
      step(["B"], "B przejeżdża przez tor A."),
      step(["A"], "A jedzie po B."),
    ],
    sources,
  }),
];
