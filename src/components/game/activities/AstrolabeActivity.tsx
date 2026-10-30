"use client";

import { useState } from "react";
import { isAimed, latitudeFromSun } from "@/game/activities";
import { sfx } from "@/game/sfx";
import type { Activity, Mission } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { GlossaryText } from "@/components/ui/GlossaryText";

type AstrolabeTask = Extract<Activity, { type: "astrolabe" }>;

const PIVOT = { x: 40, y: 178 }, RADIUS = 150;
// The latitude bar only needs the range the ship sails through; a shorter scale keeps the marks apart.
const LATITUDE_SCALE = 60;
const point = (angle: number, radius: number) => ({ x: PIVOT.x + Math.cos(angle * Math.PI / 180) * radius, y: PIVOT.y - Math.sin(angle * Math.PI / 180) * radius });

export function AstrolabeActivity({ activity, mission, onDone, onClose }: { activity: AstrolabeTask; mission: Mission; onDone: () => void; onClose: () => void }) {
  const [day, setDay] = useState(0);
  const [angle, setAngle] = useState(15);
  const [latitudes, setLatitudes] = useState<number[]>([]);
  const [answer, setAnswer] = useState<"wrong" | "right" | null>(null);
  const measuring = latitudes.length < activity.days.length;
  const target = activity.days[Math.min(day, activity.days.length - 1)];
  const aimed = measuring && isAimed(angle, target);
  const sun = point(target, RADIUS - 18), tip = point(angle, RADIUS);

  function register() {
    sfx.clue();
    const next = [...latitudes, latitudeFromSun(target)];
    setLatitudes(next);
    if (next.length < activity.days.length) { setDay(day + 1); setAngle(15); }
  }
  function choose(direction: "norte" | "sul") {
    if (direction === activity.answer) { sfx.success(); setAnswer("right"); }
    else { sfx.error(); setAnswer("wrong"); }
  }

  return <Modal title="Usar o astrolábio" onClose={onClose} className="activity-modal">
    <span className="modal-badge">ATIVIDADE · {measuring ? `DIA ${day + 1} DE ${activity.days.length}, MEIO-DIA` : "PARA ONDE FOI O NAVIO?"}</span>
    <h2>{measuring ? "Mire no Sol!" : "Compare as medidas"}</h2>
    <div className="astrolabe-activity">
      <svg className="astrolabe-art" viewBox="0 0 300 200" role="img" aria-label={measuring ? `O Sol está a ${target} graus acima do horizonte. A régua do astrolábio está em ${angle} graus.` : "Medidas concluídas"}>
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc6e8" /><stop offset="1" stopColor="#dff4fb" /></linearGradient></defs>
        <rect width="300" height="178" fill="url(#sky)" />
        <rect y="178" width="300" height="22" fill="#2f86a6" />
        <line x1="0" x2="300" y1="178" y2="178" stroke="#1d2232" strokeWidth="2" />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((tick) => { const a = point(tick, RADIUS + 6), b = point(tick, RADIUS + (tick % 30 ? 12 : 18)); return <line key={tick} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a77f2e" strokeWidth={tick % 30 ? 2 : 3} />; })}
        <path d={`M ${PIVOT.x + RADIUS + 6} ${PIVOT.y} A ${RADIUS + 6} ${RADIUS + 6} 0 0 0 ${PIVOT.x} ${PIVOT.y - RADIUS - 6}`} fill="none" stroke="#d4a94a" strokeWidth="3" />
        {measuring && <g className={aimed ? "sun aimed" : "sun"}><circle cx={sun.x} cy={sun.y} r="16" fill="#ffd166" stroke="#e09f1f" strokeWidth="3" />{aimed && <circle cx={sun.x} cy={sun.y} r="24" fill="none" stroke="#ffd166" strokeWidth="3" />}</g>}
        <line x1={PIVOT.x} y1={PIVOT.y} x2={tip.x} y2={tip.y} stroke={aimed ? "#2f7a46" : "#5a3b24"} strokeWidth="6" strokeLinecap="round" />
        <circle cx={PIVOT.x} cy={PIVOT.y} r="12" fill="#d4a94a" stroke="#a77f2e" strokeWidth="3" />
        <text x="290" y="194" textAnchor="end" fontSize="11" fontWeight="700" fill="#fff">horizonte</text>
      </svg>
      <div className="latitude-bar" aria-label="Latitude do navio">
        <span className="latitude-label top">↑ Norte · {LATITUDE_SCALE}°</span>
        <div className="latitude-track">{latitudes.map((latitude, index) => <span key={index} className="latitude-mark" style={{ bottom: `${latitude / LATITUDE_SCALE * 100}%` }}>Dia {index + 1}: {latitude}°</span>)}</div>
        <span className="latitude-label">0° · Equador</span>
      </div>
    </div>
    {measuring ? <>
      <label className="aim-control"><span>Gire a régua do astrolábio até ela apontar para o Sol: <strong>{angle}°</strong></span>
        <input type="range" min={0} max={90} value={angle} onChange={(event) => setAngle(Number(event.target.value))} aria-label="Ângulo da régua do astrolábio, em graus" />
      </label>
      {aimed && <p className="activity-success" role="status"><Icon name="sparkle" size={18} /> Na mira! O Sol está a {target}° acima do horizonte. Isso dá uma latitude de {latitudeFromSun(target)}° norte.</p>}
      <div className="modal-actions"><button className="button gold" onClick={register} disabled={!aimed}>Registrar medida<Icon name="check" size={18} /></button></div>
    </> : <>
      <p className="astrolabe-question">No dia 1, a latitude era <strong>{latitudes[0]}°</strong>. No dia 2, era <strong>{latitudes[latitudes.length - 1]}°</strong>. O navio foi para o norte ou para o sul?</p>
      {answer === "wrong" && <p className="review-note" role="alert"><strong>Ainda não.</strong> <GlossaryText text={activity.hint} glossary={mission.glossary} /></p>}
      {answer === "right" ? <>
        <p className="activity-success" role="status"><Icon name="check" size={18} /> <span><GlossaryText text={activity.success} glossary={mission.glossary} /></span></p>
        <p className="activity-note"><GlossaryText text={activity.note} glossary={mission.glossary} /></p>
        <div className="modal-actions"><button className="button gold" onClick={onDone}><Icon name="book" size={18} /> Guardar no caderno</button></div>
      </> : <div className="suspect-choices"><button className="button secondary big" onClick={() => choose("sul")}>Para o sul ↓</button><button className="button secondary big" onClick={() => choose("norte")}>Para o norte ↑</button></div>}
    </>}
  </Modal>;
}
