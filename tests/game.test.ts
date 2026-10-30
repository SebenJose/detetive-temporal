import { test } from "node:test";
import assert from "node:assert/strict";
import { missions } from "../src/content/missions.ts";
import { anachronisms, canSolve, evaluateAnswers, gameReducer, initialState, parseSave, suspects } from "../src/game/state.ts";
import { formatYear, withinLast, yearsAgo } from "../src/game/time.ts";
import { checkTablet, directionOf, isAimed, latitudeFromSun } from "../src/game/activities.ts";
import { challenge, scoreChallenge, SKILLS } from "../src/content/challenge.ts";
import { splitGlossary } from "../src/game/glossary.ts";
import { distance, INTERACTION_DISTANCE, isWalkable, movePlayer, PLAYER_START, ROOM_START } from "../src/game/movement.ts";
import type { GameState, MissionId } from "../src/game/types.ts";

function collectAll(state: GameState, mission: MissionId) {
  let next = gameReducer(state, { type: "START", mission });
  for (const clue of missions[mission].requiredClues) next = gameReducer(next, { type: "COLLECT", mission, clue });
  for (const point of anachronisms(missions[mission])) next = gameReducer(next, { type: "JUDGE", mission, suspect: point.id, anachronism: true });
  return next;
}

for (const mission of Object.values(missions)) {
  test(`${mission.id}: só permite resolver depois de apresentar todas as pistas`, () => {
    const initial = gameReducer(initialState(), { type: "START", mission: mission.id });
    const answers = Object.fromEntries(mission.questions.map((question) => [question.id, { option: question.correct, evidence: question.evidence }]));
    assert.equal(canSolve(mission, initial.missions[mission.id]), false);
    assert.deepEqual(gameReducer(initial, { type: "ATTEMPT", answers }), initial);
    const collected = collectAll(initial, mission.id);
    assert.equal(canSolve(mission, collected.missions[mission.id]), true);
    const completed = gameReducer(collected, { type: "ATTEMPT", answers });
    assert.equal(completed.missions[mission.id].completed, true);
    assert.equal(completed.missions[mission.id].attempts, 1);
    assert.deepEqual(gameReducer(completed, { type: "ATTEMPT", answers }), completed);
  });

  test(`${mission.id}: respostas erradas permitem nova tentativa e mantêm as evidências`, () => {
    const initial = collectAll(initialState(), mission.id);
    const incorrect = gameReducer(initial, { type: "ATTEMPT", answers: {} });
    assert.equal(incorrect.missions[mission.id].completed, false);
    assert.equal(incorrect.missions[mission.id].attempts, 1);
    assert.deepEqual(incorrect.missions[mission.id].clues, initial.missions[mission.id].clues);
    assert.ok(evaluateAnswers(mission, {}).every((answer) => !answer.correct && answer.hint.length > 0));
    const answers = Object.fromEntries(mission.questions.map((question) => [question.id, { option: question.correct, evidence: question.evidence }]));
    const corrected = gameReducer(incorrect, { type: "ATTEMPT", answers });
    assert.equal(corrected.missions[mission.id].completed, true);
    assert.equal(corrected.missions[mission.id].attempts, 2);
  });

  test(`${mission.id}: todas as perguntas possuem resposta válida e explicação`, () => {
    for (const question of mission.questions) {
      assert.equal(question.options.filter((option) => option.id === question.correct).length, 1);
      assert.ok(question.explanation.length > 0 && question.hint.length > 0);
      assert.ok(mission.requiredClues.includes(question.evidence), `${question.id}: a evidência precisa ser uma pista obrigatória`);
    }
    for (const clue of mission.requiredClues) assert.ok(mission.points.some((point) => point.clue?.id === clue && point.lines?.length));
  });

  test(`${mission.id}: acertar a resposta sem a pista que a justifica não resolve o caso`, () => {
    const collected = collectAll(initialState(), mission.id);
    const wrongEvidence = Object.fromEntries(mission.questions.map((question) => [question.id, { option: question.correct, evidence: mission.requiredClues.find((clue) => clue !== question.evidence) }]));
    assert.ok(evaluateAnswers(mission, wrongEvidence).every((answer) => answer.option && !answer.evidence && !answer.correct));
    assert.equal(gameReducer(collected, { type: "ATTEMPT", answers: wrongEvidence }).missions[mission.id].completed, false);
  });

  test(`${mission.id}: termos do glossário aparecem em algum texto do caso`, () => {
    const texts = [mission.intro, ...mission.facts, ...mission.points.flatMap((point) => [...(point.lines ?? []), point.clue?.text ?? "", point.activity?.hint ?? "", point.activity?.type === "astrolabe" ? `${point.activity.success} ${point.activity.note}` : ""])].join(" ");
    for (const entry of mission.glossary) assert.ok(entry.forms.some((form) => texts.includes(form)), `${entry.term} não é usado`);
  });
}

