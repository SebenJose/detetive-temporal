"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { Glow, Voxels, seeded, type Vox } from "./Voxels";

const BRASS = "#d4a94a", BRASS_DARK = "#a77f2e", WOOD = "#7a5333", WOOD_DARK = "#5a3b24";

export function OfferingTablet() {
  const carved = "#8f6f45";
  return <Voxels items={[
    [0, 0.15, 0, 1.45, 0.3, 0.7, "#a88c5f"], [0, 0.32, 0, 1.3, 0.06, 0.55, "#b99b6c"],
    [0, 0.9, 0, 1.3, 1.15, 0.24, "#d8c49a"], [0, 1.5, 0, 1.38, 0.08, 0.3, "#bfa676"], [0, 1.56, 0, 1.1, 0.05, 0.26, "#3f6fa8"],
    // Didactic key: bread + III, jar + II (invented for the game).
    [-0.33, 1.13, 0.13, 0.36, 0.16, 0.04, carved], [-0.33, 1.23, 0.13, 0.24, 0.06, 0.04, carved],
    ...[0, 1, 2].map((i): Vox => [0.08 + i * 0.12, 1.15, 0.13, 0.05, 0.24, 0.04, carved]),
    [-0.33, 0.66, 0.13, 0.2, 0.24, 0.04, carved], [-0.33, 0.81, 0.13, 0.1, 0.07, 0.04, carved], [-0.33, 0.86, 0.13, 0.18, 0.04, 0.04, carved],
    ...[0, 1].map((i): Vox => [0.08 + i * 0.12, 0.7, 0.13, 0.05, 0.24, 0.04, carved]),
    [0, 0.94, 0.13, 1.05, 0.03, 0.04, "#a5875a"], [-0.55, 0.9, 0.13, 0.03, 0.9, 0.04, "#a5875a"], [0.55, 0.9, 0.13, 0.03, 0.9, 0.04, "#a5875a"],
  ]} />;
}

export function CompassBox() {
  const needle = useRef<Group>(null);
  useFrame(({ clock }) => { if (needle.current) needle.current.rotation.y = Math.sin(clock.elapsedTime * 1.7) * 0.18 + Math.sin(clock.elapsedTime * 5.1) * 0.04; });
  return <group>
    <Voxels items={[
      [0, 0.32, 0, 0.82, 0.64, 0.82, "#8a5d3b"], [0, 0.04, 0, 0.9, 0.08, 0.9, WOOD_DARK], [0, 0.62, 0, 0.9, 0.06, 0.9, WOOD_DARK],
      [0, 0.68, 0, 0.66, 0.06, 0.66, BRASS], [0, 0.71, 0, 0.56, 0.03, 0.56, "#f2e6c4"],
      [0, 0.73, -0.24, 0.05, 0.02, 0.06, "#c0392b"], [0, 0.73, 0.24, 0.04, 0.02, 0.05, "#2f3e5a"], [0.24, 0.73, 0, 0.05, 0.02, 0.04, "#2f3e5a"], [-0.24, 0.73, 0, 0.05, 0.02, 0.04, "#2f3e5a"],
    ]} />
    <group ref={needle} position={[0, 0.75, 0]}><Voxels cast={false} items={[[0, 0, -0.1, 0.05, 0.025, 0.2, "#c0392b"], [0, 0, 0.1, 0.05, 0.025, 0.2, "#3a4a66"], [0, 0.02, 0, 0.06, 0.03, 0.06, BRASS_DARK]]} /></group>
  </group>;
}

