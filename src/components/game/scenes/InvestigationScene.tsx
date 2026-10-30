"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import type { Group, OrthographicCamera } from "three";
import { labelTexture } from "@/game/textures";
import { distance, INTERACTION_DISTANCE, movePlayer, PLAYER_START, ROOM_START } from "@/game/movement";
import type { Mission, PointOfInterest, Position, RoomId } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { Humanoid, type Expression, type Motion } from "../voxel/Humanoid";
import { characterLook } from "../voxel/characters";
import { Astrolabe, ChartTable, CompassBox, Doorway, FloorRing, Marker, OfferingTablet, Sparkles, TimeRestorer } from "../voxel/props";
import { SuspectModel } from "../voxel/suspects";
import { Environment, Waves, atmosphere } from "./environments";

type SceneProps = {
  mission: Mission; room: RoomId; paused: boolean; completed: boolean; clues: string[]; judged: string[];
  nearestId: string | null; talkingId: string | null;
  onInteract: (point: PointOfInterest) => void;
  onNearest: (point: PointOfInterest | null) => void;
  onStep?: () => void;
  touchDirection: Position;
};

/** Out-of-time objects vanish once identified: they were sent back to their own time. */
export const isCaptured = (point: PointOfInterest, judged: string[]) => !!point.suspect?.anachronism && judged.includes(point.id);

type WalkTarget = { position: Position; point?: PointOfInterest } | null;
type Shared = { player: MutableRefObject<Position>; target: MutableRefObject<WalkTarget>; world: MutableRefObject<Group | null> };

const CAMERA_OFFSET = [12, 14, 12] as const;
const CAMERA_FACING = Math.PI / 4;

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function RenderUnavailable() {
  return <div className="render-unavailable"><Icon name="compass" size={42} /><h3>Não foi possível abrir o cenário 3D.</h3><p>Use um navegador com WebGL2 e aceleração gráfica ativa. Depois, recarregue a página.</p><a className="button secondary" href="/">Voltar à agência</a></div>;
}

