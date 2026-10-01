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
  "review chain validator requires version one root",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /root-version-invalid/
    );

    assert.match(
      content,
      /version !==[\s\S]*1/
    );
  }
);

test(
  "review chain root cannot supersede another review",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /root-supersedes-invalid/
    );

    assert.match(
      content,
      /previousReviewId !==[\s\S]*null/
    );

    assert.match(
      content,
      /provenance\.supersedes !==[\s\S]*null/
    );
  }
);

test(
  "review chain requires contiguous versions",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /version-gap/
    );

    assert.match(
      content,
      /previous\.versionedReview\.version \+/
    );

    assert.match(
      content,
      /expectedVersion/
    );
  }
);

test(
  "review chain detects duplicate versions",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /duplicate-version/
    );

    assert.match(
      content,
      /new Set<number>/
    );

    assert.match(
      content,
      /seenVersions\.has/
    );
  }
);

test(
  "review chain requires supersedes to reference previous accepted review",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /supersedes-mismatch/
    );

    assert.match(
      content,
      /previous\.versionedReview\.review\.id/
    );

    assert.match(
      content,
      /entry\.provenance\.supersedes/
    );
  }
);

test(
  "review chain validates provenance for every entry",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /validateRiskReviewProvenance/
    );

    assert.match(
      content,
      /provenance-invalid/
    );

    assert.match(
      content,
      /provenanceIntegrity\.valid/
    );
  }
);

test(
  "review chain validation is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "review chain validator cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewChainValidation.ts"
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
