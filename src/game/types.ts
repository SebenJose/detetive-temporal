export type MissionId = "egito" | "navegacao";
export type RoomId = "exterior" | "arquivo";
export type Position = { x: number; z: number };
export type PortraitId = "detective" | "mummy" | "scribe" | "navigator";

export type Clue = {
  id: string;
  title: string;
  text: string;
  historical: boolean;
};

/** An object the player must judge: does it belong to the case's time or not? */
export type Suspect = {
  anachronism: boolean;
  /** Approximate year, used only to place the object on the timeline. */
  year: number;
  era: string;
  /** Shown once the player judges it correctly. */
  verdict: string;
  /** Shown after a wrong judgement, without giving the answer away. */
  hint: string;
};

/** Hands-on task that must be done after reading a point; its clue is only recorded once it is solved. */
export type Activity =
  | { type: "tablet"; rows: { id: "pao" | "jarro"; label: string; count: number }[]; hint: string }
  | { type: "astrolabe"; days: number[]; answer: "norte" | "sul"; hint: string; success: string; note: string };

export type PointOfInterest = {
  id: string;
  label: string;
  room: RoomId;
  position: Position;
  kind: "character" | "object" | "door" | "solution" | "suspect";
  portrait?: PortraitId;
  speaker?: string;
  lines?: string[];
  clue?: Clue;
  destination?: RoomId;
  suspect?: Suspect;
  activity?: Activity;
};

export type Question = {
  id: string;
  label: string;
  options: { id: string; label: string }[];
  correct: string;
  /** Clue that proves the answer: the player must pick it from the notebook. */
  evidence: string;
  /** Shown after a wrong attempt. Points back to the evidence without revealing the answer. */
  hint: string;
  /** Shown only after the case is solved. */
  explanation: string;
};

export type Answer = { option?: string; evidence?: string };

export type GlossaryEntry = { term: string; forms: string[]; text: string };

export type Source = { title: string; url: string; description: string };

export type Mission = {
  id: MissionId;
  number: string;
  title: string;
  subtitle: string;
  location: string;
  period: string;
  /** Reference year of the case (negative = a.C.), for the timeline. */
  year: number;
  theme: "sand" | "sea";
  intro: string;
  objective: string;
  rooms: Record<RoomId, string>;
  points: PointOfInterest[];
  requiredClues: string[];
  questions: Question[];
  hints: string[];
  facts: string[];
  fiction: string;
  glossary: GlossaryEntry[];
  sources: Source[];
};

export type MissionProgress = {
  clues: string[];
  /** Suspects already judged correctly. */
  judged: string[];
  completed: boolean;
  attempts: number;
  room: RoomId;
};

export type GameState = {
  version: 1;
  activeMission: MissionId;
  started: boolean;
  missions: Record<MissionId, MissionProgress>;
};

export type GameAction =
  | { type: "LOAD"; state: GameState }
  | { type: "START"; mission: MissionId }
  | { type: "COLLECT"; mission: MissionId; clue: string }
  | { type: "JUDGE"; mission: MissionId; suspect: string; anachronism: boolean }
  | { type: "MOVE_ROOM"; room: RoomId }
  | { type: "ATTEMPT"; answers: Record<string, Answer> }
  | { type: "RESET"; mission: MissionId }
  | { type: "RESET_ALL" };
