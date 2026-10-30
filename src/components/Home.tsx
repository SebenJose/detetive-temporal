"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { missionList } from "@/content/missions";
import { useProgress } from "@/game/useProgress";
import { Icon } from "./ui/Icon";
import { CaseIllustration } from "./ui/CaseIllustration";
import { Modal } from "./ui/Modal";

const TitleScene = dynamic(() => import("./TitleScene"), { ssr: false });

type View = "menu" | "cases" | "how";

export function Home() {
  const { state, dispatch, ready } = useProgress();
  const [view, setView] = useState<View>("menu");
  const [reset, setReset] = useState(false);
  const hasProgress = ready && state.started;
  const solved = ready ? missionList.filter((mission) => state.missions[mission.id].completed).length : 0;

  return <div className="title-screen">
    <div className="title-sky" aria-hidden="true"><span className="sun" /><span className="cloud cloud-a" /><span className="cloud cloud-b" /></div>
    <div className="title-scene" aria-hidden="true"><TitleScene /></div>

    <main className="title-layout">
      <header className="logo">
        <h1><span className="logo-word">DETETIVE</span><span className="logo-word accent">TEMPORAL</span></h1>
        <p className="logo-sub">Casos fora de época</p>
      </header>

      {view === "menu" && <nav className="main-menu" aria-label="Menu principal">
        <p className="menu-pitch">Uma múmia com celular. Um navegador com GPS. Viaje no tempo, converse com as pessoas da época, reúna pistas e devolva cada coisa ao seu lugar.</p>
        {hasProgress ? <Link className="menu-button primary-action" href="/jogar/?continuar=1"><Icon name="play" size={20} /> Continuar investigação</Link>
          : <Link className="menu-button primary-action" href="/jogar/?caso=egito"><Icon name="play" size={20} /> Novo jogo</Link>}
        <button className="menu-button" onClick={() => setView("cases")}><Icon name="list" size={20} /> Escolher caso <span className="menu-meta">{solved}/{missionList.length} resolvidos</span></button>
        <button className="menu-button" onClick={() => setView("how")}><Icon name="help" size={20} /> Como jogar</button>
        <Link className="menu-button" href="/creditos/"><Icon name="book" size={20} /> Fontes e créditos</Link>
        {hasProgress && <button className="menu-link" onClick={() => setReset(true)}><Icon name="reset" size={15} /> Reiniciar progresso</button>}
      </nav>}

      {view === "cases" && <section className="menu-panel" aria-label="Escolha um caso">
        <div className="panel-head"><button className="back-button" onClick={() => setView("menu")} aria-label="Voltar"><Icon name="back" size={20} /></button><h2>Escolha seu destino</h2></div>
        <div className="level-grid">{missionList.map((mission) => {
          const progress = state.missions[mission.id];
          const done = ready && progress.completed;
          return <Link key={mission.id} href={`/jogar/?caso=${mission.id}`} className={`level-card ${mission.theme} ${done ? "solved" : ""}`}>
            <div className="level-art"><CaseIllustration theme={mission.theme} /><span className="level-number">CASO {mission.number}</span>{done && <span className="level-stamp"><Icon name="check" size={14} /> RESOLVIDO</span>}</div>
            <div className="level-body">
              <span className="level-place">{mission.location} · {mission.period}</span>
              <h3>{mission.title}</h3>
              <p>{mission.subtitle}</p>
              <div className="level-progress"><span className="level-track"><i style={{ width: `${ready ? progress.clues.length / mission.requiredClues.length * 100 : 0}%` }} /></span><small>{ready ? progress.clues.length : 0}/{mission.requiredClues.length} pistas</small></div>
            </div>
          </Link>;
        })}</div>
      </section>}

      {view === "how" && <section className="menu-panel how-panel" aria-label="Como jogar">
        <div className="panel-head"><button className="back-button" onClick={() => setView("menu")} aria-label="Voltar"><Icon name="back" size={20} /></button><h2>Como jogar</h2></div>
        <ol className="how-list">
          <li><span>1</span><div><h3>Explore outra época</h3><p>Clique no chão para andar. Clique nas pessoas e nos objetos para conversar e examinar. Onde tem <b className="mark-new">!</b> ainda há uma pista.</p></div></li>
          <li><span>2</span><div><h3>Reúna as pistas</h3><p>Cada conversa vira uma pista no caderno. Você não precisa saber nada antes: tudo é explicado no jogo. Não entendeu uma palavra? Toque nas palavras sublinhadas.</p></div></li>
          <li><span>3</span><div><h3>Restaure a linha do tempo</h3><p>Responda às perguntas e mostre qual pista prova cada resposta. Errou? Você ganha uma dica e pode tentar de novo.</p></div></li>
          <li><span>4</span><div><h3>Teste o que aprendeu</h3><p>Antes de viajar, um teste rápido mostra o que você já sabe. No fim do caso, o teste final mostra o quanto você aprendeu.</p></div></li>
        </ol>
        <div className="key-grid">
          <div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>mover (ou setas, ou clique no chão)</span></div>
          <div><kbd>E</kbd><span>conversar / examinar</span></div>
          <div><kbd>Q</kbd><span>voltar uma fala</span></div>
          <div><kbd>N</kbd><span>caderno</span></div>
          <div><kbd>H</kbd><span>dica</span></div>
          <div><kbd>M</kbd><span>som</span></div>
          <div><kbd>Esc</kbd><span>pausa</span></div>
        </div>
      </section>}
    </main>

    <footer className="title-footer"><span>Uma aventura educativa para aprender investigando · <Link href="/professores/">Para professores</Link></span><span className="version-tag">PROTÓTIPO 0.5</span></footer>

    {reset && <Modal title="Reiniciar progresso" onClose={() => setReset(false)}><h2>Começar do zero?</h2><p>As pistas e os casos resolvidos serão apagados deste navegador.</p><div className="modal-actions"><button className="button secondary" onClick={() => setReset(false)}>Manter progresso</button><button className="button primary" onClick={() => { dispatch({ type: "RESET_ALL" }); setReset(false); }}>Reiniciar</button></div></Modal>}
  </div>;
}
