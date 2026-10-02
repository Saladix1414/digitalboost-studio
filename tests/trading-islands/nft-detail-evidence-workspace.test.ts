import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/detail/NftDetailWorkspace.tsx",
    "utf8"
  );

test(
  "detail workspace composes evidence",
  () => {
    assert.match(
      workspace,
      /composeNftDetailEvidence/
    );

    assert.match(
      workspace,
      /Evidence Composition/
    );

    assert.match(
      workspace,
      /evidence\.items\.map/
    );
  }
);

test(
  "detail workspace exposes cross-domain consistency",
  () => {
    assert.match(
      workspace,
      /evaluateNftDetailConsistency/
    );

    assert.match(
      workspace,
      /Cross-domain Consistency/
    );

    assert.match(
      workspace,
      /Provenance reference/
    );

    assert.match(
      workspace,
      /DNA reference/
    );

    assert.match(
      workspace,
      /Provenance closure/
    );
  }
);

test(
  "detail workspace preserves execution boundaries",
  () => {
    assert.match(
      workspace,
      /Buy Asset/
    );

    assert.match(
      workspace,
      /Verify On-chain/
    );

    assert.match(
      workspace,
      /RPC:none/
    );

    assert.match(
      workspace,
      /data-authority="none"/
    );
  }
);
