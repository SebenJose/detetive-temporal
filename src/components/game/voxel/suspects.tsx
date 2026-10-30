"use client";

import type { ReactNode } from "react";
import { Glow, Voxels, type Vox } from "./Voxels";

// Objects the player judges: in or out of the case's time. Small ones sit on a stone block (Egypt)
// or a crate (ship) so they stay readable from the isometric camera.
const WOOD = "#7a5333", WOOD_DARK = "#5a3b24", BRASS = "#d4a94a";
const BASE = 0.36;

function Base({ theme }: { theme: "sand" | "sea" }) {
  return <Voxels items={theme === "sand"
    ? [[0, BASE / 2, 0, 0.72, BASE, 0.72, "#e0cfa6"], [0, BASE - 0.02, 0, 0.76, 0.04, 0.76, "#cdb084"]]
    : [[0, BASE / 2, 0, 0.7, BASE, 0.7, "#b08a58"], [0, BASE / 2, 0, 0.72, 0.08, 0.72, "#7a5a36"], [0, BASE / 2, 0, 0.08, BASE + 0.02, 0.72, "#7a5a36"]]} receive />;
}

/** A rounded slice: two crossed boxes cut the corners, so stacked slices read as a round body. */
const ring = (y: number, h: number, radius: number, color: string): Vox[] => [[0, y, 0, radius * 2, h, radius * 1.45, color], [0, y, 0, radius * 1.45, h, radius * 2, color]];

const lift = (items: Vox[]): Vox[] => items.map(([x, y, z, w, h, d, c]) => [x, y + BASE, z, w, h, d, c]);

function Sneaker() {
  return <Voxels items={lift([
    [0, 0.04, 0, 0.62, 0.08, 0.28, "#f5f5f5"], [-0.05, 0.16, 0, 0.46, 0.16, 0.26, "#e74c3c"], [0.21, 0.12, 0, 0.18, 0.09, 0.24, "#e74c3c"],
    [-0.18, 0.29, 0, 0.18, 0.1, 0.24, "#c0392b"], [0.03, 0.25, 0, 0.04, 0.02, 0.2, "#ffffff"], [0.1, 0.23, 0, 0.04, 0.02, 0.2, "#ffffff"],
    [-0.02, 0.15, 0.135, 0.32, 0.04, 0.01, "#ffffff"], [-0.02, 0.15, -0.135, 0.32, 0.04, 0.01, "#ffffff"],
  ])} />;
}

function SodaCan() {
  return <group>
    <Voxels items={lift([
      [0, 0.26, 0, 0.3, 0.48, 0.3, "#d62828"], [0, 0.26, 0, 0.31, 0.12, 0.31, "#ffffff"], [0, 0.52, 0, 0.27, 0.04, 0.27, "#c9ced6"],
      [0.04, 0.55, 0, 0.1, 0.02, 0.05, "#aab0b8"], [0, 0.02, 0, 0.27, 0.04, 0.27, "#c9ced6"],
    ])} />
  </group>;
}

function DigitalWatch() {
  return <group>
    <Voxels items={lift([[0, 0.02, 0, 0.2, 0.04, 0.72, "#222831"], [0, 0.08, 0, 0.34, 0.1, 0.34, "#4b5563"], [0.18, 0.08, 0.06, 0.03, 0.04, 0.04, "#9aa3ad"]])} />
    <Glow p={[0, BASE + 0.135, 0]} s={[0.25, 0.012, 0.2]} color="#5fff8a" intensity={1.4} />
  </group>;
}

function CeramicJar() {
  const clay = "#b4673e", dark = "#8a4a2b";
  return <Voxels items={[
    ...ring(0.04, 0.08, 0.15, dark), ...ring(0.2, 0.24, 0.23, clay), ...ring(0.4, 0.18, 0.28, clay), ...ring(0.47, 0.06, 0.29, "#3f6fa8"),
    ...ring(0.57, 0.14, 0.22, clay), ...ring(0.68, 0.1, 0.12, clay), ...ring(0.77, 0.07, 0.17, dark),
  ]} />;
}

function ScribePalette() {
  return <Voxels items={lift([
    [0, 0.03, 0, 0.74, 0.06, 0.22, "#c9a26a"], [-0.24, 0.065, 0, 0.1, 0.02, 0.1, "#1b1b1b"], [-0.1, 0.065, 0, 0.1, 0.02, 0.1, "#b5432f"],
    [0.17, 0.065, 0, 0.32, 0.02, 0.08, "#a8864e"], [0.17, 0.09, -0.02, 0.36, 0.025, 0.025, "#7a8a3a"], [0.15, 0.09, 0.025, 0.36, 0.025, 0.025, "#6d7c32"],
  ])} />;
}

