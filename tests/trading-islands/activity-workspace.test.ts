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
  "Activity workspace is wired into activity section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /ActivityWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "activity"/
    );
  }
);

test(
  "Activity workspace consumes unified activity builders",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /activityFromReviewHistoryEntry/
    );

    assert.match(
      content,
      /activityFromReviewChainIntegrity/
    );

    assert.match(
      content,
      /activityFromRecoveryAttemptHistoryEntry/
    );

    assert.match(
      content,
      /activityFromRemoteRetryHistoryEntry/
    );
  }
);

test(
  "Activity workspace exposes source authority bot strategy and reference",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    for (
      const token of [
        "SOURCE",
        "AUTHORITY",
        "BOT",
        "STRATEGY",
        "REF",
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
  "Activity workspace keeps approval authority explicit",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /APPROVAL AUTHORITY/
    );

    assert.match(
      content,
      /NON-AUTHORITATIVE/
    );

    assert.match(
      content,
      /never authorizes execution/
    );
  }
);

test(
  "Activity workspace has no execution or PULSE coupling",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
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
      /runBotRuntimeStep/
    );


    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
    );

    assert.doesNotMatch(
      content,
      /reviewPaperRisk/
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
