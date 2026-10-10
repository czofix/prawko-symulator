import { useId, useMemo, useState } from "react";
import { maneuverEndProgress, poseAt, sampleRoute } from "../domain/routes";
import type { ParticipantId, Scenario } from "../domain/types";
import type { Playback } from "../hooks/usePlayback";
import { RoadSurface } from "./RoadSurface";
import { SceneMaterials } from "./scene/SceneMaterials";
import { Scenery } from "./scene/Scenery";
import { RoadFurniture } from "./scene/RoadFurniture";
import { VehicleModel } from "./scene/VehicleModel";
import { groundTransform, project } from "./scene/projection";
import { visibleRoute } from "./scene/visibleRoute";
import { DirectionArrows } from "./scene/DirectionArrows";

export const actorColors: Record<ParticipantId, string> = {
  A: "#e8ede8",
  B: "#70b9e5",
  C: "#ecaa55",
  D: "#d77e79",
  P: "#ffe394",
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
  const routes = useMemo(
    () =>
      Object.fromEntries(
        scenario.participants.map((p) => [p.id, visibleRoute(p)]),
      ),
    [scenario],
  );
  const paths = useMemo(
    () =>
      Object.fromEntries(
        scenario.participants.map((p) => [p.id, sampleRoute(routes[p.id])]),
      ),
    [scenario, routes],
  );
  const turnEnds = useMemo(
    () =>
      Object.fromEntries(
        scenario.participants.map((p) => [
          p.id,
          maneuverEndProgress(routes[p.id]),
        ]),
      ),
    [scenario, routes],
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
  const actors = scenario.participants
    .map((p) => {
      const fraction = progressFor(p.id),
        pose = poseAt(paths[p.id], fraction);
      return {
        participant: p,
        fraction,
        pose,
        screen: project(pose.x, pose.y),
      };
    })
    .sort((a, b) => a.screen.y - b.screen.y);
  return (
    <div className={`road-scene ${compact ? "compact" : ""}`}>
      <svg
        viewBox="0 0 600 600"
        aria-label={`Sytuacja drogowa: ${scenario.description}`}
        role="group"
        className="realistic-scene"
      >
        <SceneMaterials id={id} />
        <g transform={groundTransform}>
          <RoadSurface scenario={scenario} id={id} />
          {showRoutes && (
            <DirectionArrows participants={scenario.participants} />
          )}
        </g>
        <Scenery id={id} />
        {actors.map(({ participant: p, fraction, pose, screen }) => {
          const selectable =
            interactive &&
            scenario.question.options.some((o) => o.actor === p.id);
          const chosen = selected.includes(p.id);
          const indicating =
            p.maneuver !== "straight" && fraction < turnEnds[p.id];
          return (
            <g
              key={p.id}
              transform={`translate(${screen.x} ${screen.y})`}
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
              data-turn-signal={indicating}
              data-progress={fraction.toFixed(3)}
            >
              <ellipse cy="-8" rx="39" ry="48" fill="transparent" />
              {(chosen || step?.actors.includes(p.id)) && (
                <ellipse
                  rx={p.kind === "car" ? 38 : 23}
                  ry={p.kind === "car" ? 29 : 16}
                  fill={chosen ? "#ffffff20" : "#ffdf7525"}
                  stroke={chosen ? "#fff" : "#ffe19a"}
                  strokeWidth="2.5"
                  strokeDasharray={chosen ? undefined : "5 5"}
                />
              )}
              {p.kind === "car" ? (
                <VehicleModel
                  angle={pose.angle}
                  color={actorColors[p.id]}
                  maneuver={p.maneuver}
                  indicating={indicating}
                  id={`${id}-car-${p.id}`}
                  shadowId={id}
                />
              ) : (
                <g aria-hidden="true">
                  <ellipse
                    cx="7"
                    cy="4"
                    rx="15"
                    ry="6"
                    fill="#26392f"
                    opacity=".25"
                  />
                  <path
                    d="M-3 -13 -7 0M3 -13 8 1"
                    stroke="#253c4b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M-5 -26 5 -26 6 -12H-6Z"
                    fill="#d99c52"
                    stroke="#f5c674"
                  />
                  <path
                    d="M-5 -24 -10 -15M5 -24 11 -18"
                    stroke="#e2b78b"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cy="-32" r="5" fill="#dfb28a" />
                  <path d="M-5 -34Q0 -41 5 -34" fill="#665743" />
                </g>
              )}
              <g
                transform={`translate(${p.kind === "car" ? 0 : 20} ${p.kind === "car" ? -21 : -24})`}
                pointerEvents="none"
                aria-hidden="true"
              >
                <circle
                  r="12"
                  fill="#172b36"
                  stroke={chosen ? "#fff" : actorColors[p.id]}
                  strokeWidth="2"
                />
                <text
                  y="5.5"
                  textAnchor="middle"
                  fill="white"
                  fontWeight="800"
                  fontSize="16"
                >
                  {p.id}
                </text>
              </g>
            </g>
          );
        })}
        <RoadFurniture
          scenario={scenario}
          highlight={step?.highlight}
          compact={compact}
          onDetail={setDetail}
        />
        <rect
          width="600"
          height="600"
          fill={`url(#${id}-light)`}
          pointerEvents="none"
        />
        {!compact && (
          <g aria-hidden="true" pointerEvents="none">
            <rect
              x="16"
              y="16"
              width="184"
              height="28"
              rx="14"
              fill="#142a2c"
              opacity=".88"
            />
            <circle cx="31" cy="30" r="3" fill="#a5e688" />
            <text
              x="42"
              y="34"
              fill="#f0f5df"
              fontSize="10"
              fontWeight="600"
              letterSpacing="1.2"
            >
              WIDOK PRZESTRZENNY
            </text>
            {showRoutes && (
              <g transform="translate(18 568)">
                <rect
                  x="0"
                  y="-12"
                  width="191"
                  height="26"
                  rx="13"
                  fill="#142a2c"
                  opacity=".88"
                />
                <path
                  d="M12 1H31m-5-5 5 5-5 5"
                  fill="none"
                  stroke="#acff70"
                  strokeWidth="2.5"
                />
                <text x="41" y="5" fontSize="11" fill="#f0f5df">
                  Planowany kierunek jazdy
                </text>
              </g>
            )}
          </g>
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
