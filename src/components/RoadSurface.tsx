import type { Scenario } from "../domain/types";
export function RoadSurface({
  scenario,
  id,
}: {
  scenario: Scenario;
  id: string;
}) {
  const verticalOnly =
    scenario.geometry === "crosswalk" ||
    scenario.geometry === "merge" ||
    scenario.geometry === "lanes";
  const road = verticalOnly
    ? "M218 -400H382V1000H218Z"
    : scenario.geometry === "driveway"
      ? "M218 -400H382V1000H218V426Q218 382 174 382H-400V218H174Q218 218 218 174Z"
      : "M218 -400H382V174Q382 218 426 218H1000V382H426Q382 382 382 426V1000H218V426Q218 382 174 382H-400V218H174Q218 218 218 174Z";
  return (
    <g aria-hidden="true">
      <rect
        x="-500"
        y="-500"
        width="1600"
        height="1600"
        fill={`url(#${id}-grass)`}
      />
      <path
        d={road}
        fill={`url(#${id}-paving)`}
        stroke="#576747"
        strokeWidth="57"
      />
      <path
        d={road}
        fill={`url(#${id}-paving)`}
        stroke={`url(#${id}-paving)`}
        strokeWidth="52"
      />
      {scenario.geometry === "roundabout" && (
        <circle
          cx="300"
          cy="300"
          r="137"
          fill={`url(#${id}-asphalt)`}
          stroke="#e0dfce"
          strokeWidth="5"
        />
      )}
      <path
        d={road}
        fill={`url(#${id}-asphalt)`}
        stroke="#ecebdf"
        strokeWidth="4"
      />
      {scenario.geometry === "roundabout" && (
        <circle cx="300" cy="300" r="135" fill={`url(#${id}-asphalt)`} />
      )}
      {!["merge", "lanes"].includes(scenario.geometry) && (
        <path
          d={
            scenario.geometry === "driveway"
              ? "M297 -400V1000M303 -400V1000"
              : verticalOnly
                ? "M297 -400V374M303 -400V374M297 445V1000M303 445V1000"
                : "M297 -400V196M303 -400V196M297 404V1000M303 404V1000M-400 297H196M-400 303H196M404 297H1000M404 303H1000"
          }
          stroke="#eeeee2"
          strokeWidth="2"
          opacity=".85"
        />
      )}
      {scenario.geometry === "driveway" && (
        <path d="M193 218V382" stroke={`url(#${id}-paving)`} strokeWidth="30" />
      )}
      {scenario.geometry === "lanes" && (
        <path
          d="M300 -400V1000"
          stroke="#f5f1df"
          strokeWidth="3"
          strokeDasharray="18 20"
        />
      )}
      {["lanes", "merge"].includes(scenario.geometry) &&
        [258, 342].map((x) => (
          <path
            key={x}
            d={`M${x} 588V556m-7 8 7-8 7 8`}
            stroke="#f5f1df"
            strokeWidth="3"
            fill="none"
          />
        ))}
      {scenario.geometry === "merge" && (
        <>
          <path
            d="M218 -400H300V250L218 350Z"
            fill={`url(#${id}-asphalt)`}
            stroke="#f1efe3"
            strokeWidth="3"
          />
          <path
            d="M224 0L294 65M224 40L294 105M224 80L294 145M224 120L294 185M224 160L294 225M224 200L283 258M224 240L264 282M224 280L244 304"
            stroke="#efeee3"
            strokeWidth="5"
          />
          <path
            d="M300 355V1000"
            stroke="#f5f1df"
            strokeWidth="3"
            strokeDasharray="18 20"
          />
          <path
            d="M245 396V375Q245 358 268 347M253 348 269 347 268 363"
            fill="none"
            stroke="#f2eee0"
            strokeWidth="4"
          />
        </>
      )}
      {scenario.geometry === "roundabout" && (
        <>
          <circle cx="300" cy="300" r="78" fill="#ecebdf" />
          <circle cx="300" cy="300" r="73" fill={`url(#${id}-paving)`} />
          <circle
            cx="300"
            cy="300"
            r="63"
            fill={`url(#${id}-grass)`}
            stroke="#9ba67b"
            strokeWidth="2"
          />
          <circle cx="300" cy="300" r="30" fill="#607e4b" />
          {Array.from({ length: 14 }, (_, i) => (
            <circle
              key={i}
              cx={300 + Math.cos((i * Math.PI) / 7) * 35}
              cy={300 + Math.sin((i * Math.PI) / 7) * 35}
              r="6"
              fill={i % 2 ? "#b0b87a" : "#819854"}
            />
          ))}
        </>
      )}
      {scenario.geometry === "crosswalk" &&
        !scenario.markings &&
        Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={222 + i * 27}
            y="391"
            width="17"
            height="38"
            fill="#faf8eb"
          />
        ))}
      {scenario.cycleTrack && (
        <path d="M414 -400V1000" stroke="#b2725b" strokeWidth="32" />
      )}
      {scenario.markings?.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.rotation})`}>
          {m.kind === "pedestrian" ? (
            Array.from({ length: 6 }, (_, j) => (
              <rect
                key={j}
                x={-78 + j * 27}
                y="-19"
                width="17"
                height="38"
                fill="#faf8eb"
              />
            ))
          ) : (
            <>
              <path d="M-82 0H82" stroke="#b2725b" strokeWidth="32" />
              <path
                d="M-82 -20H82M-82 20H82"
                stroke="#faf8eb"
                strokeWidth="6"
                strokeDasharray="12 9"
              />
            </>
          )}
        </g>
      ))}
      {scenario.signs
        .filter((s) => s.type === "stop" || s.type === "yield")
        .map((s) => (
          <g
            key={s.approach}
            transform={`rotate(${{ south: 0, west: 90, north: 180, east: 270 }[s.approach]} 300 300)`}
          >
            <path
              d={
                s.type === "yield"
                  ? "M307 454H320L313.5 464Z M327 454H340L333.5 464Z M347 454H360L353.5 464Z M367 454H380L373.5 464Z"
                  : "M302 456H381"
              }
              stroke="#f9f6e9"
              strokeWidth={s.type === "yield" ? 0 : 5}
              fill={s.type === "yield" ? "#f9f6e9" : "none"}
            />
            {s.type === "stop" && (
              <text
                x="341"
                y="486"
                textAnchor="middle"
                fill="#f9f6e9"
                fontSize="17"
                fontWeight="700"
                letterSpacing="3"
              >
                STOP
              </text>
            )}
          </g>
        ))}
    </g>
  );
}
