"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { missionList, missions } from "@/content/missions";
import { anachronisms, canSolve, evaluateAnswers, judgeIsCorrect } from "@/game/state";
import { yearsAgo } from "@/game/time";
import { useProgress } from "@/game/useProgress";
import { loadChallenge, saveChallenge, summaryLine, type ChallengeRecord } from "@/game/challengeStore";
import { sfx } from "@/game/sfx";
import type { Answer, Clue, MissionId, PointOfInterest, Position } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { GlossaryText } from "@/components/ui/GlossaryText";
import { Portrait } from "@/components/ui/Portrait";
import { InvestigationScene } from "./scenes/InvestigationScene";
import { DialogueBox } from "./DialogueBox";
import { VoxelPortrait } from "./VoxelPortrait";
import { SuspectCard } from "./SuspectCard";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { TabletActivity } from "./activities/TabletActivity";
import { AstrolabeActivity } from "./activities/AstrolabeActivity";
import { Timeline } from "@/components/ui/Timeline";

type Panel = "intro" | "journal" | "pause" | "hint" | "solution" | "result" | "reset" | "suspect" | "activity" | "pretest" | "posttest" | null;

const ACTION_LABEL: Record<PointOfInterest["kind"], string> = { character: "Conversar com", object: "Examinar", door: "Ir para", solution: "Usar", suspect: "Investigar" };
const TOUCH_PAD = [
  { label: "Mover para cima", text: "▲", x: -1, z: -1, area: "up" },
  { label: "Mover para esquerda", text: "◀", x: -1, z: 1, area: "left" },
  { label: "Mover para direita", text: "▶", x: 1, z: -1, area: "right" },
  { label: "Mover para baixo", text: "▼", x: 1, z: 1, area: "down" },
];

