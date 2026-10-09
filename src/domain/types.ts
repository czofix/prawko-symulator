export type ParticipantId = "A" | "B" | "C" | "D" | "P";
export type Approach = "south" | "north" | "east" | "west";
export type Maneuver = "straight" | "left" | "right";
export type Point = readonly [number, number];
export type Segment =
  | { type: "line"; to: Point }
  | { type: "curve"; c1: Point; c2: Point; to: Point };
export interface Route {
  start: Point;
  segments: Segment[];
}
export interface Participant {
  id: ParticipantId;
  kind: "car" | "pedestrian";
  approach: Approach;
  maneuver: Maneuver;
  description: string;
  route: Route;
}
export interface RoadSign {
  approach: Approach;
  type: "yield" | "priority" | "stop" | "roundabout" | "bend" | "crossing";
  label: string;
}
export interface Signal {
  approach: Approach;
  color: "red" | "green";
  label: string;
}
export interface AnimationStep {
  actors: ParticipantId[];
  text: string;
  highlight: string;
  duration: number;
}
export interface LegalSource {
  title: string;
  provision: string;
  url: string;
  checkedAt: string | null;
}
export interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: 1 | 2 | 3;
  geometry: "crossroad" | "roundabout" | "crosswalk" | "merge";
  description: string;
  participants: Participant[];
  signs: RoadSign[];
  signals: Signal[];
  question: {
    kind: "single" | "multiple" | "order";
    prompt: string;
    options: { id: string; label: string; actor?: ParticipantId }[];
    accepted: string[][];
  };
  hint: string;
  explanation: string;
  watchFor: string;
  answerLabel: string;
  steps: AnimationStep[];
  sources: LegalSource[];
  verification: "draft" | "verified";
}
export type Mode = "learn" | "exam" | "mistakes";
export interface Attempt {
  scenarioId: string;
  answer: string[];
  correct: boolean;
  at: string;
}
export interface SessionResult {
  id: string;
  at: string;
  attempts: Attempt[];
}
export interface Progress {
  version: 1;
  attempts: Record<
    string,
    { correct: number; incorrect: number; lastCorrect: boolean }
  >;
  sessions: SessionResult[];
  speed: 0.5 | 1;
  introSeen: boolean;
}
