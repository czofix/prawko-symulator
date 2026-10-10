import type { Approach, Scenario } from "../../domain/types";
import { SignShape } from "../SignShape";
import { project } from "./projection";
const positions: Record<Approach, [number, number]> = {
  south: [424, 474],
  north: [176, 126],
  east: [474, 176],
  west: [126, 424],
};
export function RoadFurniture({
  scenario,
  highlight,
  compact,
  onDetail,
}: {
  scenario: Scenario;
  highlight?: string;
  compact: boolean;
  onDetail: (label: string) => void;
}) {
  return (
    <>
      {(Object.keys(positions) as Approach[]).map((approach) => {
        const signs = scenario.signs.filter(
          (sign) => sign.approach === approach,
        );
        if (!signs.length) return null;
        const [x, y] = positions[approach];
        // In this camera view the stacked signs otherwise cover the exit arrowheads.
        const point = project(
          x +
            (scenario.geometry === "roundabout" && approach === "south"
              ? 60
              : 0),
          y,
        );
        const actors = scenario.participants
          .filter((p) => p.approach === approach && p.kind === "car")
          .map((p) => p.id)
          .join(", ");
        const top = -45 - (signs.length - 1) * 57;
        return (
          <g key={approach} transform={`translate(${point.x} ${point.y})`}>
            <g aria-hidden="true" pointerEvents="none">
              <path
                d="M0 0 22 13"
                stroke="#27332b"
                strokeWidth="4"
                opacity=".23"
              />
              <ellipse rx="5" ry="3" fill="#a5ab9e" />
              <path d={`M0 0V${top}`} stroke="#66706d" strokeWidth="4" />
              <path d={`M-1 0V${top}`} stroke="#e2e7de" strokeWidth="1.5" />
            </g>
            {signs.map((sign, index) => (
              <g
                key={sign.type}
                transform={`translate(0 ${top + index * 57})`}
                role="button"
                tabIndex={compact ? -1 : 0}
                aria-label={sign.label}
                onClick={() => onDetail(sign.label)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onDetail(sign.label);
                  }
                }}
                className="map-control road-sign"
              >
                <rect
                  x="-37"
                  y="-28"
                  width="74"
                  height="56"
                  fill="transparent"
                />
                {highlight === approach && (
                  <circle
                    r="27"
                    fill="#ffecaa55"
                    stroke="#ffcf5b"
                    strokeWidth="3"
                  />
                )}
                <g
                  transform={
                    sign.type === "bend"
                      ? `rotate(${{ south: 0, west: -90, north: 180, east: 90 }[approach]})`
                      : undefined
                  }
                >
                  <SignShape type={sign.type} />
                </g>
                <title>{sign.label}</title>
              </g>
            ))}
            {actors && (
              <g
                transform="translate(0 -9)"
                aria-hidden="true"
                pointerEvents="none"
              >
                <rect
                  x="-23"
                  y="-9"
                  width="46"
                  height="18"
                  rx="9"
                  fill="#17322f"
                />
                <text
                  y="3.5"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#f0f5df"
                >
                  dla {actors}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {scenario.signals.map((signal) => {
        const point = project(...positions[signal.approach]);
        const actors = scenario.participants
          .filter((p) => p.approach === signal.approach)
          .map((p) => p.id)
          .join(", ");
        return (
          <g
            key={signal.approach}
            transform={`translate(${point.x} ${point.y})`}
            role="button"
            tabIndex={compact ? -1 : 0}
            aria-label={signal.label}
            onClick={() => onDetail(signal.label)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDetail(signal.label);
              }
            }}
            className="map-control road-sign"
          >
            <path
              d="M0 0 30 17"
              stroke="#27332b"
              strokeWidth="4"
              opacity=".23"
            />
            <path d="M0 0V-70" stroke="#66706d" strokeWidth="5" />
            <path d="M-1 0V-70" stroke="#e2e7de" strokeWidth="2" />
            <rect x="-37" y="-107" width="74" height="115" fill="transparent" />
            <g transform="translate(0 -62)">
              {highlight === signal.approach && (
                <rect
                  x="-23"
                  y="-43"
                  width="46"
                  height="86"
                  rx="14"
                  fill="#ffecaa33"
                  stroke="#ffcf5b"
                  strokeWidth="3"
                />
              )}
              <rect
                x="-17"
                y="-37"
                width="34"
                height="76"
                rx="8"
                fill="#252e30"
                stroke="#d9ddd2"
                strokeWidth="2"
              />
              {["red", "amber", "green"].map((color, i) => (
                <g key={color}>
                  <circle cy={-24 + i * 24} r="10" fill="#101c1d" />
                  <circle
                    cy={-24 + i * 24}
                    r="7.5"
                    fill={
                      signal.color === color
                        ? color === "red"
                          ? "#ff514e"
                          : "#54e887"
                        : "#354442"
                    }
                  />
                  {signal.color === color && (
                    <circle
                      cy={-24 + i * 24}
                      r="12"
                      fill={color === "red" ? "#ff514e" : "#54e887"}
                      opacity=".15"
                    />
                  )}
                </g>
              ))}
            </g>
            <rect
              x="-22"
              y="-19"
              width="44"
              height="16"
              rx="3"
              fill="#f0efe4"
              stroke="#9ca49a"
              strokeWidth=".8"
            />
            <text
              y="-7.5"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#263c37"
              aria-hidden="true"
            >
              dla {actors}
            </text>
            <title>{signal.label}</title>
          </g>
        );
      })}
    </>
  );
}
