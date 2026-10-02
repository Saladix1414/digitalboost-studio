import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const detailWorkspace =
  fs.readFileSync(
    "src/trading/nft/detail/NftDetailWorkspace.tsx",
    "utf8"
  );

test(
  "NFT Detail workspace exposes identity",
  () => {
    assert.match(
      detailWorkspace,
      /Identity/
    );

    assert.match(
      detailWorkspace,
      /detail\.identity\.assetId/
    );

    assert.match(
      detailWorkspace,
      /detail\.identity\.collectionId/
    );

    assert.match(
      detailWorkspace,
      /detail\.identity\.creatorRef/
    );
  }
);

test(
  "NFT Detail workspace exposes integrity references",
  () => {
    assert.match(
      detailWorkspace,
      /Integrity/
    );

    assert.match(
      detailWorkspace,
      /detail\.integrity\.dnaId/
    );

    assert.match(
      detailWorkspace,
      /detail\.integrity\.provenanceId/
    );

    assert.match(
      detailWorkspace,
      /detail\.integrity\.originId/
    );
  }
);

test(
  "NFT Detail workspace exposes seller and market context",
  () => {
    assert.match(
      detailWorkspace,
      /Seller/
    );

    assert.match(
      detailWorkspace,
      /Market Context/
    );

    assert.match(
      detailWorkspace,
      /detail\.market\.sellerId/
    );

    assert.match(
      detailWorkspace,
      /detail\.market\.priceAmount/
    );

    assert.match(
      detailWorkspace,
      /detail\.market\.currency/
    );
  }
);

test(
  "NFT Detail validates composed detail",
  () => {
    assert.match(
      detailWorkspace,
      /validateNftAssetDetail/
    );

    assert.match(
      detailWorkspace,
      /validation\.valid/
    );
  }
);

test(
  "NFT Detail exposes local back action",
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
  "execution actions remain disabled",
  () => {
    assert.match(
      detailWorkspace,
      /Buy Asset/
    );

    assert.match(
      detailWorkspace,
      /Verify On-chain/
    );

    const disabledMatches =
      detailWorkspace.match(
        /\bdisabled\b/g
      ) ?? [];

    assert.equal(
      disabledMatches.length >= 2,
      true
    );
  }
);

test(
  "NFT Detail preserves authority boundaries",
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
