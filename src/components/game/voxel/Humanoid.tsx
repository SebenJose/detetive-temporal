"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import type { Group } from "three";
import { Voxels, type Vox } from "./Voxels";

export type Expression = "neutral" | "happy" | "worried" | "surprised" | "determined";
export type Motion = { moving: boolean; talking: boolean };

export type CharacterLook = {
  head: Vox[]; torso: Vox[]; armL: Vox[]; armR: Vox[]; legL: Vox[]; legR: Vox[];
  face: "normal" | "kohl" | "mummy";
  brow?: string;
  mouth: string;
  /** Items attached to each hand, built pointing up from the palm. */
  itemL?: ReactNode; itemR?: ReactNode;
  /** Fixed arm rotations [x, z]; arms without a pose swing while walking. */
  poseL?: [number, number]; poseR?: [number, number];
  itemTiltL?: number; itemTiltR?: number;
};

// Blocks are authored in "voxel units": a character is about 17 units tall and scaled by 0.1.
export const UNIT = 0.1;
const HIP = 5, SHOULDER = 9.7, NECK = 10.2;

const MOUTHS: Record<Expression, Vox[]> = {
  neutral: [[0, 0, 0, 1.4, 0.32, 0.1, ""]],
  happy: [[0, -0.12, 0, 1.2, 0.34, 0.1, ""], [-0.75, 0.1, 0, 0.36, 0.36, 0.1, ""], [0.75, 0.1, 0, 0.36, 0.36, 0.1, ""]],
  worried: [[0, 0.1, 0, 1.1, 0.32, 0.1, ""], [-0.68, -0.13, 0, 0.36, 0.36, 0.1, ""], [0.68, -0.13, 0, 0.36, 0.36, 0.1, ""]],
  surprised: [[0, -0.05, 0, 0.75, 0.85, 0.1, ""]],
  determined: [[0.1, 0, 0, 1.25, 0.3, 0.1, ""], [0.85, 0.14, 0, 0.32, 0.32, 0.1, ""]],
};

const BROWS: Record<Expression, { y: number; tilt: number }> = {
  neutral: { y: 0, tilt: 0 }, happy: { y: 0.18, tilt: 0 }, worried: { y: 0.1, tilt: 0.32 },
  surprised: { y: 0.4, tilt: 0 }, determined: { y: -0.08, tilt: -0.22 },
};

function paint(items: Vox[], color: string): Vox[] { return items.map(([x, y, z, w, h, d]) => [x, y, z, w, h, d, color]); }

function Face({ look, expression, eyes, mouth }: { look: CharacterLook; expression: Expression; eyes: MutableRefObject<Group | null>; mouth: MutableRefObject<Group | null> }) {
  const brow = BROWS[expression];
  const eyeBlocks = useMemo<Vox[]>(() => {
    if (look.face === "mummy") return [];
    const blocks: Vox[] = [];
    for (const side of [-1, 1]) {
      const x = side * 1.05;
      blocks.push([x, 0, 0, 1.0, 1.1, 0.1, "#fbf7ee"], [x + 0.12, -0.08, 0.06, 0.56, 0.72, 0.08, "#1d2232"], [x + 0.26, 0.2, 0.11, 0.2, 0.2, 0.05, "#ffffff"]);
      if (look.face === "kohl") blocks.push([x, 0.6, 0.04, 1.15, 0.22, 0.1, "#15131c"], [x + side * 0.72, 0.5, 0.04, 0.5, 0.2, 0.1, "#15131c"], [x, -0.6, 0.04, 1.0, 0.16, 0.1, "#15131c"]);
    }
    return blocks;
  }, [look.face]);
  const mouthBlocks = useMemo(() => paint(MOUTHS[look.face === "mummy" && expression === "happy" ? "happy" : expression], look.mouth), [expression, look.face, look.mouth]);
  const squint = expression === "happy" ? 0.65 : expression === "surprised" ? 1.2 : 1;
  return <group position={[0, 0, 2.53]}>
    <group ref={eyes} position={[0, 2.65, 0]} scale={[1, squint, 1]} userData={{ open: squint }}>
      {look.face === "mummy" ? [-1, 1].map((side) => <mesh key={side} position={[side * 1.05, 0, 0.04]} scale={[0.75, 0.55, 0.1]}>
        <boxGeometry /><meshStandardMaterial color="#ffb347" emissive="#ff9b2e" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>) : <Voxels items={eyeBlocks} cast={false} />}
    </group>
    {look.brow && [-1, 1].map((side) => <mesh key={side} position={[side * 1.05, 3.62 + brow.y, 0.03]} rotation={[0, 0, -side * brow.tilt]} scale={[1.3, 0.32, 0.12]}>
      <boxGeometry /><meshStandardMaterial color={look.brow} />
    </mesh>)}
    <group ref={mouth} position={[0, 1.15, 0]}><Voxels items={mouthBlocks} cast={false} /></group>
    {expression === "happy" && look.face !== "mummy" && [-1, 1].map((side) => <mesh key={side} position={[side * 1.75, 1.75, 0]} scale={[0.7, 0.4, 0.08]}>
      <boxGeometry /><meshStandardMaterial color="#f08a8a" transparent opacity={0.65} />
    </mesh>)}
  </group>;
}

