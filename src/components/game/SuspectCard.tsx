"use client";

import { useState } from "react";
import type { Mission, PointOfInterest } from "@/game/types";
import { formatYear } from "@/game/time";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { GlossaryText } from "@/components/ui/GlossaryText";
import { VoxelPortrait } from "./VoxelPortrait";

/** The player decides whether an object belongs to the case's time. A wrong guess gets a hint, never the answer. */
export function SuspectCard({ point, mission, judged, onJudge, onClose }: { point: PointOfInterest; mission: Mission; judged: boolean; onJudge: (anachronism: boolean) => boolean; onClose: () => void }) {
  const suspect = point.suspect!;
  const [done, setDone] = useState(judged);
  const [wrong, setWrong] = useState(0);
  function choose(anachronism: boolean) {
    if (onJudge(anachronism)) { setDone(true); setWrong(0); }
    else setWrong((count) => count + 1);
  }
  const when = `por volta de ${formatYear(mission.year)}`;
  return <Modal title={point.label} onClose={onClose} className="suspect-modal">
    <div className="suspect-card">
      <div className={`suspect-portrait ${done ? (suspect.anachronism ? "is-out" : "is-in") : ""}`}>
        <VoxelPortrait objectId={point.id} fallback={<Icon name="clue" size={54} />} />
        {done && <span className="suspect-stamp">{suspect.anachronism ? "FORA DE ÉPOCA" : "DESTA ÉPOCA"}</span>}
      </div>
      <div className="suspect-body">
        <span className="modal-badge">OBJETO SUSPEITO</span>
        <h2>{point.label}</h2>
        {!done ? <>
          <p className="suspect-question">Este objeto poderia existir aqui, {when}?</p>
          {wrong > 0 && <p className="review-note" role="alert" key={wrong}><strong>Pense de novo.</strong> <GlossaryText text={suspect.hint} glossary={mission.glossary} /></p>}
          <div className="suspect-choices">
            <button className="button secondary big" onClick={() => choose(false)}><Icon name="check" size={18} /> É desta época</button>
            <button className="button gold big" onClick={() => choose(true)}><Icon name="clock" size={18} /> Está fora de época!</button>
          </div>
        </> : <>
          <p className="suspect-verdict"><GlossaryText text={suspect.verdict} glossary={mission.glossary} /></p>
          <p className="suspect-era"><Icon name="clock" size={15} /> Época do objeto: <strong>{suspect.era}</strong></p>
          {suspect.anachronism && <p className="suspect-captured"><Icon name="sparkle" size={15} /> Capturado! O detector mandou o objeto de volta para o tempo dele.</p>}
          <div className="modal-actions">
            <button className="button primary" onClick={onClose}>Continuar investigando<Icon name="arrow" /></button>
          </div>
        </>}
      </div>
    </div>
  </Modal>;
}