export default function GameExperience() {
  const { state, dispatch, ready, storageAvailable } = useProgress();
  const [initialized, setInitialized] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [dialogue, setDialogue] = useState<{ point: PointOfInterest; line: number } | null>(null);
  const [nearest, setNearest] = useState<PointOfInterest | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateAnswers> | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [touchDirection, setTouchDirection] = useState<Position>({ x: 0, z: 0 });
  const [notice, setNotice] = useState("");
  const [newClue, setNewClue] = useState<Clue | null>(null);
  const [transition, setTransition] = useState<"warp" | "fade" | null>(null);
  const [muted, setMuted] = useState(false);
  const [journalFromSolution, setJournalFromSolution] = useState(false);
  const [suspectPoint, setSuspectPoint] = useState<PointOfInterest | null>(null);
  const [activityPoint, setActivityPoint] = useState<PointOfInterest | null>(null);
  // Points read to the end in this visit: their activity opens directly next time.
  const [readPoints, setReadPoints] = useState<string[]>([]);
  const [questOpen, setQuestOpen] = useState(true);
  const [shake, setShake] = useState(0);
  const [record, setRecord] = useState<ChallengeRecord>({ name: "", cases: {} });
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mission = missions[state.activeMission];
  const progress = state.missions[state.activeMission];
  const tests = record.cases[mission.id];
  const paused = !!panel || !!dialogue || !!transition;

  const later = useCallback((callback: () => void, delay: number) => { timers.current.push(setTimeout(callback, delay)); }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { setMuted(sfx.isMuted()); setQuestOpen(window.innerWidth > 760); setRecord(loadChallenge()); }, []);

  useEffect(() => {
    if (!ready || initialized) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("caso");
    if (requested === "egito" || requested === "navegacao") {
      dispatch({ type: "START", mission: requested });
      if (!state.missions[requested].clues.length && !state.missions[requested].completed) setPanel("intro");
    } else if (!state.started) { dispatch({ type: "START", mission: "egito" }); setPanel("intro"); }
    setInitialized(true);
  }, [ready, initialized, state, dispatch]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!newClue) return;
    const timeout = setTimeout(() => setNewClue(null), 3400);
    return () => clearTimeout(timeout);
  }, [newClue]);

  const toggleMute = useCallback(() => { const next = !sfx.isMuted(); sfx.setMuted(next); setMuted(next); if (!next) sfx.click(); }, []);

  const open = useCallback((next: Panel) => { sfx.open(); setJournalFromSolution(false); setPanel(next); }, []);

  // The clue is saved as soon as the last line is shown, so closing the dialogue never loses it.
  // Points with an activity only give their clue once the activity is solved.
  const collectClue = useCallback((point: PointOfInterest, fromActivity = false) => {
    if (point.activity && !fromActivity) return;
    const clue = point.clue;
    if (!clue || progress.clues.includes(clue.id)) return;
    dispatch({ type: "COLLECT", mission: mission.id, clue: clue.id });
    sfx.clue(); setNewClue(clue);
  }, [progress.clues, dispatch, mission.id]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.repeat || /^(INPUT|SELECT|TEXTAREA)$/.test((event.target as HTMLElement)?.tagName)) return;
      const key = event.key.toLowerCase();
      if (key === "m") { toggleMute(); return; }
      if (dialogue || panel || transition) return;
      if (key === "n") { event.preventDefault(); open("journal"); }
      if (key === "h") { event.preventDefault(); open("hint"); }
      if (key === "escape") { event.preventDefault(); open("pause"); }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [panel, dialogue, transition, open, toggleMute]);

  const interact = useCallback((point: PointOfInterest) => {
    if (paused) return;
    if (point.kind === "door" && point.destination) {
      const destination = point.destination;
      sfx.door(); setTransition("fade"); setNearest(null);
      later(() => dispatch({ type: "MOVE_ROOM", room: destination }), 320);
      later(() => setTransition(null), 750);
      return;
    }
    if (point.kind === "suspect") { setSuspectPoint(point); open("suspect"); return; }
    if (point.kind === "solution") { setFeedback(null); open(progress.completed ? "result" : "solution"); return; }
    const pending = !!point.activity && !!point.clue && !progress.clues.includes(point.clue.id);
    if (pending && readPoints.includes(point.id)) { setActivityPoint(point); open("activity"); return; }
    if (point.lines?.length) { sfx.open(); setDialogue({ point, line: 0 }); if (point.lines.length === 1) collectClue(point); }
  }, [paused, dispatch, progress.completed, progress.clues, readPoints, later, open, collectClue]);

  function advanceDialogue() {
    if (!dialogue) return;
    const lastLine = (dialogue.point.lines?.length ?? 0) - 1;
    if (dialogue.line < lastLine) {
      setDialogue({ ...dialogue, line: dialogue.line + 1 });
      if (dialogue.line + 1 === lastLine) { collectClue(dialogue.point); setReadPoints((list) => list.includes(dialogue.point.id) ? list : [...list, dialogue.point.id]); }
    } else {
      const point = dialogue.point;
      setDialogue(null);
      if (point.activity && point.clue && !progress.clues.includes(point.clue.id)) { setReadPoints((list) => [...list, point.id]); setActivityPoint(point); open("activity"); }
    }
  }

  function backDialogue() {
    if (dialogue && dialogue.line > 0) setDialogue({ ...dialogue, line: dialogue.line - 1 });
  }

  function submitAnswers() {
    const result = evaluateAnswers(mission, answers);
    dispatch({ type: "ATTEMPT", answers });
    if (result.every((answer) => answer.correct)) { sfx.success(); setPanel("posttest"); setNotice("Anomalia corrigida. O tempo está em ordem!"); }
    else { sfx.error(); setFeedback(result); setShake((value) => value + 1); }
  }

  function judge(anachronism: boolean) {
    if (!suspectPoint) return false;
    const correct = judgeIsCorrect(mission, suspectPoint.id, anachronism);
    if (!correct) { sfx.error(); return false; }
    dispatch({ type: "JUDGE", mission: mission.id, suspect: suspectPoint.id, anachronism });
    if (anachronism) sfx.clue(); else sfx.success();
    return true;
  }

  function choose(questionId: string, choice: Answer) {
    sfx.click();
    setAnswers({ ...answers, [questionId]: { ...answers[questionId], ...choice } });
    setFeedback((current) => current?.filter((item) => item.id !== questionId) ?? null);
  }

  function updateRecord(next: ChallengeRecord) { setRecord(next); saveChallenge(next); setCopied(false); }

  async function copySummary() {
    try { await navigator.clipboard.writeText(summaryLine(record, missionList)); setCopied(true); } catch { setCopied(false); }
  }

  function changeMission(id: MissionId) {
    dispatch({ type: "START", mission: id }); setPanel("intro"); setAnswers({}); setDialogue(null); setHintIndex(0); setFeedback(null); setNearest(null);
    window.history.replaceState(null, "", `/jogar/?caso=${id}`);
  }

  // The knowledge test comes before the first trip to each case; after that the briefing leads straight to the trip.
  function travel() {
    if (!tests?.antes) { sfx.open(); setPanel("pretest"); return; }
    startCase();
  }

  function startCase() {
    setPanel(null); sfx.warp(); setTransition("warp");
    later(() => setTransition(null), 1300);
  }

  if (!ready || !initialized) return <main className="loading-screen"><span className="loading-compass"><Icon name="clock" size={64} /></span><p>Abrindo seu arquivo de investigação…</p></main>;

  const cluePoints = mission.points.filter((point) => point.clue);
  const found = progress.clues.length, total = mission.requiredClues.length;
  const outOfTime = anachronisms(mission), captured = outOfTime.filter((point) => progress.judged.includes(point.id));
  const solvable = canSolve(mission, progress);
  const anomalyHolder = mission.points.find((point) => point.portrait && point.portrait !== "scribe");
  const restorePoint = mission.points.find((point) => point.kind === "solution");
  const roomNumber = progress.room === "exterior" ? "01" : "02";

  return <main className={`game-shell ${mission.theme}`}>
    <InvestigationScene key={mission.id} mission={mission} room={progress.room} paused={paused} completed={progress.completed} clues={progress.clues} judged={progress.judged} nearestId={nearest?.id ?? null} talkingId={dialogue?.point.id ?? null} onInteract={interact} onNearest={setNearest} onStep={sfx.step} touchDirection={touchDirection} />

    <div className="hud">
      <div className="hud-top-left">
        <Link href="/" className="hud-button" aria-label="Voltar à agência"><Icon name="home" size={20} /></Link>
        <div className="case-chip">
          <span className="case-chip-number">CASO {mission.number}</span>
          <strong>{mission.title}</strong>
          <span className="case-chip-place"><Icon name="clock" size={13} /> {mission.location} · {mission.period}</span>
        </div>
      </div>

      <div className="hud-top-right">
        <button className="hud-button" onClick={() => open("hint")} aria-label="Pedir uma dica (H)" title="Dica (H)"><Icon name="help" size={20} /></button>
        <button className={`hud-button journal-button ${newClue ? "bump" : ""}`} onClick={() => open("journal")} aria-label={`Caderno, ${found} pistas (N)`} title="Caderno (N)"><Icon name="book" size={20} /><span className="hud-badge">{found}</span></button>
        <button className="hud-button" onClick={toggleMute} aria-label={muted ? "Ligar som (M)" : "Desligar som (M)"} title="Som (M)"><Icon name={muted ? "mute" : "sound"} size={20} /></button>
        <button className="hud-button" onClick={() => open("pause")} aria-label="Pausar (Esc)" title="Pausa (Esc)"><Icon name="pause" size={20} /></button>
      </div>

      <section className={`quest ${questOpen ? "open" : ""}`} aria-label="Objetivo do caso">
        <button className="quest-head" onClick={() => setQuestOpen(!questOpen)} aria-expanded={questOpen}>
          <span className="quest-title"><Icon name="flag" size={15} /> OBJETIVO</span>
          <span className={`anomaly-pill ${progress.completed ? "resolved" : ""}`}><i />{progress.completed ? "RESTAURADO" : "ANOMALIA"}</span>
        </button>
        <div className="quest-body">
          <p>{mission.objective}</p>
          <ul className="quest-list">{cluePoints.map((point) => { const done = progress.clues.includes(point.clue!.id); return <li key={point.id} className={done ? "done" : ""}><span className="quest-check">{done && <Icon name="check" size={11} />}</span>{done ? point.clue!.title : `${point.label} · ${mission.rooms[point.room]}`}</li>; })}<li className={`quest-hunt ${captured.length === outOfTime.length ? "done" : ""}`}><span className="quest-check">{captured.length === outOfTime.length && <Icon name="check" size={11} />}</span>Objetos fora de época: <strong>{captured.length} de {outOfTime.length}</strong></li></ul>
          <div className="stability"><div className="stability-label"><span>PISTAS ENCONTRADAS</span><strong>{found} de {total}</strong></div><div className="stability-track"><span style={{ width: `${found / total * 100}%` }} /></div></div>
          {!progress.completed && solvable && <p className="quest-ready"><Icon name="sparkle" size={14} /> Você achou tudo! Agora use o {restorePoint?.label.toLowerCase()} na {mission.rooms.arquivo.toLowerCase()}.</p>}
          {!storageAvailable && <p className="quest-warning">Salvamento indisponível neste navegador.</p>}
        </div>
      </section>

      <div className="room-banner" key={`${mission.id}-${progress.room}`}><Icon name="pin" size={16} /><span>{mission.rooms[progress.room]}</span><small>{roomNumber}/02</small></div>

      <div className="hud-bottom">
        {nearest ? <button className="interaction-prompt" onClick={() => interact(nearest)}><kbd>E</kbd><span>{ACTION_LABEL[nearest.kind]} <strong>{nearest.label}</strong></span></button>
          : <span className="hud-tip"><Icon name="clue" size={15} /> Clique no chão para andar · clique em alguém para conversar</span>}
      </div>

      <div className="controls-legend" aria-hidden="true"><span><kbd>WASD</kbd> mover</span><span><kbd>E</kbd> interagir</span><span><kbd>N</kbd> caderno</span><span><kbd>H</kbd> dica</span><span><kbd>Esc</kbd> pausa</span></div>

      <div className="touch-pad" aria-label="Controles de movimento">{TOUCH_PAD.map((control) => <button key={control.label} className={`pad-${control.area}`} aria-label={control.label} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setTouchDirection({ x: control.x, z: control.z }); }} onPointerUp={() => setTouchDirection({ x: 0, z: 0 })} onPointerCancel={() => setTouchDirection({ x: 0, z: 0 })} onLostPointerCapture={() => setTouchDirection({ x: 0, z: 0 })}>{control.text}</button>)}</div>
      {nearest && <button className="touch-action" onClick={() => interact(nearest)} aria-label={`${ACTION_LABEL[nearest.kind]} ${nearest.label}`}>E</button>}
    </div>

    {transition && <div className={`screen-transition ${transition}`} aria-hidden="true">{transition === "warp" && <div className="warp-text"><span>VIAGEM TEMPORAL</span><strong>{mission.period}</strong><small>{mission.location} · há uns {yearsAgo(mission.year).toLocaleString("pt-BR")} anos</small></div>}</div>}

    {newClue && <div className="clue-pop" role="status"><div className="clue-pop-icon"><Icon name="book" size={26} /></div><div><span>NOVA PISTA NO CADERNO!</span><strong>{newClue.title}</strong></div><em>+1</em></div>}
    <div className="toast" role="status" aria-live="polite">{notice && <><Icon name="check" size={17} />{notice}</>}</div>

    {dialogue && <DialogueBox point={dialogue.point} line={dialogue.line} completed={progress.completed} glossary={mission.glossary} activityPending={!!dialogue.point.activity && !!dialogue.point.clue && !progress.clues.includes(dialogue.point.clue.id)} onAdvance={advanceDialogue} onBack={backDialogue} onClose={() => setDialogue(null)} />}

    {panel === "intro" && <Modal title="Apresentação do caso" onClose={travel} className="briefing-modal">
      <div className="briefing">
        <div className="briefing-portrait">{anomalyHolder?.portrait && <VoxelPortrait character={anomalyHolder.portrait} anomaly expression="worried" fallback={<Portrait character={anomalyHolder.portrait} />} />}<span className="briefing-alert"><i /> ANOMALIA DETECTADA</span></div>
        <div>
          <span className="modal-badge">ARQUIVO {mission.number} · {mission.location.toUpperCase()} · {mission.period}</span>
          <h2 className="large-modal-title">{mission.title}</h2>
          <p><GlossaryText text={mission.intro} glossary={mission.glossary} /></p>
        </div>
      </div>
      <Timeline current={mission} />
      <div className="instruction-box hunt"><Icon name="clock" size={23} /><p>Atenção, detetive: <strong>{outOfTime.length} objetos fora de época</strong> estão escondidos no cenário. Procure os objetos com <b className="mark-suspect">?</b> e decida: são desta época ou não?</p></div>
      <div className="instruction-box"><Icon name="compass" size={23} /><p><strong>Clique no chão</strong> para andar. Chegue perto de alguém e <strong>clique</strong> para conversar. Cada conversa vira uma <strong>pista no caderno</strong>. Palavras <span className="glossary-term demo">sublinhadas</span> têm explicação: é só tocar!</p></div>
      <div className="modal-actions"><button className="button gold big" onClick={travel}>{tests?.antes ? "Viajar no tempo" : "Teste antes da viagem"}<Icon name="play" size={18} /></button></div>
    </Modal>}

    {panel === "journal" && <Modal title="Caderno de investigação" onClose={() => setPanel(journalFromSolution ? "solution" : null)} className="journal-modal">
      <span className="modal-badge">CASO {mission.number} · {found} DE {total} PISTAS</span>
      <h2>Seu caderno de detetive</h2>
      <p className="modal-subtitle">Aqui ficam as pistas. Use-as para provar suas respostas.</p>
      <Timeline current={mission} found={captured} />
      <div className="journal-list">
        {cluePoints.filter((point) => progress.clues.includes(point.clue!.id)).map((point, index) => <article key={point.id}><span className="journal-number">0{index + 1}</span><div><span className={`eyebrow ${point.clue!.historical ? "tag-history" : "tag-fiction"}`}>{point.clue!.historical ? "HISTÓRIA DE VERDADE" : "INVENÇÃO DO JOGO"}</span><h3>{point.clue!.title}</h3><p><GlossaryText text={point.clue!.text} glossary={mission.glossary} /></p></div></article>)}
        {cluePoints.filter((point) => !progress.clues.includes(point.clue!.id)).map((point) => <article key={point.id} className="journal-locked"><span className="journal-number">??</span><div><span className="eyebrow">PISTA AINDA NÃO ENCONTRADA</span><h3>{point.label}</h3><p>Procure em: {mission.rooms[point.room]}</p></div></article>)}
      </div>
      <div className="modal-actions">{journalFromSolution ? <button className="button gold" onClick={() => setPanel("solution")}>Voltar às perguntas<Icon name="arrow" /></button> : <button className="button primary" onClick={() => setPanel(null)}>Voltar à investigação<Icon name="arrow" /></button>}</div>
    </Modal>}

    {panel === "hint" && <Modal title="Dicas de investigação" onClose={() => setPanel(null)}><span className="modal-badge">DICA {hintIndex + 1} DE {mission.hints.length}</span><h2>Uma ajudinha no tempo.</h2><p className="hint-text"><GlossaryText text={mission.hints[hintIndex]} glossary={mission.glossary} /></p><div className="modal-actions">{hintIndex < mission.hints.length - 1 && <button className="button secondary" onClick={() => { sfx.click(); setHintIndex(hintIndex + 1); }}>Outra dica</button>}<button className="button primary" onClick={() => setPanel(null)}>Vou investigar<Icon name="arrow" /></button></div></Modal>}

    {panel === "pause" && <Modal title="Jogo pausado" onClose={() => setPanel(null)} className="pause-modal"><h2>Pausa</h2><p>Até o tempo precisa de uma pausa. Suas pistas estão guardadas.</p><div className="pause-actions"><button className="button gold big" onClick={() => setPanel(null)}><Icon name="play" size={18} /> Retomar investigação</button><button className="button secondary" onClick={() => setPanel("journal")}><Icon name="book" size={18} /> Abrir caderno</button><button className="button secondary" onClick={toggleMute}><Icon name={muted ? "mute" : "sound"} size={18} /> Som: {muted ? "desligado" : "ligado"}</button><button className="button secondary" onClick={() => setPanel("reset")}><Icon name="reset" size={18} /> Reiniciar este caso</button><Link href="/" className="button secondary"><Icon name="home" size={18} /> Voltar ao menu</Link></div></Modal>}

    {panel === "reset" && <Modal title="Reiniciar este caso" onClose={() => setPanel("pause")}><h2>Investigar este caso do início?</h2><p>As pistas deste caso serão apagadas. O outro caso continua salvo.</p><div className="modal-actions"><button className="button secondary" onClick={() => setPanel("pause")}>Cancelar</button><button className="button primary" onClick={() => { dispatch({ type: "RESET", mission: mission.id }); setHintIndex(0); setPanel("intro"); }}>Reiniciar caso</button></div></Modal>}

    {panel === "solution" && <Modal title="Corrigir a anomalia" onClose={() => setPanel(null)} className="solution-modal">
      <span className="modal-badge">{restorePoint?.label.toUpperCase()}</span>
      <h2>Prove o que você descobriu!</h2>
      {!solvable ? <>
        <p>Para consertar o tempo, você precisa de todas as pistas e de todos os objetos fora de época. Ainda faltam:</p>
        <ul className="missing-clues">{cluePoints.filter((point) => !progress.clues.includes(point.clue!.id)).map((point) => <li key={point.id}><Icon name="clue" size={17} />{point.label} · {mission.rooms[point.room]}</li>)}{captured.length < outOfTime.length && <li><Icon name="clock" size={17} />{outOfTime.length - captured.length} {outOfTime.length - captured.length === 1 ? "objeto fora de época" : "objetos fora de época"} · procure os <b className="mark-suspect">?</b></li>}</ul>
        <div className="modal-actions"><button className="button primary" onClick={() => setPanel(null)}>Continuar investigando<Icon name="arrow" /></button></div>
      </> : <>
        <p className="modal-subtitle">Para cada pergunta, escolha a resposta <strong>e</strong> a pista do caderno que prova que ela está certa.</p>
        <form key={shake} className={shake ? "shake" : ""} onSubmit={(event) => { event.preventDefault(); submitAnswers(); }}>
          {mission.questions.map((question, index) => {
            const review = feedback?.find((item) => item.id === question.id && !item.correct);
            return <fieldset key={question.id} className={review ? "needs-review" : ""}>
              <legend><span>0{index + 1}</span>{question.label}</legend>
              <div className="answer-options">{question.options.map((option) => <label className={answers[question.id]?.option === option.id ? "selected" : ""} key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id]?.option === option.id} onChange={() => choose(question.id, { option: option.id })} required /><span>{option.label}</span></label>)}</div>
              <div className="evidence-row" role="radiogroup" aria-label="Qual pista prova isso?">
                <span className="evidence-label"><Icon name="book" size={15} /> Qual pista prova isso?</span>
                {cluePoints.filter((point) => progress.clues.includes(point.clue!.id)).map((point) => <label key={point.id} className={`evidence-chip ${answers[question.id]?.evidence === point.clue!.id ? "selected" : ""}`}><input type="radio" name={`${question.id}-evidencia`} value={point.clue!.id} checked={answers[question.id]?.evidence === point.clue!.id} onChange={() => choose(question.id, { evidence: point.clue!.id })} required />{point.clue!.title}</label>)}
              </div>
              {review && <p className="review-note" role="alert">{review.option ? <>Boa resposta! Mas essa pista não prova isso. Escolha outra pista.</> : <><strong>Ainda não.</strong> {review.hint}</>}</p>}
            </fieldset>;
          })}
          {feedback && <div className="answer-feedback" role="status"><strong>Quase lá!</strong> <span>Veja as dicas nas perguntas marcadas. Você pode tentar de novo quantas vezes quiser.</span></div>}
          <div className="modal-actions"><button type="button" className="button secondary" onClick={() => { sfx.open(); setJournalFromSolution(true); setPanel("journal"); }}><Icon name="book" size={18} /> Ver caderno</button><button type="submit" className="button gold" disabled={mission.questions.some((question) => !answers[question.id]?.option || !answers[question.id]?.evidence)}>Consertar o tempo<Icon name="sparkle" size={18} /></button></div>
        </form>
      </>}
    </Modal>}

    {panel === "suspect" && suspectPoint && <SuspectCard key={suspectPoint.id} point={suspectPoint} mission={mission} judged={progress.judged.includes(suspectPoint.id)} onJudge={judge} onClose={() => setPanel(null)} />}

    {panel === "activity" && activityPoint?.activity?.type === "tablet" && <TabletActivity activity={activityPoint.activity} mission={mission} onDone={() => { collectClue(activityPoint, true); setPanel(null); }} onClose={() => setPanel(null)} />}
    {panel === "activity" && activityPoint?.activity?.type === "astrolabe" && <AstrolabeActivity activity={activityPoint.activity} mission={mission} onDone={() => { collectClue(activityPoint, true); setPanel(null); }} onClose={() => setPanel(null)} />}

    {panel === "pretest" && <KnowledgeCheck mission={mission} mode="antes" record={record} onRecord={updateRecord} onDone={startCase} />}
    {panel === "posttest" && <KnowledgeCheck mission={mission} mode="depois" record={record} onRecord={updateRecord} onDone={() => setPanel("result")} />}

    {panel === "result" && <Modal title="Caso resolvido" onClose={() => setPanel(null)} className="result-modal">
      <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>
      <div className="result-hero">
        <div className="result-portrait">{anomalyHolder?.portrait && <VoxelPortrait character={anomalyHolder.portrait} expression="happy" fallback={<Portrait character={anomalyHolder.portrait} showAnomaly={false} />} />}</div>
        <div><span className="modal-badge">CASO {mission.number} · LINHA DO TEMPO RESTAURADA</span><h2>Caso resolvido!<br /><em>História compreendida.</em></h2><p>O {mission.id === "egito" ? "celular foi recolhido e o registro de oferendas voltou ao complexo" : "GPS foi recolhido e a tripulação recuperou os recursos de navegação"}.</p></div>
      </div>
      <Timeline current={mission} found={captured} />
      <div className="result-proofs"><h3><Icon name="check" size={18} /> Suas provas</h3><ul>{mission.questions.map((question) => <li key={question.id}><strong>{question.label}</strong> {question.explanation}</li>)}</ul></div>
      <div className="result-facts"><h3><Icon name="book" size={18} /> O que aprendemos sobre esta época</h3><ul>{mission.facts.map((fact) => <li key={fact}><GlossaryText text={fact} glossary={mission.glossary} /></li>)}</ul></div>
      {(tests?.antes || tests?.depois) && <div className="result-facts result-test"><h3><Icon name="star" size={18} /> Teste de conhecimento</h3>
        <p>Antes da viagem: <strong>{tests.antes ? `${tests.antes.score} de ${tests.antes.total}` : "não feito"}</strong> · Teste final: <strong>{tests.depois ? `${tests.depois.score} de ${tests.depois.total}` : "não feito"}</strong></p>
        <p className="summary-line">{summaryLine(record, missionList)}</p>
        <button className="button secondary" onClick={copySummary}><Icon name="list" size={18} /> {copied ? "Copiado!" : "Copiar resultado para o professor"}</button>
      </div>}
      <div className="fiction-note"><span className="eyebrow">E O QUE FOI INVENTADO PARA O JOGO?</span><p>{mission.fiction}</p></div>
      <div className="result-sources"><span className="eyebrow">FONTES DO CASO (PARA PROFESSORES E CURIOSOS)</span>{mission.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="arrow" size={14} /></a>)}</div>
      <div className="modal-actions"><button className="button secondary" onClick={() => setPanel(null)}>Revisitar cenário</button>{mission.id === "egito" ? <button className="button gold" onClick={() => changeMission("navegacao")}>Próximo caso<Icon name="arrow" /></button> : <Link className="button gold" href="/">Voltar ao menu<Icon name="arrow" /></Link>}</div>
    </Modal>}
  </main>;
}
