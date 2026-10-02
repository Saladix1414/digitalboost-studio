import assert from "node:assert/strict";
import test from "node:test";

import {
  createBlockchainFallbackRecord,
} from "../../src/trading/nft/blockchain/fallback";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "fallback record remains non-executable",
  () => {
    const result =
      createBlockchainFallbackRecord(
        nftBlockchainGatewayRequestFixture,
        "fallback:polygon:secondary",
        "primary unavailable"
      );

    assert.equal(
      result.executable,
      false
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);