test("objetos suspeitos: só o julgamento correto conta, uma vez, e é exigido para resolver", () => {
  let state = gameReducer(initialState(), { type: "START", mission: "egito" });
  for (const clue of missions.egito.requiredClues) state = gameReducer(state, { type: "COLLECT", mission: "egito", clue });
  assert.equal(canSolve(missions.egito, state.missions.egito), false);
  assert.deepEqual(gameReducer(state, { type: "JUDGE", mission: "egito", suspect: "lata", anachronism: false }), state);
  assert.deepEqual(gameReducer(state, { type: "JUDGE", mission: "egito", suspect: "inventado", anachronism: true }), state);
  const judged = gameReducer(state, { type: "JUDGE", mission: "egito", suspect: "lata", anachronism: true });
  assert.deepEqual(judged.missions.egito.judged, ["lata"]);
  assert.deepEqual(gameReducer(judged, { type: "JUDGE", mission: "egito", suspect: "lata", anachronism: true }), judged);
  assert.equal(gameReducer(judged, { type: "JUDGE", mission: "egito", suspect: "jarro", anachronism: false }).missions.egito.judged.length, 2);
});

for (const mission of Object.values(missions)) {
  test(`${mission.id}: objetos suspeitos têm explicação, dica e data coerente`, () => {
    assert.ok(anachronisms(mission).length >= 3);
    assert.ok(suspects(mission).some((point) => !point.suspect.anachronism));
    for (const { suspect } of suspects(mission)) {
      assert.ok(suspect.verdict.length > 0 && suspect.hint.length > 0 && suspect.era.length > 0);
      if (suspect.anachronism) assert.ok(suspect.year > mission.year + 300);
      else assert.equal(suspect.year, mission.year);
    }
  });
}

test("salvamento antigo, sem a lista de objetos julgados, ainda carrega", () => {
  const state = collectAll(initialState(), "egito");
  const legacy = JSON.parse(JSON.stringify(state));
  delete legacy.missions.egito.judged;
  assert.deepEqual(parseSave(JSON.stringify(legacy))?.missions.egito.judged, []);
});

test("coletar pistas repetidas ou desconhecidas não altera o progresso", () => {
  const state = gameReducer(initialState(), { type: "COLLECT", mission: "egito", clue: "escrita" });
  assert.deepEqual(gameReducer(state, { type: "COLLECT", mission: "egito", clue: "escrita" }), state);
  assert.deepEqual(gameReducer(state, { type: "COLLECT", mission: "egito", clue: "inventada" }), state);
});

test("trocar de ambiente e de caso mantém as pistas; reiniciar um caso preserva o outro", () => {
  let state = collectAll(initialState(), "egito");
  state = gameReducer(state, { type: "MOVE_ROOM", room: "arquivo" });
  state = collectAll(state, "navegacao");
  state = gameReducer(state, { type: "START", mission: "egito" });
  assert.equal(state.missions.egito.room, "arquivo");
  assert.equal(state.missions.egito.clues.length, 3);
  const reset = gameReducer(state, { type: "RESET", mission: "egito" });
  assert.equal(reset.missions.egito.clues.length, 0);
  assert.deepEqual(reset.missions.navegacao, state.missions.navegacao);
});

test("o formato de salvamento preserva a partida após recarregar", () => {
  const state = gameReducer(collectAll(initialState(), "egito"), { type: "MOVE_ROOM", room: "arquivo" });
  assert.deepEqual(parseSave(JSON.stringify(state)), state);
});

test("salvamentos corrompidos ou de versões incompatíveis são rejeitados", () => {
  for (const raw of [null, "", "{invalido", "null", "[]", '{"version":2}', JSON.stringify({ ...initialState(), activeMission: "outro" })]) assert.equal(parseSave(raw), null);
  const state = initialState();
  state.missions.egito.attempts = -1;
  assert.equal(parseSave(JSON.stringify(state)), null);
});

test("um salvamento não pode concluir um caso sem as evidências conhecidas", () => {
  const state = initialState();
  state.missions.egito.clues = ["escrita", "escrita", "inventada"];
  state.missions.egito.completed = true;
  const parsed = parseSave(JSON.stringify(state));
  assert.deepEqual(parsed?.missions.egito.clues, ["escrita"]);
  assert.equal(parsed?.missions.egito.completed, false);
});

test("movimento respeita os limites do cenário e o obstáculo da pirâmide", () => {
  assert.equal(isWalkable({ x: -2, z: -2 }, "egito", "exterior"), false);
  assert.equal(isWalkable({ x: 5, z: 0 }, "egito", "arquivo"), false);
  let position = { x: 0, z: 0 };
  for (let frame = 0; frame < 1000; frame++) position = movePlayer(position, { x: -1, z: -1 }, 1 / 60, "egito", "exterior");
  assert.ok(isWalkable(position, "egito", "exterior"));
});

test("velocidade diagonal é normalizada e pausas longas não teletransportam o personagem", () => {
  const axial = movePlayer({ x: 0, z: 0 }, { x: 1, z: 0 }, 1 / 60, "egito", "arquivo");
  const diagonal = movePlayer({ x: 0, z: 0 }, { x: 1, z: 1 }, 1 / 60, "egito", "arquivo");
  assert.ok(Math.abs(Math.hypot(axial.x, axial.z) - Math.hypot(diagonal.x, diagonal.z)) < 0.0001);
  const afterPause = movePlayer({ x: 0, z: 0 }, { x: 1, z: 0 }, 30, "egito", "arquivo");
  assert.ok(afterPause.x <= 0.1751);
});

