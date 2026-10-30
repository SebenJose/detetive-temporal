import type { Metadata } from "next";
import Link from "next/link";
import { challenge, SKILLS } from "@/content/challenge";
import { missionList } from "@/content/missions";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Para professores · Detetive Temporal", description: "Objetivos, habilidades, roteiro de aula e avaliação do Detetive Temporal." };

const STEPS = [
  { time: "10 min", title: "Apresentação", text: "Pergunte: “Como saberíamos que um objeto não pertence a uma época?” Anote as hipóteses no quadro." },
  { time: "35–40 min", title: "Investigação", text: "Os estudantes jogam os casos em ordem. Cada caso começa com o teste antes da viagem e termina com o teste final. Incentive o uso do caderno e das palavras sublinhadas." },
  { time: "2 min", title: "Resultados", text: "Na tela final do último caso, cada estudante copia a linha de resultado e a envia para você." },
  { time: "10 min", title: "Conversa final", text: "Retome as hipóteses do início com as perguntas sugeridas abaixo." },
];

const QUESTIONS = [
  "Que pista provou que a lista de oferendas estava na pedra, e não no celular?",
  "Por que o astrolábio não substituía um GPS? Que informação faltava?",
  "Como vocês decidiram se um objeto era “fora de época”? Alguém mudou de ideia durante o jogo?",
  "O que no jogo era história e o que era invenção? Por que um jogo inventaria coisas?",
  "Que fontes um historiador usaria para saber como eram as viagens de navio em 1500?",
];

