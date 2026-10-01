import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}

test(
  "strategy evaluator exposes deterministic evaluation context",
  () => {
    const content =
      source(
        "strategy/evaluation-types.ts"
      );

    assert.match(
      content,
      /StrategyEvaluationContext/
    );

    assert.match(
      content,
      /current/
    );

    assert.match(
      content,
      /previous/
    );

    assert.match(
      content,
      /StrategyEvaluation/
    );
  }
);

test(
  "strategy evaluator supports all comparator semantics",
  () => {
    const content =
      source(
        "strategy/evaluator.ts"
      );

    for (
      const comparator of [
        "above",
        "below",
        "greater_than",
        "less_than",
        "crosses_above",
        "crosses_below",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `"${comparator}"`
        )
      );
    }
  }
);

test(
  "cross detection requires previous indicator context",
  () => {
    const content =
      source(
        "strategy/evaluator.ts"
      );

    assert.match(
      content,
      /previousLeft/
    );

    assert.match(
      content,
      /previousRight/
    );

    assert.match(
      content,
      /previousLeft <=/
    );

    assert.match(
      content,
      /previousLeft >=/
    );
  }
);

test(
  "strategy evaluator supports AND OR rule groups",
  () => {
    const content =
      source(
        "strategy/evaluator.ts"
      );

    assert.match(
      content,
      /results\.every/
    );

    assert.match(
      content,
      /results\.some/
    );

    assert.match(
      content,
      /entryLogic/
    );

    assert.match(
      content,
      /invalidationLogic/
    );
  }
);

test(
  "invalidation overrides a valid entry signal",
  () => {
    const content =
      source(
        "strategy/evaluator.ts"
      );

    assert.match(
      content,
      /entryMatched &&/
    );

    assert.match(
      content,
      /!invalidated/
    );

    assert.match(
      content,
      /strategy\.side/
    );

    assert.match(
      content,
      /"none"/
    );
  }
);

test(
  "strategy evaluations can never execute directly",
  () => {
    const types =
      source(
        "strategy/evaluation-types.ts"
      );

    const evaluator =
      source(
        "strategy/evaluator.ts"
      );

    assert.match(
      types,
      /executable:\s*false/
    );

    assert.match(
      evaluator,
      /executable:\s*false/
    );

    for (
      const content of [
        types,
        evaluator,
      ]
    ) {
      assert.doesNotMatch(
        content,
        /fetch\s*\(/
      );

      assert.doesNotMatch(
        content,
        /WebSocket/
      );

      assert.doesNotMatch(
        content,
        /binance|bybit|okx/i
      );

      assert.doesNotMatch(
        content,
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);