function Barrel() {
  const iron = "#3e3a36";
  return <Voxels items={[
    ...ring(0.11, 0.22, 0.29, "#8a5d3b"), ...ring(0.43, 0.46, 0.34, "#9a6b45"), ...ring(0.75, 0.22, 0.29, "#8a5d3b"),
    ...ring(0.2, 0.05, 0.325, iron), ...ring(0.66, 0.05, 0.325, iron), ...ring(0.865, 0.02, 0.25, WOOD_DARK), [0.12, 0.88, 0.06, 0.08, 0.03, 0.08, WOOD],
  ]} />;
}

function Flashlight() {
  return <group>
    <Voxels items={lift([[-0.06, 0.12, 0, 0.5, 0.18, 0.18, "#f1c40f"], [0.25, 0.12, 0, 0.14, 0.26, 0.26, "#f39c12"], [-0.06, 0.22, 0, 0.08, 0.03, 0.07, "#333333"], [-0.32, 0.12, 0, 0.03, 0.16, 0.16, "#333333"]])} />
    <Glow p={[0.33, BASE + 0.12, 0]} s={[0.02, 0.2, 0.2]} color="#fffbe0" intensity={2} />
  </group>;
}

function PlasticBottle() {
  return <group>
    <mesh position={[0, BASE + 0.25, 0]} scale={[0.22, 0.42, 0.22]}><boxGeometry /><meshStandardMaterial color="#a8dcf0" transparent opacity={0.65} /></mesh>
    <Voxels items={lift([[0, 0.12, 0, 0.18, 0.2, 0.18, "#5bb6dd"], [0, 0.27, 0, 0.23, 0.12, 0.23, "#2ecc71"], [0, 0.5, 0, 0.13, 0.08, 0.13, "#a8dcf0"], [0, 0.57, 0, 0.1, 0.06, 0.1, "#1e88e5"]])} />
  </group>;
}

function Headphones() {
  return <Voxels items={lift([
    [-0.26, 0.22, 0, 0.07, 0.3, 0.1, "#2d2d34"], [0.26, 0.22, 0, 0.07, 0.3, 0.1, "#2d2d34"], [0, 0.4, 0, 0.6, 0.07, 0.1, "#2d2d34"],
    [-0.3, 0.1, 0, 0.12, 0.22, 0.22, "#e84393"], [0.3, 0.1, 0, 0.12, 0.22, 0.22, "#e84393"],
  ])} />;
}

function Hourglass() {
  return <group>
    <Voxels items={lift([
      [0, 0.03, 0, 0.38, 0.06, 0.38, WOOD], [0, 0.63, 0, 0.38, 0.06, 0.38, WOOD],
      ...[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z]): Vox => [x, 0.33, z, 0.04, 0.56, 0.04, BRASS]),
      [0, 0.13, 0, 0.2, 0.14, 0.2, "#e9c46a"], [0, 0.45, 0, 0.13, 0.06, 0.13, "#e9c46a"], [0, 0.3, 0, 0.03, 0.22, 0.03, "#e9c46a"],
    ])} />
    <mesh position={[0, BASE + 0.33, 0]} scale={[0.24, 0.52, 0.24]}><boxGeometry /><meshStandardMaterial color="#d8f6ff" transparent opacity={0.3} /></mesh>
  </group>;
}

const MODELS: Record<string, { node: () => ReactNode; base: boolean }> = {
  tenis: { node: Sneaker, base: true }, lata: { node: SodaCan, base: true }, relogio: { node: DigitalWatch, base: true },
  jarro: { node: CeramicJar, base: false }, paleta: { node: ScribePalette, base: true },
  lanterna: { node: Flashlight, base: true }, garrafa: { node: PlasticBottle, base: true }, fone: { node: Headphones, base: true },
  barril: { node: Barrel, base: false }, ampulheta: { node: Hourglass, base: true },
};

export function SuspectModel({ id, theme }: { id: string; theme: "sand" | "sea" }) {
  const model = MODELS[id];
  if (!model) return null;
  const Node = model.node;
  return <group>{model.base && <Base theme={theme} />}<Node /></group>;
}
