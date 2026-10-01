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
  "runtime approval verifies approved paper-only review",
  () => {
    const content =
      source(
        "runtime/approval.ts"
      );

    assert.match(
      content,
      /review\.status !==\s*"approved"/
    );

    assert.match(
      content,
      /review\.authoritative !==\s*true/
    );

    assert.match(
      content,
      /review\.approvedFor !==\s*"paper-only"/
    );
  }
);

test(
  "runtime approval is bound to exact bot and strategy",
  () => {
    const content =
      source(
        "runtime/approval.ts"
      );

    assert.match(
      content,
      /review\.botId !==\s*bot\.id/
    );

    assert.match(
      content,
      /review\.strategyId !==\s*strategy\.id/
    );

    assert.match(
      content,
      /bot\.strategyId !==\s*strategy\.id/
    );
  }
);

test(
  "runtime context requires explicit approval",
  () => {
    const content =
      source(
        "runtime/types.ts"
      );

    assert.match(
      content,
      /readonly approval:\s*RiskReview/
    );

    assert.match(
      content,
      /approval-rejected/
    );
  }
);

test(
  "bot runtime verifies approval before strategy signal execution",
  () => {
    const content =
      source(
        "runtime/botRuntime.ts"
      );

    const approvalIndex =
      content.indexOf(
        "verifyRuntimeApproval("
      );

    const signalIndex =
      content.indexOf(
        "!context.evaluation.valid"
      );

    const executionIndex =
      content.indexOf(
        "executePaperOrder("
      );

    assert.ok(
      approvalIndex >= 0
    );

    assert.ok(
      signalIndex > approvalIndex
    );

    assert.ok(
      executionIndex > signalIndex
    );

    assert.match(
      content,
      /decision:\s*"approval-rejected"/
    );
  }
);

test(
  "Bot Forge keeps candidate review separate and passes active review into runtime",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /reviewPaperRisk/
    );

    assert.match(
      content,
      /candidateReview\?\.approved/
    );

    assert.match(
      content,
      /setActiveReview\(/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*candidateReview\.review/
    );
  }
);

test(
  "approval binding cannot execute and has no external coupling",
  () => {
    const content =
      source(
        "runtime/approval.ts"
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
