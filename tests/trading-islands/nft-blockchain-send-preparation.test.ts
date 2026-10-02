import assert from "node:assert/strict";
import test from "node:test";

import {
  simulateNftBlockchainRequest,
} from "../../src/trading/nft/blockchain/simulation";

import {
  prepareNftBlockchainSend,
} from "../../src/trading/nft/blockchain/sendPreparation";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "successful simulation can produce send preparation",
  () => {
    const simulation =
      simulateNftBlockchainRequest(
        nftBlockchainGatewayRequestFixture
      );

    const prepared =
      prepareNftBlockchainSend(
        nftBlockchainGatewayRequestFixture,
        simulation
      );

    assert.equal(
      prepared.stage,
      "SEND_PREPARED"
    );

    assert.equal(
      prepared.walletSigningRequired,
      true
    );

    assert.equal(
      prepared.transactionSubmitted,
      false
    );

    assert.equal(
      prepared.executable,
      false
    );

    assert.equal(
      prepared.authoritative,
      false
    );
  }
);

test(
  "failed simulation cannot produce send preparation",
  () => {
    const request = {
      ...nftBlockchainGatewayRequestFixture,

      payloadRef:
        null,
    };

    const simulation =
      simulateNftBlockchainRequest(
        request
      );

    assert.throws(
      () =>
        prepareNftBlockchainSend(
          request,
          simulation
        ),

      /BLOCKCHAIN_GATEWAY_SIMULATION_REQUIRED/
    );
  }
);

test(
  "simulation from another request cannot prepare send",
  () => {
    const simulation =
      simulateNftBlockchainRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.throws(
      () =>
        prepareNftBlockchainSend(
          {
            ...nftBlockchainGatewayRequestFixture,

            id:
              "gateway-request-other",
          },
          simulation
        ),

      /BLOCKCHAIN_GATEWAY_SIMULATION_REQUEST_MISMATCH/
    );
  }
);
