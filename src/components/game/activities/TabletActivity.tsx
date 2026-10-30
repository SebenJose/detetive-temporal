"use client";

import { useState } from "react";
import { checkTablet, TABLET_MAX } from "@/game/activities";
import { sfx } from "@/game/sfx";
import type { Activity, Mission } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { GlossaryText } from "@/components/ui/GlossaryText";

type Tablet = Extract<Activity, { type: "tablet" }>;

/** Invented symbols, matching the 3D tablet: they are not real hieroglyphs. */
function Symbol({ id, x, y, carved = false }: { id: "pao" | "jarro"; x: number; y: number; carved?: boolean }) {
  const color = carved ? "#8f6f45" : "#5a3b24";
  return <g transform={`translate(${x} ${y})`} fill={carved ? "none" : "#e8c48a"} stroke={color} strokeWidth={4} strokeLinejoin="round">
    {id === "pao" ? <path d="M-22 8c0-14 10-22 22-22s22 8 22 22Z M-10-6l4 8 M2-9l4 9 M12-5l3 7" />
      : <path d="M-9-20h18v6c8 4 12 10 12 18 0 10-8 16-21 16s-21-6-21-16c0-8 4-14 12-18Z" />}
  </g>;
}

export function TabletActivity({ activity, mission, onDone, onClose }: { activity: Tablet; mission: Mission; onDone: () => void; onClose: () => void }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(activity.rows.map((row) => [row.id, 0])));
  const [result, setResult] = useState<"wrong" | "right" | null>(null);
  const change = (id: string, delta: number) => { sfx.click(); setResult(null); setCounts({ ...counts, [id]: Math.max(0, Math.min(TABLET_MAX, counts[id] + delta)) }); };
  function check() {
    if (checkTablet(activity, counts)) { sfx.success(); setResult("right"); }
    else { sfx.error(); setResult("wrong"); }
  }
  // The list shows the rows in a different order from the stone, so the player has to read each line.
  const list = [...activity.rows].reverse();
  return <Modal title="Ler a placa de oferendas" onClose={onClose} className="activity-modal">
    <span className="modal-badge">ATIVIDADE · LEIA A PLACA</span>
    <h2>Monte a lista de oferendas</h2>
    <p className="modal-subtitle"><strong>Chave:</strong> cada desenho mostra um tipo de oferenda. Cada traço ao lado vale 1.</p>
    <div className="tablet-activity">
      <svg className="tablet-art" viewBox="0 0 260 190" role="img" aria-label="Placa de pedra com uma linha para cada desenho e traços ao lado de cada um">
        <rect x="6" y="6" width="248" height="178" rx="10" fill="#d8c49a" stroke="#a5875a" strokeWidth="5" />
        <rect x="6" y="6" width="248" height="14" fill="#3f6fa8" />
        {activity.rows.map((row, index) => <g key={row.id}>
          <Symbol id={row.id} x={58} y={66 + index * 70} carved />
          {Array.from({ length: row.count }, (_, stroke) => <rect key={stroke} x={112 + stroke * 26} y={44 + index * 70} width="9" height="44" rx="3" fill="#8f6f45" />)}
          {index < activity.rows.length - 1 && <line x1="20" x2="240" y1={102 + index * 70} y2={102 + index * 70} stroke="#a5875a" strokeWidth="2" />}
        </g>)}
      </svg>
      <div className="tablet-list">
        <h3><Icon name="list" size={17} /> Lista de oferendas</h3>
        {list.map((row) => <div key={row.id} className="counter-row">
          <svg viewBox="-28 -28 56 56" width="40" height="40" aria-hidden="true"><Symbol id={row.id} x={0} y={0} /></svg>
          <span className="counter-label">{row.label}</span>
          <button type="button" className="counter-button" onClick={() => change(row.id, -1)} aria-label={`Menos ${row.label.toLowerCase()}`} disabled={result === "right"}>−</button>
          <output aria-live="polite" aria-label={`${row.label}: ${counts[row.id]}`}>{counts[row.id]}</output>
          <button type="button" className="counter-button" onClick={() => change(row.id, 1)} aria-label={`Mais ${row.label.toLowerCase()}`} disabled={result === "right"}>+</button>
        </div>)}
      </div>
    </div>
    {result === "wrong" && <p className="review-note" role="alert"><strong>Ainda não.</strong> <GlossaryText text={activity.hint} glossary={mission.glossary} /></p>}
    {result === "right" && <p className="activity-success" role="status"><Icon name="check" size={18} /> Isso! Você leu a placa: é uma lista de oferendas com {activity.rows.map((row) => `${row.count} ${row.label.toLowerCase()}`).join(" e ")}.</p>}
    <div className="modal-actions">
      {result === "right" ? <button className="button gold" onClick={onDone}><Icon name="book" size={18} /> Guardar no caderno</button>
        : <button className="button primary" onClick={check} disabled={activity.rows.every((row) => counts[row.id] === 0)}>Conferir a lista<Icon name="check" size={18} /></button>}
    </div>
  </Modal>;
}
