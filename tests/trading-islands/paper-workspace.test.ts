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
  "Paper Trading workspace is wired into paper section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /PaperTradingWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "paper"/
    );
  }
);

test(
  "Paper Trading workspace uses local paper engine",
  () => {
    const content =
      source(
        "paper/PaperTradingWorkspace.tsx"
      );

    assert.match(
      content,
      /createPaperAccount/
    );

    assert.match(
      content,
      /fillPaperMarketOrder/
    );

    assert.match(
      content,
      /setAccount/
    );
  }
);

test(
  "Paper Trading exposes cash positions orders and ledger",
  () => {
    const content =
      source(
        "paper/PaperTradingWorkspace.tsx"
      );

    for (
      const token of [
        "account.cash",
        "account.positions",
        "account.orders",
        "account.ledger",
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
  "Paper Trading clearly preserves simulation boundary",
  () => {
    const content =
      source(
        "paper/PaperTradingWorkspace.tsx"
      );

    assert.match(
      content,
      /PAPER ONLY/
    );

    assert.match(
      content,
      /No exchange connection/i
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
