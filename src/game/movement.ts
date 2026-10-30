import { missions } from "../content/missions.ts";
import type { MissionId, Position, RoomId } from "./types.ts";

export const PLAYER_START: Position = { x: 0, z: 3.7 };
export const ROOM_START: Position = { x: -1.5, z: 2.5 };
export const INTERACTION_DISTANCE = 1.55;
export const ROOM_LIMIT = 4.7;

export type Obstacle =
  | { kind: "rect"; minX: number; maxX: number; minZ: number; maxZ: number }
  | { kind: "circle"; x: number; z: number; r: number };

const rect = (minX: number, maxX: number, minZ: number, maxZ: number): Obstacle => ({ kind: "rect", minX, maxX, minZ, maxZ });
const circle = (x: number, z: number, r: number): Obstacle => ({ kind: "circle", x, z, r });

// Scenery that blocks the walkable plane. The scenes place their props on these same coordinates.
export const OBSTACLES: Record<MissionId, Record<RoomId, Obstacle[]>> = {
  egito: {
    exterior: [rect(-4.3, -0.3, -4.3, -0.3), circle(4.3, -4.3, 0.45), circle(-4.3, 4.3, 0.45), rect(0.7, 2.3, -4.7, -3.7)],
    arquivo: [rect(-4.7, -3.9, -4.7, -3.3), circle(0.6, -3.9, 0.5), circle(3.6, -3.9, 0.5)],
  },
  navegacao: {
    exterior: [circle(0, -1, 0.6), rect(-4.7, -3.6, -4.7, -3.7), rect(3.4, 4.7, -4.7, -3.8)],
    arquivo: [rect(-4.7, -3.7, -4.7, -3.6), rect(3.5, 4.7, -4.7, -2.7)],
  },
};

const POINT_RADIUS = 0.42;

function blocked(obstacle: Obstacle, position: Position) {
  if (obstacle.kind === "circle") return Math.hypot(position.x - obstacle.x, position.z - obstacle.z) < obstacle.r;
  return position.x > obstacle.minX && position.x < obstacle.maxX && position.z > obstacle.minZ && position.z < obstacle.maxZ;
}

export function distance(a: Position, b: Position) { return Math.hypot(a.x - b.x, a.z - b.z); }

export function isWalkable(position: Position, mission: MissionId, room: RoomId) {
  if (Math.abs(position.x) > ROOM_LIMIT || Math.abs(position.z) > ROOM_LIMIT) return false;
  if (OBSTACLES[mission][room].some((obstacle) => blocked(obstacle, position))) return false;
  // Characters and objects are solid; doors can be walked onto.
  return !missions[mission].points.some((point) => point.room === room && point.kind !== "door" && distance(point.position, position) < POINT_RADIUS);
}

export function movePlayer(position: Position, direction: Position, delta: number, mission: MissionId, room: RoomId): Position {
  const length = Math.hypot(direction.x, direction.z);
  if (!length) return position;
  const step = Math.min(Math.max(delta, 0), 0.05) * 3.5;
  const next = { x: position.x + direction.x / length * step, z: position.z + direction.z / length * step };
  // Resolve axes separately so the character can slide along a wall.
  if (!isWalkable({ x: next.x, z: position.z }, mission, room)) next.x = position.x;
  if (!isWalkable({ x: next.x, z: next.z }, mission, room)) next.z = position.z;
  return next;
}
