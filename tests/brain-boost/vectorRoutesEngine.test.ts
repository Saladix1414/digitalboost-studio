import assert from "node:assert/strict";
import test from "node:test";

import {
  generateVectorRoutesChallenge,
  isVectorRouteValid,
} from "../../src/brain-boost/vectorRoutesEngine.ts";

function findValidPaths(
  challenge: ReturnType<typeof generateVectorRoutesChallenge>,
): string[][] {
  const results: string[][] = [];

  function visit(path: string[]) {
    if (path.length - 1 > challenge.maxMoves) return;

    const current = path[path.length - 1];

    if (current === challenge.portalNodeId) {
      if (isVectorRouteValid(challenge, path)) results.push(path);
      return;
    }

    for (const edge of challenge.edges) {
      if (
        edge.from === current &&
        !path.includes(edge.to)
      ) {
        visit([...path, edge.to]);
      }
    }
  }

  visit([challenge.sourceNodeId]);
  return results;
}

test("Vector Routes genera rutas deterministas en los 99 niveles", () => {
  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 17, 271, 999]) {
      const challenge = generateVectorRoutesChallenge(level, seed);

      assert.deepEqual(
        challenge,
        generateVectorRoutesChallenge(level, seed),
      );

      assert.equal(challenge.level, level);
      assert.ok(challenge.nodes.length >= 9);
      assert.ok(challenge.edges.length >= 12);
      assert.ok(challenge.checkpointIds.length >= 1);
      assert.ok(challenge.checkpointIds.length <= 3);

      assert.equal(
        new Set(challenge.nodes.map((node) => node.id)).size,
        challenge.nodes.length,
      );

      assert.ok(
        challenge.nodes.some((node) => node.id === challenge.sourceNodeId),
      );
      assert.ok(
        challenge.nodes.some((node) => node.id === challenge.portalNodeId),
      );

      const expectedCheckpoints =
        level <= 10 ? 1 :
        level <= 30 ? 2 :
        3;

      assert.equal(challenge.checkpointIds.length, expectedCheckpoints);

      assert.equal(
        challenge.nodes.some((node) => node.kind === "hazard"),
        level > 20,
      );

      for (const edge of challenge.edges) {
        assert.ok(challenge.nodes.some((node) => node.id === edge.from));
        assert.ok(challenge.nodes.some((node) => node.id === edge.to));
      }

      const validPaths = findValidPaths(challenge);
      assert.equal(
        validPaths.length,
        1,
        `Debe existir una única ruta válida en nivel ${level}, semilla ${seed}`,
      );

      assert.ok(isVectorRouteValid(challenge, validPaths[0]));
    }
  }
});

test("Vector Routes rechaza rutas incompletas, saltos y callejones sin salida", () => {
  for (const seed of [1, 7, 41, 103]) {
    const challenge = generateVectorRoutesChallenge(50, seed);
    const solution = findValidPaths(challenge)[0];

    assert.equal(isVectorRouteValid(challenge, []), false);
    assert.equal(isVectorRouteValid(challenge, [challenge.sourceNodeId]), false);
    assert.equal(
      isVectorRouteValid(challenge, [
        challenge.sourceNodeId,
        challenge.portalNodeId,
      ]),
      false,
    );
    assert.equal(
      isVectorRouteValid(challenge, [...solution, solution[1]]),
      false,
    );

    const hazard = challenge.nodes.find((node) => node.kind === "hazard");
    assert.ok(hazard);

    const hazardPath = [
      challenge.sourceNodeId,
      "a",
      "c",
      hazard.id,
    ];

    assert.equal(isVectorRouteValid(challenge, hazardPath), false);
  }
});

test("Vector Routes normaliza niveles y semillas no finitas", () => {
  assert.equal(generateVectorRoutesChallenge(0, 1).level, 1);
  assert.equal(generateVectorRoutesChallenge(1000, 1).level, 99);
  assert.equal(generateVectorRoutesChallenge(Number.NaN, 1).level, 1);

  assert.deepEqual(
    generateVectorRoutesChallenge(20, Number.NaN),
    generateVectorRoutesChallenge(20, 1),
  );
});
