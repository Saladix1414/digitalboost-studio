import assert from "node:assert/strict";
import test from "node:test";

import {
  generateFocusChallenge,
} from "../../src/brain-boost/focusProtocolEngine.ts";

test("Focus Protocol genera desafíos deterministas en los 99 niveles", () => {
  let tested = 0;

  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 7, 103, 999]) {
      const puzzle = generateFocusChallenge(level, seed);

      assert.deepEqual(puzzle, generateFocusChallenge(level, seed));
      assert.equal(puzzle.level, level);

      const expectedGridSize = level <= 10 ? 3 : level <= 30 ? 4 : 5;
      assert.equal(puzzle.gridSize, expectedGridSize);
      assert.equal(puzzle.tiles.length, expectedGridSize ** 2);
      assert.ok(puzzle.correctIndex >= 0);
      assert.ok(puzzle.correctIndex < puzzle.tiles.length);
      assert.equal(puzzle.tiles[puzzle.correctIndex], puzzle.target);

      // Solo existe un objetivo exacto; el resto son distractores.
      assert.equal(
        puzzle.tiles.filter((symbol) => symbol === puzzle.target).length,
        1,
      );

      tested++;
    }
  }

  assert.equal(tested, 396);
});

test("Focus Protocol limita los niveles y tolera entradas no finitas", () => {
  assert.equal(generateFocusChallenge(0, 1).level, 1);
  assert.equal(generateFocusChallenge(1000, 1).level, 99);
  assert.equal(generateFocusChallenge(Number.NaN, 1).level, 1);
  assert.deepEqual(
    generateFocusChallenge(1, 42),
    generateFocusChallenge(1, 42),
  );
});
