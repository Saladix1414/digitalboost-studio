import assert from "node:assert/strict";
import test from "node:test";
import { generateNumberPatternPuzzle } from "../../src/brain-boost/logicReactorEngine.ts";

test("Number Patterns genera secuencias numéricas correctas en los 99 niveles", () => {
  const seeds = [1, 7, 103, 999];
  let tested = 0;

  for (let level = 1; level <= 99; level++) {
    for (const seed of seeds) {
      const puzzle = generateNumberPatternPuzzle(level, seed);
      const repeated = generateNumberPatternPuzzle(level, seed);

      assert.deepEqual(puzzle, repeated);
      assert.equal(puzzle.kind, "number-pattern");
      assert.equal(puzzle.level, level);
      assert.ok(puzzle.sequence);
      assert.equal(puzzle.sequence.length, 6);
      assert.equal(puzzle.sequence[5], "?");
      assert.equal(puzzle.choices.length, 4);
      assert.equal(new Set(puzzle.choices.map(c => c.value)).size, 4);
      assert.equal(puzzle.hints.length, 2);

      const correct = puzzle.choices.find(
        c => c.id === puzzle.correctChoiceId,
      );
      assert.ok(correct, `Falta respuesta correcta: nivel ${level}`);

      const values = puzzle.sequence.slice(0, 5).map(Number);
      assert.ok(values.every(Number.isFinite));

      const differences = values.slice(1).map(
        (value, index) => value - values[index],
      );
      const variant = Math.floor((level - 1) / 3) % 4;
      let expected;

      if (variant === 0) {
        assert.ok(differences.every(d => d === differences[0]));
        expected = values[4] + differences[0];
      } else if (variant === 1) {
        assert.equal(differences[0], differences[2]);
        assert.equal(differences[1], differences[3]);
        expected = values[4] + differences[0];
      } else if (variant === 2) {
        let rule;

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

        assert.ok(rule, `Regla de cuadrados inválida: nivel ${level}`);
        expected = (rule.roots[4] + 1) ** 2 + rule.offset;
      } else {
        assert.equal(values[2], values[0] + values[1]);
        assert.equal(values[3], values[1] + values[2]);
        assert.equal(values[4], values[2] + values[3]);
        expected = values[4] + values[3];
      }

      assert.equal(
        Number(correct.value),
        expected,
        `Respuesta incorrecta: nivel ${level}, semilla ${seed}`,
      );

      tested++;
    }
  }

  assert.equal(tested, 396);
});
