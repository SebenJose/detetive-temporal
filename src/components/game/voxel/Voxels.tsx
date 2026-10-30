"use client";

import { useLayoutEffect, useRef } from "react";
import { BoxGeometry, Color, Matrix4, type InstancedMesh } from "three";

/** One block: center x, y, z, size w, h, d and color. */
export type Vox = [number, number, number, number, number, number, string];

export const unitBox = new BoxGeometry(1, 1, 1);

/** Static blocks batched into one instanced draw call. */
export function Voxels({ items, cast = true, receive = false, roughness = 0.88 }: { items: Vox[]; cast?: boolean; receive?: boolean; roughness?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const matrix = new Matrix4(), color = new Color();
    items.forEach(([x, y, z, w, h, d, c], index) => {
      matrix.makeScale(w, h, d); matrix.setPosition(x, y, z);
      target.setMatrixAt(index, matrix); target.setColorAt(index, color.set(c));
    });
    target.instanceMatrix.needsUpdate = true;
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
    target.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh key={items.length} ref={mesh} args={[unitBox, undefined, items.length]} castShadow={cast} receiveShadow={receive}>
    <meshStandardMaterial roughness={roughness} metalness={0} />
  </instancedMesh>;
}

/** A single block that glows; used for screens, flames and magic. */
export function Glow({ p, s, color, intensity = 1.6, opacity = 1 }: { p: [number, number, number]; s: [number, number, number]; color: string; intensity?: number; opacity?: number }) {
  return <mesh position={p} scale={s} geometry={unitBox}>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent={opacity < 1} opacity={opacity} toneMapped={false} />
  </mesh>;
}

/** Small deterministic pseudo-random generator, so decorations stay put between renders. */
export function seeded(seed: number) {
  let value = seed;
  return () => { value = (value * 16807) % 2147483647; return (value - 1) / 2147483646; };
}
