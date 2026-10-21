import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialLogicReactorSession,
  logicReactorSessionReducer as reduce,
} from "../../src/brain-boost/logicReactorSession.ts";

function start() {
  return reduce(createInitialLogicReactorSession(), { type: "START" });
}

function answer(
  state: ReturnType<typeof start>,
  correct: boolean,
) {
  return reduce(state, {
    type: "ANSWER",
    choiceId: correct ? "right" : "wrong",
    correctChoiceId: "right",
  });
}

test("una respuesta correcta puntúa y una respuesta duplicada no altera el estado", () => {
  const initial = start();
  const first = answer(initial, true);

  assert.equal(first.score, 100);
  assert.equal(first.streak, 1);
  assert.equal(first.correctCount, 1);
  assert.equal(first.feedback?.correct, true);

  const duplicate = reduce(first, {
    type: "ANSWER",
    choiceId: "wrong",
    correctChoiceId: "right",
  });

  assert.strictEqual(duplicate, first);
  assert.equal(duplicate.score, 100);
  assert.equal(duplicate.correctCount, 1);
});

test("la puntuación de racha es correcta y un error rompe la racha", () => {
  let state = start();

  state = answer(state, true);
  state = reduce(state, { type: "ADVANCE", roundsInRun: 5 });
  state = answer(state, true);

  assert.equal(state.score, 215);
  assert.equal(state.streak, 2);
  assert.equal(state.correctCount, 2);

  state = reduce(state, { type: "ADVANCE", roundsInRun: 5 });
  state = answer(state, false);

  assert.equal(state.score, 215);
  assert.equal(state.streak, 0);
  assert.equal(state.correctCount, 2);
});

test("las pistas se limitan a dos y se reinician al cambiar de desafío", () => {
  let state = start();

  state = reduce(state, { type: "REVEAL_HINT" });
  state = reduce(state, { type: "REVEAL_HINT" });

  assert.equal(state.hintsUsed, 2);

  const exhausted = reduce(state, { type: "REVEAL_HINT" });
  assert.strictEqual(exhausted, state);

  state = answer(state, true);
  const answered = reduce(state, { type: "REVEAL_HINT" });
  assert.strictEqual(answered, state);

  state = reduce(state, { type: "ADVANCE", roundsInRun: 5 });

  assert.equal(state.round, 1);
  assert.equal(state.hintsUsed, 0);
  assert.equal(state.selectedChoiceId, null);
  assert.equal(state.feedback, null);
  assert.equal(state.phase, "playing");
});

test("la misión termina en la ronda correcta y no avanza después de resultados", () => {
  let state = start();

  for (let i = 0; i < 4; i++) {
    state = answer(state, false);
    state = reduce(state, { type: "ADVANCE", roundsInRun: 5 });
  }

  assert.equal(state.round, 4);
  assert.equal(state.phase, "playing");

  state = answer(state, false);
  state = reduce(state, { type: "ADVANCE", roundsInRun: 5 });

  assert.equal(state.round, 4);
  assert.equal(state.phase, "results");

  const completed = reduce(state, { type: "ADVANCE", roundsInRun: 5 });
  assert.strictEqual(completed, state);
});

test("el inicio de una misión nueva limpia el estado de la anterior", () => {
  let state = start();
  state = answer(state, true);
  state = reduce(state, { type: "REVEAL_HINT" });

  state = reduce(state, { type: "START" });

  assert.equal(state.phase, "playing");
  assert.equal(state.round, 0);
  assert.equal(state.score, 0);
  assert.equal(state.streak, 0);
  assert.equal(state.correctCount, 0);
  assert.equal(state.hintsUsed, 0);
  assert.equal(state.feedback, null);
  assert.equal(state.selectedChoiceId, null);
});
