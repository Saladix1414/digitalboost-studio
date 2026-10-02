import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const detailWorkspace =
  fs.readFileSync(
    "src/trading/nft/detail/NftDetailWorkspace.tsx",
    "utf8"
  );

const catalogWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "Phase 28 preserves local Marketplace to Detail navigation",
  () => {
    assert.match(
      catalogWorkspace,
      /View Asset/
    );

    assert.match(
      catalogWorkspace,
      /setDetailListingId/
    );

    assert.match(
      catalogWorkspace,
      /findNftAssetDetailByListingId/
    );

    assert.match(
      catalogWorkspace,
      /NftDetailWorkspace/
    );
  }
);

test(
  "Phase 28 preserves back navigation",
  () => {
    assert.match(
      detailWorkspace,
      /Back to Marketplace/
    );

    assert.match(
      detailWorkspace,
      /onClick=\{onBack\}/
    );
  }
);

test(
  "Phase 28 exposes evidence composition",
  () => {
    assert.match(
      detailWorkspace,
      /Evidence Composition/
    );

    assert.match(
      detailWorkspace,
      /Cross-domain Consistency/
    );

    assert.match(
      detailWorkspace,
      /composeNftDetailEvidence/
    );

    assert.match(
      detailWorkspace,
      /evaluateNftDetailConsistency/
    );
  }
);

test(
  "Phase 28 keeps transaction actions disabled",
  () => {
    assert.match(
      detailWorkspace,
      /Buy Asset/
    );

    assert.match(
      detailWorkspace,
      /Verify On-chain/
    );

    const disabled =
      detailWorkspace.match(
        /\bdisabled\b/g
      ) ?? [];

    assert.equal(
      disabled.length >= 2,
      true
    );
  }
);

test(
  "Phase 28 UI preserves authority boundaries",
  () => {
    assert.match(
      detailWorkspace,
      /detail ≠ ownership/
    );

    assert.match(
      detailWorkspace,
      /seller ref ≠ seller authority/
    );

    assert.match(
      detailWorkspace,
      /price ≠ payment/
    );

    assert.match(
      detailWorkspace,
      /provenance ≠ absolute truth/
    );

    assert.match(
      detailWorkspace,
      /data-authority="none"/
    );
  }
);
