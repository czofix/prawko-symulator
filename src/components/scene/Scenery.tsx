import { memo } from "react";
import { groundTransform, project } from "./projection";
const trees = [
  [76, 75, 34],
  [113, 43, 25],
  [507, 90, 33],
  [551, 137, 25],
  [71, 521, 34],
  [106, 561, 24],
  [519, 522, 31],
  [559, 565, 28],
];
export const Scenery = memo(function Scenery({ id }: { id: string }) {
  return (
    <g aria-hidden="true" pointerEvents="none">
      <g transform={groundTransform}>
        {trees.map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x + 21}
            cy={y + 22}
            rx={r * 1.2}
            ry={r * 0.82}
            fill="#243c2e"
            opacity=".23"
            filter={`url(#${id}-soft-shadow)`}
          />
        ))}
      </g>
      {trees.map(([x, y, r], i) => {
        const root = project(x, y),
          crown = project(x, y, 24);
        return (
          <g key={i}>
            <path
              d={`M${root.x} ${root.y}L${crown.x} ${crown.y - 10}`}
              stroke="#6a6650"
              strokeWidth="5"
            />
            {Array.from({ length: 7 }, (_, j) => (
              <circle
                key={j}
                cx={crown.x + Math.cos(j * 2.4) * r * 0.45}
                cy={crown.y + Math.sin(j * 2.4) * r * 0.32}
                r={r * 0.6}
                fill={`url(#${id}-tree)`}
              />
            ))}
            {Array.from({ length: 18 }, (_, j) => (
              <circle
                key={j}
                cx={crown.x + (Math.cos(j * 2.4) * r * (j % 4)) / 5}
                cy={crown.y + (Math.sin(j * 2.4) * r * (j % 3)) / 5}
                r={2 + (j % 3)}
                fill={j % 2 ? "#b3bd85" : "#3e633a"}
                opacity=".35"
              />
            ))}
          </g>
        );
      })}
      {[
        [165, 195],
        [440, 400],
        [440, 70],
        [160, 530],
      ].map(([x, y], i) => {
        const base = project(x, y),
          top = project(x, y, 51),
          shadow = project(x + 30, y + 23);
        return (
          <g key={i}>
            <path
              d={`M${base.x} ${base.y}L${shadow.x} ${shadow.y}`}
              stroke="#24382e"
              opacity=".22"
              strokeWidth="3"
            />
            <ellipse cx={base.x} cy={base.y} rx="4" ry="2.5" fill="#868c80" />
            <path
              d={`M${base.x} ${base.y}V${top.y}`}
              stroke="#505958"
              strokeWidth="2.2"
            />
            <path
              d={`M${top.x - 6} ${top.y - 2}Q${top.x} ${top.y - 7} ${top.x + 6} ${top.y - 2}L${top.x + 3} ${top.y + 4}H${top.x - 3}Z`}
              fill="#454e4a"
              stroke="#c4cbb9"
              strokeWidth=".8"
            />
          </g>
        );
      })}
    </g>
  );
});
