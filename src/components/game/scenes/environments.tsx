"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Matrix4, Object3D, Vector3, type Group, type InstancedMesh, type Mesh, type PointLight } from "three";
import type { MissionId, RoomId } from "@/game/types";
import { Glow, Voxels, seeded, unitBox, type Vox } from "../voxel/Voxels";

export type Atmosphere = { background: string; fog: [string, number, number]; ambient: number; sun: number; sunColor: string; sky: string; ground: string };

export function atmosphere(mission: MissionId, room: RoomId): Atmosphere {
  if (mission === "egito") return room === "exterior"
    ? { background: "#f3c98b", fog: ["#f3c98b", 26, 48], ambient: 1.25, sun: 2.6, sunColor: "#fff1d6", sky: "#ffe2b0", ground: "#e2c48f" }
    : { background: "#2a1c14", fog: ["#2a1c14", 24, 40], ambient: 0.7, sun: 1.0, sunColor: "#ffd9a8", sky: "#5a3a26", ground: "#3a2a1e" };
  return room === "exterior"
    ? { background: "#9fd6e8", fog: ["#9fd6e8", 26, 50], ambient: 1.3, sun: 2.4, sunColor: "#fffaf0", sky: "#d7f1fb", ground: "#2f86a6" }
    : { background: "#1f1712", fog: ["#1f1712", 24, 40], ambient: 0.75, sun: 0.9, sunColor: "#ffe2b8", sky: "#4a3626", ground: "#2a1f18" };
}

/** A thin block stretched between two points; used for ropes and rigging. */
function Beam({ from, to, size = 0.04, color }: { from: [number, number, number]; to: [number, number, number]; size?: number; color: string }) {
  const transform = useMemo(() => {
    const a = new Vector3(...from), b = new Vector3(...to), helper = new Object3D();
    helper.position.copy(a).add(b).multiplyScalar(0.5); helper.lookAt(b);
    return { position: helper.position.clone(), quaternion: helper.quaternion.clone(), length: a.distanceTo(b) };
  }, [from, to]);
  return <mesh position={transform.position} quaternion={transform.quaternion} scale={[size, size, transform.length]} geometry={unitBox}><meshStandardMaterial color={color} roughness={1} /></mesh>;
}

function Torch({ position, light = true }: { position: [number, number, number]; light?: boolean }) {
  const flame = useRef<Mesh>(null), lamp = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + position[0] * 3;
    const flicker = 1 + Math.sin(t * 17) * 0.12 + Math.sin(t * 7.3) * 0.08;
    flame.current?.scale.set(0.16 * flicker, 0.28 * (2 - flicker), 0.16 * flicker);
    if (lamp.current) lamp.current.intensity = 9 * flicker;
  });
  return <group position={position}>
    <Voxels items={[[0, 0, 0, 0.1, 0.5, 0.1, "#5a3b24"], [0, 0.27, 0, 0.2, 0.08, 0.2, "#3a2a1c"], [0, -0.05, -0.12, 0.08, 0.08, 0.2, "#3a2a1c"]]} />
    <mesh ref={flame} position={[0, 0.45, 0]} geometry={unitBox}><meshStandardMaterial color="#ffb347" emissive="#ff8a1f" emissiveIntensity={2.6} toneMapped={false} /></mesh>
    <Glow p={[0, 0.42, 0]} s={[0.08, 0.14, 0.08]} color="#fff3b0" intensity={3} />
    {light && <pointLight ref={lamp} position={[0, 0.6, 0.3]} color="#ffa552" intensity={9} distance={7} decay={1.6} />}
  </group>;
}