/** A voxel figure with articulated limbs, idle breathing, blinking, talking and a walk cycle. */
export function Humanoid({ look, expression = "neutral", motion, phase = 0 }: { look: CharacterLook; expression?: Expression; motion: MutableRefObject<Motion>; phase?: number }) {
  const body = useRef<Group>(null), torso = useRef<Group>(null), head = useRef<Group>(null);
  const armL = useRef<Group>(null), armR = useRef<Group>(null), legL = useRef<Group>(null), legR = useRef<Group>(null);
  const eyes = useRef<Group>(null), mouth = useRef<Group>(null);
  const walk = useRef(0), blinkAt = useRef(2 + phase);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime + phase, { moving, talking } = motion.current;
    walk.current += ((moving ? 1 : 0) - walk.current) * Math.min(1, delta * 10);
    const w = walk.current, swing = Math.sin(t * 11);
    if (body.current) body.current.position.y = Math.abs(swing) * 0.38 * w + Math.sin(t * 2.1) * 0.04;
    if (torso.current) { torso.current.rotation.x = 0.07 * w; torso.current.scale.y = 1 + Math.sin(t * 2.1) * 0.012; }
    if (legL.current) legL.current.rotation.x = swing * 0.75 * w;
    if (legR.current) legR.current.rotation.x = -swing * 0.75 * w;
    if (armL.current) { const [x, z] = look.poseL ?? [0, 0]; armL.current.rotation.x = x + (look.poseL ? Math.sin(t * 2) * 0.04 : -swing * 0.65 * w + Math.sin(t * 2.1) * 0.03); armL.current.rotation.z = z - (look.poseL ? 0 : 0.06); }
    if (armR.current) { const [x, z] = look.poseR ?? [0, 0]; armR.current.rotation.x = x + (look.poseR ? Math.sin(t * 2 + 1) * 0.04 : swing * 0.65 * w + Math.sin(t * 2.1) * 0.03); armR.current.rotation.z = z + (look.poseR ? 0 : 0.06); }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.55) * 0.2 * (1 - w);
      head.current.rotation.x = talking ? Math.sin(t * 8) * 0.06 : Math.sin(t * 0.8) * 0.03;
      head.current.rotation.z = talking ? Math.sin(t * 3.3) * 0.05 : 0;
    }
    if (eyes.current) {
      const open = eyes.current.userData.open as number;
      if (t > blinkAt.current + 0.13) blinkAt.current = t + 2 + ((t * 7.31) % 3);
      eyes.current.scale.y = t > blinkAt.current ? 0.1 : open;
    }
    if (mouth.current) mouth.current.scale.y = talking ? 1 + Math.abs(Math.sin(t * 15)) * 1.7 : 1;
  });

  return <group scale={UNIT}>
    <group ref={body}>
      <group ref={legL} position={[-1.1, HIP, 0]}><Voxels items={look.legL} /></group>
      <group ref={legR} position={[1.1, HIP, 0]}><Voxels items={look.legR} /></group>
      <group ref={torso} position={[0, HIP, 0]}><Voxels items={look.torso} /></group>
      <group ref={armL} position={[-3.3, SHOULDER, 0]}>
        <Voxels items={look.armL} />
        {look.itemL && <group position={[0, -4.9, 0.2]} rotation={[Math.PI / 2 + (look.itemTiltL ?? 0), 0, 0]}>{look.itemL}</group>}
      </group>
      <group ref={armR} position={[3.3, SHOULDER, 0]}>
        <Voxels items={look.armR} />
        {look.itemR && <group position={[0, -4.9, 0.2]} rotation={[Math.PI / 2 + (look.itemTiltR ?? 0), 0, 0]}>{look.itemR}</group>}
      </group>
      <group ref={head} position={[0, NECK, 0]}>
        <Voxels items={look.head} />
        <Face look={look} expression={expression} eyes={eyes} mouth={mouth} />
      </group>
    </group>
  </group>;
}
