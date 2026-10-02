import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
    "utf8"
  );

test(
  "Marketplace workspace mounts canonical engine",
  () => {
    assert.match(
      workspace,
      /runMarketplaceEngine/
    );

    assert.match(
      workspace,
      /nftMarketplaceEngineInputFixture/
    );

    assert.match(
      workspace,
      /data-marketplace-engine/
    );
  }
);

test(
  "Marketplace workspace mounts observable engine",
  () => {
    assert.match(
      workspace,
      /runObservableMarketplaceEngine/
    );

    assert.match(
      workspace,
      /Engine Lifecycle/
    );

    assert.match(
      workspace,
      /Deterministic Trace/
    );

    assert.match(
      workspace,
      /observable\.observability/
    );
  }
);

test(
  "Marketplace discovery remains mounted",
  () => {
    assert.match(
      workspace,
      /NftMarketplaceCatalogWorkspace/
    );
  }
);

test(
  "Marketplace workspace exposes pre-settlement boundary",
  () => {
    assert.match(
      workspace,
      /PRE_SETTLEMENT_READY/
    );

    assert.match(
      workspace,
      /pre-settlement ≠ settlement/
    );

    assert.match(
      workspace,
      /matched ≠ paid/
    );

    assert.match(
      workspace,
      /telemetry ≠ authority/
    );

    assert.match(
      workspace,
      /RPC:none/
    );
  }
);
