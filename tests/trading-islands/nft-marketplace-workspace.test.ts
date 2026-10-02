import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const marketplaceWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
    "utf8"
  );

const forgeWorkspace =
  fs.readFileSync(
    "src/trading/nft/NftForgeWorkspace.tsx",
    "utf8"
  );

test(
  "NFT Forge mounts Marketplace workspace",
  () => {
    assert.match(
      forgeWorkspace,
      /NftMarketplaceWorkspace/
    );

    assert.match(
      forgeWorkspace,
      /<NftMarketplaceWorkspace \/>/
    );
  }
);

test(
  "Marketplace workspace exposes listing and eligibility",
  () => {
    assert.match(
      marketplaceWorkspace,
      /Listing/
    );

    assert.match(
      marketplaceWorkspace,
      /Eligibility/
    );

    assert.match(
      marketplaceWorkspace,
      /evaluateFixtureMarketplaceEligibility/
    );
  }
);

test(
  "Marketplace workspace exposes order and pre-settlement flow",
  () => {
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
      /matchMarketplaceOrder/
    );

    assert.match(
      marketplaceWorkspace,
      /createMarketplacePreSettlement/
    );
  }
);

test(
  "Marketplace workspace preserves execution boundaries",
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
      /data-authority="none"/
    );
  }
);

test(
  "Marketplace workspace performs no external execution",
  () => {
    assert.doesNotMatch(
      marketplaceWorkspace,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /WebSocket/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      marketplaceWorkspace,
      /eth_sendRawTransaction/
    );
  }
);
