import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const marketplaceWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
    "utf8"
  );

const marketplaceEngine =
  fs.readFileSync(
    "src/trading/nft/marketplace/orchestration/engine.ts",
    "utf8"
  );

test(
  "Phase 29 engine preserves Phase 26 marketplace flow",
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
      /runMarketplaceEngine/
    );

    assert.match(
      marketplaceEngine,
      /evaluateFixtureMarketplaceEligibility/
    );

    assert.match(
      marketplaceEngine,
      /createMarketplaceSaleIntent/
    );

    assert.match(
      marketplaceEngine,
      /matchMarketplaceOrder/
    );

    assert.match(
      marketplaceEngine,
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

test(
  "Phase 26 responsibilities are delegated instead of duplicated in workspace",
  () => {
    assert.doesNotMatch(
      marketplaceWorkspace,
      /evaluateFixtureMarketplaceEligibility/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /createMarketplaceSaleIntent/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /matchMarketplaceOrder/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /createMarketplacePreSettlement/
    );
  }
);
