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
  "Bot Forge derives audit from completed runtime session",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /createRuntimeAuditRecord/
    );

    assert.match(
      content,
      /runtimeSession/
    );

    assert.match(
      content,
      /runtimeAudit/
    );
  }
);

test(
  "Runtime Audit UI exposes approval evidence",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    for (
      const token of [
        "riskReviewId",
        "approvalScope",
        "approvalVerified",
        "decision",
        "authoritative",
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
  "Runtime Audit UI shows exact bot and strategy binding",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /runtimeAudit\.approval[\s\S]*\.botId/
    );

    assert.match(
      content,
      /runtimeAudit\.approval[\s\S]*\.strategyId/
    );
  }
);

test(
  "Runtime Audit is explicitly evidence only",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /EVIDENCE ONLY/
    );

    assert.match(
      content,
      /Audit records evidence/
    );

    assert.match(
      content,
      /does not authorize execution/
    );
  }
);

test(
  "Runtime Audit UI cannot bypass execution authority",
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
