"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import type { PortraitId } from "@/game/types";
import { Glow, Voxels, seeded, type Vox } from "./Voxels";
import type { CharacterLook } from "./Humanoid";

const INK = "#1d2232";

/** A plain head block with ears and nose; characters add hair, hats and beards around it. */
function baseHead(skin: string, shade: string): Vox[] {
  return [[0, 2.5, 0, 5, 5, 5, skin], [-2.65, 2.3, 0.2, 0.35, 1.1, 0.9, shade], [2.65, 2.3, 0.2, 0.35, 1.1, 0.9, shade], [0, 2.0, 2.68, 0.65, 0.8, 0.4, shade]];
}

function arm(sleeve: string, cuff: string, hand: string, sleeveLength = 4.4): Vox[] {
  const rest = 4.4 - sleeveLength;
  const blocks: Vox[] = [[0, -sleeveLength / 2 + 0.2, 0, 1.75, sleeveLength, 1.75, sleeve], [0, -sleeveLength + 0.2, 0, 1.85, 0.45, 1.85, cuff]];
  if (rest > 0) blocks.push([0, -sleeveLength - rest / 2 + 0.2, 0, 1.5, rest, 1.5, hand]);
  blocks.push([0, -4.65, 0, 1.45, 1.15, 1.45, hand]);
  return blocks;
}

/** Glitching cubes that orbit an anomalous object. */
function Glitch({ radius = 1.6 }: { radius?: number }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current?.children.forEach((child, index) => {
      const angle = t * (1.4 + index * 0.25) + index * 2.1;
      child.position.set(Math.cos(angle) * radius, 1 + Math.sin(t * 3 + index) * 1.1, Math.sin(angle) * radius);
      child.visible = Math.sin(t * 13 + index * 5) > -0.3;
      child.rotation.set(t * 2, t * 3, 0);
    });
  });
  return <group ref={group}>{["#ff4fd8", "#38e8ff", "#ff4fd8", "#9cff57"].map((color, index) => <Glow key={index} p={[0, 0, 0]} s={[0.45, 0.45, 0.45]} color={color} intensity={2.5} />)}</group>;
}

function FlickerScreen({ color, p, s }: { color: string; p: [number, number, number]; s: [number, number, number] }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const material = mesh.current?.material as MeshStandardMaterial | undefined;
    if (material) material.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 23) * 0.35 + (Math.sin(clock.elapsedTime * 3.7) > 0.93 ? 1.8 : 0);
  });
  return <mesh ref={mesh} position={p} scale={s}><boxGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} /></mesh>;
}

/** The mummy's phone: screen facing out, with empty signal bars and a red cross ("sem sinal"). */
function Phone() {
  return <group>
    <Voxels items={[
      [0, 1.3, 0, 1.7, 2.9, 0.34, INK], [0, 1.3, -0.19, 1.5, 2.7, 0.05, "#3b4256"], [-0.4, 2.35, -0.23, 0.4, 0.4, 0.05, "#9aa3b8"],
      [0.62, 2.45, 0.22, 0.12, 0.18, 0.04, INK], [0.77, 2.5, 0.22, 0.12, 0.28, 0.04, INK], [0.92, 2.55, 0.22, 0.12, 0.38, 0.04, INK],
    ]} cast={false} />
    <FlickerScreen color="#5fd4ff" p={[0, 1.25, 0.18]} s={[1.45, 2.4, 0.05]} />
    {[0.7, -0.7].map((angle) => <mesh key={angle} position={[0, 1.25, 0.22]} rotation={[0, 0, angle]} scale={[0.95, 0.2, 0.04]}><boxGeometry /><meshStandardMaterial color="#ff3b4d" emissive="#ff3b4d" emissiveIntensity={1.4} toneMapped={false} /></mesh>)}
    <Glitch />
  </group>;
}

function Gps() {
  return <group>
    <Voxels items={[[0, 1.1, 0, 1.6, 2.5, 0.6, "#2a3038"], [0.5, 2.9, 0, 0.3, 1.3, 0.3, "#1a1e24"], [0.5, 3.6, 0, 0.45, 0.25, 0.45, "#e5484d"], [0, 0.25, 0.32, 0.9, 0.35, 0.05, "#e2b84a"]]} />
    <FlickerScreen color="#8dff6a" p={[0, 1.4, 0.32]} s={[1.2, 1.3, 0.05]} />
    <Glitch />
  </group>;
}

