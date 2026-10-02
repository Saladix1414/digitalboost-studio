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
  "Marketplace workspace exposes listing and eligibility through canonical engine",
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
      /runMarketplaceEngine/
    );

    assert.match(
      marketplaceWorkspace,
      /engine\.eligibility/
    );
  }
);

test(
  "Marketplace workspace exposes order and pre-settlement through engine orchestration",
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
      /engine\.order/
    );

    assert.match(
      marketplaceWorkspace,
      /engine\.preSettlement/
    );

    assert.match(
      marketplaceWorkspace,
      /runObservableMarketplaceEngine/
    );
  }
);

test(
  "Marketplace workspace exposes lifecycle and deterministic trace",
  () => {
    assert.match(
      marketplaceWorkspace,
      /Engine Lifecycle/
    );

    assert.match(
      marketplaceWorkspace,
      /Deterministic Trace/
    );

    assert.match(
      marketplaceWorkspace,
      /observable\.lifecycle/
    );

    assert.match(
      marketplaceWorkspace,
      /observable\.observability/
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
      /telemetry ≠ authority/
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
