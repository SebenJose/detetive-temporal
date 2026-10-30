"use client";

import { useEffect, useRef, useState } from "react";
import type { GlossaryEntry, PointOfInterest } from "@/game/types";
import { sfx } from "@/game/sfx";
import { GlossaryText } from "@/components/ui/GlossaryText";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Portrait } from "@/components/ui/Portrait";
import { VoxelPortrait } from "./VoxelPortrait";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** RPG-style speech box with a typewriter effect and an animated voxel close-up. */
export function DialogueBox({ point, line, completed, glossary, activityPending = false, onAdvance, onBack, onClose }: { point: PointOfInterest; line: number; completed: boolean; glossary: GlossaryEntry[]; activityPending?: boolean; onAdvance: () => void; onBack: () => void; onClose: () => void }) {
  const lines = point.lines ?? [];
  const text = lines[line] ?? "";
  const last = line === lines.length - 1;
  const [shown, setShown] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const furthest = useRef(line);
  const typing = shown < text.length;

  useEffect(() => {
    // Lines already read (reached again with "Voltar") show at once instead of being typed again.
    const reread = line < furthest.current;
    furthest.current = Math.max(furthest.current, line);
    if (reducedMotion() || reread) { setShown(text.length); return; }
    setShown(0);
    let ticks = 0;
    timer.current = setInterval(() => {
      ticks++;
      if (ticks % 3 === 0 && point.kind === "character") sfx.blip(point.portrait === "mummy" ? 0.7 : point.portrait === "navigator" ? 0.85 : 1.15);
      // Functional update so skipping ahead ("Pular") is never overwritten by the next tick.
      setShown((count) => Math.min(text.length, count + 1));
    }, 20);
    return () => clearInterval(timer.current);
  }, [text, line, point.kind, point.portrait]);

  useEffect(() => { if (!typing) clearInterval(timer.current); }, [typing]);

  useEffect(() => { button.current?.focus(); }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const pressed = event.key.toLowerCase();
      if (pressed === "e") { event.preventDefault(); next(); }
      if (pressed === "q" || pressed === "arrowleft") { event.preventDefault(); back(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  function next() {
    if (typing) { setShown(text.length); return; }
    sfx.click(); onAdvance();
  }

  function back() {
    if (line === 0) return;
    sfx.click(); onBack();
  }

  const character = point.kind === "character";
  const fallback = point.portrait ? <Portrait character={point.portrait} showAnomaly={!completed} /> : <Icon name={point.id === "astrolabe" || point.id === "compass" ? "compass" : "book"} size={54} />;
  return <Modal title={point.speaker ?? point.label} onClose={onClose} className="dialogue-modal" bare>
    <div className="dialogue-box" onClick={(event) => { if (!(event.target as HTMLElement).closest("button, .glossary-pop")) next(); }}>
      <div className={`dialogue-portrait ${character ? "is-character" : "is-object"}`}>
        <VoxelPortrait character={point.portrait} objectId={character ? undefined : point.id} anomaly={!completed} talking={typing} expression={point.portrait === "scribe" || completed ? "happy" : "worried"} fallback={fallback} />
      </div>
      <div className="dialogue-body">
        <div className="dialogue-name"><strong>{point.speaker ?? point.label}</strong><span>{character ? "CONVERSA" : "OBSERVAÇÃO"}</span></div>
        <p className="dialogue-text" aria-live="polite">{typing ? <>{text.slice(0, shown)}<span className="dialogue-ghost" aria-hidden="true">{text.slice(shown)}</span></> : <GlossaryText key={text} text={text} glossary={glossary} />}</p>
        <div className="dialogue-footer">
          <span className="dialogue-pips" aria-label={`Fala ${line + 1} de ${lines.length}`}>{lines.map((_, index) => <i key={index} className={index <= line ? "on" : ""} />)}</span>
          <span className="dialogue-actions">
            <button className="button secondary" onClick={back} disabled={line === 0} aria-label="Voltar para a fala anterior (Q)" title="Fala anterior (Q)"><Icon name="back" size={17} />Voltar</button>
            <button ref={button} className={`button ${last && !typing && activityPending ? "gold" : "primary"}`} onClick={next}>
              {typing ? "Pular" : last ? (activityPending ? "Vamos lá!" : "Fechar") : "Continuar"}<Icon name={last && !typing ? (activityPending ? "play" : "check") : "arrow"} size={17} />
            </button>
          </span>
        </div>
      </div>
      <button className="dialogue-close icon-button" onClick={onClose} aria-label="Fechar"><Icon name="close" size={18} /></button>
    </div>
  </Modal>;
}
