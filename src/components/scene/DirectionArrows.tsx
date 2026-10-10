import { memo, useMemo } from "react";
import type { Participant } from "../../domain/types";
import { directionArrow } from "./directionArrow";

export const DirectionArrows = memo(function DirectionArrows({
  participants,
}: {
  participants: Participant[];
}) {
  const arrows = useMemo(
    () =>
      participants.map((participant) => ({
        id: participant.id,
        arrow: directionArrow(participant),
      })),
    [participants],
  );
  return (
    <g
      className="planned-routes"
      aria-hidden="true"
      pointerEvents="none"
      fill="#95ed53"
      strokeLinejoin="round"
    >
      {arrows.map(
        ({ id, arrow }) =>
          arrow && (
            <g key={id} data-direction-arrow={id}>
              <path
                d={arrow.path}
                fill="none"
                stroke="#95ed53"
                strokeWidth={arrow.strokeWidth}
                strokeLinecap="butt"
              />
              <path
                data-arrowhead={id}
                d={`M0 0L${-arrow.headWidth / 2} ${arrow.headLength}H${arrow.headWidth / 2}Z`}
                transform={`translate(${arrow.tip.x} ${arrow.tip.y}) rotate(${arrow.tip.angle})`}
              />
            </g>
          ),
      )}
    </g>
  );
});