function MagnifyingGlass() {
  const gold = "#e3b54f";
  return <group>
    <Voxels items={[[0, 0.6, 0, 0.5, 2.0, 0.5, "#6d4128"], [0, 1.8, 0, 0.6, 0.4, 0.6, gold], [0, 4.4, 0, 2.6, 0.45, 0.45, gold], [0, 2.1, 0, 2.6, 0.45, 0.45, gold], [-1.1, 3.25, 0, 0.45, 2.6, 0.45, gold], [1.1, 3.25, 0, 0.45, 2.6, 0.45, gold]]} />
    <mesh position={[0, 3.25, 0]} scale={[1.8, 1.9, 0.12]}><boxGeometry /><meshStandardMaterial color="#bdf3ff" transparent opacity={0.45} emissive="#8ae7ff" emissiveIntensity={0.3} /></mesh>
  </group>;
}

/** Wrist band with a glowing face. Hand items are rotated a quarter turn, so local y points out of the wrist and -z up the arm. */
function ChronoWatch() {
  return <group>
    <Voxels items={[[0, -0.2, -1.5, 1.95, 1.95, 0.5, "#2b1d16"], [0, 0.8, -1.5, 1.0, 0.1, 0.75, "#e3b54f"]]} cast={false} />
    <Glow p={[0, 0.86, -1.5]} s={[0.75, 0.06, 0.55]} color="#3df0d0" intensity={2} />
  </group>;
}

function Scroll() {
  return <Voxels items={[[0, 0.6, 0, 3.2, 1.0, 1.0, "#ecdcaa"], [-1.75, 0.6, 0, 0.45, 1.3, 1.3, "#b88d4f"], [1.75, 0.6, 0, 0.45, 1.3, 1.3, "#b88d4f"], [0, 0.6, 0.52, 2.2, 0.12, 0.05, "#a0794a"]]} />;
}

function ReedPen() {
  return <Voxels items={[[0, 1.2, 0, 0.28, 2.6, 0.28, "#7b9a3f"], [0, 2.6, 0, 0.18, 0.3, 0.18, INK]]} />;
}

