import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  TRADING_VISUAL_DNA_VERSION,
  tradingColors,
  tradingStateSemantics,
  tradingVisualDNA,
} from "../../src/trading/design/tradingTokens.ts";

const tokenSource = fs.readFileSync(
  new URL(
    "../../src/trading/design/tradingTokens.ts",
    import.meta.url
  ),
  "utf8"
);

const cssSource = fs.readFileSync(
  new URL(
    "../../src/trading/trading-islands.css",
    import.meta.url
  ),
  "utf8"
);

test(
  "Trading Islands Visual DNA has a canonical version",
  () => {
    assert.equal(
      TRADING_VISUAL_DNA_VERSION,
      "trading-islands-visual-dna-v1"
    );

    assert.equal(
      tradingVisualDNA.version,
      TRADING_VISUAL_DNA_VERSION
    );
  }
);

test(
  "Trading Islands keeps semantic market colors explicit",
  () => {
    assert.equal(
      tradingColors.semantic.positive,
      "#26c281"
    );

    assert.equal(
      tradingColors.semantic.negative,
      "#ef5b68"
    );

    assert.equal(
      tradingColors.semantic.warning,
      "#e5b84b"
    );

    assert.equal(
      tradingColors.chart.candleUp,
      tradingColors.semantic.positive
    );

    assert.equal(
      tradingColors.chart.candleDown,
      tradingColors.semantic.negative
    );
  }
);

test(
  "Trading Islands defines all required visual states",
  () => {
    const expectedStates = [
      "default",
      "hover",
      "active",
      "selected",
      "disabled",
      "loading",
      "success",
      "warning",
      "error",
      "running",
      "paused",
      "stopped",
    ];

    for (const state of expectedStates) {
      assert.ok(
        state in tradingStateSemantics,
        `missing visual state: ${state}`
      );
    }
  }
);

test(
  "Trading Islands Visual DNA is independent from PULSE",
  () => {
    assert.doesNotMatch(
      tokenSource,
      /DigitalBoostPulse|from\s+["'][^"']*Pulse/i
    );

    assert.doesNotMatch(
      cssSource,
      /data-pulse|\.pulse-/i
    );
  }
);

test(
  "Trading Islands CSS owns an isolated root namespace",
  () => {
    assert.match(
      cssSource,
      /\[data-trading-islands="true"\]/
    );

    assert.match(
      cssSource,
      /--ti-positive/
    );

    assert.match(
      cssSource,
      /--ti-negative/
    );

    assert.match(
      cssSource,
      /prefers-reduced-motion/
    );
  }
);
