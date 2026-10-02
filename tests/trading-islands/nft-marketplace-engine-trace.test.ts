import assert from "node:assert/strict";
import test from "node:test";

import {
  appendMarketplaceEngineTrace,
} from "../../src/trading/nft/marketplace/orchestration/trace";

test(
  "trace entries are append-only and sequential",
  () => {
    const first =
      appendMarketplaceEngineTrace(
        [],
        {
          kind:
            "DOMAIN",

          level:
            "INFO",

          code:
            "FIRST",

          message:
            "first",

          occurredAt:
            "2026-10-14T10:00:00.000Z",
        }
      );

    const second =
      appendMarketplaceEngineTrace(
        first,
        {
          kind:
            "DOMAIN",

          level:
            "INFO",

          code:
            "SECOND",

          message:
            "second",

          occurredAt:
            "2026-10-14T10:01:00.000Z",
        }
      );

    assert.equal(
      first.length,
      1
    );

    assert.equal(
      second.length,
      2
    );

    assert.equal(
      second[0].sequence,
      1
    );

    assert.equal(
      second[1].sequence,
      2
    );

    assert.equal(
      second.every(
        (entry) =>
          entry.authoritative ===
          false
      ),
      true
    );
  }
);
