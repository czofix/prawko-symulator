import { maneuverEndProgress, poseAt, sampleRoute } from "../../domain/routes";
import type { Participant } from "../../domain/types";
import { project } from "./projection";

// A direction cue is intentionally shorter than the route used for playback.
// It begins in front of the participant, includes the turn, and ends in-frame.
export function directionArrow(participant: Participant) {
  const points = sampleRoute(participant.route);
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    distances.push(
      distances[i - 1] +
        Math.hypot(
          points[i][0] - points[i - 1][0],
          points[i][1] - points[i - 1][1],
        ),
    );
  }
  const total = distances.at(-1)!;
  const pedestrian = participant.kind === "pedestrian";
  const start = pedestrian ? 12 : 52;
  const headLength = pedestrian ? 16 : 28;
  if (total <= start + headLength) return null;

  const turnEnd = maneuverEndProgress(participant.route) * total;
  let end = Math.min(
    total,
    pedestrian ? 150 : turnEnd > 0 ? turnEnd + 32 : 320,
  );
  // Keep even the arrowhead away from the edge of the scene. In particular,
  // cars already near the lane merge need shorter cues than approaching cars.
  for (let distance = start; distance <= end; distance += 2) {
    const pose = poseAt(points, distance / total);
    const screen = project(pose.x, pose.y);
    if (
      pose.x < 80 ||
      pose.x > 520 ||
      pose.y < 80 ||
      pose.y > 520 ||
      screen.x < 35 ||
      screen.x > 565 ||
      screen.y < 35 ||
      screen.y > 565
    ) {
      end = distance - 2;
      break;
    }
  }
  if (end <= start + headLength) return null;

  const tip = poseAt(points, end / total);
  const stemEnd = end - headLength + 2;
  const first = poseAt(points, start / total);
  const last = poseAt(points, stemEnd / total);
  const middle = points.filter(
    (_, i) => distances[i] > start && distances[i] < stemEnd,
  );
  const path =
    `M${first.x} ${first.y} ` +
    [...middle, [last.x, last.y]]
      .map((point) => `L${point[0]} ${point[1]}`)
      .join(" ");
  return {
    path,
    tip,
    headLength,
    headWidth: pedestrian ? 18 : 32,
    strokeWidth: pedestrian ? 6 : 11,
  };
}
