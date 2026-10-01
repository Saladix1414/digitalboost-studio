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
  "runtime session defines structured activity events",
  () => {
    const content =
      source(
        "runtime/activityTypes.ts"
      );

    for (
      const event of [
        "session_started",
        "signal_seen",
        "approval_checked",
        "approval_rejected",
        "no_signal",
        "risk_checked",
        "order_accepted",
        "order_rejected",
        "ledger_updated",
        "session_completed",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          event
        )
      );
    }
  }
);

test(
  "runtime session delegates actual decision to bot runtime",
  () => {
    const content =
      source(
        "runtime/session.ts"
      );

    assert.match(
      content,
      /runBotRuntimeStep/
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
      /evaluatePaperRisk/
    );
  }
);

test(
  "runtime events remain observational and non authoritative",
  () => {
    const content =
      source(
        "runtime/activityTypes.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "runtime session records risk and ledger outcomes",
  () => {
    const content =
      source(
        "runtime/session.ts"
      );

    assert.match(
      content,
      /risk_checked/
    );

    assert.match(
      content,
      /order_accepted/
    );

    assert.match(
      content,
      /order_rejected/
    );

    assert.match(
      content,
      /ledger_updated/
    );
  }
);

test(
  "runtime session remains local and exchange free",
  () => {
    for (
      const file of [
        "runtime/activityTypes.ts",
        "runtime/session.ts",
      ]
    ) {
      const content =
        source(file);

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
