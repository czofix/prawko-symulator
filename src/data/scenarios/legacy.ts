import { routeFor } from "../../domain/routes";
import type {
  AnimationStep,
  Approach,
  LegalSource,
  Maneuver,
  Participant,
  ParticipantId,
  RoadSign,
  Scenario,
} from "../../domain/types";
const car = (
  id: ParticipantId,
  approach: Approach,
  maneuver: Maneuver = "straight",
): Participant => ({
  id,
  approach,
  maneuver,
  kind: "car",
  description: `${id}: ${{ south: "od dołu", north: "od góry", east: "z prawej", west: "z lewej" }[approach]}, ${{ straight: "jedzie prosto", left: "skręca w lewo", right: "skręca w prawo" }[maneuver]}`,
  route: routeFor(approach, maneuver),
});
const ped = (startX: number): Participant => ({
  id: "P",
  approach: "east",
  maneuver: "straight",
  kind: "pedestrian",
  description: "P: pieszy przechodzi od prawej do lewej po przejściu",
  route: { start: [startX, 410], segments: [{ type: "line", to: [194, 410] }] },
});
const sign = (approach: Approach, type: Exclude<RoadSign["type"], "cycleCrossing">): RoadSign => ({
  approach,
  type,
  label: `${{ yield: "A-7: ustąp pierwszeństwa", priority: "D-1: droga z pierwszeństwem", stop: "B-20: STOP", roundabout: "C-12: ruch okrężny", bend: `${approach === "north" ? "T-6c" : "T-6a"}: przebieg pierwszeństwa łączy dolny i lewy wlot na rysunku`, crossing: "D-6: przejście dla pieszych" }[type]} — wlot ${{ south: "dolny", north: "górny", east: "prawy", west: "lewy" }[approach]}`,
});
const law = (provision: string): LegalSource => ({
  title: "Prawo o ruchu drogowym — tekst jednolity, Dz.U. 2024 poz. 1251",
  provision,
  url: "https://api.sejm.gov.pl/eli/acts/DU/2024/1251/text.pdf",
  checkedAt: "2026-10-09",
});
const signsLaw = (provision: string): LegalSource => ({
  title: "Znaki i sygnały drogowe — tekst jednolity, Dz.U. 2019 poz. 2310",
  provision,
  url: "https://api.sejm.gov.pl/eli/acts/DU/2019/2310/text.pdf",
  checkedAt: "2026-10-09",
});
const step = (
  actors: ParticipantId[],
  text: string,
  highlight = actors.join(","),
): AnimationStep => ({ actors, text, highlight, duration: 3200 });
const options = (ids: ParticipantId[]) =>
  ids.map((id) => ({
    id,
    label: id === "P" ? "Pieszy P" : `Samochód ${id}`,
    actor: id,
  }));
