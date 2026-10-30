# Detetive Temporal: Casos Fora de Época

Jogo educativo de investigação histórica para o navegador, feito para o 6º ano do Ensino Fundamental. O jogador viaja no tempo, conversa com personagens, reúne pistas e usa essas pistas para provar suas respostas e devolver à época certa os objetos que foram parar no lugar errado.

São dois casos: *A múmia sem sinal* (Egito Antigo, c. 2500 a.C.) e *Depois da próxima onda* (navegação oceânica, c. 1500). O jogo trabalha as habilidades EF06HI01 e EF06HI02 da BNCC.

## Como rodar

Requisitos: [Git](https://git-scm.com/) e [Node.js](https://nodejs.org/) 22.18 ou mais recente.

```bash
git clone https://github.com/SebenJose/detetive-temporal.git
cd detetive-temporal
npm ci
npm run dev
```

Depois, abra http://127.0.0.1:3000 no navegador. O cenário 3D precisa de WebGL2 (Chrome, Edge ou Firefox atualizados).

Para gerar a versão estática:

```bash
npm run build     # gera a pasta out/
npm run preview   # serve out/ em http://127.0.0.1:8080 (requer Python 3)
```

A pasta `out/` pode ser publicada em qualquer hospedagem de arquivos estáticos, mas precisa ser servida por HTTP.

Testes e checagem de tipos:

```bash
npm test
npm run typecheck
```

## Como jogar

| Ação | Mouse ou toque | Teclado |
| --- | --- | --- |
| Andar | clicar no chão | WASD ou setas |
| Conversar ou examinar | clicar na pessoa ou no objeto | E |
| Voltar uma fala | botão "Voltar" | Q |
| Caderno de pistas | botão do livro | N |
| Dica | botão "?" | H |
| Pausa | botão de pausa | Esc |

Em cada caso, o jogador faz um teste rápido antes de viajar, explora o cenário, identifica os objetos fora de época e responde às perguntas finais escolhendo a pista que prova cada resposta. Ao resolver o caso, faz o teste final e vê a comparação entre as duas notas. A página `/professores` traz objetivos, roteiro de aula e orientações para usar os resultados.

O progresso fica salvo apenas no navegador.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/content/` | Textos, pistas, perguntas e testes de cada caso |
| `src/game/` | Regras, movimento, glossário, sons e salvamento |
| `src/components/` | Cena 3D, personagens, diálogos e telas do jogo |
| `src/app/` | Páginas do site |
| `tests/` | Testes das regras e do conteúdo |
| `docs/` | Termo de abertura do projeto |

Para mudar textos ou perguntas, edite `src/content/missions.ts` e rode `npm test`.

## Autor

José Carlos Seben de Souza Leite, para a disciplina Informática na Educação (UTFPR). As fontes históricas usadas estão na página "Fontes e créditos" do jogo.
