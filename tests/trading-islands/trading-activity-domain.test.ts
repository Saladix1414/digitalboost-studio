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
  "activity domain keeps explicit source identity",
  () => {
    const content =
      source(
        "activity/types.ts"
      );

    for (
      const sourceName of [
        "strategy",
        "risk-review",
        "runtime",
        "paper-ledger",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          sourceName
        )
      );
    }
  }
);

test(
  "activity domain distinguishes approval authority from observation",
  () => {
    const content =
      source(
        "activity/types.ts"
      );

    assert.match(
      content,
      /"none"/
    );

    assert.match(
      content,
      /"approval"/
    );
  }
);

test(
  "risk review activity is approval authority",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /source:\s*"risk-review"/
    );

    assert.match(
      content,
      /authority:\s*"approval"/
    );
  }
);

test(
  "runtime and ledger activity remain non authoritative",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /source:\s*"runtime"/
    );

    assert.match(
      content,
      /source:\s*"paper-ledger"/
    );

    assert.match(
      content,
      /authority:\s*"none"/
    );
  }
);

test(
  "activity builders preserve bot strategy and reference ids",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /botId/
    );

    assert.match(
      content,
      /strategyId/
    );

    assert.match(
      content,
      /referenceId/
    );
  }
);

test(
  "activity domain cannot execute and has no external coupling",
  () => {
    for (
      const file of [
        "activity/types.ts",
        "activity/builders.ts",
      ]
    ) {
      const content =
        source(file);

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
  }
);
