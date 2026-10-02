import assert from "node:assert/strict";
import test from "node:test";

import {
  prepareNftBlockchainGatewayRequest,
} from "../../src/trading/nft/blockchain/pipeline";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "gateway pipeline reaches SEND_PREPARED after successful simulation",
  () => {
    const result =
      prepareNftBlockchainGatewayRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.equal(
      result.state.stage,
      "SEND_PREPARED"
    );

    assert.equal(
      result.simulation.status,
      "PASS"
    );

    assert.notEqual(
      result.preparation,
      null
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "gateway pipeline stops on simulation failure",
  () => {
    const result =
      prepareNftBlockchainGatewayRequest({
        ...nftBlockchainGatewayRequestFixture,

        contractRef:
          null,
      });

    assert.equal(
      result.state.stage,
      "FAILED"
    );

    assert.equal(
      result.state.failureCode,
      "SIMULATION_FAILED"
    );

    assert.equal(
      result.preparation,
      null
    );
  }
);
