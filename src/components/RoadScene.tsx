import { useId, useMemo, useState } from "react";
import {
  poseAt,
  sampleRoute,
  svgPath,
  maneuverEndProgress,
} from "../domain/routes";
import type { Approach, ParticipantId, Scenario } from "../domain/types";
import { SignShape } from "./SignShape";
import { RoadSurface } from "./RoadSurface";
import type { Playback } from "../hooks/usePlayback";
export const actorColors: Record<ParticipantId, string> = {
  A: "#64dfca",
  B: "#83b6ff",
  C: "#ffc078",
  D: "#ce9ffc",
  P: "#ffe394",
};
const positions: Record<Approach, [number, number]> = {
  south: [424, 474],
  north: [176, 126],
  east: [474, 176],
  west: [126, 424],
};
export function RoadScene({
  scenario,
  selected = [],
  onSelect,
  showRoutes = true,
  playback,
  interactive = true,
  compact = false,
}: {
  scenario: Scenario;
  selected?: string[];
  onSelect?: (id: string) => void;
  showRoutes?: boolean;
  playback?: Playback;
  interactive?: boolean;
  compact?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const [detail, setDetail] = useState("");
  const paths = useMemo(
    () =>
      Object.fromEntries(
        scenario.participants.map((p) => [p.id, sampleRoute(p.route)]),
      ),
    [scenario],
  );
  const turnEnds = useMemo(
    () =>
      Object.fromEntries(
        scenario.participants.map((p) => [p.id, maneuverEndProgress(p.route)]),
      ),
    [scenario],
  );
  const step = playback ? scenario.steps[playback.index] : undefined;
  const progressFor = (actor: ParticipantId) => {
    if (!playback) return 0;
    const actorStep = scenario.steps.findIndex((s) => s.actors.includes(actor));
    if (actorStep === -1) return 0;
    return playback.finished || actorStep < playback.index
      ? 1
      : actorStep === playback.index
        ? playback.fraction
        : 0;
  };
  return (
    <div className={`road-scene ${compact ? "compact" : ""}`}>
      <svg
        viewBox="0 0 600 600"
        aria-label={`Sytuacja drogowa: ${scenario.description}`}
        role="group"
      >
        <defs>
          <pattern
            id={`${id}-grid`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0H0V30"
              fill="none"
              stroke="#28362f"
              strokeWidth="0.6"
            />
          </pattern>
          {scenario.participants.map((p) => (
            <marker
              key={p.id}
              id={`${id}-arrow-${p.id}`}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0 0 6 3 0 6"
                fill="none"
                stroke={actorColors[p.id]}
                strokeWidth="1.5"
              />
            </marker>
          ))}
        </defs>
        <RoadSurface scenario={scenario} id={id} />
        {showRoutes &&
          scenario.participants.map((p) => (
            <path
              key={p.id}
              d={svgPath(p.route)}
              fill="none"
              stroke={actorColors[p.id]}
              strokeWidth="3"
              strokeDasharray="7 8"
              opacity="0.6"
              markerEnd={`url(#${id}-arrow-${p.id})`}
            />
          ))}
        {showRoutes &&
          scenario.participants.flatMap((p) =>
            [0.23, 0.55].map((fraction) => {
              const pose = poseAt(paths[p.id], fraction);
              return (
                <path
                  key={`${p.id}-${fraction}`}
                  d="M-5 4 0 -5 5 4"
                  transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`}
                  fill="none"
                  stroke={actorColors[p.id]}
                  strokeWidth="3"
                />
              );
            }),
          )}
        {scenario.signs.map((s, i) => {
          const [baseX, baseY] = positions[s.approach];
          const offset =
            scenario.signs
              .slice(0, i)
              .filter((other) => other.approach === s.approach).length * 76;
          const x =
            baseX +
            (s.approach === "west"
              ? -offset
              : s.approach === "east"
                ? offset
                : 0);
          const y =
            baseY +
            (s.approach === "north"
              ? -offset
              : s.approach === "south"
                ? offset
                : 0);
          return (
            <g
              key={`${s.approach}-${s.type}`}
              transform={`translate(${x} ${y})`}
              role="button"
              tabIndex={compact ? -1 : 0}
              aria-label={s.label}
              onClick={() => setDetail(s.label)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDetail(s.label);
                }
              }}
              className="map-control"
            >
              <rect x="-37" y="-37" width="74" height="74" fill="transparent" />
              {step?.highlight === s.approach && (
                <circle r="29" fill="none" stroke="#ffe19a" strokeWidth="3" />
              )}
              <g
                transform={
                  s.type === "bend"
                    ? `rotate(${{ south: 0, west: -90, north: 180, east: 90 }[s.approach]})`
                    : undefined
                }
              >
                <SignShape type={s.type} />
              </g>
              <title>{s.label}</title>
            </g>
          );
        })}
        {scenario.signals.map((s) => {
          const [x, y] = positions[s.approach];
          return (
            <g
              key={s.approach}
              transform={`translate(${x} ${y})`}
              role="button"
              tabIndex={compact ? -1 : 0}
              aria-label={s.label}
              onClick={() => setDetail(s.label)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDetail(s.label);
                }
              }}
              className="map-control"
            >
              <rect x="-37" y="-37" width="74" height="74" fill="transparent" />
              {step?.highlight === s.approach && (
                <rect
                  x="-23"
                  y="-43"
                  width="46"
                  height="86"
                  rx="14"
                  fill="none"
                  stroke="#ffe19a"
                  strokeWidth="3"
                />
              )}
              <rect
                x="-16"
                y="-36"
                width="32"
                height="72"
                rx="9"
                fill="#111a22"
                stroke="#829099"
              />
              {["red", "amber", "green"].map((c, i) => (
                <circle
                  key={c}
                  cy={-23 + i * 23}
                  r="8"
                  fill={
                    s.color === c
                      ? c === "red"
                        ? "#ff6c75"
                        : "#65edab"
                      : "#39454b"
                  }
                />
              ))}
              <title>{s.label}</title>
            </g>
          );
        })}
        {scenario.participants.map((p) => {
          const fraction = progressFor(p.id);
          const pose = poseAt(paths[p.id], fraction);
          const selectable =
            interactive &&
            scenario.question.options.some((o) => o.actor === p.id);
          const chosen = selected.includes(p.id);
          return (
            <g
              key={p.id}
              transform={`translate(${pose.x} ${pose.y})`}
              opacity={fraction >= 1 && p.kind === "car" ? 0 : 1}
              role={selectable ? "button" : "img"}
              tabIndex={selectable ? 0 : undefined}
              aria-label={p.description}
              aria-pressed={selectable ? chosen : undefined}
              onClick={() => selectable && onSelect?.(p.id)}
              onKeyDown={(e) => {
                if (selectable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect?.(p.id);
                }
              }}
              className={selectable ? "map-control vehicle" : "vehicle"}
              data-actor={p.id}
              data-turn-signal={
                p.maneuver !== "straight" && fraction < turnEnds[p.id]
              }
              data-progress={fraction.toFixed(3)}
            >
              <circle r={p.kind === "car" ? 35 : 25} fill="transparent" />
              {(chosen || step?.actors.includes(p.id)) && (
                <circle
                  r={p.kind === "car" ? 34 : 24}
                  stroke={chosen ? "#fff" : "#ffe19a"}
                  fill="none"
                  strokeWidth="2"
                  strokeDasharray={chosen ? undefined : "5 5"}
                />
              )}
              {p.kind === "car" ? (
                <g transform={`rotate(${pose.angle})`}>
                  <rect
                    x="-19"
                    y="-31"
                    width="38"
                    height="62"
                    rx="10"
                    fill={actorColors[p.id]}
                    stroke="#111d28"
                    strokeWidth="2"
                  />
                  <path d="M-14 -18Q0 -24 14 -18L12 -7H-12Z" fill="#193743" />
                  <path d="M-12 17H12L13 23H-13Z" fill="#234452" />
                  <rect
                    x="-20"
                    y="-10"
                    width="4"
                    height="10"
                    rx="2"
                    fill="#132a32"
                  />
                  <rect
                    x="16"
                    y="-10"
                    width="4"
                    height="10"
                    rx="2"
                    fill="#132a32"
                  />
                  <path
                    d="M-13 -28H-6M6 -28H13"
                    stroke="#f2ffe7"
                    strokeWidth="3"
                  />
                  {p.maneuver !== "straight" && fraction < turnEnds[p.id] && (
                    <>
                      <circle
                        cx={p.maneuver === "left" ? -17 : 17}
                        cy="-24"
                        r="4"
                        fill="#ffb53e"
                        stroke="#4a350a"
                      />
                      <circle
                        cx={p.maneuver === "left" ? -17 : 17}
                        cy="24"
                        r="3"
                        fill="#ffb53e"
                      />
                    </>
                  )}
                </g>
              ) : (
                <>
                  <circle r="17" fill={actorColors.P} />
                  <circle cy="-7" r="6" fill="#33414a" />
                  <path d="M-8 10Q0 -4 8 10" fill="#33414a" />
                </>
              )}
              <text
                y={p.kind === "car" ? 9 : 36}
                textAnchor="middle"
                fill={p.kind === "car" ? "#132c37" : "#ffe394"}
                fontWeight="900"
                fontSize="18"
                pointerEvents="none"
              >
                {p.id}
              </text>
            </g>
          );
        })}
        {!compact && (
          <>
            <text x="28" y="34" fill="#b3c6bb" fontSize="11" letterSpacing="2">
              WIDOK Z GÓRY
            </text>
            <g transform="translate(565 35)">
              <path d="M0 10V-10m-5 6 5-6 5 6" stroke="#9cb2a5" fill="none" />
              <text
                x="0"
                y="27"
                textAnchor="middle"
                fill="#9cb2a5"
                fontSize="10"
              >
                N
              </text>
            </g>
          </>
        )}
      </svg>
      {detail && (
        <div className="sign-detail" role="status">
          <span>{detail}</span>
          <button aria-label="Zamknij opis znaku" onClick={() => setDetail("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