test("os pontos de partida são livres e todo ponto de interesse pode ser alcançado", () => {
  for (const mission of Object.values(missions)) {
    assert.ok(isWalkable(PLAYER_START, mission.id, "exterior"));
    assert.ok(isWalkable(ROOM_START, mission.id, "arquivo"));
    for (const point of mission.points) {
      const reachable = Array.from({ length: 24 }, (_, i) => i / 24 * Math.PI * 2).some((angle) => {
        const spot = { x: point.position.x + Math.cos(angle) * 1.0, z: point.position.z + Math.sin(angle) * 1.0 };
        return isWalkable(spot, mission.id, point.room) && distance(spot, point.position) < INTERACTION_DISTANCE;
      });
      assert.ok(reachable, `${mission.id}/${point.id} precisa ter um lugar livre ao redor`);
    }
  }
});

test("personagens e objetos são sólidos, mas portas podem ser atravessadas", () => {
  assert.equal(isWalkable(missions.egito.points.find((point) => point.id === "mummy")!.position, "egito", "exterior"), false);
  assert.equal(isWalkable(missions.egito.points.find((point) => point.id === "entry")!.position, "egito", "exterior"), true);
});

test("glossário marca só a primeira ocorrência de cada termo, sem pegar pedaços de palavras", () => {
  const parts = splitGlossary("A escriba e as escribas. Inscrições? Uma inscrição.", missions.egito.glossary);
  const terms = parts.filter((part) => typeof part !== "string").map((part) => (part as { text: string }).text);
  assert.deepEqual(terms, ["escriba", "Inscrições"]);
  assert.equal(parts.map((part) => typeof part === "string" ? part : part.text).join(""), "A escriba e as escribas. Inscrições? Uma inscrição.");
  assert.deepEqual(splitGlossary("descrição", missions.egito.glossary), ["descrição"]);
});

test("datas são ditas de um jeito que crianças entendem", () => {
  assert.equal(formatYear(-2500), "2.500 a.C.");
  assert.equal(formatYear(1500), "1500");
  assert.equal(yearsAgo(-2500, 2026), 4500);
  assert.equal(yearsAgo(1500, 2026), 500);
  assert.equal(withinLast([1870, 1960, 1972], 2026), 200);
});

test("atividades: a placa confere a contagem e o astrolábio leva à direção certa", () => {
  for (const mission of Object.values(missions)) for (const point of mission.points.filter((item) => item.activity)) {
    assert.ok(point.clue && mission.requiredClues.includes(point.clue.id), `${point.id}: a atividade precisa liberar uma pista obrigatória`);
    const activity = point.activity!;
    if (activity.type === "tablet") {
      const right = Object.fromEntries(activity.rows.map((row) => [row.id, row.count]));
      assert.ok(checkTablet(activity, right));
      assert.ok(!checkTablet(activity, { ...right, pao: right.pao + 1 }));
      for (const row of activity.rows) assert.ok(point.clue!.text.includes(`${row.count} ${row.label.toLowerCase()}`), `a pista deve citar ${row.count} ${row.label}`);
    } else {
      assert.equal(directionOf(activity), activity.answer);
      assert.ok(activity.days.every((height) => height > 0 && height < 90));
    }
  }
  assert.equal(latitudeFromSun(60), 30);
  assert.ok(isAimed(58, 60) && !isAimed(57, 60));
});

test("teste de conhecimento: antes e depois de cada caso avaliam as mesmas habilidades, com perguntas novas", () => {
  const labels = Object.values(challenge).flatMap((tests) => [...tests.antes, ...tests.depois].map((question) => question.label));
  assert.equal(new Set(labels).size, labels.length, "nenhuma pergunta se repete entre casos ou etapas");
  for (const mission of Object.values(missions)) {
    const tests = challenge[mission.id];
    assert.deepEqual(tests.antes.map((question) => question.skill), tests.depois.map((question) => question.skill));
    for (const question of [...tests.antes, ...tests.depois]) {
      assert.ok(SKILLS[question.skill]);
      assert.equal(question.options.filter((option) => option.id === question.correct).length, 1);
      assert.ok(mission.questions.every((item) => item.label !== question.label), "não repete as perguntas do restaurador");
    }
    for (const stage of [tests.antes, tests.depois]) {
      const positions = stage.map((question) => question.options.findIndex((option) => option.id === question.correct));
      assert.ok(new Set(positions).size >= 3, `a resposta certa muda de posição (${mission.id}: ${positions})`);
    }
    assert.equal(scoreChallenge(tests.antes, Object.fromEntries(tests.antes.map((question, index) => [index, question.correct]))), tests.antes.length);
    assert.equal(scoreChallenge(tests.depois, {}), 0);
  }
});
