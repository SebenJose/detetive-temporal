"use client";

import type { ChallengeMode } from "@/content/challenge";
import type { Mission, MissionId } from "./types";

// Results stay in this browser only, like the game progress. The teacher collects them through the
// summary line the student copies at the end of a case.
const KEY = "detetive-temporal:desafio:v2";

export type ChallengeResult = { answers: Record<number, string>; score: number; total: number; date: string };
export type ChallengeRecord = { name: string; cases: Partial<Record<MissionId, Partial<Record<ChallengeMode, ChallengeResult>>>> };

export function loadChallenge(): ChallengeRecord {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (value && typeof value === "object" && typeof value.name === "string" && value.cases && typeof value.cases === "object") return value;
  } catch { /* storage unavailable or corrupted */ }
  return { name: "", cases: {} };
}

export function saveChallenge(record: ChallengeRecord) {
  try { localStorage.setItem(KEY, JSON.stringify(record)); return true; } catch { return false; }
}

export function withResult(record: ChallengeRecord, mission: MissionId, mode: ChallengeMode, result: ChallengeResult): ChallengeRecord {
  return { ...record, cases: { ...record.cases, [mission]: { ...record.cases[mission], [mode]: result } } };
}

export function summaryLine(record: ChallengeRecord, missions: Mission[]) {
  const score = (result?: ChallengeResult) => result ? `${result.score}/${result.total}` : "não feito";
  const cases = missions.map((mission) => `Caso ${mission.number}: antes ${score(record.cases[mission.id]?.antes)}, depois ${score(record.cases[mission.id]?.depois)}`);
  return [record.name.trim() || "Sem nome", ...cases].join(" · ");
}
