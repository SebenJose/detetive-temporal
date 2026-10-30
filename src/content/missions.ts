import type { GlossaryEntry, Mission, MissionId } from "../game/types.ts";

// Textos escritos para o 6º ano (11–12 anos): frases curtas, uma ideia por fala.
// Palavras do glossário aparecem destacadas e podem ser tocadas para ver o significado.

const anomalia: GlossaryEntry = { term: "anomalia", forms: ["anomalia"], text: "Algo fora do normal. Neste jogo, é um objeto que foi parar na época errada." };

export const missions: Record<MissionId, Mission> = {
  egito: {
    id: "egito",
    number: "01",
    title: "A múmia sem sinal",
    subtitle: "Um celular. Alguns milênios de diferença.",
    location: "Egito Antigo",
    period: "c. 2500 a.C.",
    year: -2500,
    theme: "sand",
    intro: "Alarme na Agência! Um celular caiu no Egito Antigo, há uns 4.500 anos. Uma múmia tenta achar uma lista importante no aparelho, mas a lista sumiu. Descubra como as pessoas daquela época guardavam informações e devolva cada coisa ao seu tempo.",
    objective: "Descubra onde estava a lista de oferendas.",
    rooms: { exterior: "Pátio das pirâmides", arquivo: "Sala dos registros" },
    points: [
      {
        id: "mummy", label: "Múmia", room: "exterior", position: { x: 2.7, z: -1.5 },
        kind: "character", portrait: "mummy", speaker: "Múmia, acordada pela anomalia",
        lines: [
          "Este celular não me reconhece! Acho que é por causa das faixas no meu rosto.",
          "Eu precisava ver a lista de oferendas. Quando este aparelho apareceu, a lista sumiu. Agora ele só mostra uma receita de pão de queijo!",
          "A escriba do pátio sabe onde guardamos as informações. Vá falar com ela. E traga algo que não precise de bateria!",
        ],
        clue: { id: "celular", title: "Um objeto fora de época", text: "O celular chegou com a anomalia e não tem a lista de oferendas. A múmia disse para procurar a escriba.", historical: false },
      },
      {
        id: "scribe", label: "Escriba", room: "exterior", position: { x: -2.7, z: 2 },
        kind: "character", portrait: "scribe", speaker: "Escriba do complexo",
        lines: [
          "Olá, detetive! Eu sou escriba: meu trabalho é escrever e guardar informações importantes.",
          "Aqui não existe celular. Para não esquecer nada, gravamos desenhos e sinais na pedra dos monumentos funerários.",
          "Essas inscrições guardam nomes, cargos e listas de oferendas. A pedra dura muito, muito tempo!",
          "A placa com a lista está na sala dos registros. Deixei lá uma chave para você ler os desenhos. Não precisa saber hieróglifos!",
        ],
        clue: { id: "escrita", title: "A pedra guarda informações", text: "No Egito Antigo, inscrições em pedra nos monumentos funerários guardavam nomes, cargos e listas de oferendas.", historical: true },
      },
      {
        id: "tenis", label: "Tênis", room: "exterior", position: { x: 3.7, z: 0.9 }, kind: "suspect",
        suspect: { anachronism: true, year: 1870, era: "século 19", verdict: "Fora de época! Tênis com sola de borracha só surgiram no século 19, há menos de 200 anos. No Egito Antigo, muita gente andava descalça ou usava sandálias de fibras de plantas.", hint: "Olhe a sola deste calçado: é de borracha. Será que existia há 4.500 anos?" },
      },
      {
        id: "lata", label: "Lata de refrigerante", room: "exterior", position: { x: 0.4, z: -2.6 }, kind: "suspect",
        suspect: { anachronism: true, year: 1960, era: "século 20", verdict: "Fora de época! Latas de refrigerante só apareceram no século 20, há menos de 100 anos. Aqui, as bebidas eram guardadas em jarros de cerâmica.", hint: "É uma lata de metal fino, com rótulo colorido. Quem fabricaria isso há 4.500 anos?" },
      },
      {
        id: "jarro", label: "Jarro de cerâmica", room: "exterior", position: { x: -1.0, z: 0.9 }, kind: "suspect",
        suspect: { anachronism: false, year: -2500, era: "Egito Antigo", verdict: "É desta época! Jarros de cerâmica eram usados para guardar comida e bebida. Eles aparecem até nas listas de oferendas.", hint: "Converse com a escriba e examine a placa de oferendas: elas falam de objetos como este." },
      },
      { id: "entry", label: "Sala dos registros", room: "exterior", position: { x: 4, z: 3 }, kind: "door", destination: "arquivo" },
      {
        id: "tablet", label: "Placa de oferendas", room: "arquivo", position: { x: -2.5, z: -1.8 },
        kind: "object", speaker: "Placa de oferendas · modelo do jogo",
        lines: [
          "Uma placa de pedra com desenhos e risquinhos. Ao lado está a chave de leitura que a escriba deixou.",
          "Chave: cada desenho mostra um tipo de oferenda. Cada traço ao lado do desenho vale 1.",
          "Atenção: estes desenhos e esta chave foram inventados para o jogo. Não são uma tradução de hieróglifos de verdade.",
          "Agora é com você: use a chave para ler a placa e montar a lista de oferendas.",
        ],
        activity: { type: "tablet", rows: [{ id: "pao", label: "Pães", count: 3 }, { id: "jarro", label: "Jarros", count: 2 }], hint: "Olhe uma linha de cada vez: qual é o desenho? Quantos traços tem ao lado dele?" },
        clue: { id: "oferendas", title: "A lista estava na pedra", text: "A placa mostra 3 pães e 2 jarros: é a lista de oferendas. A chave de leitura foi inventada para o jogo.", historical: false },
      },
      {
        id: "relogio", label: "Relógio digital", room: "arquivo", position: { x: 2.1, z: -1.9 }, kind: "suspect",
        suspect: { anachronism: true, year: 1972, era: "anos 1970", verdict: "Fora de época! Relógios digitais de pulso surgiram nos anos 1970. Eles precisam de bateria, e a múmia pediu algo sem bateria!", hint: "Este objeto tem números que acendem numa telinha. Do que ele precisa para funcionar?" },
      },
      {
        id: "paleta", label: "Paleta de escriba", room: "arquivo", position: { x: -0.3, z: -0.6 }, kind: "suspect",
        suspect: { anachronism: false, year: -2500, era: "Egito Antigo", verdict: "É desta época! Os escribas usavam paletas com tinta preta e vermelha e pincéis feitos de junco para escrever.", hint: "Quem trabalha escrevendo aqui? Releia o que a escriba contou sobre o trabalho dela." },
      },
      { id: "restore", label: "Restaurador temporal", room: "arquivo", position: { x: 2.5, z: 1 }, kind: "solution" },
      { id: "exit", label: "Voltar ao pátio", room: "arquivo", position: { x: -3.7, z: 3.4 }, kind: "door", destination: "exterior" },
    ],
    requiredClues: ["celular", "escrita", "oferendas"],
    questions: [
      {
        id: "intruso", label: "Qual objeto NÃO é desta época?", correct: "celular", evidence: "celular",
        options: [{ id: "placa", label: "A placa de pedra" }, { id: "celular", label: "O celular" }, { id: "jarro", label: "O jarro de oferenda" }],
        hint: "Lembre do que a múmia contou: o que apareceu junto com a anomalia?",
        explanation: "O celular chegou com a anomalia. Ele só seria inventado milhares de anos depois.",
      },
      {
        id: "registro", label: "Onde os egípcios guardavam informações importantes?", correct: "pedra", evidence: "escrita",
        options: [{ id: "app", label: "Num aplicativo de celular" }, { id: "pedra", label: "Gravadas na pedra dos monumentos" }, { id: "memoria", label: "Só na memória da múmia" }],
        hint: "Abra o caderno e releia o que a escriba explicou sobre guardar informações.",
        explanation: "A escriba explicou que inscrições em pedra guardavam nomes, cargos e oferendas.",
      },
      {
        id: "lista", label: "O que a placa da sala dos registros mostra?", correct: "oferendas", evidence: "oferendas",
        options: [{ id: "receita", label: "Uma receita de pão de queijo" }, { id: "tesouro", label: "O mapa de um tesouro" }, { id: "oferendas", label: "3 pães e 2 jarros de oferenda" }],
        hint: "Use a chave de leitura: conte os traços ao lado de cada desenho.",
        explanation: "Pela chave do jogo, a placa mostra 3 pães e 2 jarros: a lista de oferendas.",
      },
    ],
    hints: [
      "Comece falando com a múmia. Ela está perto da pirâmide.",
      "Os objetos com ? podem não ser desta época. Clique neles e decida: é do Egito Antigo ou não?",
      "Converse com a escriba no pátio. Depois entre pela porta da sala dos registros.",
      "Na sala, examine a placa de pedra e procure mais objetos com ?. Com tudo pronto, use o restaurador temporal.",
    ],
    facts: [
      "As pirâmides de Gizé foram construídas no Reino Antigo, por volta de 2500 a.C., ou seja, há cerca de 4.500 anos. Nosso cenário é inventado, mas se inspira nessa época.",
      "Inscrições em pedra nos monumentos funerários guardavam nomes, cargos e listas de oferendas. Hoje elas são fontes para os historiadores.",
      "Você trabalhou como um historiador: usou pistas para provar cada resposta.",
    ],
    fiction: "A agência temporal, a múmia que fala, o celular, os personagens e a placa com a chave de leitura foram inventados para o jogo. A placa não é cópia nem tradução de uma inscrição real.",
    glossary: [
      anomalia,
      { term: "escriba", forms: ["escriba", "escribas"], text: "Pessoa que sabia ler e escrever e trabalhava registrando informações. No Egito Antigo, poucas pessoas sabiam escrever." },
      { term: "oferenda", forms: ["oferenda", "oferendas"], text: "Algo oferecido aos deuses ou aos mortos, como pães e bebidas." },
      { term: "inscrição", forms: ["inscrição", "inscrições"], text: "Texto ou desenho gravado numa superfície dura, como a pedra." },
      { term: "monumento funerário", forms: ["monumentos funerários", "monumento funerário"], text: "Construção feita para homenagear quem morreu, como as pirâmides e as tumbas." },
      { term: "hieróglifo", forms: ["hieróglifos", "hieróglifo"], text: "Sinal da escrita do Egito Antigo. Muitos parecem desenhos de pessoas, animais e objetos." },
      { term: "Reino Antigo", forms: ["Reino Antigo"], text: "Período da história do Egito, há cerca de 4.500 anos, quando as grandes pirâmides de Gizé foram construídas." },
      { term: "múmia", forms: ["múmia"], text: "Corpo preservado com técnicas especiais e enrolado em faixas. Múmias de verdade não falam: esta é invenção do jogo!" },
      { term: "a.C.", forms: ["a.C."], text: "Quer dizer “antes de Cristo”. 2500 a.C. foi há uns 4.500 anos." },
    ],
    sources: [
      { title: "The Metropolitan Museum of Art · Age of the Pyramids", url: "https://www.metmuseum.org/exhibitions/listings/1999/egyptian-art-in-the-age-of-the-pyramids", description: "Contexto do Reino Antigo e das pirâmides de Gizé." },
      { title: "The Met · Tomb Chapel of Raemkai: South Wall", url: "https://www.metmuseum.org/art/collection/search/577372", description: "Exemplo documentado de uma lista de oferendas inscrita em uma capela funerária do Reino Antigo." },
      { title: "The Met · Tomb Chapel of Raemkai", url: "https://www.metmuseum.org/art/collection/search/590874", description: "Inscrições de nomes e títulos em um monumento funerário." },
    ],
  },
  navegacao: {
    id: "navegacao", number: "02", title: "Depois da próxima onda", subtitle: "O GPS perdeu o rumo. E o século.",
    location: "Oceano Atlântico", period: "c. 1500", year: 1500, theme: "sea",
    intro: "Alarme na Agência! Um GPS foi parar num navio de uns 500 anos atrás. Ele manda virar “depois da próxima onda”, e a tripulação está perdida. Descubra para que servia cada instrumento de navegação daquela época.",
    objective: "Descubra para que servem a bússola, o mapa e o astrolábio.",
    rooms: { exterior: "Convés do navio", arquivo: "Cabine de navegação" },
    points: [
      {
        id: "navigator", label: "Navegador", room: "exterior", position: { x: 2.8, z: -1.5 }, kind: "character", portrait: "navigator", speaker: "Navegador da tripulação",
        lines: [
          "Este aparelho mandou: “Vire à direita depois da próxima onda”. Mas o mar tem milhares de ondas!",
          "Antes dessa confusão, usávamos vários instrumentos juntos. Cada um ajudava com uma coisa diferente.",
          "A bússola está aqui no convés. O mapa e o astrolábio estão na cabine. Descubra para que serve cada um e depois use a mesa de navegação.",
        ],
        clue: { id: "gps", title: "Uma ordem impossível", text: "O GPS veio com a anomalia. Na época, os navegadores combinavam vários instrumentos, e cada um dava um tipo de informação.", historical: false },
      },
      {
        id: "compass", label: "Bússola", room: "exterior", position: { x: -2.4, z: 1.8 }, kind: "object", speaker: "Bússola",
        lines: [
          "A agulha da bússola é magnética: ela aponta para o norte.",
          "Sabendo onde fica o norte, dá para achar os pontos cardeais e manter o navio na direção certa.",
          "Mas a bússola não mostra onde fica a terra nem diz onde o navio está.",
        ],
        clue: { id: "bussola", title: "Bússola → direção", text: "A agulha magnética aponta para o norte. Assim o navegador sabe a direção. Mas a bússola não mostra onde o navio está.", historical: true },
      },
      {
        id: "lanterna", label: "Lanterna elétrica", room: "exterior", position: { x: 1.0, z: 1.6 }, kind: "suspect",
        suspect: { anachronism: true, year: 1899, era: "fim do século 19", verdict: "Fora de época! Lanternas elétricas de pilha só surgiram no fim do século 19. Em 1500, à noite, usavam-se velas e lampiões com chama.", hint: "Esta lanterna acende com pilhas. Existiam pilhas elétricas há 500 anos?" },
      },
      {
        id: "garrafa", label: "Garrafa de plástico", room: "exterior", position: { x: 2.6, z: -4.0 }, kind: "suspect",
        suspect: { anachronism: true, year: 1975, era: "anos 1970", verdict: "Fora de época! Garrafas de plástico como esta só se espalharam nos anos 1970. Nos navios, a água ia em barris de madeira.", hint: "De que material é esta garrafa? E de que são feitas as outras coisas do navio?" },
      },
      {
        id: "barril", label: "Barril de madeira", room: "exterior", position: { x: -3.6, z: -0.8 }, kind: "suspect",
        suspect: { anachronism: false, year: 1500, era: "c. 1500", verdict: "É desta época! Barris de madeira guardavam água, comida e outras cargas nas longas viagens.", hint: "Olhe o canto do convés: há outros objetos parecidos guardando a carga do navio." },
      },
      { id: "entry", label: "Cabine de navegação", room: "exterior", position: { x: 4, z: 3 }, kind: "door", destination: "arquivo" },
      {
        id: "chart", label: "Carta de navegação", room: "arquivo", position: { x: -2.8, z: -1.5 }, kind: "object", speaker: "Carta de navegação (mapa)",
        lines: [
          "Esta é uma carta de navegação, o mapa dos navegadores. Ela mostra a costa, ilhas e outros pontos de referência.",
          "Com ela, o navegador planejava o caminho do navio. Este mapa foi inventado para o jogo.",
          "Mas o mapa não se mexe sozinho: ele não mostra onde o navio está agora, como faz um GPS.",
        ],
        clue: { id: "mapa", title: "Mapa → planejar o caminho", text: "A carta de navegação mostra a costa e outros pontos de referência e ajuda a planejar o caminho. O mapa do jogo é inventado.", historical: true },
      },
      {
        id: "astrolabe", label: "Astrolábio náutico", room: "arquivo", position: { x: 1.7, z: -2.3 }, kind: "object", speaker: "Astrolábio náutico",
        lines: [
          "Com o astrolábio náutico, o navegador media a altura do Sol ou de uma estrela acima do horizonte.",
          "Essa medida ajudava a descobrir a latitude: o quanto o navio estava mais ao norte ou mais ao sul.",
          "O astrolábio não dava a posição completa, como um GPS. A latitude era só uma parte da resposta.",
          "Vamos experimentar? Mire no Sol do meio-dia em dois dias de viagem. O jogo faz as contas para você.",
        ],
        activity: { type: "astrolabe", days: [60, 50], answer: "norte", hint: "Compare as duas latitudes: o número ficou maior ou menor? Latitude maior quer dizer mais longe do Equador.",
          success: "Isso! A latitude aumentou, então o navio foi para o norte. Mas repare: o astrolábio não diz se o navio foi para leste ou oeste. Essa medida, a longitude, era muito mais difícil no mar.",
          note: "Simplificação do jogo: num dia de equinócio, no hemisfério norte, a latitude é 90° menos a altura do Sol ao meio-dia. Nos outros dias, os navegadores usavam tabelas para corrigir a conta." },
        clue: { id: "astrolabio", title: "Astrolábio → latitude", text: "Medindo a altura do Sol ou de uma estrela, o astrolábio ajudava a descobrir a latitude. Sozinho, não dava a posição completa do navio.", historical: true },
      },
      {
        id: "fone", label: "Fone de ouvido", room: "arquivo", position: { x: 0.4, z: 2.9 }, kind: "suspect",
        suspect: { anachronism: true, year: 1910, era: "início do século 20", verdict: "Fora de época! Fones de ouvido surgiram no início do século 20, junto com o rádio e o telefone. Em 1500, a tripulação se comunicava pela voz e por sinais combinados.", hint: "Este objeto toca sons perto da orelha. De onde viriam esses sons há 500 anos?" },
      },
      {
        id: "ampulheta", label: "Ampulheta", room: "arquivo", position: { x: -0.6, z: -0.2 }, kind: "suspect",
        suspect: { anachronism: false, year: 1500, era: "c. 1500", verdict: "É desta época! A ampulheta media o tempo com areia escorrendo. Nos navios, ajudava a marcar os turnos de trabalho e a estimar quanto o navio tinha andado.", hint: "Observe como ela funciona: só areia passando de um lado para o outro. Precisa de algo moderno para isso?" },
      },
      { id: "restore", label: "Mesa de navegação", room: "arquivo", position: { x: 2.5, z: 1.5 }, kind: "solution" },
      { id: "exit", label: "Voltar ao convés", room: "arquivo", position: { x: -3.7, z: 3.4 }, kind: "door", destination: "exterior" },
    ],
    requiredClues: ["gps", "bussola", "mapa", "astrolabio"],
    questions: [
      {
        id: "direcao", label: "Qual instrumento mostra a direção do norte?", correct: "bussola", evidence: "bussola",
        options: [{ id: "mapa", label: "Mapa" }, { id: "bussola", label: "Bússola" }, { id: "astrolabio", label: "Astrolábio" }],
        hint: "Procure no caderno a pista que fala de uma agulha.",
        explanation: "A agulha magnética da bússola aponta para o norte e ajuda a manter a direção.",
      },
      {
        id: "trajeto", label: "Qual instrumento ajuda a planejar o caminho do navio?", correct: "mapa", evidence: "mapa",
        options: [{ id: "astrolabio", label: "Astrolábio" }, { id: "bussola", label: "Bússola" }, { id: "mapa", label: "Mapa" }],
        hint: "Qual pista fala da costa, de ilhas e de pontos de referência?",
        explanation: "A carta de navegação mostra pontos de referência e ajuda a planejar o caminho.",
      },
      {
        id: "latitude", label: "Qual instrumento usa o Sol ou as estrelas para descobrir a latitude?", correct: "astrolabio", evidence: "astrolabio",
        options: [{ id: "bussola", label: "Bússola" }, { id: "astrolabio", label: "Astrolábio náutico" }, { id: "mapa", label: "Mapa" }],
        hint: "Qual pista fala de medir a altura de um astro acima do horizonte?",
        explanation: "O astrolábio media a altura do Sol ou de uma estrela. Isso ajudava a descobrir a latitude, mas não a posição completa.",
      },
    ],
    hints: [
      "Fale com o navegador e examine a bússola aqui no convés.",
      "Os objetos com ? podem não ser de 1500. Clique neles e decida: é desta época ou não?",
      "Entre na cabine, examine o mapa e o astrolábio e procure mais objetos com ?.",
      "Com as pistas e os objetos fora de época encontrados, use a mesa de navegação. O caderno mostra para que serve cada instrumento.",
    ],
    facts: [
      "Os navegadores usavam vários instrumentos juntos, porque cada um ajudava com uma coisa.",
      "A bússola mostra a direção. A carta de navegação ajuda a planejar o caminho.",
      "O astrolábio náutico ajudava a descobrir a latitude observando o Sol ou as estrelas. Ele não dava a posição completa, como um GPS.",
      "A longitude (leste ou oeste) era muito difícil de medir no mar. Isso só ficou mais fácil séculos depois.",
    ],
    fiction: "O navio, os personagens, o mapa e o GPS perdido no tempo foram inventados. A navegação foi simplificada para mostrar a função de cada instrumento, sem imitar uma viagem real.",
    glossary: [
      anomalia,
      { term: "tripulação", forms: ["tripulação"], text: "Todas as pessoas que trabalham num navio." },
      { term: "convés", forms: ["convés"], text: "O “chão” da parte de cima do navio, ao ar livre." },
      { term: "magnética", forms: ["magnética"], text: "Que funciona como um ímã. A agulha magnética da bússola se vira para o norte." },
      { term: "pontos cardeais", forms: ["pontos cardeais"], text: "As quatro direções principais: norte, sul, leste e oeste." },
      { term: "carta de navegação", forms: ["carta de navegação"], text: "Mapa feito para quem navega, com a costa, ilhas e outros pontos de referência." },
      { term: "astrolábio náutico", forms: ["astrolábio náutico"], text: "Instrumento de metal em forma de roda, usado para medir a altura do Sol ou de uma estrela no céu." },
      { term: "horizonte", forms: ["horizonte"], text: "A linha onde o céu parece encontrar o mar ou a terra." },
      { term: "latitude", forms: ["latitude"], text: "Mostra o quanto um lugar está ao norte ou ao sul da linha do Equador." },
      { term: "longitude", forms: ["longitude"], text: "Mostra o quanto um lugar está a leste ou a oeste. Em 1500, era muito difícil medi-la no mar." },
      { term: "Equador", forms: ["Equador"], text: "Linha imaginária que divide a Terra em metade norte e metade sul. Lá a latitude é 0°." },
      { term: "equinócio", forms: ["equinócio"], text: "Dia do ano em que o dia e a noite têm quase a mesma duração. Acontece duas vezes por ano." },
    ],
    sources: [{ title: "Royal Museums Greenwich · What is a mariner’s astrolabe?", url: "https://www.rmg.co.uk/stories/space-astronomy/what-mariners-astrolabe", description: "Uso do astrolábio náutico e determinação da latitude por observação astronômica." }],
  },
};

export const missionList = Object.values(missions);
