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
  "runtime result carries exact approval evidence",
  () => {
    const content =
      source(
        "runtime/types.ts"
      );

    assert.match(
      content,
      /approvalReviewId/
    );

    assert.match(
      content,
      /approvalBotId/
    );

    assert.match(
      content,
      /approvalStrategyId/
    );
  }
);

test(
  "runtime populates approval evidence from bound review",
  () => {
    const content =
      source(
        "runtime/botRuntime.ts"
      );

    assert.match(
      content,
      /context\.approval\.id/
    );

    assert.match(
      content,
      /context\.approval\.botId/
    );

    assert.match(
      content,
      /context\.approval\.strategyId/
    );
  }
);

test(
  "runtime audit records review id bot id strategy id and scope",
  () => {
    const content =
      source(
        "runtime/auditTypes.ts"
      );

    assert.match(
      content,
      /riskReviewId/
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
      /approvalScope/
    );

    assert.match(
      content,
      /approvalVerified/
    );
  }
);

test(
  "runtime audit is explicitly non authoritative",
  () => {
    const content =
      source(
        "runtime/auditTypes.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "audit builder derives evidence from completed runtime session",
  () => {
    const content =
      source(
        "runtime/audit.ts"
      );

    assert.match(
      content,
      /BotRuntimeSessionResult/
    );

    assert.match(
      content,
      /result\.runtime\.approvalReviewId/
    );

    assert.match(
      content,
      /result\.runtime\.decision/
    );

    assert.match(
      content,
      /result\.session\.events/
    );
  }
);

test(
  "runtime audit cannot execute and has no external coupling",
  () => {
    for (
      const file of [
        "runtime/auditTypes.ts",
        "runtime/audit.ts",
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
        /evaluatePaperRisk/
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