function palm(x: number, z: number, height: number, seed: number): Vox[] {
  const random = seeded(seed), blocks: Vox[] = [];
  let px = x, pz = z;
  const lean = random() * 0.06 + 0.03;
  for (let i = 0; i < height; i++) { blocks.push([px, 0.2 + i * 0.36, pz, 0.26, 0.38, 0.26, i % 2 ? "#8a6a43" : "#9d7b4f"]); px += lean; }
  const top = 0.2 + height * 0.36;
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2 + random();
    for (let j = 1; j <= 4; j++) blocks.push([px + Math.cos(angle) * j * 0.28, top - j * j * 0.035, pz + Math.sin(angle) * j * 0.28, 0.3, 0.08, 0.3, j % 2 ? "#5f8f4e" : "#4f7d42"]);
  }
  blocks.push([px, top, pz, 0.32, 0.22, 0.32, "#4f7d42"], [px + 0.12, top - 0.18, pz, 0.12, 0.14, 0.12, "#8b4a2b"], [px - 0.1, top - 0.2, pz + 0.08, 0.12, 0.14, 0.12, "#8b4a2b"]);
  return blocks;
}

function steppedPyramid(x: number, z: number, base: number, layers: number, height: number): Vox[] {
  return Array.from({ length: layers }, (_, i): Vox => {
    const size = base - i * (base / layers);
    return [x, height / 2 + i * height, z, size, height, size, i % 2 ? "#d4b073" : "#dfbd82"];
  });
}

function jar(x: number, z: number, y = 0, color = "#b4673e"): Vox[] {
  return [[x, y + 0.15, z, 0.26, 0.3, 0.26, color], [x, y + 0.34, z, 0.18, 0.1, 0.18, color], [x, y + 0.42, z, 0.22, 0.05, 0.22, "#8a4a2b"]];
}

function barrel(x: number, z: number, y = 0): Vox[] {
  return [[x, y + 0.35, z, 0.62, 0.7, 0.62, "#8a5d3b"], [x, y + 0.35, z, 0.68, 0.46, 0.68, "#9a6b45"], [x, y + 0.12, z, 0.66, 0.06, 0.66, "#3e3a36"], [x, y + 0.58, z, 0.66, 0.06, 0.66, "#3e3a36"]];
}

function crate(x: number, z: number, y = 0, size = 0.7): Vox[] {
  return [[x, y + size / 2, z, size, size, size, "#b08a58"], [x, y + size / 2, z, size + 0.02, 0.1, size + 0.02, "#7a5a36"], [x, y + size / 2, z, 0.1, size + 0.02, size + 0.02, "#7a5a36"]];
}

function EgyptCourtyard() {
  const items = useMemo(() => {
    const random = seeded(3), blocks: Vox[] = [];
    for (let i = 0; i < 70; i++) blocks.push([(random() - 0.5) * 22, 0.005, (random() - 0.5) * 22, 0.3 + random() * 0.9, 0.02, 0.3 + random() * 0.9, random() > 0.5 ? "#d9b981" : "#e8cd9b"]);
    // Low stone border marking the courtyard.
    for (let i = -5; i <= 5; i++) {
      blocks.push([i * 1.0, 0.12, 5.25, 0.92, 0.24, 0.5, i % 2 ? "#cdb084" : "#c2a476"], [5.25, 0.12, i * 1.0, 0.5, 0.24, 0.92, i % 2 ? "#c2a476" : "#cdb084"]);
      blocks.push([i * 1.0, 0.25, -5.25, 0.92, 0.5, 0.5, i % 2 ? "#cdb084" : "#c2a476"], [-5.25, 0.25, i * 1.0, 0.5, 0.5, 0.92, i % 2 ? "#c2a476" : "#cdb084"]);
    }
    blocks.push(...steppedPyramid(-2.3, -2.3, 4.0, 6, 0.56), [-2.3, 3.55, -2.3, 0.35, 0.3, 0.35, "#efe2c0"]);
    blocks.push(...steppedPyramid(-13, -6, 8, 10, 0.75), ...steppedPyramid(-7, -14, 6.5, 9, 0.7), ...steppedPyramid(-16, -15, 4, 6, 0.6));
    blocks.push(...palm(4.3, -4.3, 8, 11), ...palm(-4.3, 4.3, 7, 12), ...palm(7.5, 2, 9, 13), ...palm(1.5, 7.5, 7, 14), ...palm(-8, 3.5, 8, 15));
    // Construction site: limestone blocks, a ramp and a wooden sledge.
    for (const [x, y, z] of [[0.95, 0.25, -4.45], [1.5, 0.25, -4.45], [2.05, 0.25, -4.45], [1.2, 0.75, -4.45], [1.75, 0.75, -4.45], [1.5, 0.25, -3.95], [2.05, 0.25, -3.95]]) blocks.push([x, y, z, 0.5, 0.5, 0.5, random() > 0.5 ? "#eadcb8" : "#e0cfa6"]);
    blocks.push([0.95, 0.55, -3.95, 0.5, 0.06, 0.3, "#8a6a43"], [0.95, 0.06, -3.95, 0.6, 0.06, 0.12, "#6f5233"]);
    // Jars and baskets just outside the walkable area.
    blocks.push(...jar(-5.0, 1.6), ...jar(-5.0, 2.1, 0, "#c47a48"), ...jar(-4.95, 2.6), [5.0, 0.15, 1.2, 0.5, 0.3, 0.5, "#c9a15b"], [5.0, 0.32, 1.2, 0.4, 0.06, 0.4, "#b38a48"]);
    for (let i = 0; i < 14; i++) { const angle = random() * Math.PI * 2, r = 7 + random() * 6; blocks.push([Math.cos(angle) * r, 0.1, Math.sin(angle) * r, 0.3 + random() * 0.4, 0.2 + random() * 0.3, 0.3 + random() * 0.4, "#c8a26c"]); }
    return blocks;
  }, []);
  return <Voxels items={items} receive />;
}