export function ChartTable() {
  const items = useMemo(() => {
    const random = seeded(31);
    const blocks: Vox[] = [
      [0, 0.72, 0, 1.7, 0.1, 1.15, WOOD], ...[[-0.72, -0.46], [0.72, -0.46], [-0.72, 0.46], [0.72, 0.46]].map(([x, z]): Vox => [x, 0.34, z, 0.12, 0.68, 0.12, WOOD_DARK]),
      [0, 0.785, 0, 1.45, 0.02, 0.95, "#efe0b5"],
      [0.48, 0.81, 0.28, 0.06, 0.04, 0.06, "#2a2f3a"], [0.52, 0.86, 0.3, 0.02, 0.12, 0.02, "#f5f0e0"],
      [-0.55, 0.8, -0.34, 0.18, 0.02, 0.18, BRASS], [0.6, 0.8, -0.38, 0.12, 0.05, 0.12, "#6b6f78"],
    ];
    // An invented, simplified coastline and route.
    for (let i = 0; i < 9; i++) blocks.push([-0.62 + random() * 0.18, 0.8, -0.38 + i * 0.09, 0.12 + random() * 0.12, 0.012, 0.09, "#9bb27a"]);
    for (let i = 0; i < 7; i++) blocks.push([-0.3 + i * 0.12, 0.802, 0.25 - Math.sin(i * 0.8) * 0.18, 0.05, 0.012, 0.05, "#b5432f"]);
    return blocks;
  }, []);
  return <Voxels items={items} />;
}

export function Astrolabe() {
  const alidade = useRef<Group>(null), body = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (alidade.current) alidade.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.5;
    if (body.current) body.current.rotation.z = Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });
  const ring = useMemo(() => Array.from({ length: 16 }, (_, i): Vox => {
    const angle = i / 16 * Math.PI * 2;
    return [Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0, 0.17, 0.17, 0.06, i % 2 ? BRASS : BRASS_DARK];
  }), []);
  return <group>
    <Voxels items={[[0, 0.06, 0, 0.7, 0.12, 0.7, WOOD_DARK], [0, 0.85, 0, 0.12, 1.6, 0.12, WOOD], [0, 1.68, 0.12, 0.5, 0.08, 0.08, WOOD]]} />
    <group ref={body} position={[0, 1.66, 0.2]}>
      <group position={[0, -0.55, 0]}>
        <Voxels items={[...ring, [0, 0.46, 0, 0.08, 0.14, 0.05, BRASS], [0, 0, 0, 0.04, 0.72, 0.04, BRASS_DARK], [0, 0, 0, 0.72, 0.04, 0.04, BRASS_DARK]]} />
        <group ref={alidade}><Voxels items={[[0, 0, 0.04, 0.78, 0.06, 0.03, "#f0d27a"], [-0.33, 0.05, 0.04, 0.05, 0.1, 0.03, "#f0d27a"], [0.33, 0.05, 0.04, 0.05, 0.1, 0.03, "#f0d27a"]]} /></group>
      </group>
    </group>
  </group>;
}

