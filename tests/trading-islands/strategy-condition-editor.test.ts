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
  "strategy model defines AND OR logic",
  () => {
    const content =
      source(
        "strategy/types.ts"
      );

    assert.match(
      content,
      /StrategyLogicOperator/
    );

    assert.match(
      content,
      /"and"/
    );

    assert.match(
      content,
      /"or"/
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
  "Strategy Builder supports multiple entry and invalidation conditions",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /ConditionEditor/
    );

    assert.match(
      content,
      /entryConditions/
    );

    assert.match(
      content,
      /invalidationConditions/
    );

    assert.match(
      content,
      /Add condition/
    );

    assert.match(
      content,
      /Remove/
    );
  }
);

test(
  "condition editor supports indicator and numeric operands",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /rightKind/
    );

    assert.match(
      content,
      /Numeric value/
    );

    assert.match(
      content,
      /rightValue/
    );

    assert.match(
      content,
      /rightIndicator/
    );
  }
);

test(
  "validator requires explicit invalidation logic",
  () => {
    const content =
      source(
        "strategy/validator.ts"
      );

    assert.match(
      content,
      /invalidationConditions\.length/
    );

    assert.match(
      content,
      /At least one invalidation condition is required/
    );
  }
);

test(
  "strategy condition editor stays paper only and network free",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /executionMode:\s*"paper-only"/
    );

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
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