/** Fixed isometric angle; the view drifts toward the player so the room feels larger. */
function CameraRig({ player }: { player: MutableRefObject<Position> }) {
  const { camera, size } = useThree();
  const focus = useRef({ x: player.current.x * 0.55, z: player.current.z * 0.55 });
  useEffect(() => {
    (camera as OrthographicCamera).zoom = Math.min(size.width / 13, size.height / 9.5);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  useFrame((_, delta) => {
    const ease = Math.min(1, delta * 3);
    focus.current.x += (player.current.x * 0.55 - focus.current.x) * ease;
    focus.current.z += (player.current.z * 0.55 - focus.current.z) * ease;
    camera.position.set(CAMERA_OFFSET[0] + focus.current.x, CAMERA_OFFSET[1], CAMERA_OFFSET[2] + focus.current.z);
    camera.lookAt(focus.current.x, 0.6, focus.current.z);
  });
  return null;
}

/** Gentle swell for the ship deck. */
function Rocking({ enabled, children, world }: { enabled: boolean; children: ReactNode; world: MutableRefObject<Group | null> }) {
  useFrame(({ clock }) => {
    if (!world.current) return;
    const t = clock.elapsedTime;
    world.current.rotation.x = enabled ? Math.sin(t * 0.7) * 0.012 : 0;
    world.current.rotation.z = enabled ? Math.sin(t * 0.5 + 1) * 0.018 : 0;
    world.current.position.y = enabled ? Math.sin(t * 0.9) * 0.05 : 0;
  });
  return <group ref={world}>{children}</group>;
}

function turnToward(group: Group, angle: number, ease: number) {
  let difference = angle - group.rotation.y;
  difference = Math.atan2(Math.sin(difference), Math.cos(difference));
  group.rotation.y += difference * ease;
}

function ObjectModel({ point, completed, theme }: { point: PointOfInterest; completed: boolean; theme: "sand" | "sea" }) {
  if (point.kind === "door") return <Doorway theme={theme} hood={theme === "sea" && point.destination === "arquivo"} />;
  if (point.kind === "solution") return <TimeRestorer completed={completed} />;
  if (point.kind === "suspect") return <SuspectModel id={point.id} theme={theme} />;
  if (point.id === "tablet") return <OfferingTablet />;
  if (point.id === "compass") return <CompassBox />;
  if (point.id === "chart") return <ChartTable />;
  if (point.id === "astrolabe") return <Astrolabe />;
  return null;
}

function expressionFor(point: PointOfInterest, completed: boolean): Expression {
  if (point.portrait === "scribe") return "happy";
  return completed ? "happy" : "worried";
}

function ScenePoint({ point, mission, completed, collected, nearest, talking, paused, shared }: { point: PointOfInterest; mission: Mission; completed: boolean; collected: boolean; nearest: boolean; talking: boolean; paused: boolean; shared: Shared }) {
  const look = useMemo(() => point.portrait ? characterLook(point.portrait, !completed) : null, [point.portrait, completed]);
  const label = useMemo(() => labelTexture(point.label, collected), [point.label, collected]);
  useEffect(() => () => label.dispose(), [label]);
  const body = useRef<Group>(null);
  const hovered = useRef(false);
  const motion = useRef<Motion>({ moving: false, talking });
  motion.current.talking = talking;
  useFrame((_, delta) => {
    if (!body.current || !look) return;
    const player = shared.player.current, near = distance(player, point.position) < 3.2;
    turnToward(body.current, near || talking ? Math.atan2(player.x - point.position.x, player.z - point.position.z) : CAMERA_FACING, Math.min(1, delta * 5));
  });
  const markerType = point.kind === "door" ? "door" : point.kind === "solution" ? "solution" : collected ? "done" : point.kind === "suspect" ? "suspect" : "new";
  const top = look ? 2.25 : point.kind === "door" ? 2.2 : point.kind === "solution" ? 2.15 : point.kind === "suspect" ? 1.4 : point.id === "astrolabe" ? 2.25 : 1.85;
  const ringColor = point.kind === "door" ? "#5ff0d2" : point.kind === "solution" ? (completed ? "#ffd166" : "#c77dff") : collected ? "#7bd88f" : point.kind === "suspect" ? "#ff7ad9" : "#ffcc33";
  return <group position={[point.position.x, 0, point.position.z]}
    onClick={(event) => { event.stopPropagation(); if (!paused) shared.target.current = { position: point.position, point }; }}
    onPointerOver={(event) => { event.stopPropagation(); hovered.current = true; document.body.style.cursor = "pointer"; }}
    onPointerOut={() => { hovered.current = false; document.body.style.cursor = ""; }}>
    <FloorRing color={ringColor} active={nearest} />
    {look ? <group ref={body} rotation={[0, CAMERA_FACING, 0]}><Humanoid look={look} expression={expressionFor(point, completed)} motion={motion} phase={point.position.x} /></group>
      : <group rotation={[0, point.kind === "door" || point.id === "astrolabe" || point.id === "tablet" ? CAMERA_FACING : 0, 0]}><ObjectModel point={point} completed={completed} theme={mission.theme} /></group>}
    {!(point.kind === "solution" && completed) && <Marker type={markerType} y={top} active={nearest} />}
    {point.kind === "solution" && completed && <Sparkles />}
    {nearest && <sprite position={[0, top + 0.5, 0]} scale={[2.2, 0.39, 1]}><spriteMaterial map={label} transparent depthWrite={false} depthTest={false} /></sprite>}
  </group>;
}

function Player({ mission, room, paused, completed, judged, touchDirection, onNearest, onInteract, onStep, shared }: SceneProps & { shared: Shared }) {
  const body = useRef<Group>(null), shadow = useRef<Group>(null);
  const keys = useRef(new Set<string>()), nearestRef = useRef<string | null>(null);
  const motion = useRef<Motion>({ moving: false, talking: false });
  const stuck = useRef(0), stepClock = useRef(0);
  const controls = useRef({ paused, touchDirection, onNearest, onInteract, onStep, judged });
  controls.current = { paused, touchDirection, onNearest, onInteract, onStep, judged };
  const look = useMemo(() => characterLook("detective"), []);
  useEffect(() => {
    shared.player.current = { ...(room === "exterior" ? PLAYER_START : ROOM_START) };
    shared.target.current = null;
    keys.current.clear(); nearestRef.current = null; controls.current.onNearest(null);
    if (body.current) body.current.rotation.y = CAMERA_FACING;
    const down = (event: KeyboardEvent) => {
      if (controls.current.paused || /^(INPUT|SELECT|TEXTAREA)$/.test((event.target as HTMLElement)?.tagName)) return;
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "e", " "].includes(key)) event.preventDefault();
      keys.current.add(key);
      if ((key === "e" || key === " ") && !event.repeat) { const point = mission.points.find((point) => point.room === room && point.id === nearestRef.current && !isCaptured(point, controls.current.judged)); if (point) controls.current.onInteract(point); }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", clear); document.addEventListener("visibilitychange", clear);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); document.removeEventListener("visibilitychange", clear); };
  }, [mission, room, shared]);
  useFrame((_, delta) => {
    const control = controls.current, direction = { x: 0, z: 0 };
    const position = shared.player.current;
    if (control.paused) { keys.current.clear(); shared.target.current = null; }
    else {
      if (keys.current.has("w") || keys.current.has("arrowup")) { direction.x--; direction.z--; }
      if (keys.current.has("s") || keys.current.has("arrowdown")) { direction.x++; direction.z++; }
      if (keys.current.has("a") || keys.current.has("arrowleft")) { direction.x--; direction.z++; }
      if (keys.current.has("d") || keys.current.has("arrowright")) { direction.x++; direction.z--; }
      direction.x += control.touchDirection.x; direction.z += control.touchDirection.z;
      const target = shared.target.current;
      if (direction.x || direction.z) shared.target.current = null;
      else if (target) {
        const gap = distance(target.position, position);
        if (target.point && gap < (target.point.kind === "door" ? 0.5 : 1.15)) { shared.target.current = null; control.onInteract(target.point); }
        else if (!target.point && gap < 0.12) shared.target.current = null;
        else { direction.x = target.position.x - position.x; direction.z = target.position.z - position.z; }
      }
    }
    const next = movePlayer(position, direction, delta, mission.id, room);
    const moved = distance(next, position);
    const moving = moved > 0.0005;
    // Give up on click-to-walk when something blocks the way; still talk if close enough.
    if (shared.target.current && !moving) {
      stuck.current += delta;
      if (stuck.current > 0.3) {
        const target = shared.target.current;
        shared.target.current = null;
        if (target.point && distance(target.position, position) < INTERACTION_DISTANCE + 0.9) control.onInteract(target.point);
      }
    } else stuck.current = 0;
    shared.player.current = next;
    motion.current.moving = moving;
    if (moving) {
      stepClock.current += delta;
      if (stepClock.current > 0.3) { stepClock.current = 0; control.onStep?.(); }
      if (body.current) turnToward(body.current, Math.atan2(next.x - position.x, next.z - position.z), Math.min(1, delta * 12));
    }
    body.current?.position.set(next.x, 0, next.z);
    shadow.current?.position.set(next.x, 0.015, next.z);
    const nearest = mission.points.filter((point) => point.room === room && !isCaptured(point, control.judged) && distance(point.position, next) < INTERACTION_DISTANCE).sort((a, b) => distance(a.position, next) - distance(b.position, next))[0] ?? null;
    if (nearestRef.current !== (nearest?.id ?? null)) { nearestRef.current = nearest?.id ?? null; control.onNearest(nearest); }
  });
  return <>
    <group ref={body}><Humanoid look={look} expression={completed ? "happy" : "determined"} motion={motion} /></group>
    <group ref={shadow}><mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.38, 20]} /><meshBasicMaterial color="#1d2232" opacity={0.2} transparent depthWrite={false} /></mesh></group>
  </>;
}

