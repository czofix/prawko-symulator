import type { Participant, Point } from "../../domain/types";
import {
  car,
  choice,
  define,
  first,
  law,
  sign,
  signsLaw,
  step,
} from "./helpers";
const pedestrian = (from: Point, to: Point): Participant => ({
  id: "P",
  kind: "pedestrian",
  approach: "east",
  maneuver: "straight",
  description: "P: pieszy przechodzący przez jezdnię w kierunku strzałki",
  route: { start: from, segments: [{ type: "line", to }] },
});
const bicycle = (from: Point, to: Point): Participant => ({
  id: "B",
  kind: "cyclist",
  approach: "east",
  maneuver: "straight",
  description: "B: rowerzysta jadący w kierunku strzałki",
  route: { start: from, segments: [{ type: "line", to }] },
});
export const vulnerable = [
  define(5, {
    id: "pedestrian-entering",
    title: "Pieszy właśnie wchodzi",
    difficulty: 1,
    geometry: "crosswalk",
    description:
      "P właśnie wchodzi na przejście od prawej, stawiając krok na jezdnię. A zbliża się swoim pasem. Brak sygnalizacji i innych uczestników.",
    participants: [car("A", "south"), pedestrian([382, 410], [194, 410])],
    signs: [sign("south", "crossing")],
    question: choice(
      "Co powinien zrobić A?",
      "Ustąpić wchodzącemu P, w tej sytuacji zatrzymać się",
      "Jechać, dopóki P nie dojdzie do środka pasa",
    ),
    hint: "Sprawdź różnicę między staniem obok przejścia a wchodzeniem.",
    answerLabel: "A ustępuje wchodzącemu P.",
    explanation:
      "Kierowca ustępuje pieszemu na przejściu i wchodzącemu na nie. P już wchodzi, więc A czeka.",
    watchFor: "Nie trzeba czekać, aż pieszy znajdzie się na środku jezdni.",
    steps: [
      step(["P"], "A czeka, P przechodzi."),
      step(["A"], "A rusza po ustąpieniu P."),
    ],
    sources: [law("art. 13 ust. 1a; art. 26 ust. 1"), signsLaw("§ 47 ust. 1")],
  }),
  define(5, {
    id: "cyclist-on-crossing",
    title: "Rower już na przejeździe",
    difficulty: 1,
    geometry: "crosswalk",
    description:
      "B jedzie rowerem po oznaczonym przejeździe od prawej do lewej i już znajduje się na przejeździe. A jedzie prosto. Brak sygnalizacji.",
    participants: [car("A", "south"), bicycle([370, 410], [190, 410])],
    markings: [{ x: 300, y: 410, rotation: 0, kind: "cycle" }],
    signs: [sign("south", "cycleCrossing")],
    question: choice(
      "Jak powinien zachować się A?",
      "Ustąpić B znajdującemu się na przejeździe",
      "Przejechać pierwszy, bo samochód jest większy",
    ),
    hint: "Zwróć uwagę na położenie roweru względem przejazdu.",
    answerLabel: "B przed A.",
    explanation:
      "Kierowca ustępuje rowerzyście znajdującemu się na przejeździe. A czeka, aż B opuści jego tor.",
    watchFor:
      "To zadanie dotyczy roweru już na przejeździe, nie dowolnego roweru zbliżającego się z daleka.",
    steps: [
      step(["B"], "B przejeżdża, A czeka."),
      step(["A"], "A kontynuuje jazdę."),
    ],
    sources: [law("art. 27 ust. 1"), signsLaw("§ 47 ust. 2; § 88 ust. 2")],
  }),
  define(5, {
    id: "right-turn-pedestrian",
    title: "Pieszy na drodze, w którą skręcasz",
    difficulty: 2,
    description:
      "A skręca w prawo. P przechodzi na skrzyżowaniu przez jezdnię drogi, w którą A wjeżdża. Nie ma zebry, znaków pierwszeństwa ani świateł.",
    participants: [
      car("A", "south", "right"),
      pedestrian([430, 375], [430, 195]),
    ],
    question: choice(
      "Czy brak zebry pozwala A przejechać przed P?",
      "Nie, przy skręcie A ustępuje temu pieszemu",
      "Tak, pierwszeństwo pieszego istnieje tylko na zebrze",
    ),
    hint: "Przyjrzyj się relacji skrętu do drogi pieszego.",
    answerLabel: "P przed A.",
    explanation:
      "Skręcając w drogę poprzeczną, A ustępuje pieszemu przechodzącemu na skrzyżowaniu przez jej jezdnię. Zebra nie jest warunkiem tej zasady.",
    watchFor: "Obserwuj pieszych również na nieoznakowanym wylocie.",
    steps: [
      step(["P"], "A czeka przed skrętem, P przechodzi."),
      step(["A"], "A skręca po ustąpieniu."),
    ],
    sources: [law("art. 26 ust. 2")],
  }),
  define(5, {
    id: "left-turn-crossing",
    title: "Przejście po lewym skręcie",
    difficulty: 2,
    description:
      "A skręca w lewo. P już przechodzi przez oznaczone przejście na lewym wylocie, od góry ku dołowi. Brak innych aut i świateł.",
    participants: [
      car("A", "south", "left"),
      pedestrian([150, 225], [150, 410]),
    ],
    markings: [{ x: 150, y: 300, rotation: 90, kind: "pedestrian" }],
    signs: [
      {
        ...sign("west", "crossing"),
        position: [150, 176],
        actors: ["A"],
        label: "D-6: przejście dla pieszych — dla A na lewym wylocie",
      },
    ],
    question: choice(
      "Na co musi poczekać A?",
      "Na przejście P przez tor jazdy",
      "Na nic, bo z przeciwka nie ma pojazdu",
    ),
    hint: "Po sprawdzeniu przeciwnego wlotu spójrz na wybrany wylot.",
    answerLabel: "P przed A.",
    explanation:
      "Brak samochodu z przeciwka nie oznacza wolnego skrętu. A ustępuje pieszemu na przejściu.",
    watchFor: "Nie kończ obserwacji na środku skrzyżowania.",
    steps: [
      step(["P"], "P przechodzi, A czeka."),
      step(["A"], "A wykonuje lewy skręt."),
    ],
    sources: [law("art. 26 ust. 1–2")],
  }),
  define(5, {
    id: "left-turn-opposite-cyclist",
    title: "Z przeciwka jedzie rower",
    difficulty: 2,
    description:
      "A od dołu skręca w lewo. B jedzie rowerem prosto z przeciwka po jezdni. Brak znaków, świateł i innych uczestników.",
    participants: [
      car("A", "south", "left"),
      {
        ...car("B", "north"),
        kind: "cyclist",
        description: "B: rowerzysta z przeciwka, jedzie prosto",
      },
    ],
    question: first(["A", "B"], "B"),
    hint: "Czy reguła lewego skrętu dotyczy wyłącznie samochodów?",
    answerLabel: "B przed A.",
    explanation:
      "Rower także jest pojazdem. A przy lewym skręcie ustępuje rowerzyście jadącemu prosto z przeciwka.",
    watchFor: "Rozmiar pojazdu nie określa pierwszeństwa.",
    steps: [
      step(["B"], "Rowerzysta B jedzie prosto."),
      step(["A"], "A skręca po B."),
    ],
    sources: [law("art. 25 ust. 1; art. 2 pkt 31 i 47")],
  }),
  define(5, {
    id: "right-turn-cycle-track",
    title: "Rower równolegle do samochodu",
    difficulty: 3,
    cycleTrack: true,
    description:
      "A skręca w prawo przez drogę dla rowerów. B jedzie tą drogą na wprost, w tym samym kierunku co A przed skrętem. Brak świateł i innych uczestników.",
    participants: [
      car("A", "south", "right"),
      {
        ...bicycle([414, 490], [414, -60]),
        approach: "south",
        description:
          "B: rowerzysta jedzie prosto po równoległej drodze dla rowerów",
      },
    ],
    markings: [{ x: 414, y: 300, rotation: 90, kind: "cycle" }],
    question: choice(
      "Komu ustępuje A przy skręcie?",
      "Rowerzyście B jadącemu wprost",
      "Nikomu, bo rower jest poza jezdnią samochodu",
    ),
    hint: "Prześledź przecięcie prawego skrętu z drogą dla rowerów.",
    answerLabel: "B przed A.",
    explanation:
      "A opuszczając drogę i skręcając w poprzeczną ustępuje B jadącemu wprost po drodze dla rowerów wzdłuż opuszczanej drogi.",
    watchFor:
      "Roweru trzeba szukać także obok jezdni i z tyłu po prawej stronie.",
    steps: [
      step(["B"], "B jedzie wprost, A czeka."),
      step(["A"], "A skręca przez wolny przejazd."),
    ],
    sources: [law("art. 27 ust. 1a")],
  }),
  define(5, {
    id: "two-vulnerable-crossings",
    title: "Dwa przejścia torów, dwie obserwacje",
    difficulty: 3,
    geometry: "crosswalk",
    description:
      "A jedzie prosto. P przechodzi po zebrze bliżej A, a B jedzie rowerem po oddzielnym przejeździe dalej od A. Oboje już znajdują się na swoich przejściach przez jezdnię. Brak świateł.",
    participants: [
      car("A", "south"),
      pedestrian([368, 430], [190, 430]),
      bicycle([368, 335], [190, 335]),
    ],
    markings: [
      { x: 300, y: 430, rotation: 0, kind: "pedestrian" },
      { x: 300, y: 335, rotation: 0, kind: "cycle" },
    ],
    signs: [sign("south", "crossing"), sign("south", "cycleCrossing")],
    question: {
      kind: "multiple",
      prompt: "Komu musi ustąpić A?",
      options: [
        { id: "P", label: "Pieszemu P", actor: "P" },
        { id: "B", label: "Rowerzyście B", actor: "B" },
      ],
      accepted: [["P", "B"]],
    },
    hint: "Sprawdź oba przecinające jezdnię tory.",
    answerLabel: "A ustępuje P i B.",
    explanation:
      "Pieszy na przejściu i rowerzysta na przejeździe mają tu pierwszeństwo. Ich tory są oddzielne, więc mogą poruszać się jednocześnie.",
    watchFor:
      "Ustąpienie pieszemu nie zastępuje sprawdzenia sąsiedniego przejazdu.",
    steps: [
      step(["P", "B"], "P i B przekraczają jezdnię oddzielnymi torami."),
      step(["A"], "A przejeżdża po ustąpieniu obu."),
    ],
    sources: [law("art. 26 ust. 1; art. 27 ust. 1"), signsLaw("§ 88 ust. 1–2")],
  }),
];
