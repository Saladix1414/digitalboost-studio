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
  "runtime binding fingerprints bot strategy and risk configuration",
  () => {
    const content =
      source(
        "runtime/binding.ts"
      );

    for (
      const token of [
        "bot.id",
        "bot.strategyId",
        "bot.symbol",
        "bot.timeframe",
        "maxOrderNotional",
        "maxPositionNotional",
        "minCashReserve",
        "strategy.id",
        "strategy.symbol",
        "strategy.timeframe",
        "maxPositionPercent",
        "stopLossPercent",
        "takeProfitPercent",
        "entryConditions",
        "invalidationConditions",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token.replace(
            ".",
            "\\."
          )
        )
      );
    }
  }
);

test(
  "Risk Review stores exact binding fingerprint",
  () => {
    const types =
      source(
        "risk/reviewTypes.ts"
      );

    const review =
      source(
        "risk/review.ts"
      );

    assert.match(
      types,
      /bindingFingerprint/
    );

    assert.match(
      review,
      /createRuntimeBindingFingerprint/
    );

    assert.match(
      review,
      /bindingFingerprint:\s*binding\.value/
    );
  }
);

test(
  "runtime rejects stale review when configuration changes",
  () => {
    const content =
      source(
        "runtime/approval.ts"
      );

    assert.match(
      content,
      /createRuntimeBindingFingerprint/
    );

    assert.match(
      content,
      /review\.bindingFingerprint !==/
    );

    assert.match(
      content,
      /configuration changed/
    );
  }
);

test(
  "runtime result and audit preserve binding evidence",
  () => {
    const runtimeTypes =
      source(
        "runtime/types.ts"
      );

    const auditTypes =
      source(
        "runtime/auditTypes.ts"
      );

    const audit =
      source(
        "runtime/audit.ts"
      );

    assert.match(
      runtimeTypes,
      /approvalBindingFingerprint/
    );

    assert.match(
      auditTypes,
      /bindingFingerprint/
    );

    assert.match(
      audit,
      /approvalBindingFingerprint/
    );
  }
);

test(
  "binding layer cannot execute or access network",
  () => {
    const content =
      source(
        "runtime/binding.ts"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
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
      /binance|bybit|okx/i
    );

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