export function Doorway({ theme, hood = false }: { theme: "sand" | "sea"; hood?: boolean }) {
  const glow = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const material = glow.current?.material as MeshStandardMaterial | undefined;
    if (material) material.opacity = 0.35 + Math.sin(clock.elapsedTime * 2.4) * 0.12;
  });
  const frame: Vox[] = theme === "sand" ? [
    [-0.5, 0.75, 0, 0.26, 1.5, 0.4, "#c9ab78"], [0.5, 0.75, 0, 0.26, 1.5, 0.4, "#c9ab78"], [0, 1.6, 0, 1.36, 0.24, 0.48, "#b8955f"],
    [0, 1.76, 0, 1.44, 0.08, 0.52, "#3f6fa8"], [0, 1.84, 0, 1.5, 0.08, 0.56, "#b5432f"], [0, 0.03, 0.1, 1.2, 0.06, 0.6, "#bfa06d"],
  ] : [
    [-0.48, 0.75, 0, 0.18, 1.5, 0.3, WOOD_DARK], [0.48, 0.75, 0, 0.18, 1.5, 0.3, WOOD_DARK], [0, 1.56, 0, 1.15, 0.18, 0.34, WOOD_DARK],
    ...[0, 1, 2, 3].map((i): Vox => [-0.29 + i * 0.195, 0.72, -0.04, 0.18, 1.38, 0.08, i % 2 ? "#8a603c" : "#7a5333"]),
    [0.27, 0.75, 0.04, 0.08, 0.08, 0.05, BRASS], [0, 0.03, 0.1, 1.1, 0.06, 0.6, WOOD],
  ];
  // Companionway hood: the deck door leads down a covered stair, so it does not stand alone on the planks.
  const hoodBlocks: Vox[] = [
    [-0.6, 0.62, -0.55, 0.12, 1.24, 1.1, "#5a3b24"], [0.6, 0.62, -0.55, 0.12, 1.24, 1.1, "#5a3b24"], [0, 0.5, -1.08, 1.32, 1.0, 0.1, "#5a3b24"],
    [0, 1.7, -0.2, 1.46, 0.12, 0.55, WOOD], [0, 1.48, -0.62, 1.46, 0.12, 0.5, WOOD], [0, 1.24, -1.0, 1.46, 0.12, 0.4, WOOD],
    [-0.6, 1.38, -0.55, 0.12, 0.5, 0.75, "#5a3b24"], [0.6, 1.38, -0.55, 0.12, 0.5, 0.75, "#5a3b24"],
  ];
  return <group>
    <Voxels items={frame} />
    {hood && <Voxels items={hoodBlocks} />}
    {theme === "sand" && <mesh position={[0, 0.74, -0.05]} scale={[0.74, 1.46, 0.05]}><boxGeometry /><meshStandardMaterial color="#21160f" /></mesh>}
    <mesh ref={glow} position={[0, 0.74, 0.08]} scale={[0.72, 1.4, 0.02]}><boxGeometry /><meshStandardMaterial color="#7ff3dd" emissive="#4fe0c4" emissiveIntensity={1.2} transparent opacity={0.4} depthWrite={false} toneMapped={false} /></mesh>
  </group>;
}

/** Pedestal with a floating hourglass: purple while the anomaly is active, gold once restored. */
export function TimeRestorer({ completed }: { completed: boolean }) {
  const glass = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!glass.current) return;
    glass.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 2) * 0.08;
    glass.current.rotation.y = clock.elapsedTime * (completed ? 0.5 : 1.4);
    glass.current.rotation.z = completed ? 0 : Math.sin(clock.elapsedTime * 7) * 0.06;
  });
  const accent = completed ? "#ffd166" : "#c77dff";
  return <group>
    <Voxels items={[[0, 0.3, 0, 0.9, 0.6, 0.9, "#8f7a5c"], [0, 0.66, 0, 1.08, 0.12, 1.08, "#b49a6e"], [0, 0.04, 0, 1.08, 0.08, 1.08, "#6f5c43"]]} />
    <Glow p={[0, 0.74, 0]} s={[0.7, 0.04, 0.7]} color={accent} intensity={1.4} opacity={0.85} />
    <group ref={glass} position={[0, 1.35, 0]}>
      <Voxels items={[[0, 0.36, 0, 0.6, 0.08, 0.6, BRASS], [0, -0.36, 0, 0.6, 0.08, 0.6, BRASS], ...[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([x, z]): Vox => [x, 0, z, 0.06, 0.66, 0.06, BRASS_DARK])]} />
      <mesh position={[0, 0.16, 0]} scale={[0.38, 0.3, 0.38]}><boxGeometry /><meshStandardMaterial color="#d8f6ff" transparent opacity={0.35} /></mesh>
      <mesh position={[0, -0.16, 0]} scale={[0.38, 0.3, 0.38]}><boxGeometry /><meshStandardMaterial color="#d8f6ff" transparent opacity={0.35} /></mesh>
      <Glow p={[0, completed ? -0.22 : 0.2, 0]} s={[0.26, 0.16, 0.26]} color={accent} intensity={1.8} />
      <Glow p={[0, 0, 0]} s={[0.06, 0.2, 0.06]} color={accent} intensity={1.8} />
    </group>
  </group>;
}

