import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    new URL(
      "../../src/trading/activity/adapters/identityWallet.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "identity wallet activity adapter does not mutate shared store",
  () => {
    assert.doesNotMatch(
      content,
      /recordTradingActivityEvent|recordTradingActivityEvents|appendTradingActivityEvent|resetTradingActivityStoreForTests/
    );
  }
);

test(
  "identity wallet activity adapter performs no wallet or blockchain execution",
  () => {
    assert.doesNotMatch(
      content,
      /requestAccounts|switchChain|eth_requestAccounts|eth_sendTransaction|sendTransaction|submitTransaction/
    );
  }
);

test(
  "identity wallet activity adapter performs no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket|XMLHttpRequest/
    );
  }
);

test(
  "identity wallet activity remains non authoritative",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );

    assert.match(
      content,
      /createTradingActivityEvent/
    );
  }
);

test(
  "identity wallet adapter reuses canonical Activity Center",
  () => {
    assert.match(
      content,
      /from "\.\.\/factory"/
    );

    assert.match(
      content,
      /TradingActivityEvent/
    );
  }
);
