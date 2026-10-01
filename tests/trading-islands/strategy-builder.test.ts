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
  "Strategy Builder is wired into strategies section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /StrategyBuilder/
    );

    assert.match(
      workspace,
      /activeSection === "strategies"/
    );
  }
);

test(
  "Strategy Builder produces structured paper-only strategy data",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /TradingStrategy/
    );

    assert.match(
      content,
      /executionMode:\s*"paper-only"/
    );

    assert.match(
      content,
      /assessStrategy/
    );
  }
);

test(
  "Strategy Builder exposes risk intent fields",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /maxPositionPercent/
    );

    assert.match(
      content,
      /stopLossPercent/
    );

    assert.match(
      content,
      /takeProfitPercent/
    );
  }
);

test(
  "Strategy Builder cannot deploy live",
  () => {
    const content =
      source(
        "strategy/StrategyBuilder.tsx"
      );

    assert.match(
      content,
      /disabled/
    );

    assert.match(
      content,
      /Live deployment unavailable/
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
