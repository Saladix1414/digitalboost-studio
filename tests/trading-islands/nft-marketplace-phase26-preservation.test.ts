import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const marketplaceWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
    "utf8"
  );

test(
  "Phase 27 catalog preserves Phase 26 marketplace flow",
  () => {
    assert.match(
      marketplaceWorkspace,
      /Eligibility/
    );

    assert.match(
      marketplaceWorkspace,
      /Sale Intent/
    );

    assert.match(
      marketplaceWorkspace,
      /Pre-settlement/
    );

    assert.match(
      marketplaceWorkspace,
      /evaluateFixtureMarketplaceEligibility/
    );

    assert.match(
      marketplaceWorkspace,
      /createMarketplaceSaleIntent/
    );

    assert.match(
      marketplaceWorkspace,
      /matchMarketplaceOrder/
    );

    assert.match(
      marketplaceWorkspace,
      /createMarketplacePreSettlement/
    );
  }
);

test(
  "Phase 26 execution boundaries remain visible",
  () => {
    assert.match(
      marketplaceWorkspace,
      /eligibility ≠ ownership/
    );

    assert.match(
      marketplaceWorkspace,
      /matched ≠ paid/
    );

    assert.match(
      marketplaceWorkspace,
      /pre-settlement ≠ settlement/
    );

    assert.match(
      marketplaceWorkspace,
      /RPC:none/
    );
  }
);
