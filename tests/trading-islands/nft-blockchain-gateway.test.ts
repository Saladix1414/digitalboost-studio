import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceBlockchainGatewayState,
  createBlockchainGatewayState,
  simulateBlockchainGatewayRequest,
} from "../../src/trading/nft/blockchain/gateway";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "gateway begins idle and non-authoritative",
  () => {
    const state =
      createBlockchainGatewayState(
        "gateway-state-001"
      );

    assert.equal(
      state.stage,
      "IDLE"
    );

    assert.equal(
      state.failureCode,
      "NONE"
    );

    assert.equal(
      state.authoritative,
      false
    );
  }
);

test(
  "gateway simulation is deterministic and non-authoritative",
  () => {
    const result =
      simulateBlockchainGatewayRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.equal(
      result.success,
      true
    );

    assert.equal(
      result.stage,
      "SIMULATED"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "gateway state advances only through valid transitions",
  () => {
    const initial =
      createBlockchainGatewayState(
        "gateway-state-002"
      );

    const simulated =
      advanceBlockchainGatewayState(
        initial,
        "SIMULATED"
      );

    const prepared =
      advanceBlockchainGatewayState(
        simulated,
        "SEND_PREPARED"
      );

    assert.equal(
      prepared.stage,
      "SEND_PREPARED"
    );

    assert.equal(
      prepared.attempt,
      2
    );
  }
);

test(
  "gateway rejects invalid transition",
  () => {
    const initial =
      createBlockchainGatewayState(
        "gateway-state-003"
      );

    assert.throws(
      () =>
        advanceBlockchainGatewayState(
          initial,
          "VERIFIED"
        ),

      /BLOCKCHAIN_GATEWAY_INVALID_TRANSITION/
    );
  }
);
