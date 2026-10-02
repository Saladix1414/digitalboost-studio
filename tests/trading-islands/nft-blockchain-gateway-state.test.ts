import assert from "node:assert/strict";
import test from "node:test";

import {
  canTransitionBlockchainGateway,
} from "../../src/trading/nft/blockchain/stateMachine";

test(
  "gateway canonical transitions are explicit",
  () => {
    assert.equal(
      canTransitionBlockchainGateway(
        "IDLE",
        "SIMULATED"
      ),
      true
    );

    assert.equal(
      canTransitionBlockchainGateway(
        "SIMULATED",
        "SEND_PREPARED"
      ),
      true
    );

    assert.equal(
      canTransitionBlockchainGateway(
        "SUBMITTED",
        "VERIFIED"
      ),
      true
    );

    assert.equal(
      canTransitionBlockchainGateway(
        "VERIFIED",
        "INDEXED"
      ),
      true
    );
  }
);

test(
  "gateway rejects impossible jumps",
  () => {
    assert.equal(
      canTransitionBlockchainGateway(
        "IDLE",
        "VERIFIED"
      ),
      false
    );

    assert.equal(
      canTransitionBlockchainGateway(
        "INDEXED",
        "SUBMITTED"
      ),
      false
    );
  }
);
