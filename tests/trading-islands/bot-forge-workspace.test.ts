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
  "Bot Forge workspace is wired into bot forge section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /BotForgeWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "bot-forge"/
    );
  }
);

test(
  "Bot Forge workspace consumes structured bot domain",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /mockTradingBots/
    );

    assert.match(
      content,
      /assessTradingBot/
    );

    assert.match(
      content,
      /transitionTradingBot/
    );
  }
);

test(
  "Bot Forge exposes explicit lifecycle controls",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    for (
      const token of [
        "Start paper bot",
        "Pause",
        "Resume",
        "Stop",
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
  "Bot Forge exposes risk profile and strategy reference",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /strategyId/
    );

    assert.match(
      content,
      /maxOrderNotional/
    );

    assert.match(
      content,
      /maxPositionNotional/
    );

    assert.match(
      content,
      /minCashReserve/
    );
  }
);

test(
  "Bot Forge preserves paper-only boundary",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /Live deployment unavailable/
    );

    assert.match(
      content,
      /paper mode/i
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
