import assert from "node:assert/strict";
import test from "node:test";

import {
  generateSpatialPuzzle,
  isSpatialRouteConnected,
  transformSpatialVertices,
} from "../../src/brain-boost/spatialRiftEngine.ts";

test("Spatial Rift genera desafíos deterministas hasta el nivel 99", () => {
  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 17, 271, 999]) {
      const puzzle = generateSpatialPuzzle(level, seed);

      assert.deepEqual(puzzle, generateSpatialPuzzle(level, seed));
      assert.equal(puzzle.level, level);
      assert.ok(puzzle.vertices.length >= 6);
      assert.equal(puzzle.choices.length, 4);
      assert.equal(new Set(puzzle.choices.map(c => c.id)).size, 4);
      assert.equal(new Set(puzzle.choices.map(c =>
        `${c.rotationDeg}:${c.mirrored}`,
      )).size, 4);
      assert.equal(puzzle.hints.length, 2);

      const correct = puzzle.choices.find(
        choice => choice.id === puzzle.correctChoiceId,
      );

      assert.ok(correct);
      assert.equal(correct.rotationDeg, puzzle.rotationDeg);
      assert.equal(correct.mirrored, false);

      level <= 10
        ? assert.ok([90, 180, 270].includes(puzzle.rotationDeg))
        : level <= 30
          ? assert.equal(puzzle.rotationDeg % 45, 0)
          : assert.equal(puzzle.rotationDeg % 30, 0);
    }
  }
});

test("Rift Routes alinea el recorrido completo en una sola opción", () => {
  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 17, 271, 999]) {
      const puzzle = generateSpatialPuzzle(level, seed);

      assert.equal(
        puzzle.mode,
        level <= 10 ? "orientation" : "rift-route",
      );
      assert.ok(puzzle.route.pathVertexIndices.length >= 2);
      assert.equal(puzzle.route.pathVertexIndices[0], 0);
      assert.equal(
        puzzle.route.pathVertexIndices.at(-1),
        puzzle.route.exitVertexIndex,
      );

      const target = transformSpatialVertices(
        puzzle.vertices,
        puzzle.rotationDeg,
        false,
      );

      for (const choice of puzzle.choices) {
        const transformed = transformSpatialVertices(
          puzzle.vertices,
          choice.rotationDeg,
          choice.mirrored,
        );

        const aligned = puzzle.route.pathVertexIndices.every((index) =>
          Math.hypot(
            transformed[index].x - target[index].x,
            transformed[index].y - target[index].y,
          ) < 1e-9,
        );

        assert.equal(
          aligned,
          choice.id === puzzle.correctChoiceId,
          `Alineación inesperada en nivel ${level}, semilla ${seed}, opción ${choice.label}.`,
        );
        if (puzzle.mode === "rift-route") {
          assert.equal(isSpatialRouteConnected(puzzle, choice), aligned);
        }
      }
    }
  }
});

test("las transformaciones producen coordenadas válidas", () => {
  const point = [{ x: 1, y: 0 }];

  const rotated = transformSpatialVertices(point, 90, false);
  assert.ok(Math.abs(rotated[0].x) < 1e-10);
  assert.ok(Math.abs(rotated[0].y - 1) < 1e-10);

  const mirrored = transformSpatialVertices(point, 0, true);
  assert.deepEqual(mirrored, [{ x: -1, y: 0 }]);

  const combined = transformSpatialVertices(point, 90, true);
  assert.ok(Math.abs(combined[0].x) < 1e-10);
  assert.ok(Math.abs(combined[0].y + 1) < 1e-10);
});
