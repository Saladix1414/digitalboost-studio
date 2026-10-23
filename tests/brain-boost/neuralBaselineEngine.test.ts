import test from "node:test";
import assert from "node:assert/strict";
import {
  generateNeuralBaselineChallenge,
  evaluateNeuralBaseline,
} from "../../src/brain-boost/neuralBaselineEngine.ts";

test("Neural Baseline genera secuencias deterministas en los 99 niveles", () => {
  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 17, 271, 999]) {
      const first = generateNeuralBaselineChallenge(level, seed);
      const second = generateNeuralBaselineChallenge(level, seed);

      assert.deepEqual(first, second);
      assert.equal(first.level, level);
      assert.equal(first.stimuli.length, 15);
      assert.equal(first.targetCount, 9);
      assert.equal(first.distractorCount, 6);
      assert.equal(first.stimuli.filter((item) => item.isTarget).length, 9);
      assert.equal(first.stimuli.filter((item) => !item.isTarget).length, 6);

      for (const stimulus of first.stimuli) {
        assert.equal(stimulus.isTarget, stimulus.glyph === first.targetGlyph);
        assert.ok(stimulus.displayMs >= 340);
        assert.ok(stimulus.responseWindowMs >= 350);
        assert.ok(stimulus.onsetDelayMs >= 500);
      }
    }
  }
});

test("la dificultad aumenta de forma acotada", () => {
  const easy = generateNeuralBaselineChallenge(1, 41);
  const hard = generateNeuralBaselineChallenge(99, 41);

  assert.ok(hard.stimuli[0].displayMs <= easy.stimuli[0].displayMs);
  assert.ok(hard.stimuli[0].responseWindowMs <= easy.stimuli[0].responseWindowMs);

  assert.equal(generateNeuralBaselineChallenge(0, 1).level, 1);
  assert.equal(generateNeuralBaselineChallenge(500, 1).level, 99);
  assert.equal(generateNeuralBaselineChallenge(Number.NaN, 1).level, 1);
  assert.equal(generateNeuralBaselineChallenge(1, Number.POSITIVE_INFINITY).seed, 1);
});

test("evalúa aciertos, rechazos, precisión, latencia y puntaje conocido", () => {
  const challenge = generateNeuralBaselineChallenge(1, 42);
  const responses = challenge.stimuli.map((stimulus) => ({
    reactionMs: stimulus.isTarget ? 500 : null,
  }));

  const result = evaluateNeuralBaseline(challenge, responses);

  assert.equal(result.hits, 9);
  assert.equal(result.omissions, 0);
  assert.equal(result.falseAlarms, 0);
  assert.equal(result.correctRejections, 6);
  assert.equal(result.accuracy, 100);
  assert.equal(result.meanReactionMs, 500);
  assert.equal(result.reactionConsistency, 100);
  assert.equal(result.score, 90);
});

test("distingue anticipaciones y respuestas tardías", () => {
  const challenge = generateNeuralBaselineChallenge(1, 43);
  const targetIndex = challenge.stimuli.findIndex((item) => item.isTarget);
  const responses = challenge.stimuli.map((stimulus) => ({
    reactionMs: stimulus.isTarget ? 500 : null,
  }));

  responses[targetIndex] = { reactionMs: 100 };
  const early = evaluateNeuralBaseline(challenge, responses);

  assert.equal(early.anticipations, 1);
  assert.equal(early.omissions, 1);
  assert.equal(early.hits, 8);

  responses[targetIndex] = {
    reactionMs: challenge.stimuli[targetIndex].responseWindowMs + 100,
  };
  const late = evaluateNeuralBaseline(challenge, responses);

  assert.equal(late.lateResponses, 1);
  assert.equal(late.omissions, 1);
  assert.equal(late.hits, 8);
});

test("registra falsas alarmas y maneja una sesión sin respuestas", () => {
  const challenge = generateNeuralBaselineChallenge(1, 44);
  const responses = challenge.stimuli.map((stimulus) => ({
    reactionMs: stimulus.isTarget ? 500 : null,
  }));
  const distractorIndex = challenge.stimuli.findIndex((item) => !item.isTarget);

  responses[distractorIndex] = { reactionMs: 300 };
  const withFalseAlarm = evaluateNeuralBaseline(challenge, responses);

  assert.equal(withFalseAlarm.falseAlarms, 1);
  assert.equal(withFalseAlarm.correctRejections, 5);
  assert.equal(withFalseAlarm.accuracy, 93);

  const noResponses = evaluateNeuralBaseline(
    challenge,
    challenge.stimuli.map(() => ({ reactionMs: null })),
  );

  assert.equal(noResponses.hits, 0);
  assert.equal(noResponses.omissions, 9);
  assert.equal(noResponses.correctRejections, 6);
  assert.equal(noResponses.meanReactionMs, null);
  assert.equal(noResponses.accuracy, 40);
  assert.equal(noResponses.score, 28);
});
