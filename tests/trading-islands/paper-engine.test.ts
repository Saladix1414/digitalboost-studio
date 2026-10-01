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
  "paper engine defines account orders positions and ledger",
  () => {
    const content =
      source(
        "paper/types.ts"
      );

    for (
      const token of [
        "PaperAccountState",
        "PaperOrder",
        "PaperPosition",
        "PaperLedgerEntry",
      ]
    ) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "paper engine creates deterministic starting account",
  () => {
    const content =
      source(
        "paper/engine.ts"
      );

    assert.match(
      content,
      /createPaperAccount/
    );

    assert.match(
      content,
      /Initial paper capital/
    );
  }
);

test(
  "paper engine validates cash and position before filling",
  () => {
    const content =
      source(
        "paper/engine.ts"
      );

    assert.match(
      content,
      /Insufficient paper cash/
    );

    assert.match(
      content,
      /Insufficient paper position/
    );
  }
);

test(
  "paper engine updates cash orders positions and ledger locally",
  () => {
    const content =
      source(
        "paper/engine.ts"
      );

    assert.match(
      content,
      /updatePosition/
    );

    assert.match(
      content,
      /cashDelta/
    );

    assert.match(
      content,
      /ledger/
    );

    assert.match(
      content,
      /status:\s*"filled"/
    );
  }
);

test(
  "paper engine remains isolated from exchanges network and PULSE",
  () => {
    const content =
      source(
        "paper/engine.ts"
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
