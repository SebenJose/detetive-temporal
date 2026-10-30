import { missions } from "../content/missions.ts";
import type { Answer, GameAction, GameState, Mission, MissionId, MissionProgress, PointOfInterest } from "./types.ts";

export const SAVE_KEY = "detetive-temporal:progresso:v1";
const freshProgress = (): MissionProgress => ({ clues: [], judged: [], completed: false, attempts: 0, room: "exterior" });

export function initialState(): GameState {
  return { version: 1, activeMission: "egito", started: false, missions: { egito: freshProgress(), navegacao: freshProgress() } };
}

export const suspects = (mission: Mission) => mission.points.filter((point): point is PointOfInterest & { suspect: NonNullable<PointOfInterest["suspect"]> } => point.kind === "suspect" && !!point.suspect);
export const anachronisms = (mission: Mission) => suspects(mission).filter((point) => point.suspect.anachronism);

export function judgeIsCorrect(mission: Mission, suspectId: string, anachronism: boolean) {
  const point = suspects(mission).find((item) => item.id === suspectId);
  return !!point && point.suspect.anachronism === anachronism;
}

// Solving needs every clue and every out-of-time object identified.
export function canSolve(mission: Mission, progress: MissionProgress): boolean {
  return mission.requiredClues.every((id) => progress.clues.includes(id)) && anachronisms(mission).every((point) => progress.judged.includes(point.id));
}

// An answer only counts when it is backed by the clue that proves it: guessing the option is not enough.
export function evaluateAnswers(mission: Mission, answers: Record<string, Answer>) {
  return mission.questions.map((question) => {
    const option = answers[question.id]?.option === question.correct;
    const evidence = answers[question.id]?.evidence === question.evidence;
    return { id: question.id, correct: option && evidence, option, evidence, hint: question.hint };
  });
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "LOAD") return action.state;
  if (action.type === "RESET_ALL") return initialState();
  if (action.type === "START") return { ...state, started: true, activeMission: action.mission };
  const id: MissionId = "mission" in action ? action.mission : state.activeMission;
  const progress = state.missions[id];
  let updated = progress;
  if (action.type === "COLLECT") {
    const valid = missions[id].points.some((point) => point.clue?.id === action.clue);
    if (!valid || progress.clues.includes(action.clue)) return state;
    updated = { ...progress, clues: [...progress.clues, action.clue] };
  }
  if (action.type === "JUDGE") {
    if (!judgeIsCorrect(missions[id], action.suspect, action.anachronism) || progress.judged.includes(action.suspect)) return state;
    updated = { ...progress, judged: [...progress.judged, action.suspect] };
  }
  if (action.type === "MOVE_ROOM") updated = { ...progress, room: action.room };
  if (action.type === "RESET") updated = freshProgress();
  if (action.type === "ATTEMPT") {
    if (!canSolve(missions[id], progress) || progress.completed) return state;
    const correct = evaluateAnswers(missions[id], action.answers).every((answer) => answer.correct);
    updated = { ...progress, attempts: progress.attempts + 1, completed: correct };
  }
  return { ...state, missions: { ...state.missions, [id]: updated } };
}

// Malformed, outdated or forged saves never unlock an unfinished case.
export function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.started !== "boolean" || !["egito", "navegacao"].includes(value.activeMission)) return null;
    const restored = initialState();
    restored.activeMission = value.activeMission;
    restored.started = value.started;
    for (const id of ["egito", "navegacao"] as const) {
      const progress = value.missions?.[id];
      if (!progress || !Array.isArray(progress.clues) || typeof progress.completed !== "boolean" || !Number.isSafeInteger(progress.attempts) || progress.attempts < 0 || !["exterior", "arquivo"].includes(progress.room)) return null;
      const validClues = missions[id].points.flatMap((point) => point.clue ? [point.clue.id] : []);
      const clues = [...new Set<string>((progress.clues as unknown[]).filter((clue): clue is string => typeof clue === "string" && validClues.includes(clue)))];
      const validSuspects = suspects(missions[id]).map((point) => point.id);
      // Saves from before the out-of-time objects existed have no "judged" list.
      const judged = [...new Set<string>((Array.isArray(progress.judged) ? progress.judged as unknown[] : []).filter((item): item is string => typeof item === "string" && validSuspects.includes(item)))];
      const candidate = { clues, judged, attempts: progress.attempts, room: progress.room, completed: false };
      restored.missions[id] = { ...candidate, completed: progress.completed && canSolve(missions[id], candidate) };
    }
    return restored;
  } catch { return null; }
}
