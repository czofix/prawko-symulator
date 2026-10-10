import type {
  Participant,
  ParticipantId,
  Point,
  Route,
  Segment,
} from "../../domain/types";
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
const point = (angle: number): Point => [
  300 + 110 * Math.cos((angle * Math.PI) / 180),
  300 + 110 * Math.sin((angle * Math.PI) / 180),
];
function arc(from: number, to: number): Segment[] {
  const segments: Segment[] = [];
  for (let a = from; a > to; a -= 30) {
    const b = Math.max(to, a - 30),
      k = (4 / 3) * Math.tan(((b - a) * Math.PI) / 720),
      p = point(a),
      q = point(b);
    segments.push({
      type: "curve",
      c1: [
        p[0] - k * 110 * Math.sin((a * Math.PI) / 180),
        p[1] + k * 110 * Math.cos((a * Math.PI) / 180),
      ],
      c2: [
        q[0] + k * 110 * Math.sin((b * Math.PI) / 180),
        q[1] - k * 110 * Math.cos((b * Math.PI) / 180),
      ],
      to: q,
    });
  }
  return segments;
}
const exit: Segment[] = [
  { type: "curve", c1: [400, 350], c2: [414, 342], to: [440, 342] },
  { type: "line", to: [660, 342] },
];
const entering: Route = {
  start: [342, 515],
  segments: [
    { type: "curve", c1: [342, 440], c2: [344, 417], to: point(55) },
    ...arc(55, 40),
    ...exit,
  ],
};
const circulating = (id: ParticipantId, angle = 150): Participant => ({
  ...car(id, "west", "right"),
  description: `${id}: na rondzie, zjeżdża prawym wylotem`,
  indicatorFromDistance: 0,
  route: { start: point(angle), segments: [...arc(angle, 40), ...exit] },
});
const entry = (id: ParticipantId = "A"): Participant => ({
  ...car(id, "south", "right"),
  description: `${id}: wjeżdża od dołu, pierwszy zjazd`,
  route: entering,
});
const entrySigns = [sign("south", "yield"), sign("south", "roundabout")];
export const roundabouts = [
  define(4, {
    id: "roundabout-second-exit",
    title: "Drugi zjazd, to samo ustąpienie",
    difficulty: 2,
    geometry: "roundabout",
    description:
      "A przy A-7 i C-12 wjeżdża od dołu i wybiera drugi zjazd, ku górze. B już jedzie po jednopasowym rondzie i zjeżdża w prawo. Brak pieszych.",
    participants: [
      {
        ...entry(),
        maneuver: "right",
        description: "A: wjeżdża, opuszcza rondo drugim zjazdem",
        indicatorFromDistance: 230,
        route: {
          start: entering.start,
          segments: [
            entering.segments[0],
            ...arc(55, -55),
            { type: "curve", c1: [350, 196], c2: [342, 175], to: [342, 150] },
            { type: "line", to: [342, -60] },
          ],
        },
      },
      circulating("B"),
    ],
    signs: entrySigns,
    question: first(["A", "B"], "B"),
    hint: "Wybór dalszego zjazdu nie zmienia znaków przy wjeździe.",
    answerLabel: "B przed A.",
    explanation:
      "A ustępuje B na rondzie. Potem wjeżdża, jedzie do drugiego zjazdu i sygnalizuje jego opuszczenie.",
    watchFor:
      "Pierwszeństwo przy wjeździe nie zależy od numeru wybranego zjazdu.",
    steps: [
      step(["B"], "B przejeżdża przed wjazdem A.", "south"),
      step(["A"], "A wjeżdża i zjeżdża drugim wylotem."),
    ],
    sources: [signsLaw("§ 36 ust. 1–2"), law("art. 22 ust. 5")],
  }),
  define(4, {
    id: "roundabout-exit-indicator",
    title: "Pokaż zamiar zjazdu",
    difficulty: 1,
    geometry: "roundabout",
    description:
      "A jedzie jednopasowym rondem i zamierza zjechać najbliższym prawym wylotem. Nie ma innych uczestników.",
    participants: [circulating("A", 80)],
    question: choice(
      "Jak sygnalizować ten manewr?",
      "Zawczasu włączyć prawy kierunkowskaz, po zjeździe go wyłączyć",
      "Włączyć lewy kierunkowskaz do opuszczenia ronda",
    ),
    hint: "Zjazd jest zmianą kierunku w prawo.",
    answerLabel: "Prawy kierunkowskaz przed zjazdem.",
    explanation:
      "Czytelnie zapowiedz zjazd. Po zakończeniu manewru zaprzestań sygnalizowania.",
    watchFor: "Sygnał powinien pojawić się przed manewrem, nie dopiero po nim.",
    steps: [step(["A"], "A sygnalizuje prawy zjazd i opuszcza rondo.")],
    sources: [law("art. 22 ust. 5")],
  }),
  define(4, {
    id: "roundabout-exit-pedestrian",
    title: "Zjazd kończy się przejściem",
    difficulty: 2,
    geometry: "roundabout",
    description:
      "A zjeżdża z jednopasowego ronda prawym wylotem. P jest już na przejściu i idzie ku górze rysunku. Nie ma sygnalizacji.",
    participants: [
      circulating("A", 80),
      {
        id: "P",
        kind: "pedestrian",
        approach: "east",
        maneuver: "straight",
        description: "P: pieszy na przejściu przy zjeździe",
        route: {
          start: [480, 375],
          segments: [{ type: "line", to: [480, 195] }],
        },
      },
    ],
    markings: [{ x: 480, y: 300, rotation: 90, kind: "pedestrian" }],
    signs: [
      {
        ...sign("east", "crossing"),
        position: [440, 470],
        actors: ["A"],
        label: "D-6: przejście dla pieszych — dla A na prawym wylocie",
      },
    ],
    question: choice(
      "Czy A ma pierwszeństwo, bo opuszcza rondo?",
      "Nie, A ustępuje P",
      "Tak, pojazd opuszczający rondo zawsze jedzie pierwszy",
    ),
    hint: "Sprawdź drogę po zjeździe z ronda.",
    answerLabel: "P przed A.",
    explanation:
      "Zjazd z ronda nie odbiera pieszemu pierwszeństwa na przejściu. A umożliwia P przejście.",
    watchFor: "Obserwuj również przejście przy wylocie.",
    steps: [
      step(["P"], "A czeka, pieszy opuszcza jezdnię."),
      step(["A"], "A bezpiecznie zjeżdża."),
    ],
    sources: [law("art. 26 ust. 1–2")],
  }),
  define(4, {
    id: "roundabout-following",
    title: "Zachowaj kolejność na jednym pasie",
    difficulty: 2,
    geometry: "roundabout",
    description:
      "A jedzie przed B na jedynym pasie ronda. Obaj zjeżdżają tym samym prawym wylotem. Nie wyprzedzają się; utrzymują bezpieczny odstęp.",
    participants: [circulating("A", 65), circulating("B", 150)],
    question: choice(
      "Jak powinien przejechać B?",
      "Za A, zachowując odstęp",
      "Obok A, ścinając przez wyspę",
    ),
    hint: "Policz pasy i sprawdź położenie pojazdu przed B.",
    answerLabel: "B podąża za A.",
    explanation:
      "Na jednym pasie B nie może zająć miejsca obok A. Utrzymuje odstęp i przejeżdża za nim. Animacja pokazuje kolejno oba tory.",
    watchFor:
      "Krótka animacja nie wyznacza odstępu w metrach ani czasu reakcji.",
    steps: [
      step(["A"], "A zjeżdża jako pojazd prowadzący."),
      step(["B"], "B jedzie tym samym pasem za A."),
    ],
    sources: [law("art. 19 ust. 2 pkt 3; art. 22 ust. 1")],
  }),
  define(4, {
    id: "roundabout-red-entry",
    title: "Czerwone przed rondem",
    difficulty: 2,
    geometry: "roundabout",
    description:
      "A przy A-7 i C-12 ma działające czerwone S-1 przed wjazdem. B już jedzie po rondzie ku prawemu wylotowi. Czerwone dotyczy wyłącznie wjazdu A.",
    participants: [entry(), circulating("B")],
    signs: entrySigns,
    signals: [signal("south", "red")],
    question: choice(
      "Kiedy A może wjechać?",
      "Dopiero po sygnale zezwalającym i ocenie sytuacji",
      "Gdy B przejedzie, mimo czerwonego",
    ),
    hint: "Która informacja ma teraz wyższą rangę niż znaki?",
    answerLabel: "A pozostaje przed czerwonym.",
    explanation:
      "Czerwone zabrania wjazdu także po przejeździe B. W tej animacji sygnał się nie zmienia.",
    watchFor: "Luka na rondzie nie jest zgodą na przejazd przez czerwone.",
    steps: [
      step(["B"], "B opuszcza rondo. A nadal czeka na czerwonym.", "south"),
    ],
    sources: [law("art. 5 ust. 3"), signsLaw("§ 95 ust. 1 pkt 3")],
  }),
  define(4, {
    id: "roundabout-without-yield",
    title: "Samo C-12",
    difficulty: 3,
    geometry: "roundabout",
    description:
      "Przy wjeździe A jest tylko C-12, bez A-7 i bez świateł. B już jedzie po rondzie. Brak innych znaków pierwszeństwa. Tory się łączą.",
    participants: [entry(), circulating("B")],
    signs: [sign("south", "roundabout")],
    question: first(["A", "B"], "A"),
    hint: "C-12 sam określa kierunek ruchu. Sprawdź prawą stronę B.",
    answerLabel: "A przed B.",
    explanation:
      "Bez A-7 nie działa szczególne pierwszeństwo pojazdów na rondzie wynikające z zestawu znaków. B ustępuje A nadjeżdżającemu z jego prawej.",
    watchFor: "Nie zakładaj, że każde rondo ma identyczne oznakowanie.",
    steps: [
      step(["A"], "B ustępuje wjeżdżającemu A."),
      step(["B"], "B przejeżdża po A."),
    ],
    sources: [law("art. 25 ust. 1"), signsLaw("§ 36 ust. 1–2")],
  }),
  define(4, {
    id: "roundabout-independent-entries",
    title: "Dwa niezależne pierwsze zjazdy",
    difficulty: 3,
    geometry: "roundabout",
    description:
      "A od dołu i B od góry wjeżdżają na puste jednopasowe rondo z A-7 i C-12. Każdy wybiera pierwszy zjazd w prawo. Brak innych uczestników.",
    participants: [
      entry(),
      {
        ...entry("B"),
        approach: "north",
        description: "B: wjeżdża od góry, pierwszy zjazd",
        route: {
          start: [258, 85],
          segments: entering.segments.map((s) =>
            s.type === "line"
              ? { type: "line", to: [600 - s.to[0], 600 - s.to[1]] as Point }
              : {
                  type: "curve",
                  c1: [600 - s.c1[0], 600 - s.c1[1]] as Point,
                  c2: [600 - s.c2[0], 600 - s.c2[1]] as Point,
                  to: [600 - s.to[0], 600 - s.to[1]] as Point,
                },
          ),
        },
      },
    ],
    signs: [...entrySigns, sign("north", "yield"), sign("north", "roundabout")],
    question: choice(
      "Czy te dwa przejazdy mogą odbyć się jednocześnie?",
      "Tak, po przeciwnych, rozdzielonych częściach ronda",
      "Nie, na całym rondzie może być tylko jedno auto",
    ),
    hint: "Sprawdź krótkie tory obu pierwszych zjazdów.",
    answerLabel: "A i B mogą jechać jednocześnie.",
    explanation:
      "Żaden z tych torów nie przecina drugiego wjazdu. Przy pustym rondzie i tych manewrach nie ma konfliktu.",
    watchFor:
      "To rozwiązanie dotyczy pokazanych pierwszych zjazdów, nie dowolnego ruchu po rondzie.",
    steps: [
      step(["A", "B"], "A i B wjeżdżają i zjeżdżają po rozdzielonych torach."),
    ],
    sources: [signsLaw("§ 36 ust. 1–2"), law("art. 2 pkt 23")],
  }),
];
