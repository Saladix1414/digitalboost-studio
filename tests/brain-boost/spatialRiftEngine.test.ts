import assert from "node:assert/strict";
import test from "node:test";

import {
  generateSpatialPuzzle,
  isSpatialRouteConnected,
  isSpatialRouteTopologyValid,
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
        : level <= 25
          ? assert.equal(puzzle.rotationDeg % 45, 0)
          : level <= 50
            ? assert.equal(puzzle.rotationDeg % 30, 0)
            : level <= 75
              ? assert.equal(puzzle.rotationDeg % 15, 0)
              : assert.equal(puzzle.rotationDeg % 10, 0);
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

test("Spatial Rift aumenta la complejidad topológica por nivel", () => {
  for (let level = 11; level <= 99; level++) {
    for (const seed of [1, 17, 271, 999]) {
      const puzzle = generateSpatialPuzzle(level, seed);
      const { route } = puzzle;

      assert.ok(isSpatialRouteTopologyValid(route, puzzle.vertices.length));

      const expected = level <= 20
        ? { main: 3, alternate: 4, deadEnds: 1, additional: 0 }
        : level <= 30
          ? { main: 3, alternate: 4, deadEnds: 2, additional: 0 }
          : level <= 50
            ? { main: 4, alternate: 5, deadEnds: 1, additional: 0 }
            : level <= 70
              ? { main: 4, alternate: 5, deadEnds: 2, additional: 0 }
              : { main: 4, alternate: 5, deadEnds: 2, additional: 1 };

      assert.equal(route.pathVertexIndices.length, expected.main);
      assert.equal(route.alternatePathVertexIndices.length, expected.alternate);
      assert.equal(route.deadEndVertexIndices.length, expected.deadEnds);
      assert.equal(route.additionalPathVertexIndices.length, expected.additional);

      assert.equal(route.pathVertexIndices[0], route.sourceVertexIndex);
      assert.equal(route.pathVertexIndices.at(-1), route.exitVertexIndex);
      assert.equal(
        route.alternatePathVertexIndices[0],
        route.sourceVertexIndex,
      );
      assert.equal(
        route.alternatePathVertexIndices.at(-1),
        route.exitVertexIndex,
      );
      assert.notDeepEqual(
        route.pathVertexIndices,
        route.alternatePathVertexIndices,
      );

      const hasEdge = (from: number, to: number) =>
        route.edges.some(
          (edge) =>
            (edge.fromVertexIndex === from && edge.toVertexIndex === to) ||
            (edge.fromVertexIndex === to && edge.toVertexIndex === from),
        );

      for (const path of [
        route.pathVertexIndices,
        route.alternatePathVertexIndices,
        ...route.additionalPathVertexIndices,
      ]) {
        for (let index = 1; index < path.length; index++) {
          assert.ok(hasEdge(path[index - 1], path[index]));
        }
      }

      assert.ok(route.deadEndVertexIndices.length > 0);
      for (const deadEnd of route.deadEndVertexIndices) {
        assert.equal(
          route.edges.filter(
            (edge) =>
              edge.fromVertexIndex === deadEnd ||
              edge.toVertexIndex === deadEnd,
          ).length,
          1,
        );
      }

      const target = transformSpatialVertices(
        puzzle.vertices,
        puzzle.rotationDeg,
        false,
      );
      const routeVertices = new Set(
        route.edges.flatMap((edge) => [
          edge.fromVertexIndex,
          edge.toVertexIndex,
        ]),
      );

      for (const choice of puzzle.choices) {
        const transformed = transformSpatialVertices(
          puzzle.vertices,
          choice.rotationDeg,
          choice.mirrored,
        );
        const aligned = [...routeVertices].every(
          (index) =>
            Math.hypot(
              transformed[index].x - target[index].x,
              transformed[index].y - target[index].y,
            ) < 1e-9,
        );

        assert.equal(aligned, choice.id === puzzle.correctChoiceId);
        assert.equal(isSpatialRouteConnected(puzzle, choice), aligned);
      }
    }
  }
});

test("Spatial Rift varía el trazado por semilla y mantiene su topología", () => {
  for (const level of [11, 25, 40, 60, 80]) {
    const signatures = new Set<string>();

    for (let seed = 1; seed <= 24; seed++) {
      const puzzle = generateSpatialPuzzle(level, seed);
      const { route } = puzzle;

      assert.ok(
        isSpatialRouteTopologyValid(route, puzzle.vertices.length),
        `Topología inválida en nivel ${level}, semilla ${seed}.`,
      );

      const signature = route.edges
        .map(({ fromVertexIndex, toVertexIndex }) => {
          const a = Math.min(fromVertexIndex, toVertexIndex);
          const b = Math.max(fromVertexIndex, toVertexIndex);
          return `${a}:${b}`;
        })
        .sort()
        .join("|");

      signatures.add(signature);
      assert.deepEqual(puzzle, generateSpatialPuzzle(level, seed));
    }

    assert.ok(
      signatures.size >= 4,
      `Poca variación topológica en nivel ${level}: ${signatures.size} trazados.`,
    );
  }
});

test("Rift Routes rechaza redes desconectadas y callejones mal definidos", () => {
  const puzzle = generateSpatialPuzzle(11, 17);
  const correct = puzzle.choices.find(
    (choice) => choice.id === puzzle.correctChoiceId,
  );
  assert.ok(correct);

  const brokenFrom = puzzle.route.pathVertexIndices[0];
  const brokenTo = puzzle.route.pathVertexIndices[1];

  const disconnectedRoute = {
    ...puzzle.route,
    edges: puzzle.route.edges.filter(
      (edge) => !(
        (edge.fromVertexIndex === brokenFrom &&
          edge.toVertexIndex === brokenTo) ||
        (edge.fromVertexIndex === brokenTo &&
          edge.toVertexIndex === brokenFrom)
      ),
    ),
  };

  assert.equal(
    isSpatialRouteTopologyValid(disconnectedRoute, puzzle.vertices.length),
    false,
  );
  assert.equal(
    isSpatialRouteConnected(
      { ...puzzle, route: disconnectedRoute },
      correct,
    ),
    false,
  );

  const invalidAdditionalPathRoute = {
    ...puzzle.route,
    additionalPathVertexIndices: [[
      puzzle.route.sourceVertexIndex,
      puzzle.vertices.length + 1,
      puzzle.route.exitVertexIndex,
    ]],
  };

  assert.equal(
    isSpatialRouteTopologyValid(
      invalidAdditionalPathRoute,
      puzzle.vertices.length,
    ),
    false,
  );

  const invalidDeadEndRoute = {
    ...puzzle.route,
    deadEndVertexIndices: [5],
  };
  assert.equal(
    isSpatialRouteTopologyValid(invalidDeadEndRoute, puzzle.vertices.length),
    false,
  );
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
