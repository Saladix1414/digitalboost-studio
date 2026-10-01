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
  "Bot Forge consumes runtime sessions",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /runBotRuntimeSession/
    );

    assert.match(
      content,
      /runtimeSession/
    );

    assert.match(
      content,
      /Runtime Activity/
    );
  }
);

test(
  "Bot Forge runtime step requires paper-running state",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /selectedBot\.status !==\s*"paper-running"/
    );

    assert.match(
      content,
      /Run local paper step/
    );
  }
);

test(
  "runtime activity renders structured session events",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /session\.events/
    );

    assert.match(
      content,
      /event\.sequence/
    );

    assert.match(
      content,
      /event\.type/
    );

    assert.match(
      content,
      /event\.message/
    );
  }
);

test(
  "runtime activity clearly remains non authoritative",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /Telemetry records outcomes/
    );

    assert.match(
      content,
      /authoritative = false/
    );
  }
);

test(
  "Bot Forge activity UI does not bypass runtime boundary",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /evaluatePaperRisk/
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
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