function EgyptArchive() {
  const items = useMemo(() => {
    const random = seeded(5), blocks: Vox[] = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) blocks.push([-4.82 + i * 1.07, 0.01, -4.82 + j * 1.07, 1.05, 0.02, 1.05, (i + j) % 2 ? "#cfb487" : "#c2a575"]);
    const wall = "#d9c196", band = "#9c4a32", blue = "#3f6fa8", gold = "#e0b44a";
    blocks.push([0, 1.3, -5.35, 10.9, 2.6, 0.3, wall], [-5.35, 1.3, 0, 0.3, 2.6, 10.9, wall], [0, 0.3, -5.18, 10.7, 0.6, 0.06, band], [-5.18, 0.3, 0, 0.06, 0.6, 10.7, band]);
    for (let i = 0; i < 22; i++) {
      blocks.push([-5.2 + i * 0.5, 2.5, -5.17, 0.4, 0.2, 0.06, i % 2 ? blue : gold], [-5.17, 2.5, -5.2 + i * 0.5, 0.06, 0.2, 0.4, i % 2 ? gold : blue]);
      // Decorative, invented painted panels: these are not real hieroglyphs.
      for (const y of [1.2, 1.65]) {
        if (random() > 0.25) blocks.push([-5.0 + i * 0.47, y, -5.17, 0.16, 0.12 + random() * 0.18, 0.05, random() > 0.6 ? "#2a3550" : random() > 0.5 ? band : "#4c7a52"]);
        if (random() > 0.25) blocks.push([-5.17, y, -5.0 + i * 0.47, 0.05, 0.12 + random() * 0.18, 0.16, random() > 0.6 ? "#2a3550" : random() > 0.5 ? band : "#4c7a52"]);
      }
    }
    blocks.push([-5.17, 1.43, 0, 0.04, 0.03, 10.4, "#b89a6a"], [0, 1.43, -5.17, 10.4, 0.03, 0.04, "#b89a6a"]);
    for (const x of [0.6, 3.6]) {
      blocks.push([x, 1.2, -3.9, 0.62, 2.4, 0.62, "#e6d5ae"], [x, 2.5, -3.9, 0.9, 0.22, 0.9, "#c9ab78"], [x, 0.08, -3.9, 0.8, 0.16, 0.8, "#b99c6d"]);
      for (const y of [0.6, 1.5, 2.1]) blocks.push([x, y, -3.9, 0.66, 0.12, 0.66, y > 2 ? blue : band]);
    }
    blocks.push([-4.3, 0.55, -4.1, 0.75, 1.1, 0.75, "#8a6a43"], [-4.3, 0.55, -3.7, 0.7, 0.04, 0.05, "#5a3b24"]);
    blocks.push(...jar(-4.45, -4.2, 1.1), ...jar(-4.12, -4.0, 1.1, "#c9a15b"), [-4.3, 0.6, -3.7, 0.5, 0.14, 0.14, "#ecdcaa"]);
    blocks.push(...jar(-4.8, 1.2), ...jar(-4.8, 1.7, 0, "#9a5a3a"), ...jar(-1.6, -4.8, 0, "#c47a48"));
    return blocks;
  }, []);
  return <group>
    <Voxels items={items} receive />
    <Torch position={[-1.8, 1.6, -5.05]} /><Torch position={[2.1, 1.6, -5.05]} /><Torch position={[-5.05, 1.6, 1.4]} light={false} />
  </group>;
}

