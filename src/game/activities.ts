import type { Activity } from "./types.ts";

type Tablet = Extract<Activity, { type: "tablet" }>;
type AstrolabeTask = Extract<Activity, { type: "astrolabe" }>;

export const TABLET_MAX = 5;
export const AIM_TOLERANCE = 2;

export function checkTablet(activity: Tablet, counts: Record<string, number>) {
  return activity.rows.every((row) => counts[row.id] === row.count);
}

// Simplified on purpose (and said so in the game): on an equinox, in the northern hemisphere,
// latitude = 90° − height of the noon Sun. Real navigators used tables and corrections.
export const latitudeFromSun = (height: number) => 90 - height;

export const isAimed = (angle: number, target: number) => Math.abs(angle - target) <= AIM_TOLERANCE;

/** Where the ship went between the first and the last measurement. */
export function directionOf(activity: AstrolabeTask): "norte" | "sul" {
  const first = latitudeFromSun(activity.days[0]), last = latitudeFromSun(activity.days[activity.days.length - 1]);
  return last > first ? "norte" : "sul";
}
