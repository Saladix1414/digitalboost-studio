import assert from "node:assert/strict";
import test from "node:test";

import {
  simulateNftBlockchainRequest,
} from "../../src/trading/nft/blockchain/simulation";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "valid blockchain request passes deterministic simulation",
  () => {
    const result =
      simulateNftBlockchainRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.equal(
      result.status,
      "PASS"
    );

    assert.equal(
      result.checks.every(
        (check) =>
          check.passed
      ),
      true
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

test(
  "simulation fails when contract reference is absent",
  () => {
    const result =
      simulateNftBlockchainRequest({
        ...nftBlockchainGatewayRequestFixture,

        contractRef:
          null,
      });

    assert.equal(
      result.status,
      "FAIL"
    );

    assert.equal(
      result.checks.some(
        (check) =>
          check.code ===
            "CONTRACT_REFERENCE" &&
          check.passed ===
            false
      ),
      true
    );
  }
);
