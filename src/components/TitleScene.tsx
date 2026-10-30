"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Group, OrthographicCamera } from "three";
import { Humanoid, type Motion } from "./game/voxel/Humanoid";
import { characterLook } from "./game/voxel/characters";
import { Glow, Voxels, seeded, type Vox } from "./game/voxel/Voxels";
import { TimeRestorer } from "./game/voxel/props";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function Island() {
  const items = useMemo(() => {
    const random = seeded(21), blocks: Vox[] = [];
    // Floating chunk of desert: sand on top, earth and stone below.
    for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
      const r = Math.hypot(x, z);
      if (r > 4.6) continue;
      blocks.push([x, -0.25, z, 1, 0.5, 1, random() > 0.5 ? "#e6c891" : "#dcbb82"]);
      const depth = Math.max(1, Math.round(5 - r + random() * 1.5));
      for (let y = 1; y <= depth; y++) blocks.push([x, -0.25 - y * 0.8, z, 0.98, 0.8, 0.98, y === 1 ? "#b88a58" : y < 3 ? "#9a7048" : "#7b5a3c"]);
    }
    for (let i = 0; i < 6; i++) { const size = 4 - i * 0.66; blocks.push([-1.5, 0.28 + i * 0.56, -1.5, size, 0.56, size, i % 2 ? "#d4b073" : "#dfbd82"]); }
    let px = 2.6;
    for (let i = 0; i < 8; i++) { blocks.push([px, 0.18 + i * 0.36, -2.4, 0.26, 0.38, 0.26, i % 2 ? "#8a6a43" : "#9d7b4f"]); px += 0.05; }
    for (let i = 0; i < 6; i++) { const angle = i / 6 * Math.PI * 2; for (let j = 1; j <= 4; j++) blocks.push([px + Math.cos(angle) * j * 0.28, 3.1 - j * j * 0.035, -2.4 + Math.sin(angle) * j * 0.28, 0.3, 0.08, 0.3, j % 2 ? "#5f8f4e" : "#4f7d42"]); }
    blocks.push([-3.2, 0.15, 2.4, 0.26, 0.3, 0.26, "#b4673e"], [-3.2, 0.34, 2.4, 0.18, 0.1, 0.18, "#b4673e"], [-2.8, 0.15, 2.9, 0.26, 0.3, 0.26, "#c47a48"]);
    return blocks;
  }, []);
  return <Voxels items={items} receive />;
}

function Stars() {
  const items = useMemo(() => { const random = seeded(4); return Array.from({ length: 70 }, (): Vox => { const angle = random() * Math.PI * 2, r = 14 + random() * 10; return [Math.cos(angle) * r, -4 + random() * 18, Math.sin(angle) * r, 0.12, 0.12, 0.12, random() > 0.7 ? "#ffd166" : "#ffffff"]; }); }, []);
  return <group>{items.map(([x, y, z, , , , color], index) => <Glow key={index} p={[x, y, z]} s={[0.14, 0.14, 0.14]} color={color} intensity={1.5} />)}</group>;
}

function Characters() {
  const detective = useMemo(() => characterLook("detective"), []);
  const mummy = useMemo(() => characterLook("mummy", true), []);
  const idle = useRef<Motion>({ moving: false, talking: false });
  const chatter = useRef<Motion>({ moving: false, talking: true });
  return <>
    <group position={[1.4, 0, 1.4]} rotation={[0, -0.4, 0]}><Humanoid look={detective} expression="determined" motion={idle} /></group>
    <group position={[-0.6, 0, 2.3]} rotation={[0, 0.9, 0]}><Humanoid look={mummy} expression="worried" motion={chatter} phase={1.3} /></group>
  </>;
}

function FitZoom() {
  const { camera, size } = useThree();
  useEffect(() => {
    (camera as OrthographicCamera).zoom = Math.min(size.width / 17, size.height / 11);
    camera.lookAt(0, 0.4, 0); camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Spin({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.12 + 0.6;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.15;
  });
  return <group ref={group}>{children}</group>;
}

/** Animated voxel diorama behind the title menu. */
export default function TitleScene() {
  return <Boundary>
    <Canvas className="title-canvas" orthographic shadows dpr={[1, 1.75]} camera={{ position: [14, 10, 14], zoom: 56, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }}>
      <FitZoom />
      <ambientLight intensity={1.0} />
      <hemisphereLight args={["#ffd9a0", "#3a2f5a", 0.7]} />
      <directionalLight position={[6, 12, 4]} intensity={2.4} color="#fff0d6" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <Stars />
      <Spin>
        <Island />
        <Characters />
        <group position={[2.2, 0, -0.2]}><TimeRestorer completed={false} /></group>
      </Spin>
    </Canvas>
  </Boundary>;
}