/** Ground click marker that fades out where the player is heading. */
function TargetPing({ target }: { target: MutableRefObject<WalkTarget> }) {
  const ring = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const current = target.current;
    ring.current.visible = !!current && !current.point;
    if (current) { ring.current.position.set(current.position.x, 0.03, current.position.z); ring.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.12); }
  });
  return <group ref={ring} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.18, 0.26, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthWrite={false} /></mesh></group>;
}

function World(props: SceneProps) {
  const player = useRef<Position>({ ...(props.room === "exterior" ? PLAYER_START : ROOM_START) });
  const target = useRef<WalkTarget>(null), world = useRef<Group | null>(null);
  const shared = useMemo<Shared>(() => ({ player, target, world }), []);
  const air = atmosphere(props.mission.id, props.room);
  const points = props.mission.points.filter((point) => point.room === props.room && !isCaptured(point, props.judged));
  const deck = props.mission.id === "navegacao" && props.room === "exterior";
  const onGround = (event: ThreeEvent<MouseEvent>) => {
    if (props.paused) return;
    const local = world.current ? world.current.worldToLocal(event.point.clone()) : event.point;
    target.current = { position: { x: Math.max(-4.6, Math.min(4.6, local.x)), z: Math.max(-4.6, Math.min(4.6, local.z)) } };
  };
  return <>
    <color attach="background" args={[air.background]} />
    <fog attach="fog" args={air.fog} />
    <CameraRig player={player} />
    <ambientLight intensity={air.ambient} />
    <hemisphereLight args={[air.sky, air.ground, 0.55]} />
    <directionalLight position={[5, 11, 4]} intensity={air.sun} color={air.sunColor} castShadow shadow-mapSize={[1536, 1536]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={11} shadow-camera-bottom={-11} shadow-bias={-0.0006} shadow-normalBias={0.02} />
    {deck && <Waves />}
    <Rocking enabled={deck} world={world}>
      <Environment mission={props.mission.id} room={props.room} onGround={onGround} />
      {points.map((point) => <ScenePoint key={point.id} point={point} mission={props.mission} completed={props.completed} collected={point.clue ? props.clues.includes(point.clue.id) : props.judged.includes(point.id)} nearest={props.nearestId === point.id} talking={props.talkingId === point.id} paused={props.paused} shared={shared} />)}
      <Player {...props} shared={shared} />
      <TargetPing target={target} />
    </Rocking>
  </>;
}

export function InvestigationScene(props: SceneProps) {
  const points = props.mission.points.filter((point) => point.room === props.room && !isCaptured(point, props.judged));
  return <div className={`investigation-scene ${props.mission.theme}`} role="region" aria-label={`Cenário 3D: ${props.mission.rooms[props.room]}`}>
    <SceneBoundary fallback={<RenderUnavailable />}><Canvas orthographic shadows dpr={[1, 1.75]} camera={{ position: [...CAMERA_OFFSET], near: 0.1, far: 120, zoom: 60 }} gl={{ antialias: true }} fallback={<RenderUnavailable />}>
      <World key={props.room} {...props} />
    </Canvas></SceneBoundary>
    <div className="scene-object-list" aria-label="Pontos de interesse neste ambiente">{points.map((point) => <button key={point.id} disabled={props.paused} onClick={() => props.onInteract(point)}><Icon name={point.kind === "door" ? "door" : point.kind === "solution" ? "sparkle" : "clue"} size={12} />{point.label}{(point.clue ? props.clues.includes(point.clue.id) : props.judged.includes(point.id)) && <Icon name="check" size={11} />}</button>)}</div>
  </div>;
}
