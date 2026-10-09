import type { Scenario } from "../domain/types";
export function RoadSurface({
  scenario,
  id,
}: {
  scenario: Scenario;
  id: string;
}) {
  const verticalOnly =
    scenario.geometry === "crosswalk" || scenario.geometry === "merge";
  return (
    <>
      <rect width="600" height="600" fill="#1c302b" />
      <rect width="600" height="600" fill={`url(#${id}-grid)`} />
      {scenario.geometry === "roundabout" && (
        <circle cx="300" cy="300" r="147" fill="#748077" />
      )}
      <path
        d={
          verticalOnly
            ? "M208 0H392V600H208Z"
            : "M208 0H392V208H600V392H392V600H208V392H0V208H208Z"
        }
        fill="#748077"
      />
      {scenario.geometry === "roundabout" && (
        <circle cx="300" cy="300" r="137" fill="#303c45" />
      )}
      <path
        d={
          verticalOnly
            ? "M218 0H382V600H218Z"
            : "M218 0H382V218H600V382H382V600H218V382H0V218H218Z"
        }
        fill="#303c45"
      />
      {scenario.geometry !== "merge" && (
        <path
          d={
            verticalOnly
              ? "M300 0V600"
              : "M300 0V205M300 395V600M0 300H205M395 300H600"
          }
          stroke="#a3adb0"
          strokeWidth="2"
          strokeDasharray="14 16"
        />
      )}
      {scenario.geometry === "merge" && (
        <>
          <path
            d="M218 0H300V250L218 350Z"
            fill="#1c302b"
            stroke="#adb8b7"
            strokeWidth="3"
          />
          <path
            d="M226 210H288M226 240H288M226 270H276M226 300H252"
            stroke="#c6c9bc"
            strokeWidth="6"
          />
          <path
            d="M300 355V600"
            stroke="#a3adb0"
            strokeWidth="2"
            strokeDasharray="14 16"
          />
          <path
            d="M244 307H264L254 289"
            fill="none"
            stroke="#e8ae73"
            strokeWidth="5"
          />
          <text x="425" y="266" fill="#e2d6be" fontSize="13">
            Koniec pasa
          </text>
          <path d="M418 278 305 280" stroke="#e2d6be" strokeDasharray="3 5" />
        </>
      )}
      {scenario.geometry === "roundabout" && (
        <>
          <circle cx="300" cy="300" r="78" fill="#829088" />
          <circle cx="300" cy="300" r="69" fill="#28443a" />
          <circle
            cx="300"
            cy="300"
            r="54"
            fill="none"
            stroke="#426354"
            strokeWidth="1"
          />
          <path
            d="M288 255A47 47 0 1 0 345 308M345 308l-12 8m12-8 6 14"
            stroke="#82a393"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {scenario.geometry === "crosswalk" &&
        Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={222 + i * 27}
            y="391"
            width="17"
            height="38"
            fill="#d5dedc"
            opacity="0.9"
          />
        ))}
      {scenario.signs
        .filter((s) => s.type === "stop" || s.type === "yield")
        .map((s) => (
          <path
            key={s.approach}
            d={
              s.type === "yield"
                ? "M307 454H320L313.5 464Z M327 454H340L333.5 464Z M347 454H360L353.5 464Z M367 454H380L373.5 464Z"
                : "M302 456H381"
            }
            transform={`rotate(${{ south: 0, west: 90, north: 180, east: 270 }[s.approach]} 300 300)`}
            stroke="#d3dddc"
            strokeWidth={s.type === "yield" ? "0" : "4"}
            fill={s.type === "yield" ? "#d3dddc" : "none"}
          />
        ))}
    </>
  );
}