const looks: Record<PortraitId, (anomaly: boolean) => CharacterLook> = {
  detective: () => {
    const skin = "#e7aa80", shade = "#cf8f66", coat = "#3d5d8f", coatDark = "#2c4670", hat = "#7a4b2a", band = "#2b1d16", hair = "#4a2c1a", pants = "#2a3346", boot = "#3e2a1e";
    const leg: Vox[] = [[0, -2.2, 0, 1.95, 4.4, 1.95, pants], [0, -4.5, 0.25, 2.1, 1.0, 2.5, boot]];
    return {
      face: "normal", brow: hair, mouth: "#6a2f2a",
      legL: leg, legR: leg,
      torso: [
        [0, 2.6, 0, 5, 5.2, 3, coat], [0, -0.9, 0, 5.3, 2.0, 3.25, coat], [-1.4, -0.9, 1.4, 0.15, 2.0, 0.5, coatDark],
        [0, 4.1, 1.52, 1.5, 2.0, 0.1, "#f3efe4"], [0, 3.6, 1.58, 0.5, 1.8, 0.1, "#c0392b"],
        [-0.95, 3.8, 1.55, 0.6, 2.6, 0.1, coatDark], [0.95, 3.8, 1.55, 0.6, 2.6, 0.1, coatDark],
        [0, 1.3, 0, 5.15, 0.6, 3.15, "#2b1d16"], [0, 1.3, 1.6, 0.8, 0.65, 0.1, "#e3b54f"],
        [0, 2.4, 1.55, 0.35, 0.35, 0.1, "#e3b54f"], [1.6, 4.0, 1.55, 0.75, 0.75, 0.1, "#3df0d0"],
        [0, 5.3, -0.4, 5.6, 0.7, 2.6, coatDark],
      ],
      armL: arm(coat, coatDark, skin), armR: arm(coat, coatDark, skin),
      head: [
        ...baseHead(skin, shade),
        [0, 2.9, -2.3, 5.2, 3.6, 0.7, hair], [-2.55, 3.4, -0.7, 0.3, 2.2, 3.4, hair], [2.55, 3.4, -0.7, 0.3, 2.2, 3.4, hair],
        [0, 5.15, 0.25, 7.2, 0.45, 7.0, hat], [0, 6.3, 0, 5.3, 2.0, 5.3, hat], [0, 5.65, 0, 5.45, 0.6, 5.45, band], [0, 7.35, 0, 4.2, 0.3, 4.4, hat],
        [-2.0, 5.65, 2.75, 0.4, 0.8, 0.1, "#d9a441"],
      ],
      itemR: <MagnifyingGlass />, poseR: [-0.55, 0.08], itemTiltR: -0.9,
      itemL: <ChronoWatch />,
    };
  },
  mummy: (anomaly) => {
    const tones = ["#f1e6c8", "#e1d3ad", "#d2c296"];
    const random = seeded(7);
    const strip = (x: number, y: number, z: number, w: number, d: number, index: number): Vox => [x + (random() - 0.5) * 0.25, y, z, w + random() * 0.18, 1.02, d + random() * 0.18, tones[index % 3]];
    const leg: Vox[] = [0, 1, 2, 3, 4].map((i) => strip(0, -0.5 - i, 0, 2.0, 2.0, i));
    const limb: Vox[] = [0, 1, 2, 3, 4].map((i) => strip(0, -0.3 - i, 0, 1.7, 1.7, i + 1));
    return {
      face: "mummy", mouth: "#3a2b1f",
      legL: leg, legR: leg.map(([x, y, z, w, h, d, c]) => [x, y, z, w, h, d, c] as Vox).reverse(),
      torso: [...[0, 1, 2, 3, 4].map((i) => strip(0, 0.5 + i, 0, 5.0, 3.0, i)), [1.3, 2.3, 1.6, 0.6, 2.4, 0.12, tones[2]], [-1.2, 4.1, 1.6, 1.8, 0.4, 0.12, tones[1]]],
      armL: [...limb, [0.6, -5.4, 0.4, 0.4, 1.6, 0.12, tones[0]]], armR: limb,
      head: [
        ...[0, 1, 2, 3, 4].map((i) => strip(0, 0.5 + i, 0, 5.0, 5.0, i + 2)), [0, 5.1, 0, 4.6, 0.3, 4.6, tones[1]],
        [0, 2.65, 2.53, 4.3, 1.5, 0.1, "#2a2119"], [0, 2.0, 2.66, 0.6, 0.6, 0.3, tones[2]], [1.8, 4.3, 2.6, 1.6, 0.35, 0.1, tones[2]],
      ],
      ...(anomaly ? { itemR: <Phone />, poseR: [-1.05, 0.25] as [number, number], itemTiltR: -0.72, poseL: [-1.35, -0.05] as [number, number] } : {}),
    };
  },
  scribe: () => {
    const skin = "#b9774f", shade = "#9e6141", linen = "#f4ecd8", wig = "#16141c", gold = "#e0b44a";
    const leg: Vox[] = [[0, -3.5, 0, 1.6, 3.0, 1.6, skin], [0, -4.75, 0.25, 1.85, 0.5, 2.2, "#8a5a2b"]];
    return {
      face: "kohl", brow: wig, mouth: "#6b2b2b",
      legL: leg, legR: leg,
      torso: [
        [0, 2.4, 0, 4.6, 4.8, 2.8, linen], [0, -1.2, 0, 4.9, 2.6, 3.0, linen], [0, -2.3, 0, 5.1, 0.4, 3.2, "#e6dcc4"],
        [0, 4.75, 0, 5.1, 0.6, 3.2, gold], [0, 4.15, 0.05, 4.7, 0.6, 3.05, "#2f64ad"], [0, 3.55, 0.1, 3.9, 0.6, 2.95, "#2ca391"], [0, 3.0, 0.12, 2.6, 0.5, 2.95, gold],
        [0, 0.9, 0, 4.7, 0.45, 2.9, "#b0413e"], [1.2, 0.0, 1.5, 0.45, 1.5, 0.1, "#b0413e"],
      ],
      armL: [[0, -2.0, 0, 1.5, 4.4, 1.5, skin], [0, -0.2, 0, 1.7, 0.5, 1.7, gold], [0, -3.4, 0, 1.65, 0.5, 1.65, gold], [0, -4.65, 0, 1.4, 1.1, 1.4, skin]],
      armR: [[0, -2.0, 0, 1.5, 4.4, 1.5, skin], [0, -0.2, 0, 1.7, 0.5, 1.7, gold], [0, -3.4, 0, 1.65, 0.5, 1.65, gold], [0, -4.65, 0, 1.4, 1.1, 1.4, skin]],
      head: [
        ...baseHead(skin, shade),
        [0, 5.05, 0, 5.5, 0.9, 5.5, wig], [0, 2.3, -2.45, 5.5, 5.4, 0.8, wig], [-2.6, 2.1, 0.1, 0.65, 4.8, 4.6, wig], [2.6, 2.1, 0.1, 0.65, 4.8, 4.6, wig],
        [0, 4.4, 2.55, 5.4, 1.0, 0.4, wig], [0, 4.85, 0, 5.7, 0.4, 5.7, gold], [0, 4.85, 2.88, 0.8, 0.8, 0.1, "#2ca391"],
        [-2.95, 1.2, 1.4, 0.3, 0.7, 0.3, gold], [2.95, 1.2, 1.4, 0.3, 0.7, 0.3, gold],
      ],
      itemL: <Scroll />, poseL: [-0.75, 0.1], itemTiltL: -0.6,
      itemR: <ReedPen />, poseR: [-0.4, -0.05], itemTiltR: -0.4,
    };
  },
  navigator: (anomaly) => {
    const skin = "#d69c75", shade = "#bd8461", shirt = "#efe5c9", vest = "#4b6a50", beard = "#6a4024", beardDark = "#4f2e19", cap = "#a8392f";
    const leg: Vox[] = [[0, -1.5, 0, 2.05, 3.0, 2.05, "#6e4f33"], [0, -3.25, 0, 2.15, 0.45, 2.15, "#5a3f28"], [0, -3.9, 0, 1.75, 1.3, 1.75, "#d8d0b4"], [0, -4.6, 0.25, 2.0, 0.8, 2.5, "#2a2220"]];
    return {
      face: "normal", brow: beard, mouth: "#5a2620",
      legL: leg, legR: leg,
      torso: [
        [0, 2.6, 0, 5, 5.2, 3, shirt], [-1.55, 2.7, 0, 1.9, 5.0, 3.06, vest], [1.55, 2.7, 0, 1.9, 5.0, 3.06, vest], [0, 2.7, -0.75, 5.06, 5.0, 1.6, vest],
        [0, 3.3, 1.54, 0.25, 2.6, 0.1, "#8a6a40"], [0, 4.7, 0.2, 3.0, 0.5, 2.7, shirt],
        [0, 0.9, 0, 5.2, 0.9, 3.15, cap], [1.4, 0.0, 1.6, 0.6, 1.4, 0.15, cap],
      ],
      armL: arm(shirt, "#d9cfb1", skin), armR: arm(shirt, "#d9cfb1", skin),
      head: [
        ...baseHead(skin, shade),
        // Full beard that follows the jaw and leaves the mouth visible: sideburns, cheeks, chin and a split moustache.
        [-2.35, 2.45, 1.8, 0.4, 1.3, 1.4, beard], [2.35, 2.45, 1.8, 0.4, 1.3, 1.4, beard],
        [-2.2, 0.85, 1.65, 0.7, 1.5, 1.9, beardDark], [2.2, 0.85, 1.65, 0.7, 1.5, 1.9, beardDark],
        [-1.75, 1.05, 2.6, 1.4, 1.7, 0.3, beard], [1.75, 1.05, 2.6, 1.4, 1.7, 0.3, beard],
        [0, 0.45, 2.6, 2.2, 0.9, 0.3, beard], [0, -0.3, 2.25, 3.0, 0.9, 1.0, beardDark], [0, -0.9, 2.15, 1.5, 0.5, 0.7, beardDark],
        [-0.72, 1.6, 2.68, 1.3, 0.4, 0.22, beardDark], [0.72, 1.6, 2.68, 1.3, 0.4, 0.22, beardDark], [-1.4, 1.35, 2.68, 0.4, 0.5, 0.22, beardDark], [1.4, 1.35, 2.68, 0.4, 0.5, 0.22, beardDark],
        [0, 2.6, -2.3, 5.2, 3.6, 0.6, beard],
        [0, 5.3, 0, 5.4, 1.4, 5.4, cap], [0, 4.75, 0, 5.6, 0.5, 5.6, "#8a2c24"], [-1.0, 5.9, -2.2, 2.8, 1.2, 2.0, cap], [-1.6, 5.4, -3.2, 1.4, 1.0, 1.0, cap],
        [2.95, 1.6, 0.6, 0.3, 0.6, 0.3, "#e0b44a"],
      ],
      ...(anomaly ? { itemR: <Gps />, poseR: [-1.05, 0.2] as [number, number], itemTiltR: -0.72 } : {}),
    };
  },
};

export function characterLook(id: PortraitId, anomaly = false): CharacterLook { return looks[id](anomaly); }
