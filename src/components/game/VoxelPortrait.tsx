"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Group, OrthographicCamera } from "three";
import type { PortraitId } from "@/game/types";
import { Humanoid, type Expression, type Motion } from "./voxel/Humanoid";
import { characterLook } from "./voxel/characters";
import { Astrolabe, ChartTable, CompassBox, OfferingTablet } from "./voxel/props";
import { SuspectModel } from "./voxel/suspects";

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Turntable({ children, swing = 0.12, base = 0.35 }: { children: ReactNode; swing?: number; base?: number }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => { if (group.current) group.current.rotation.y = base + Math.sin(clock.elapsedTime * 0.7) * swing; });
  return <group ref={group}>{children}</group>;
}

/** Keeps the framing constant whatever the size of the portrait box (zoom is tuned for 170px). */
function FitZoom({ zoom, y }: { zoom: number; y: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    (camera as OrthographicCamera).zoom = zoom * size.height / 170;
    camera.lookAt(0, y, 0); camera.updateProjectionMatrix();
  }, [camera, size, zoom, y]);
  return null;
}

function Bust({ character, anomaly, talking, expression }: { character: PortraitId; anomaly: boolean; talking: boolean; expression: Expression }) {
  const look = useMemo(() => characterLook(character, anomaly), [character, anomaly]);
  const motion = useRef<Motion>({ moving: false, talking });
  motion.current.talking = talking;
  return <Turntable><Humanoid look={look} expression={expression} motion={motion} /></Turntable>;
}

const OBJECTS: Record<string, { node: ReactNode; y: number; zoom: number }> = {
  tablet: { node: <OfferingTablet />, y: 0.85, zoom: 88 },
  compass: { node: <CompassBox />, y: 0.55, zoom: 150 },
  chart: { node: <ChartTable />, y: 0.6, zoom: 85 },
  astrolabe: { node: <Astrolabe />, y: 1.05, zoom: 75 },
  ...Object.fromEntries(["tenis", "lata", "relogio", "paleta", "lanterna", "garrafa", "fone", "ampulheta"].map((id) => [id, { node: <SuspectModel id={id} theme={["lanterna", "garrafa", "fone", "ampulheta"].includes(id) ? "sea" : "sand"} />, y: 0.55, zoom: 140 }])),
  jarro: { node: <SuspectModel id="jarro" theme="sand" />, y: 0.42, zoom: 150 },
  barril: { node: <SuspectModel id="barril" theme="sea" />, y: 0.45, zoom: 140 },
};

/** Animated close-up for the dialogue box: a talking head for characters, a turntable for objects. */
export function VoxelPortrait({ character, objectId, anomaly = false, talking = false, expression = "neutral", fallback }: { character?: PortraitId; objectId?: string; anomaly?: boolean; talking?: boolean; expression?: Expression; fallback: ReactNode }) {
  const object = objectId ? OBJECTS[objectId] : undefined;
  if (!character && !object) return <>{fallback}</>;
  const y = character ? 1.36 : object!.y, zoom = character ? 115 : object!.zoom;
  return <Boundary fallback={fallback}>
    <Canvas orthographic dpr={[1, 2]} camera={{ position: [0, y + 0.25, 6], zoom, near: 0.1, far: 30 }} gl={{ antialias: true, alpha: true }} fallback={fallback}>
      <FitZoom zoom={zoom} y={y} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#9fd8ff" />
      {character ? <Bust character={character} anomaly={anomaly} talking={talking} expression={expression} /> : <group rotation={[0.25, 0, 0]}><Turntable base={0.2} swing={0.45}>{object!.node}</Turntable></group>}
    </Canvas>
  </Boundary>;
}