function Waves() {
  const mesh = useRef<InstancedMesh>(null);
  const cells = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let x = -20; x <= 20; x += 1.25) for (let z = -20; z <= 20; z += 1.25) if (Math.abs(x) > 6.8 || Math.abs(z) > 6.1) list.push([x, z, (x * 0.37 + z * 0.61) % 6.28]);
    return list;
  }, []);
  useLayoutEffect(() => {
    const color = new Color();
    cells.forEach(([x, z], index) => mesh.current?.setColorAt(index, color.set((Math.round(x + z) & 1) ? "#2f86a6" : "#3a95b5")));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [cells]);
  const matrix = useMemo(() => new Matrix4(), []);
  useFrame(({ clock }) => {
    const target = mesh.current, t = clock.elapsedTime;
    if (!target) return;
    cells.forEach(([x, z, phase], index) => {
      const y = -0.75 + Math.sin(t * 1.3 + phase + x * 0.3) * 0.12 + Math.cos(t * 0.9 + z * 0.4) * 0.08;
      matrix.makeScale(1.24, 0.5, 1.24); matrix.setPosition(x, y, z); target.setMatrixAt(index, matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  });
  return <group>
    <instancedMesh ref={mesh} args={[unitBox, undefined, cells.length]} receiveShadow><meshStandardMaterial roughness={0.35} metalness={0.05} /></instancedMesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#246f8c" roughness={0.6} /></mesh>
  </group>;
}

const HULL = "#5a3b24", HULL_DARK = "#3a2618", RAIL = "#7a5333", POST = "#4a3020", CANVAS = "#f4ead1", CANVAS_SHADE = "#e3d5b0", CROSS = "#b8322a";

/** Half-width of the pointed bow at each slice, from the deck edge to the stem. */
const BOW_SLICES = Array.from({ length: 8 }, (_, i) => ({ x: 5.65 + i * 0.4, half: 5.5 * Math.sqrt(1 - i / 8.4), rise: i * i * 0.012 }));

/**
 * Square main sail with the red cross of the period, built from vertical strips so it bellies forward.
 * The group is stretched along x to make it breathe with the wind.
 */
function MainSail() {
  const items = useMemo(() => {
    // Strips are thick enough to overlap their neighbours, so the curve has no gaps.
    const blocks: Vox[] = [], strips = 12, width = 4.6, top = 2.95, height = 2.95, depth = 0.2;
    for (let i = 0; i < strips; i++) {
      const t = (i + 0.5) / strips * 2 - 1, z = t * width / 2, belly = 0.16 * (1 - t * t), front = belly + depth / 2 + 0.01;
      blocks.push([belly, 0, z, depth, height, width / strips + 0.01, i % 2 ? CANVAS : CANVAS_SHADE]);
      // Cross: a vertical band in the middle strips and a horizontal band across.
      if (Math.abs(t) < 0.17) blocks.push([front, 0.05, z, 0.02, height * 0.72, width / strips + 0.02, CROSS]);
      if (Math.abs(t) < 0.76) blocks.push([front, 0.25, z, 0.02, 0.36, width / strips + 0.02, CROSS]);
    }
    for (const y of [top / 2 - 0.05, -top / 2 + 0.05]) blocks.push([0, y, 0, 0.1, 0.08, width + 0.1, "#cdbb8f"]);
    return blocks;
  }, []);
  return <Voxels items={items} />;
}

/** Triangular lateen sail on the stern mast, hanging from a slanted yard. */
function LateenSail() {
  const items = useMemo(() => {
    const blocks: Vox[] = [], from = { y: 2.1, z: 2.7 }, to = { y: 6.4, z: -2.3 }, strips = 12;
    for (let i = 0; i < strips; i++) {
      const t = (i + 0.5) / strips, z = from.z + (to.z - from.z) * t, yard = from.y + (to.y - from.y) * t, foot = 2.0 + t * 0.5;
      if (yard - foot < 0.15) continue;
      blocks.push([0.1 * Math.sin(t * Math.PI), (yard + foot) / 2, z, 0.16, yard - foot, (from.z - to.z) / strips + 0.02, i % 2 ? CANVAS : CANVAS_SHADE]);
    }
    return blocks;
  }, []);
  return <group position={[-6.45, 0, 0.3]}>
    <Voxels items={items} />
    <Beam from={[0, 2.0, 2.9]} to={[0, 6.55, -2.45]} size={0.1} color={POST} />
  </group>;
}

function ShipDeck() {
  const sail = useRef<Group>(null), lateen = useRef<Group>(null);
  useFrame(({ clock }) => {
    const wind = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.22;
    if (sail.current) sail.current.scale.x = wind;
    if (lateen.current) lateen.current.scale.x = 2 - wind;
  });
  const items = useMemo(() => {
    const blocks: Vox[] = [];
    for (let i = 0; i < 15; i++) blocks.push([0, -0.06, -5.25 + i * 0.75, 10.9, 0.12, 0.72, i % 2 ? "#a47a4f" : "#b08657"]);
    // Hull: strakes that narrow towards the keel, an ochre wale and a dark band at the waterline.
    blocks.push([0, -0.4, 0, 11.0, 0.6, 11.2, HULL], [0, -0.85, 0, 10.5, 0.4, 10.5, "#4f3420"], [0, -1.15, 0, 9.8, 0.3, 9.6, HULL_DARK]);
    blocks.push([0, -0.2, 0, 11.06, 0.1, 11.26, "#b8893e"], [0, -0.62, 0, 11.04, 0.12, 11.24, HULL_DARK]);
    // Pointed bow, rising slightly towards the stem, with its own bulwark.
    BOW_SLICES.forEach(({ x, half, rise }, i) => {
      blocks.push([x, -0.06 + rise, 0, 0.42, 0.12, half * 2, i % 2 ? "#a47a4f" : "#b08657"]);
      blocks.push([x, -0.55 + rise / 2, 0, 0.42, 0.9 + rise, half * 2 - 0.15, HULL], [x, -0.2 + rise, 0, 0.42, 0.1, half * 2 + 0.06, "#b8893e"]);
      // Each bulwark block reaches the next slice's edge, so the rail reads as one continuous wall.
      const inner = BOW_SLICES[i + 1]?.half ?? 0.3, span = half - inner + 0.18;
      for (const side of [-1, 1]) blocks.push([x, 0.18 + rise, side * (half + inner) / 2, 0.42, 0.36, span, RAIL], [x, 0.4 + rise, side * (half + inner) / 2, 0.44, 0.1, span + 0.06, HULL]);
    });
    blocks.push([8.85, 0.25, 0, 0.4, 0.9, 0.5, HULL], [8.85, 0.75, 0, 0.3, 0.2, 0.3, HULL_DARK]);
    for (const z of [-5.45, 5.45]) {
      blocks.push([0, 0.35, z, 11, 0.12, 0.2, HULL], [0, 0.12, z, 11, 0.3, 0.16, RAIL]);
      for (let i = 0; i < 12; i++) blocks.push([-5.25 + i * 0.95, 0.2, z, 0.14, 0.42, 0.22, POST]);
    }
    // Raised stern castle beyond the walkable area: door, lit windows, a ladder and a railing on top.
    blocks.push([-6.4, 0.6, 0, 1.8, 1.4, 11.2, RAIL], [-6.4, 1.35, 0, 1.9, 0.12, 11.3, HULL], [-6.4, 0.2, 0, 1.84, 0.1, 11.24, "#b8893e"]);
    blocks.push([-5.49, 0.55, 0, 0.06, 0.95, 0.75, HULL_DARK], [-5.47, 1.05, 0, 0.08, 0.1, 0.95, POST], [-5.47, 0.55, 0.42, 0.08, 1.0, 0.1, POST], [-5.47, 0.55, -0.42, 0.08, 1.0, 0.1, POST], [-5.45, 0.55, 0.22, 0.04, 0.08, 0.08, "#d4a94a"]);
    for (const z of [-2.6, 2.4]) blocks.push([-5.47, 0.85, z, 0.08, 0.5, 0.6, POST]);
    for (let k = 0; k < 4; k++) blocks.push([-4.95 - k * 0.16, 0.17 + k * 0.33, -3.0, 0.3, 0.08, 0.8, RAIL]);
    blocks.push([-5.2, 0.7, -3.42, 0.7, 0.1, 0.06, POST], [-5.2, 0.7, -2.58, 0.7, 0.1, 0.06, POST]);
    for (let z = -5.4; z <= 5.4; z += 0.9) blocks.push([-5.55, 1.6, z, 0.12, 0.42, 0.12, POST]);
    blocks.push([-5.55, 1.83, 0, 0.16, 0.1, 11.2, RAIL], [-7.25, 1.83, 0, 0.16, 0.1, 11.2, RAIL], [-7.25, 1.6, 0, 0.1, 0.42, 11.2, POST]);
    blocks.push([-7.0, 2.0, 0, 0.1, 1.2, 0.1, POST], [-7.0, 2.65, 0, 0.3, 0.08, 0.3, POST]);
    // Main mast, yard and crow's nest; stern mast.
    blocks.push([0, 3.2, -1, 0.32, 6.4, 0.32, "#6b4a2f"], [0, 4.95, -1, 0.18, 0.18, 5.2, HULL], [0, 1.95, -1, 0.14, 0.14, 4.8, HULL], [0, 6.0, -1, 0.9, 0.35, 0.9, RAIL], [0, 6.75, -1, 0.06, 1.2, 0.06, POST]);
    blocks.push([-6.45, 3.9, 0.3, 0.24, 5.0, 0.24, "#6b4a2f"]);
    // Cargo, a flat hatch grating, a coiled rope by the rail, mooring bitts and a bucket.
    blocks.push(...barrel(-4.35, -4.35), ...barrel(-3.95, -4.1), ...barrel(-4.35, -3.95, 0), ...barrel(-4.15, -4.2, 0.7));
    blocks.push(...crate(4.1, -4.35), ...crate(3.8, -4.2, 0.7, 0.55), [4.2, 0.08, -3.95, 0.7, 0.16, 0.4, "#c9b48a"]);
    blocks.push([-1.6, 0.02, -3.1, 1.5, 0.04, 1.1, POST]);
    for (let i = 0; i < 5; i++) blocks.push([-2.2 + i * 0.3, 0.05, -3.1, 0.08, 0.04, 1.0, RAIL], [-1.6, 0.05, -3.5 + i * 0.2, 1.4, 0.04, 0.06, RAIL]);
    for (const [size, y] of [[0.8, 0.05], [0.66, 0.14], [0.52, 0.23]]) for (const [dx, dz, w, d] of [[0, size / 2, size, 0.14], [0, -size / 2, size, 0.14], [size / 2, 0, 0.14, size], [-size / 2, 0, 0.14, size]]) blocks.push([0.6 + dx, y, 5.0 + dz, w, 0.09, d, y > 0.1 ? "#9c7f4e" : "#8a6d40"]);
    blocks.push([-5.0, 0.25, 2.6, 0.22, 0.5, 0.22, POST], [-5.0, 0.25, 3.0, 0.22, 0.5, 0.22, POST], [-5.0, 0.42, 2.8, 0.16, 0.1, 0.6, RAIL]);
    blocks.push([5.0, 0.15, 2.0, 0.5, 0.3, 0.36, RAIL], [5.0, 0.15, 2.0, 0.36, 0.3, 0.5, RAIL], [5.0, 0.2, 2.0, 0.54, 0.05, 0.54, "#3e3a36"], [5.0, 0.29, 2.0, 0.3, 0.02, 0.3, "#3a95b5"]);
    return blocks;
  }, []);
  return <group>
    <Voxels items={items} receive />
    <group ref={sail} position={[0.12, 3.45, -1]}><MainSail /></group>
    <group ref={lateen}><LateenSail /></group>
    <Glow p={[0, 7.25, -0.75]} s={[0.04, 0.22, 0.5]} color="#c0392b" intensity={0.6} />
    <Glow p={[-6.45, 6.55, 0.55]} s={[0.04, 0.18, 0.45]} color="#c0392b" intensity={0.6} />
    {[-2.6, 2.4].map((z) => <Glow key={z} p={[-5.42, 0.85, z]} s={[0.04, 0.36, 0.44]} color="#ffc56b" intensity={1.4} />)}
    <Glow p={[-7.0, 2.85, 0]} s={[0.22, 0.28, 0.22]} color="#ffc56b" intensity={2} />
    <Beam from={[7.9, 0.45, 0]} to={[10.4, 1.5, 0]} size={0.14} color={HULL} />
    <Beam from={[0, 6.2, -1]} to={[-5.2, 0.4, -5.4]} color="#3a2a1c" /><Beam from={[0, 6.2, -1]} to={[-5.2, 0.4, 5.4]} color="#3a2a1c" />
    <Beam from={[0, 6.2, -1]} to={[4.6, 0.4, -5.4]} color="#3a2a1c" /><Beam from={[0, 6.2, -1]} to={[4.6, 0.4, 5.4]} color="#3a2a1c" />
    <Beam from={[0, 6.2, -1]} to={[10.3, 1.5, 0]} color="#3a2a1c" /><Beam from={[-6.45, 6.3, 0.3]} to={[0, 5.0, -1]} color="#3a2a1c" />
  </group>;
}

function ShipCabin() {
  const lantern = useRef<Group>(null);
  useFrame(({ clock }) => { if (lantern.current) lantern.current.rotation.z = Math.sin(clock.elapsedTime * 1.3) * 0.12; });
  const items = useMemo(() => {
    const blocks: Vox[] = [];
    for (let i = 0; i < 15; i++) blocks.push([0, 0.0, -5.25 + i * 0.75, 10.7, 0.04, 0.72, i % 2 ? "#8a6442" : "#946c48"]);
    blocks.push([0, 1.4, -5.35, 10.9, 2.8, 0.3, "#7a5333"], [-5.35, 1.4, 0, 0.3, 2.8, 10.9, "#73502f"]);
    for (let i = -5; i <= 5; i += 2) blocks.push([i, 1.4, -5.15, 0.22, 2.8, 0.14, "#4f3420"], [-5.15, 1.4, i, 0.14, 2.8, 0.22, "#4f3420"]);
    blocks.push([0, 2.75, -5.1, 10.7, 0.18, 0.3, "#4f3420"], [-5.1, 2.75, 0, 0.3, 0.18, 10.7, "#4f3420"]);
    for (const x of [-2.6, 0.2, 3.0]) blocks.push([x, 1.6, -5.15, 1.3, 1.1, 0.1, "#3a2a1c"], [x, 1.6, -5.13, 0.08, 1.0, 0.1, "#3a2a1c"], [x, 1.6, -5.13, 1.2, 0.08, 0.1, "#3a2a1c"]);
    // Shelf with books and rolled charts.
    blocks.push([-4.2, 0.9, -4.2, 0.9, 1.8, 0.8, "#5a3b24"], [-4.2, 0.6, -3.79, 0.8, 0.05, 0.05, "#3a2a1c"], [-4.2, 1.2, -3.79, 0.8, 0.05, 0.05, "#3a2a1c"]);
    ["#b5432f", "#2f5a8a", "#4c7a52", "#d4a94a", "#7a3b52"].forEach((color, i) => blocks.push([-4.5 + i * 0.15, 0.82, -3.85, 0.12, 0.38, 0.3, color]));
    blocks.push([-4.2, 1.42, -3.9, 0.7, 0.16, 0.16, "#efe0b5"], [-4.2, 1.6, -3.9, 0.6, 0.14, 0.14, "#e6d3a2"]);
    // Bunk with a blanket and a sea chest.
    blocks.push([4.1, 0.3, -3.7, 1.2, 0.6, 2.0, "#5a3b24"], [4.1, 0.65, -3.7, 1.05, 0.12, 1.85, "#b5432f"], [4.1, 0.72, -4.4, 0.8, 0.14, 0.4, "#efe5c9"]);
    blocks.push([4.15, 0.25, -2.95, 0.9, 0.5, 0.5, "#7a5333"], [4.15, 0.52, -2.95, 0.94, 0.06, 0.54, "#3e3a36"], [4.15, 0.3, -2.69, 0.12, 0.12, 0.04, "#d4a94a"]);
    blocks.push([0.2, 0.025, 0.4, 3.0, 0.03, 2.2, "#7a3b3b"], [0.2, 0.03, 0.4, 2.6, 0.03, 1.8, "#9a5a4a"]);
    blocks.push(...barrel(-4.9, 1.6), ...crate(-4.9, 2.6, 0, 0.55));
    return blocks;
  }, []);
  return <group>
    <Voxels items={items} receive />
    {[-2.6, 0.2, 3.0].map((x) => <Glow key={x} p={[x, 1.6, -5.18]} s={[1.15, 0.95, 0.04]} color="#bfe8ff" intensity={0.9} />)}
    <directionalLight position={[0.2, 2.4, -3]} intensity={0.6} color="#cfefff" />
    <group ref={lantern} position={[-1.2, 2.7, -4.4]}>
      <Voxels items={[[0, -0.25, 0, 0.04, 0.5, 0.04, "#2a2220"], [0, -0.55, 0, 0.3, 0.06, 0.3, "#2a2220"], [0, -0.85, 0, 0.3, 0.06, 0.3, "#2a2220"]]} />
      <Glow p={[0, -0.7, 0]} s={[0.22, 0.26, 0.22]} color="#ffc56b" intensity={2.4} />
      <pointLight position={[0, -0.7, 0.3]} color="#ffb35c" intensity={10} distance={8} decay={1.5} />
    </group>
    <Torch position={[3.6, 1.6, -5.05]} />
  </group>;
}

/** Large ground plane that catches clicks for point-and-click movement. */
function Ground({ color, onGround }: { color: string; onGround: (event: ThreeEvent<MouseEvent>) => void }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow onClick={onGround}>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>;
}

export function Environment({ mission, room, onGround }: { mission: MissionId; room: RoomId; onGround: (event: ThreeEvent<MouseEvent>) => void }) {
  const air = atmosphere(mission, room);
  const deck = mission === "navegacao" && room === "exterior";
  return <group>
    {deck ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} onClick={onGround}><planeGeometry args={[10.7, 10.7]} /><meshBasicMaterial visible={false} /></mesh> : <Ground color={air.ground} onGround={onGround} />}
    {mission === "egito" ? room === "exterior" ? <EgyptCourtyard /> : <EgyptArchive /> : room === "exterior" ? <ShipDeck /> : <ShipCabin />}
  </group>;
}

export { Waves };
