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
  "Trading Overview exists and is wired",
  () => {
    assert.equal(
      fs.existsSync(
        new URL(
          "overview/TradingOverview.tsx",
          root
        )
      ),
      true
    );

    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /<TradingOverview/
    );

    assert.match(
      workspace,
      /onNavigate=\{setActiveSection\}/
    );
  }
);

test(
  "Overview uses deterministic market fixtures",
  () => {
    const markets =
      source(
        "fixtures/markets.ts"
      );

    for (const symbol of [
      "BTC",
      "ETH",
      "SOL",
    ]) {
      assert.match(
        markets,
        new RegExp(
          `symbol:\\s*["']${symbol}["']`
        )
      );
    }
  }
);

test(
  "Overview exposes portfolio, paper bots and activity",
  () => {
    const content =
      source(
        "overview/TradingOverview.tsx"
      );

    assert.match(
      content,
      /mockPortfolio/
    );

    assert.match(
      content,
      /mockBots/
    );

    assert.match(
      content,
      /mockOverviewActivity/
    );

    assert.match(
      content,
      /Paper portfolio/
    );

    assert.match(
      content,
      /Paper bots/
    );
  }
);

test(
  "Overview does not contain exchange or network integration",
  () => {
    const files = [
      "overview/TradingOverview.tsx",
      "fixtures/markets.ts",
      "fixtures/overview.ts",
      "types/trading.ts",
    ];

    for (const file of files) {
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
    }
  }
);

test(
  "Overview remains independent from PULSE",
  () => {
    for (const file of [
      "overview/TradingOverview.tsx",
      "fixtures/markets.ts",
      "fixtures/overview.ts",
      "types/trading.ts",
    ]) {
      assert.doesNotMatch(
        source(file),
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);

test(
  "mock bots are explicitly paper state",
  () => {
    const content =
      source(
        "types/trading.ts"
      );

    assert.match(
      content,
      /PaperBotState/
    );

    assert.match(
      content,
      /PaperBotSummary/
    );
  }
);
