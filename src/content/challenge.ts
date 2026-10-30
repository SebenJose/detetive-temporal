import type { MissionId } from "../game/types.ts";

// Teste de conhecimento de cada caso: um "antes" da viagem e um "depois" ao concluir. Cada pergunta do
// "depois" avalia a mesma habilidade da pergunta do "antes", numa situação diferente, para que a resposta
// não possa ser decorada. Nenhuma repete as perguntas do restaurador nem os objetos com "?" do cenário.

export type ChallengeQuestion = {
  skill: string;
  label: string;
  options: { id: string; label: string }[];
  correct: string;
  explanation: string;
};

export type ChallengeMode = "antes" | "depois";

export const SKILLS: Record<string, string> = {
  anacronismo: "Identificar um objeto fora de época",
  fonte: "Reconhecer um registro como fonte de informação",
  evidencia: "Escolher uma evidência para provar uma ideia",
  instrumento: "Relacionar instrumento e função",
  ficcao: "Diferenciar história e invenção",
  tempo: "Situar acontecimentos no tempo",
};

const HISTORY_OR_FICTION = [{ id: "historia", label: "História" }, { id: "invencao", label: "Invenção" }];

export const challenge: Record<MissionId, Record<ChallengeMode, ChallengeQuestion[]>> = {
  egito: {
    antes: [
      {
        skill: "anacronismo", label: "Num mercado do Egito Antigo, há 4.500 anos, qual destes objetos NÃO poderia estar lá?", correct: "oculos",
        options: [{ id: "oculos", label: "Óculos de sol de plástico" }, { id: "cesto", label: "Um cesto de palha" }, { id: "vaso", label: "Um vaso de barro" }],
        explanation: "O plástico só se espalhou no século 20. Cestos de palha e vasos de barro já existiam no Egito Antigo.",
      },
      {
        skill: "fonte", label: "Arqueólogos acharam uma parede antiga com desenhos de pessoas carregando pães e jarros. Para um historiador, essa parede é…", correct: "fonte",
        options: [{ id: "enfeite", label: "Só um enfeite, sem informação" }, { id: "prova", label: "Uma prova de que as múmias falavam" }, { id: "fonte", label: "Uma fonte que conta como as pessoas viviam" }],
        explanation: "Desenhos e inscrições antigas são fontes: mostram o que as pessoas faziam, comiam e ofereciam.",
      },
      {
        skill: "ficcao", label: "Num desenho animado, os egípcios constroem uma pirâmide em um só dia, usando um guindaste. Isso é história ou invenção?", correct: "invencao",
        options: HISTORY_OR_FICTION,
        explanation: "Invenção! As pirâmides levaram anos para ficar prontas, e não existiam guindastes como os de hoje.",
      },
      {
        skill: "tempo", label: "Qual destes acontecimentos é o MAIS antigo?", correct: "piramides",
        options: [{ id: "bicicleta", label: "A invenção da bicicleta" }, { id: "piramides", label: "A construção das pirâmides de Gizé" }, { id: "portugueses", label: "A chegada dos portugueses ao Brasil" }],
        explanation: "As pirâmides de Gizé têm cerca de 4.500 anos. Os portugueses chegaram ao Brasil há uns 500 anos, e a bicicleta tem menos de 250.",
      },
    ],
    depois: [
      {
        skill: "anacronismo", label: "Na oficina de um escriba do Egito Antigo, qual objeto está fora de época?", correct: "caneta",
        options: [{ id: "papiro", label: "Uma folha de papiro" }, { id: "tigela", label: "Uma tigela de barro" }, { id: "caneta", label: "Uma caneta esferográfica" }],
        explanation: "A caneta esferográfica é do século 20. Os escribas escreviam com pincéis de junco, em pedra ou papiro.",
      },
      {
        skill: "fonte", label: "Num museu, há uma pedra antiga com o nome e o cargo de um homem gravados. O que ela ensina a um historiador?", correct: "quem",
        options: [{ id: "quem", label: "Quem era essa pessoa e qual era o trabalho dela" }, { id: "nada", label: "Nada: é só uma pedra" }, { id: "receita", label: "A comida favorita dessa pessoa" }],
        explanation: "Inscrições com nomes e cargos são fontes: contam quem foi a pessoa e o que ela fazia.",
      },
      {
        skill: "ficcao", label: "Qual destas frases é HISTÓRIA, e não invenção?", correct: "inscricoes",
        options: [{ id: "mumias", label: "Múmias ajudavam a contar as oferendas." }, { id: "inscricoes", label: "Inscrições em pedra guardam nomes de pessoas do Egito Antigo." }, { id: "relogios", label: "Os escribas marcavam a hora em relógios de pulso." }],
        explanation: "As inscrições em pedra existem e são estudadas até hoje. Múmias que ajudam e relógios de pulso no Egito são invenção.",
      },
      {
        skill: "tempo", label: "As pirâmides de Gizé foram construídas há cerca de 4.500 anos. Em que época isso foi?", correct: "ac",
        options: [{ id: "1500", label: "Por volta do ano 1500" }, { id: "dc", label: "Por volta de 2500 d.C." }, { id: "ac", label: "Por volta de 2500 a.C." }],
        explanation: "a.C. quer dizer “antes de Cristo”. 2500 a.C. foi há uns 4.500 anos. O ano 2500 d.C. ainda nem chegou!",
      },
    ],
  },
  navegacao: {
    antes: [
      {
        skill: "anacronismo", label: "Num navio de 500 anos atrás, qual destes objetos NÃO poderia estar a bordo?", correct: "radio",
        options: [{ id: "radio", label: "Um rádio a pilha" }, { id: "corda", label: "Uma corda grossa" }, { id: "vela", label: "Uma vela de pano no mastro" }],
        explanation: "Rádios e pilhas só surgiram séculos depois. Cordas e velas de pano moviam os navios de 1500.",
      },
      {
        skill: "instrumento", label: "Sem relógio, como um marinheiro de 1500 sabia que o turno de trabalho tinha acabado?", correct: "ampulheta",
        options: [{ id: "bussola", label: "Olhando a bússola" }, { id: "mapa", label: "Lendo o mapa" }, { id: "ampulheta", label: "Esperando a areia da ampulheta passar" }],
        explanation: "A ampulheta media o tempo com areia escorrendo e ajudava a marcar os turnos no navio.",
      },
      {
        skill: "evidencia", label: "Léo diz: “Os navegadores de 1500 desenhavam mapas da costa.” Qual é a melhor prova disso?", correct: "museu",
        options: [{ id: "museu", label: "Um mapa daquela época guardado num museu" }, { id: "filme", label: "Um filme de piratas" }, { id: "colega", label: "A opinião de um colega" }],
        explanation: "Um objeto da própria época é uma fonte. Filmes e opiniões não provam o que aconteceu.",
      },
      {
        skill: "ficcao", label: "Num filme, um navio de 1500 é atacado por um polvo gigante do tamanho de uma ilha. Isso é história ou invenção?", correct: "invencao",
        options: HISTORY_OR_FICTION,
        explanation: "Invenção! Os perigos reais eram tempestades, doenças e a falta de comida e água.",
      },
    ],
    depois: [
      {
        skill: "anacronismo", label: "No porão de um navio de 1500, qual objeto está fora de época?", correct: "geladeira",
        options: [{ id: "geladeira", label: "Uma geladeira" }, { id: "saco", label: "Um saco de biscoitos" }, { id: "caixote", label: "Um caixote de madeira" }],
        explanation: "A geladeira precisa de eletricidade e só surgiu no século 20. Biscoitos secos e caixotes de madeira iam nas viagens.",
      },
      {
        skill: "instrumento", label: "O céu ficou nublado o dia inteiro: não dá para ver o Sol nem as estrelas. Qual instrumento fica sem uso?", correct: "astrolabio",
        options: [{ id: "bussola", label: "Bússola" }, { id: "mapa", label: "Mapa" }, { id: "astrolabio", label: "Astrolábio" }],
        explanation: "O astrolábio precisa mirar o Sol ou uma estrela. A bússola e o mapa continuam funcionando.",
      },
      {
        skill: "evidencia", label: "Qual é a melhor prova de que um navio de 1500 levava um astrolábio?", correct: "naufragio",
        options: [{ id: "desenho", label: "Um desenho animado sobre navegação" }, { id: "naufragio", label: "Um astrolábio encontrado no naufrágio de um navio daquela época" }, { id: "palpite", label: "Um palpite da turma" }],
        explanation: "Um objeto achado nos restos do próprio navio é uma fonte. Desenhos e palpites não provam o que aconteceu.",
      },
      {
        skill: "ficcao", label: "Sobre a navegação em 1500, qual destas frases é HISTÓRIA?", correct: "longitude",
        options: [{ id: "longitude", label: "Em 1500, era muito difícil medir a longitude no mar." }, { id: "gps", label: "Um GPS guiava os navios em 1500." }, { id: "completa", label: "O astrolábio mostrava a posição completa do navio." }],
        explanation: "Medir a longitude no mar só ficou fácil séculos depois. O astrolábio dava só a latitude, e o GPS é bem recente.",
      },
    ],
  },
};

export function scoreChallenge(questions: ChallengeQuestion[], answers: Record<number, string>) {
  return questions.filter((question, index) => answers[index] === question.correct).length;
}