const first = (
  ids: ParticipantId[],
  correct: ParticipantId,
): Scenario["question"] => ({
  kind: "single",
  prompt: "Kto powinien przejechać jako pierwszy?",
  options: options(ids),
  accepted: [[correct]],
});
const base = {
  verification: "verified" as const,
  geometry: "crossroad" as const,
  signs: [],
  signals: [],
};
export const legacy: Scenario[] = [
  {
    ...base,
    id: "right-hand-south",
    title: "Spójrz w prawo",
    category: "Skrzyżowanie równorzędne",
    difficulty: 1,
    description:
      "Dwa samochody jadą prosto. Nie ma znaków ani świateł. Oba docierają do wlotów jednocześnie.",
    participants: [car("A", "south"), car("B", "east")],
    question: first(["A", "B"], "B"),
    hint: "Spójrz z miejsca kierowcy A. Po której stronie widzi samochód B?",
    answerLabel: "Najpierw B, potem A.",
    explanation:
      "Kierowca A ma samochód B po swojej prawej stronie. Na tym skrzyżowaniu A ustępuje mu pierwszeństwa.",
    watchFor: "Prawa strona kierowcy nie zawsze jest prawą stroną ekranu.",
    steps: [
      step(
        ["B"],
        "A czeka. B przejeżdża, ponieważ nadjeżdża z prawej strony A.",
      ),
      step(["A"], "Droga jest wolna. Teraz przejeżdża A."),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "right-hand-north",
    title: "Zmień perspektywę",
    category: "Skrzyżowanie równorzędne",
    difficulty: 1,
    description:
      "A nadjeżdża od góry, B z lewej strony rysunku. Oba pojazdy jadą prosto i docierają do wlotów jednocześnie. Brak znaków i świateł.",
    participants: [car("A", "north"), car("B", "west")],
    question: first(["A", "B"], "B"),
    hint: "Wyobraź sobie, że siedzisz za kierownicą A i patrzysz w dół rysunku.",
    answerLabel: "Najpierw B, potem A.",
    explanation:
      "B jest po prawej stronie kierowcy A, choć na rysunku znajduje się po lewej. A ustępuje B.",
    watchFor: "Oceniaj położenie z perspektywy kierowcy.",
    steps: [
      step(["B"], "B nadjeżdża z prawej strony A, więc A czeka."),
      step(["A"], "Po przejeździe B rusza A."),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "opposite-straight",
    title: "Dwa przeciwne kierunki",
    category: "Ruch jednoczesny",
    difficulty: 1,
    description:
      "A i B nadjeżdżają z przeciwnych stron. Oba jadą prosto, każdy swoim pasem. Nie ma innych uczestników, znaków ani świateł.",
    participants: [car("A", "south"), car("B", "north")],
    question: {
      kind: "single",
      prompt: "Czy A i B mogą przejechać jednocześnie?",
      options: [
        { id: "yes", label: "Tak, każdy swoim pasem" },
        { id: "no", label: "Nie, jeden musi zaczekać" },
      ],
      accepted: [["yes"]],
    },
    hint: "Porównaj planowane tory jazdy. Czy się przecinają?",
    answerLabel: "Tak, mogą przejechać jednocześnie.",
    explanation:
      "Ich tory nie przecinają się. Żaden nie skręca w lewo ani nie nadjeżdża z prawej strony drugiego.",
    watchFor:
      "Nie każda sytuacja wymaga wyznaczenia jednego pojazdu jako pierwszego.",
    steps: [
      step(["A", "B"], "A i B jadą jednocześnie, po przeciwnych pasach."),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "left-versus-straight",
    title: "Skręcasz w lewo",
    category: "Skręt w lewo",
    difficulty: 1,
    description:
      "A skręca w lewo. B z przeciwka jedzie prosto. Skrzyżowanie jest równorzędne, bez sygnalizacji.",
    participants: [car("A", "south", "left"), car("B", "north")],
    question: first(["A", "B"], "B"),
    hint: "Zwróć uwagę na kierunkowskaz A i kierunek jazdy B.",
    answerLabel: "B jedzie pierwszy. A czeka.",
    explanation:
      "Przy skręcie w lewo A ustępuje pojazdowi z przeciwka jadącemu prosto.",
    watchFor: "Przed skrętem w lewo sprawdź ruch z przeciwka.",
    steps: [
      step(["B"], "B jedzie prosto. A nie przecina jeszcze jego toru."),
      step(["A"], "A skręca w lewo po przejeździe B."),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "left-versus-right",
    title: "Dwa skręty, jedna droga",
    category: "Skręt w lewo",
    difficulty: 2,
    description:
      "A skręca w lewo, a B z przeciwka w prawo. Chcą wjechać na ten sam pas drogi po lewej stronie rysunku. Brak znaków i świateł.",
    participants: [car("A", "south", "left"), car("B", "north", "right")],
    question: first(["A", "B"], "B"),
    hint: "Oba samochody chcą zająć ten sam pas po skręcie.",
    answerLabel: "B skręca pierwszy, potem A.",
    explanation:
      "Skręcający w lewo A ustępuje pojazdowi z przeciwka skręcającemu w prawo.",
    watchFor:
      "Skręt w prawo pojazdu z przeciwka także ma znaczenie dla skręcającego w lewo.",
    steps: [
      step(["B"], "B skręca w prawo. A pozostawia mu miejsce."),
      step(["A"], "A może teraz skręcić w lewo."),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "priority-before-right",
    title: "Najpierw sprawdź znaki",
    category: "Droga z pierwszeństwem",
    difficulty: 1,
    description:
      "A jedzie drogą z pierwszeństwem. B ma znak „ustąp pierwszeństwa”. Oba samochody jadą prosto, brak świateł.",
    participants: [car("A", "south"), car("B", "east")],
    signs: [sign("south", "priority"), sign("east", "yield")],
    question: first(["A", "B"], "A"),
    hint: "Zanim zastosujesz zasadę prawej strony, odczytaj znaki obu kierowców.",
    answerLabel: "A przejeżdża pierwszy.",
    explanation:
      "B jest na drodze podporządkowanej. Musi ustąpić A, mimo że nadjeżdża z jego prawej strony.",
    watchFor:
      "Znaki określające pierwszeństwo zmieniają sytuację względem skrzyżowania równorzędnego.",
    steps: [
      step(["A"], "D-1 wskazuje drogę z pierwszeństwem A. B czeka.", "south"),
      step(
        ["B"],
        "Po przejeździe A samochód B wjeżdża na skrzyżowanie.",
        "east",
      ),
    ],
    sources: [law("art. 5 ust. 1"), signsLaw("§ 5 ust. 5 oraz § 43 ust. 1")],
  },
  {
    ...base,
    id: "yield-to-priority",
    title: "Odwrócone role",
    category: "Droga podporządkowana",
    difficulty: 1,
    description:
      "A ma znak „ustąp pierwszeństwa”. B jedzie prosto drogą z pierwszeństwem. A także chce jechać prosto.",
    participants: [car("A", "south"), car("B", "east")],
    signs: [sign("south", "yield"), sign("east", "priority")],
    question: first(["A", "B"], "B"),
    hint: "Odczytaj odwrócony trójkąt przy wlocie A.",
    answerLabel: "A ustępuje B.",
    explanation:
      "Znak A-7 zobowiązuje A do ustąpienia pojazdowi B na drodze z pierwszeństwem.",
    watchFor: "Patrz na znak przypisany do własnego wlotu.",
    steps: [
      step(["B"], "B przejeżdża drogą z pierwszeństwem.", "south"),
      step(["A"], "A wjeżdża, kiedy nie wymusi pierwszeństwa."),
    ],
    sources: [signsLaw("§ 5 ust. 5 oraz § 43 ust. 1")],
  },
  {
    ...base,
    id: "stop-is-not-priority",
    title: "Zatrzymanie to nie wszystko",
    category: "Znak STOP",
    difficulty: 2,
    description:
      "A zatrzymał się przed linią STOP i chce jechać prosto. B zbliża się drogą z pierwszeństwem od dołu rysunku. Brak sygnalizacji.",
    participants: [car("A", "west"), car("B", "south")],
    signs: [sign("west", "stop"), sign("south", "priority")],
    question: {
      kind: "single",
      prompt: "Co powinien teraz zrobić kierowca A?",
      options: [
        { id: "wait", label: "Zaczekać, aż B przejedzie" },
        { id: "go", label: "Ruszyć, bo już się zatrzymał" },
      ],
      accepted: [["wait"]],
    },
    hint: "STOP dotyczy zarówno zatrzymania, jak i pierwszeństwa.",
    answerLabel: "A czeka na przejazd B.",
    explanation:
      "Samo zatrzymanie nie daje A pierwszeństwa. Musi jeszcze ustąpić B na drodze z pierwszeństwem.",
    watchFor: "Po zatrzymaniu ponownie oceń, czy możesz bezpiecznie wjechać.",
    steps: [
      step(["B"], "A pozostaje przed linią STOP. B przejeżdża.", "west"),
      step(["A"], "Po ustąpieniu B samochód A rusza."),
    ],
    sources: [signsLaw("§ 21 ust. 1")],
  },
  {
    ...base,
    id: "two-valid-orders",
    title: "Wybierz bezpieczny wariant",
    category: "Kolejność przejazdu",
    difficulty: 2,
    description:
      "A i B jadą prosto z przeciwnych stron, każdy swoim pasem. Brak znaków, świateł i innych uczestników. W tym zadaniu wybierz jedną bezpieczną kolejność pojedynczych przejazdów.",
    participants: [car("A", "south"), car("B", "north")],
    question: {
      kind: "order",
      prompt: "Ułóż jedną z możliwych kolejności przejazdu.",
      options: options(["A", "B"]),
      accepted: [
        ["A", "B"],
        ["B", "A"],
      ],
    },
    hint: "Ich tory się nie przecinają. Czy któryś z nich musi ustąpić drugiemu?",
    answerLabel: "A → B lub B → A. Ruch jednoczesny także jest możliwy.",
    explanation:
      "Żaden pojazd nie ma obowiązku ustąpić drugiemu w tej sytuacji. Akceptujemy obie kolejności. Mogą też jechać jednocześnie, ale tutaj ćwiczymy wybór jednej z kolejności.",
    watchFor: "Nie dopisuj obowiązku czekania, jeśli tory jazdy nie kolidują.",
    steps: [
      step(["A"], "Pokazujemy wariant A → B. A przejeżdża swoim pasem."),
      step(
        ["B"],
        "Następnie przejeżdża B. Odwrotna kolejność również jest dopuszczona.",
      ),
    ],
    sources: [law("art. 25 ust. 1")],
  },
  {
    ...base,
    id: "priority-bends",
    title: "Pierwszeństwo skręca",
    category: "Łamane pierwszeństwo",
    difficulty: 3,
    description:
      "Gruba linia na tabliczkach łączy dolny i lewy wlot. A i B są na drodze z pierwszeństwem, C na podporządkowanej. A i B jadą prosto, a C skręca w lewo. Jego tor przecina tor A i łączy się z pasem B.",
    participants: [
      car("A", "south"),
      car("B", "west"),
      car("C", "north", "left"),
    ],
    signs: [
      sign("south", "priority"),
      sign("south", "bend"),
      sign("west", "priority"),
      sign("west", "bend"),
      sign("north", "yield"),
      sign("north", "bend"),
    ],
    question: {
      kind: "multiple",
      prompt: "Komu musi ustąpić kierowca C? Zaznacz wszystkich.",
      options: options(["A", "B"]),
      accepted: [["A", "B"]],
    },
    hint: "Najpierw porównaj status dróg. Dopiero potem oceniaj relację A i B.",
    answerLabel: "C ustępuje A i B.",
    explanation:
      "A i B są na drodze z pierwszeństwem. Skręcający w lewo C ma z nimi kolizyjne tory, więc ustępuje obu. To, że A i B jadą prosto i opuszczają przebieg pierwszeństwa, nie odbiera im pierwszeństwa wobec C. Pomiędzy A i B stosujemy zasadę prawej strony: B ustępuje A.",
    watchFor:
      "Gruba linia na tabliczce pokazuje przebieg pierwszeństwa, a nie nakaz skrętu.",
    steps: [
      step(
        ["A"],
        "B ma A z prawej; C jest podporządkowany. A jedzie.",
        "south",
      ),
      step(["B"], "B nadal ma pierwszeństwo względem C.", "west"),
      step(["C"], "C skręca w lewo po ustąpieniu A i B.", "north"),
    ],
    sources: [
      law("art. 5 ust. 1, art. 25 ust. 1 oraz art. 2 pkt 23"),
      signsLaw("§ 43 ust. 1–2 oraz § 5 ust. 5 i 7"),
    ],
  },
  {
    ...base,
    id: "green-and-red",
    title: "Spójrz na sygnalizator",
    category: "Sygnalizacja świetlna",
    difficulty: 2,
    description:
      "A ma zielony sygnał S-1, B czerwony. Oba jadą prosto. Za skrzyżowaniem jest miejsce. Nie ma pieszych ani rowerzystów. Światła w tym zadaniu nie zmieniają się.",
    participants: [car("A", "south"), car("B", "east")],
    signals: [
      { approach: "south", color: "green", label: "S-1: zielone dla A" },
      { approach: "east", color: "red", label: "S-1: czerwone dla B" },
    ],
    question: first(["A", "B"], "A"),
    hint: "Zwróć uwagę, do którego wlotu przypisany jest każdy sygnalizator.",
    answerLabel: "A jedzie. B pozostaje przed sygnalizatorem.",
    explanation:
      "Zielony sygnał zezwala A na wjazd w opisanej sytuacji. Czerwony zakazuje wjazdu B.",
    watchFor:
      "Nie ruszaj tylko dlatego, że inny samochód już przejechał. Twój sygnał nadal może być czerwony.",
    steps: [
      step(
        ["A"],
        "A przejeżdża na zielonym. B czeka przez całe wyjaśnienie.",
        "south",
      ),
    ],
    sources: [law("art. 5 ust. 3"), signsLaw("§ 95 ust. 1 i 2")],
  },
  {
    ...base,
    id: "green-left",
    title: "Zielone i skręt w lewo",
    category: "Sygnalizacja świetlna",
    difficulty: 2,
    description:
      "A i B mają zwykłe zielone światło S-1, bez strzałek kierunkowych. A skręca w lewo, B z przeciwka jedzie prosto. Za skrzyżowaniem jest miejsce. Brak pieszych i rowerzystów.",
    participants: [car("A", "south", "left"), car("B", "north")],
    signals: [
      { approach: "south", color: "green", label: "S-1: zielone dla A" },
      { approach: "north", color: "green", label: "S-1: zielone dla B" },
    ],
    question: first(["A", "B"], "B"),
    hint: "Zwykłe zielone światło nie oznacza bezkolizyjnego skrętu w lewo.",
    answerLabel: "B jedzie pierwszy, A ustępuje.",
    explanation:
      "Oba pojazdy mogą wjechać, ale ich tory się przecinają. Skręcający w lewo A ustępuje B jadącemu z przeciwka prosto.",
    watchFor: "Odróżniaj zwykły sygnał S-1 od kierunkowego S-3.",
    steps: [
      step(["B"], "B jedzie prosto na zielonym. A czeka."),
      step(["A"], "Po przejeździe B samochód A skręca w lewo."),
    ],
    sources: [
      law("art. 25 ust. 1"),
      signsLaw("§ 95 ust. 1 oraz § 97 ust. 1 i 3"),
    ],
  },
  {
    ...base,
    id: "roundabout-yield",
    title: "Zanim wjedziesz na rondo",
    category: "Ruch okrężny",
    difficulty: 2,
    geometry: "roundabout",
    description:
      "A wjeżdża na jednopasowe rondo ze znakami A-7 i C-12. B jest już na rondzie i zbliża się do toru A. Oba pojazdy zjadą w prawo na rysunku; sygnalizują zjazd.",
    participants: [
      {
        ...car("A", "south", "right"),
        route: {
          start: [342, 520],
          segments: [
            { type: "line", to: [342, 455] },
            { type: "curve", c1: [342, 410], c2: [395, 342], to: [450, 342] },
            { type: "line", to: [660, 342] },
          ],
        },
      },
      {
        ...car("B", "west", "right"),
        description:
          "B: na rondzie, zbliża się do wlotu A i zjeżdża prawym wylotem",
        route: {
          start: [280, 416],
          segments: [
            { type: "curve", c1: [350, 435], c2: [390, 380], to: [418, 352] },
            { type: "curve", c1: [429, 342], c2: [450, 342], to: [470, 342] },
            { type: "line", to: [660, 342] },
          ],
        },
      },
    ],
    signs: [sign("south", "yield"), sign("south", "roundabout")],
    question: first(["A", "B"], "B"),
    hint: "Znaczenie ma zestaw dwóch znaków przed wjazdem.",
    answerLabel: "A ustępuje B będącemu na rondzie.",
    explanation:
      "Połączenie A-7 z C-12 nakazuje wjeżdżającemu ustąpić pojazdowi na skrzyżowaniu o ruchu okrężnym.",
    watchFor:
      "Nie wyciągaj wniosku o pierwszeństwie wyłącznie z okrągłego kształtu jezdni.",
    steps: [
      step(
        ["B"],
        "A czeka przed wjazdem. B przejeżdża i opuszcza rondo.",
        "south",
      ),
      step(
        ["A"],
        "Kiedy tor jest wolny, A wjeżdża i zjeżdża pierwszym wylotem.",
      ),
    ],
    sources: [signsLaw("§ 36 ust. 1 i 2")],
  },
  {
    ...base,
    id: "pedestrian-on-crossing",
    title: "Pieszy na przejściu",
    category: "Piesi",
    difficulty: 1,
    geometry: "crosswalk",
    description:
      "Pieszy P jest już na przejściu bez sygnalizacji i idzie od prawej do lewej. A zbliża się do przejścia swoim pasem. Nie ma innych uczestników.",
    participants: [car("A", "south"), ped(368)],
    signs: [sign("south", "crossing")],
    question: {
      kind: "single",
      prompt: "Jak powinien zachować się kierowca A?",
      options: [
        { id: "wait", label: "Zwolnić i zatrzymać się, aby ustąpić pieszemu" },
        { id: "go", label: "Przejechać przed pieszym" },
      ],
      accepted: [["wait"]],
    },
    hint: "Sprawdź położenie pieszego względem przejścia i toru A.",
    answerLabel: "A ustępuje pieszemu P.",
    explanation:
      "Pieszy jest na przejściu i ma pierwszeństwo. W tej sytuacji A zatrzymuje się, aby pozwolić mu przejść.",
    watchFor:
      "Zbliżając się do przejścia, zachowaj szczególną ostrożność i zmniejsz prędkość.",
    steps: [
      step(["P"], "A czeka przed przejściem. Pieszy przechodzi.", "P"),
      step(["A"], "Po ustąpieniu pieszemu A kontynuuje jazdę."),
    ],
    sources: [
      law("art. 13 ust. 1a oraz art. 26 ust. 1"),
      signsLaw("§ 47 ust. 1 oraz § 88 ust. 1"),
    ],
  },
  {
    ...base,
    id: "zipper-jam",
    title: "Jeden za jednego",
    category: "Jazda na suwak",
    difficulty: 3,
    geometry: "merge",
    description:
      "Ruch jest znacznie spowolniony: samochody poruszają się w korku. Lewy pas kończy się. A dojechał bezpośrednio do końca pasa. B właśnie mija miejsce zwężenia, C jest następnym pojazdem na prawym pasie.",
    participants: [
      {
        ...car("A", "south", "right"),
        description: "A: koniec lewego pasa, zmienia pas na prawy",
        route: {
          start: [258, 365],
          segments: [
            { type: "curve", c1: [258, 300], c2: [342, 310], to: [342, 240] },
            { type: "line", to: [342, -60] },
          ],
        },
      },
      {
        ...car("B", "south"),
        description: "B: prawy pas, przed miejscem wpuszczenia A",
        route: {
          start: [342, 220],
          segments: [{ type: "line", to: [342, -60] }],
        },
      },
      {
        ...car("C", "south"),
        description: "C: prawy pas, za B",
        route: {
          start: [342, 475],
          segments: [{ type: "line", to: [342, -60] }],
        },
      },
    ],
    question: {
      kind: "order",
      prompt: "Ułóż kolejność przejazdu przez zwężenie.",
      options: options(["A", "B", "C"]),
      accepted: [["B", "A", "C"]],
    },
    hint: "C powinien umożliwić wjazd jednemu pojazdowi z kończącego się pasa, bezpośrednio przed zwężeniem.",
    answerLabel: "B → A → C.",
    explanation:
      "W warunkach znacznego spowolnienia i zaniku pasa C wpuszcza jeden samochód z kończącego się pasa. Tutaj jest nim A. B jest już przed miejscem zmiany pasa.",
    watchFor:
      "Suwak stosujemy przy znacznym spowolnieniu i bezpośrednio przed końcem pasa lub przeszkodą.",
    steps: [
      step(["B"], "B przejeżdża przed miejscem włączenia A."),
      step(
        ["A"],
        "C pozostawia miejsce. A zmienia pas bezpośrednio przed zwężeniem.",
      ),
      step(["C"], "Za wpuszczonym A przejeżdża C."),
    ],
    sources: [law("art. 22 ust. 4a")],
  },
  {
    ...base,
    id: "merge-free-flow",
    title: "A gdy nie ma korka?",
    category: "Zmiana pasa",
    difficulty: 3,
    geometry: "merge",
    description:
      "Ruch odbywa się płynnie, bez znacznego zmniejszenia prędkości. Lewy pas się kończy. A chce zmienić pas na prawy, po którym zbliża się B. Tory pojazdów kolidują.",
    participants: [
      {
        ...car("A", "south", "right"),
        description: "A: lewy pas, zamierza zmienić pas na prawy",
        route: {
          start: [258, 365],
          segments: [
            { type: "curve", c1: [258, 300], c2: [342, 310], to: [342, 240] },
            { type: "line", to: [342, -60] },
          ],
        },
      },
      {
        ...car("B", "south"),
        route: {
          start: [342, 435],
          segments: [{ type: "line", to: [342, -60] }],
        },
      },
    ],
    question: {
      kind: "single",
      prompt: "Jak powinien postąpić kierowca A?",
      options: [
        { id: "yield", label: "Ustąpić B przy zmianie pasa" },
        { id: "zipper", label: "Wjechać przed B, powołując się na suwak" },
      ],
      accepted: [["yield"]],
    },
    hint: "Porównaj tempo ruchu z warunkami wymaganymi dla jazdy na suwak.",
    answerLabel: "A ustępuje B.",
    explanation:
      "Nie występuje znaczne zmniejszenie prędkości, więc wyjątek dotyczący suwaka nie ma tu zastosowania. A zmieniając pas ustępuje pojazdowi jadącemu po pasie docelowym.",
    watchFor: "Sam koniec pasa nie wystarcza do zastosowania jazdy na suwak.",
    steps: [
      step(
        ["B"],
        "B przejeżdża swoim pasem. A nie wymusza zmiany prędkości B.",
      ),
      step(["A"], "Po ustąpieniu B samochód A bezpiecznie zmienia pas."),
    ],
    sources: [law("art. 22 ust. 4 i 4a")],
  },
];
