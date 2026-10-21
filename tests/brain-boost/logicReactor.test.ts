import assert from "node:assert/strict";
import test from "node:test";

import { generateLogicPuzzle } from "../../src/brain-boost/logicReactorEngine.ts";
import {
  MAX_LEVEL,
  getRoundsInRun,
  getUnlockedLevelAfterRun,
  normalizeCoreLevel,
  safeInteger,
} from "../../src/brain-boost/logicReactorProgress.ts";

test("396 desafíos son deterministas, completos y semánticamente correctos", () => {
  const seeds = [1, 7, 103, 999];
  const kinds = new Set<string>();
  let total = 0;

  for (let level = 1; level <= MAX_LEVEL; level++) {
    for (const seed of seeds) {
      const puzzle = generateLogicPuzzle(level, seed);
      assert.deepEqual(puzzle, generateLogicPuzzle(level, seed));

      assert.equal(puzzle.level, level);
      assert.ok(puzzle.title.trim());
      assert.ok(puzzle.prompt.trim());
      assert.ok(puzzle.explanation.trim());
      assert.equal(puzzle.choices.length, 4);
      assert.equal(new Set(puzzle.choices.map(c => c.id)).size, 4);
      assert.equal(new Set(puzzle.choices.map(c => c.value)).size, 4);
      assert.equal(puzzle.hints.length, 2);

      const correct = puzzle.choices.find(
        c => c.id === puzzle.correctChoiceId,
      );
      assert.ok(correct, `Falta la respuesta correcta en nivel ${level}`);

      kinds.add(puzzle.kind);

      if (puzzle.kind === "number-pattern") {
        assert.ok(puzzle.sequence);
        const values = puzzle.sequence.slice(0, 5).map(Number);
        assert.ok(values.every(Number.isFinite));

        const differences = values.slice(1).map(
          (value, index) => value - values[index],
        );
        const variant = Math.floor((level - 1) / 3) % 4;
        let expected: number;

        if (variant === 0) {
          assert.ok(differences.every(d => d === differences[0]));
          expected = values[4] + differences[0];
        } else if (variant === 1) {
          assert.equal(differences[0], differences[2]);
          assert.equal(differences[1], differences[3]);
          expected = values[4] + differences[0];
        } else if (variant === 2) {
          let rule: { offset: number; roots: number[] } | undefined;

          for (let offset = 0; offset <= 4; offset++) {
            const roots = values.map(v => Math.sqrt(v - offset));
            if (
              roots.every(Number.isInteger) &&
              roots.every((v, i) => v === roots[0] + i)
            ) {
              rule = { offset, roots };
              break;
            }
          }

          assert.ok(rule, `Regla de cuadrados incorrecta en nivel ${level}`);
          expected = (rule.roots[4] + 1) ** 2 + rule.offset;
        } else {
          assert.equal(values[2], values[0] + values[1]);
          assert.equal(values[3], values[1] + values[2]);
          assert.equal(values[4], values[2] + values[3]);
          expected = values[4] + values[3];
        }

        assert.equal(Number(correct.value), expected);
      } else if (puzzle.kind === "symbol-rule") {
        assert.ok(puzzle.sequence);
        const sequence = puzzle.sequence.slice(0, 5).map(
          item => item.split(" · "),
        );

        for (let i = 1; i < sequence.length; i++) {
          assert.deepEqual(
            sequence[i],
            [...sequence[i - 1].slice(1), sequence[i - 1][0]],
          );
        }

        const last = sequence[4];
        assert.equal(
          correct.value,
          [...last.slice(1), last[0]].join(" · "),
        );
      } else {
        assert.ok(puzzle.logicLines);
        const premise = puzzle.logicLines[puzzle.logicLines.length - 1];

        const expected = premise.endsWith("está activo.")
          ? "Activo"
          : premise.endsWith("está inactivo.")
            ? "Inactivo"
            : null;

        assert.ok(expected, `Premisa desconocida en nivel ${level}`);
        assert.equal(correct.value, expected);
      }

      total++;
    }
  }

  assert.equal(total, 396);
  assert.deepEqual(
    [...kinds].sort(),
    ["conditional-logic", "number-pattern", "symbol-rule"],
  );
});

test("normalización de niveles y datos persistidos", () => {
  assert.equal(MAX_LEVEL, 99);

  const cases: [unknown, number][] = [
    [0, 1],
    [1, 1],
    [2, 6],
    [5, 6],
    [6, 6],
    [7, 11],
    [11, 11],
    [91, 91],
    [95, 96],
    [96, 96],
    [99, 96],
    [1000, 96],
    [NaN, 1],
    ["invalid", 1],
  ];

  for (const [value, expected] of cases) {
    assert.equal(normalizeCoreLevel(value), expected);
  }

  assert.equal(safeInteger(Infinity, 4, 0, 10), 4);
  assert.equal(safeInteger(-5, 0, 0, 100), 0);
  assert.equal(safeInteger(12.9, 0, 0, 100), 12);
});

test("misiones y desbloqueo respetan los límites de nivel", () => {
  const runCases: [number, number][] = [
    [1, 5],
    [6, 5],
    [91, 5],
    [96, 4],
    [99, 4],
  ];

  for (const [level, expectedRounds] of runCases) {
    assert.equal(getRoundsInRun(level), expectedRounds);
  }

  const unlockCases: [number, number, number, number][] = [
    [1, 1, 3, 1],
    [1, 1, 4, 6],
    [6, 6, 4, 11],
    [91, 91, 4, 96],
    [96, 96, 4, 96],
    [6, 6, 3, 6],
  ];

  for (const [current, level, correct, expected] of unlockCases) {
    assert.equal(
      getUnlockedLevelAfterRun(current, level, correct),
      expected,
    );
  }
});