// Blocks drawing a "?" over objects still to be judged.
const QUESTION: [number, number][] = [[-0.09, 0.26], [-0.03, 0.32], [0.05, 0.32], [0.11, 0.26], [0.11, 0.18], [0.05, 0.12], [0, 0.05], [0, -0.03], [0, -0.16]];

/** Floating "!" over clues not yet found, a check over collected ones and a chevron over exits. */
export function Marker({ type, y, active }: { type: "new" | "done" | "door" | "solution" | "suspect"; y: number; active: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = y + Math.sin(t * 3) * 0.07;
    group.current.rotation.y = t * 1.6;
    const scale = active ? 1.25 + Math.sin(t * 8) * 0.06 : 1;
    group.current.scale.setScalar(scale);
  });
  const color = type === "new" ? "#ffcc33" : type === "done" ? "#7bd88f" : type === "door" ? "#5ff0d2" : type === "suspect" ? "#ff7ad9" : "#e2a8ff";
  return <group ref={group} position={[0, y, 0]}>
    {type === "new" && <><Glow p={[0, 0.16, 0]} s={[0.12, 0.3, 0.12]} color={color} /><Glow p={[0, -0.1, 0]} s={[0.12, 0.12, 0.12]} color={color} /></>}
    {type === "done" && <group rotation={[0, 0, 0]}><mesh position={[-0.07, 0, 0]} rotation={[0, 0, 0.8]} scale={[0.09, 0.2, 0.09]}><boxGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} /></mesh><mesh position={[0.07, 0.07, 0]} rotation={[0, 0, -0.65]} scale={[0.09, 0.36, 0.09]}><boxGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} /></mesh></group>}
    {type === "door" && <><mesh position={[-0.08, 0, 0]} rotation={[0, 0, -0.8]} scale={[0.09, 0.26, 0.09]}><boxGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} /></mesh><mesh position={[0.08, 0, 0]} rotation={[0, 0, 0.8]} scale={[0.09, 0.26, 0.09]}><boxGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} /></mesh></>}
    {type === "suspect" && QUESTION.map(([x, qy], index) => <Glow key={index} p={[x, qy, 0]} s={[0.085, 0.085, 0.085]} color={color} />)}
    {type === "solution" && <mesh rotation={[0.6, 0, 0.6]} scale={0.16}><octahedronGeometry /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} /></mesh>}
  </group>;
}

/** Pulsing ring on the floor around a point of interest. */
export function FloorRing({ color, active }: { color: string; active: boolean }) {
  const ring = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const pulse = active ? 1 + Math.sin(clock.elapsedTime * 6) * 0.08 : 1;
    ring.current.scale.set(pulse, pulse, 1);
    (ring.current.material as MeshStandardMaterial).opacity = active ? 0.95 : 0.55;
  });
  return <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
    <ringGeometry args={[0.5, 0.6, 4, 1]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.2 : 0.5} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
  </mesh>;
}

/** Golden cubes that burst out once when the timeline is restored. */
export function Sparkles({ count = 26, color = "#ffd166" }: { count?: number; color?: string }) {
  const group = useRef<Group>(null), start = useRef<number | null>(null);
  const seeds = useMemo(() => { const random = seeded(99); return Array.from({ length: count }, () => [random() * Math.PI * 2, 1.5 + random() * 2.5, 2 + random() * 3]); }, [count]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const age = (clock.elapsedTime - start.current) % 3.2;
    group.current.children.forEach((child, index) => {
      const [angle, speed, lift] = seeds[index];
      child.position.set(Math.cos(angle) * speed * age * 0.5, 1.2 + lift * age - 2.2 * age * age, Math.sin(angle) * speed * age * 0.5);
      child.scale.setScalar(Math.max(0, 0.14 * (1 - age / 2.2)));
      child.rotation.set(age * 5, age * 3, 0);
    });
  });
  return <group ref={group}>{seeds.map((_, index) => <Glow key={index} p={[0, 0, 0]} s={[1, 1, 1]} color={index % 3 ? color : "#ffffff"} intensity={2} />)}</group>;
}
