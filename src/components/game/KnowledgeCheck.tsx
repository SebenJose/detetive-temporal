"use client";

import { useState } from "react";
import { challenge, scoreChallenge, type ChallengeMode } from "@/content/challenge";
import { withResult, type ChallengeRecord } from "@/game/challengeStore";
import { sfx } from "@/game/sfx";
import type { Mission } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

const COPY: Record<ChallengeMode, { title: string; badge: string; lead: string; finish: string }> = {
  antes: { title: "Teste antes da viagem", badge: "ANTES DA VIAGEM", lead: "Antes de viajar, responda do jeito que você sabe hoje. Não tem problema errar: no fim do caso, você faz outro teste para ver o quanto aprendeu.", finish: "Viajar no tempo" },
  depois: { title: "Teste final do caso", badge: "TESTE FINAL", lead: "Caso resolvido! Agora, perguntas parecidas com as do começo, em situações novas. Vamos ver o que você aprendeu.", finish: "Ver resultado do caso" },
};

/**
 * Knowledge check of a case. "antes" opens before the time travel and does not correct the answers;
 * "depois" opens once the case is solved, explains each answer and compares the two scores.
 */
export function KnowledgeCheck({ mission, mode, record, onRecord, onDone }: { mission: Mission; mode: ChallengeMode; record: ChallengeRecord; onRecord: (record: ChallengeRecord) => void; onDone: () => void }) {
  const questions = challenge[mission.id][mode];
  const copy = COPY[mode];
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const question = questions[step];
  const finished = step >= questions.length;
  const before = record.cases[mission.id]?.antes;
  const score = scoreChallenge(questions, answers);

  function pick(option: string) {
    if (checked) return;
    sfx.click(); setAnswers({ ...answers, [step]: option });
    // The final test explains every answer right away; the first one only records it.
    if (mode === "depois") { setChecked(true); if (option === question.correct) sfx.success(); else sfx.error(); }
  }
  function next() {
    sfx.click(); setChecked(false);
    if (step < questions.length - 1) { setStep(step + 1); return; }
    onRecord(withResult(record, mission.id, mode, { answers, score, total: questions.length, date: new Date().toISOString() }));
    sfx.success(); setStep(questions.length);
  }

  return <Modal title={copy.title} onClose={onDone} dismissible={false} className="fact-modal">
    <span className="modal-badge">CASO {mission.number} · {copy.badge}{question ? ` · PERGUNTA ${step + 1} DE ${questions.length}` : ""}</span>
    <h2>{copy.title}</h2>

    {step < 0 && <>
      <p>{copy.lead}</p>
      {mode === "antes" && <label className="name-field"><span>Seu nome ou número da chamada <small>(opcional, para o professor)</small></span>
        <input value={record.name} maxLength={40} onChange={(event) => onRecord({ ...record, name: event.target.value })} placeholder="Ex.: Ana, nº 3" />
      </label>}
      <div className="modal-actions"><button className="button gold big" onClick={() => { sfx.open(); setStep(0); }}>Começar ({questions.length} perguntas)<Icon name="arrow" /></button></div>
    </>}

    {question && <>
      <div className={`fact-card ${checked ? answers[step] === question.correct ? "right" : "wrong" : ""}`}>
        <p className="fact-text">{question.label}</p>
        <div className="answer-options challenge-options">{question.options.map((option) => <label key={option.id} className={answers[step] === option.id ? "selected" : ""}>
          <input type="radio" name={`${mode}-${step}`} checked={answers[step] === option.id} disabled={checked} onChange={() => pick(option.id)} /><span>{option.label}</span>
        </label>)}</div>
        {checked && <div className="fact-feedback" role="status"><strong>{answers[step] === question.correct ? "Acertou!" : "Quase!"}</strong> {question.explanation}</div>}
      </div>
      <div className="fact-progress" aria-hidden="true">{questions.map((_, dot) => <i key={dot} className={dot < step ? "on" : dot === step ? "current" : ""} />)}</div>
      <div className="modal-actions"><button className="button gold" disabled={!answers[step]} onClick={next}>{step < questions.length - 1 ? "Próxima" : "Terminar"}<Icon name="arrow" /></button></div>
    </>}

    {finished && <>
      <div className="fact-score"><strong>{score} de {questions.length}</strong>
        {mode === "antes" ? <span>Guarde esse número! No fim do caso, você faz o teste final.</span>
          : before ? <span className="challenge-compare">Antes: <b>{before.score}</b> → Depois: <b>{score}</b>{score > before.score ? " · Você evoluiu!" : ""}</span>
          : <span>Muito bem, detetive!</span>}
      </div>
      <div className="modal-actions"><button className="button gold big" onClick={onDone}>{copy.finish}<Icon name={mode === "antes" ? "play" : "arrow"} size={18} /></button></div>
    </>}
  </Modal>;
}