export default function TeachersPage() {
  return <div className="info-page"><header className="info-header"><Link href="/" className="back-button" aria-label="Voltar ao menu"><Icon name="back" size={20} /></Link><span className="info-logo">DETETIVE <b>TEMPORAL</b></span></header>
    <main className="credits-main">
      <span className="eyebrow">PARA PROFESSORES</span>
      <h1>Investigar o passado<br />com pistas e fontes.</h1>
      <p className="credits-lead">Aventura educativa para o 6º ano. Os estudantes viajam a duas épocas, conversam com personagens, examinam fontes, caçam objetos fora de época e precisam <strong>provar</strong> cada conclusão com uma pista. Nenhuma resposta depende de algo que o jogo ainda não ensinou.</p>

      <section className="credits-block">
        <h2>Habilidades relacionadas</h2>
        <p>O jogo se relaciona com as habilidades abaixo, da BNCC e do Referencial Curricular do Paraná. Dois casos curtos não cobrem essas habilidades por inteiro: eles servem como introdução ou atividade de apoio.</p>
        <ul>
          <li><strong>EF06HI01</strong> · Identificar diferentes formas de compreensão da noção de tempo e de periodização dos processos históricos (continuidades e rupturas). <em>No jogo:</em> linha do tempo em escala, objetos fora de época e datas contadas em “há uns 4.500 anos”.</li>
          <li><strong>EF06HI02</strong> · Identificar a gênese da produção do saber histórico e analisar o significado das fontes que originaram determinadas formas de registro em sociedades e épocas distintas. <em>No jogo:</em> a inscrição em pedra como registro de oferendas, a leitura da placa e a escolha de evidências.</li>
        </ul>
        <p>O caso 02 aborda as navegações por volta de 1500, tema aprofundado no 7º ano. Aqui ele é usado para trabalhar a função de instrumentos e o uso de evidências.</p>
      </section>

      <section className="credits-block">
        <h2>Objetivos de aprendizagem</h2>
        <p>Ao concluir um caso, espera-se que o estudante consiga:</p>
        <ul>
          <li>identificar um anacronismo depois de conhecer o contexto da cena;</li>
          <li>explicar a função de um objeto ou prática histórica apresentado no jogo;</li>
          <li>relacionar pelo menos uma evidência à solução escolhida;</li>
          <li>diferenciar elementos históricos de invenções da narrativa.</li>
        </ul>
      </section>

      <section className="credits-block">
        <h2>O que acontece em cada caso</h2>
        <div className="teacher-table" role="table" aria-label="Mecânicas e o que elas ensinam">
          <div role="row" className="teacher-row head"><span role="columnheader">No jogo</span><span role="columnheader">O que o estudante faz</span><span role="columnheader">Objetivo</span></div>
          <div role="row" className="teacher-row"><span role="cell">Conversas e caderno</span><span role="cell">Lê falas curtas; cada uma vira uma pista marcada como “história” ou “invenção do jogo”.</span><span role="cell">Contexto e fontes</span></div>
          <div role="row" className="teacher-row"><span role="cell">Objetos com “?”</span><span role="cell">Decide se cada objeto poderia existir naquela época; o erro gera uma dica.</span><span role="cell">Anacronismo</span></div>
          <div role="row" className="teacher-row"><span role="cell">Placa de oferendas</span><span role="cell">Usa uma chave de leitura (inventada) para montar a lista registrada na pedra.</span><span role="cell">Registro como fonte</span></div>
          <div role="row" className="teacher-row"><span role="cell">Astrolábio</span><span role="cell">Mira o Sol em dois dias e conclui para onde o navio foi pela latitude.</span><span role="cell">Função do instrumento</span></div>
          <div role="row" className="teacher-row"><span role="cell">Restaurador temporal</span><span role="cell">Responde às perguntas e escolhe a pista que prova cada resposta.</span><span role="cell">Uso de evidências</span></div>
          <div role="row" className="teacher-row"><span role="cell">Teste antes e teste final</span><span role="cell">Responde a perguntas curtas antes de viajar e ao concluir o caso; no final, cada resposta é explicada.</span><span role="cell">Avaliação</span></div>
        </div>
      </section>

      <section className="credits-block">
        <h2>Sugestão de aula (cerca de 60 minutos)</h2>
        <ol className="teacher-steps">{STEPS.map((step) => <li key={step.title}><span>{step.time}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol>
        <p>A duração de cada caso ainda não foi medida com estudantes; ajuste o tempo depois da primeira turma.</p>
      </section>

      <section className="credits-block">
        <h2>Perguntas para a conversa final</h2>
        <ul>{QUESTIONS.map((question) => <li key={question}>{question}</li>)}</ul>
      </section>

      <section className="credits-block">
        <h2>Teste de conhecimento: antes e depois de cada caso</h2>
        <p>Cada caso começa com um teste curto, antes da viagem no tempo, sem correção, e termina com o teste final, logo depois de o caso ser resolvido. Cada pergunta do teste final avalia a mesma habilidade da pergunta correspondente do teste inicial, em uma situação diferente, para evitar que a resposta seja apenas memorizada. Nenhuma pergunta repete as do restaurador temporal.</p>
        {missionList.map((mission) => <p key={mission.id}><strong>Caso {mission.number} ({challenge[mission.id].antes.length} + {challenge[mission.id].depois.length} perguntas):</strong> {challenge[mission.id].antes.map((question) => SKILLS[question.skill].toLowerCase()).join("; ")}.</p>)}
        <p><strong>Como coletar:</strong> os resultados ficam salvos apenas no navegador do estudante. Na tela final de um caso, ele copia uma linha como <code>Ana, nº 3 · Caso 01: antes 2/4, depois 4/4 · Caso 02: antes 1/4, depois 3/4</code> e a envia (formulário, mensagem ou papel). Não há servidor nem coleta automática de dados.</p>
        <p><strong>Cuidado ao interpretar:</strong> com poucas turmas, os resultados são indícios, não prova de que o jogo funciona. Observe também se os estudantes conseguem explicar suas escolhas na conversa final.</p>
      </section>

      <section className="credits-block">
        <h2>História e invenção em cada caso</h2>
        {missionList.map((mission) => <div key={mission.id} className="teacher-case">
          <span className="eyebrow">CASO {mission.number} · {mission.location} · {mission.period}</span>
          <h3>{mission.title}</h3>
          <p><strong>História:</strong> {mission.facts.join(" ")}</p>
          <p><strong>Invenção:</strong> {mission.fiction}</p>
        </div>)}
        <Link className="button secondary" href="/creditos/">Fontes consultadas<Icon name="arrow" /></Link>
      </section>

      <section className="credits-block">
        <h2>Acessibilidade e limites</h2>
        <ul>
          <li>Palavras difíceis podem ser tocadas para ver o significado.</li>
          <li>Funciona com mouse, teclado ou toque. O cenário 3D precisa de WebGL2; em computadores muito antigos pode ficar lento.</li>
          <li>Algumas atividades simplificam o conteúdo, e o próprio jogo avisa quando faz isso: a chave de leitura da placa é inventada, e a conta da latitude vale para um dia de equinócio.</li>
          <li>O progresso fica salvo no navegador: usar o mesmo computador e o mesmo navegador entre as aulas.</li>
        </ul>
      </section>
    </main>
    <footer className="title-footer"><span>detetive temporal · material para professores</span><span className="version-tag">PROTÓTIPO 0.5</span></footer>
  </div>;
}
