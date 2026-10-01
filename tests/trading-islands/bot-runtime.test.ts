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
  "paper execution boundary performs risk before fill",
  () => {
    const content =
      source(
        "paper/executionBoundary.ts"
      );

    const riskIndex =
      content.indexOf(
        "evaluatePaperRisk"
      );

    const fillIndex =
      content.indexOf(
        "fillPaperMarketOrder("
      );

    assert.ok(
      riskIndex >= 0
    );

    assert.ok(
      fillIndex >= 0
    );

    assert.ok(
      riskIndex <
      fillIndex
    );

    assert.match(
      content,
      /!riskDecision\.approved/
    );
  }
);

test(
  "bot runtime requires paper-running state",
  () => {
    const content =
      source(
        "runtime/botRuntime.ts"
      );

    assert.match(
      content,
      /paper-running/
    );

    assert.match(
      content,
      /decision:\s*"inactive"/
    );
  }
);

test(
  "bot runtime requires valid active strategy signal",
  () => {
    const content =
      source(
        "runtime/botRuntime.ts"
      );

    assert.match(
      content,
      /evaluation\.valid/
    );

    assert.match(
      content,
      /evaluation\.invalidated/
    );

    assert.match(
      content,
      /evaluation\.signal/
    );

    assert.match(
      content,
      /no-signal/
    );
  }
);

test(
  "bot runtime delegates execution through paper boundary",
  () => {
    const content =
      source(
        "runtime/botRuntime.ts"
      );

    assert.match(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /evaluatePaperRisk/
    );
  }
);

test(
  "bot runtime exposes distinct risk and execution decisions",
  () => {
    const content =
      source(
        "runtime/types.ts"
      );

    for (
      const decision of [
        "inactive",
        "no-signal",
        "risk-rejected",
        "paper-filled",
        "paper-rejected",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          decision
        )
      );
    }
  }
);

test(
  "bot runtime can never authorize live execution",
  () => {
    const runtime =
      source(
        "runtime/botRuntime.ts"
      );

    const types =
      source(
        "runtime/types.ts"
      );

    assert.match(
      types,
      /liveExecution:\s*false/
    );

    assert.match(
      runtime,
      /liveExecution:\s*false/
    );

    for (
      const content of [
        runtime,
        types,
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
