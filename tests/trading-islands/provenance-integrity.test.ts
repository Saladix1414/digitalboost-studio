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
  "provenance validator checks review identity and version",
  () => {
    const content =
      source(
        "risk/reviewProvenanceValidation.ts"
      );

    assert.match(
      content,
      /review-id-mismatch/
    );

    assert.match(
      content,
      /version-mismatch/
    );

    assert.match(
      content,
      /provenance\.reviewId !==/
    );

    assert.match(
      content,
      /provenance\.version !==/
    );
  }
);

test(
  "provenance validator checks bot strategy fingerprint and scope",
  () => {
    const content =
      source(
        "risk/reviewProvenanceValidation.ts"
      );

    for (
      const issue of [
        "bot-id-mismatch",
        "strategy-id-mismatch",
        "fingerprint-mismatch",
        "scope-mismatch",
      ]
    ) {
      assert.match(
        content,
        new RegExp(issue)
      );
    }
  }
);

test(
  "provenance validator checks supersedes relationship",
  () => {
    const content =
      source(
        "risk/reviewProvenanceValidation.ts"
      );

    assert.match(
      content,
      /supersedes-mismatch/
    );

    assert.match(
      content,
      /previousReviewId/
    );
  }
);

test(
  "provenance integrity result is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/reviewProvenanceValidation.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "activity marks invalid provenance as invalid evidence",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /validateRiskReviewProvenance/
    );

    assert.match(
      content,
      /INVALID EVIDENCE/
    );

    assert.match(
      content,
      /severity:[\s\S]*?"danger"/
    );

    assert.match(
      content,
      /authority:\s*"none"/
    );
  }
);

test(
  "Risk Review and Bot Forge surface provenance integrity",
  () => {
    const risk =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      risk,
      /validateRiskReviewProvenance/
    );

    assert.match(
      risk,
      /INTEGRITY · VALID/
    );

    assert.match(
      bot,
      /validateRiskReviewProvenance/
    );

    assert.match(
      bot,
      /INTEGRITY · VALID/
    );
  }
);

test(
  "provenance validation cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewProvenanceValidation.ts"
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
      /runBotRuntime/
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
