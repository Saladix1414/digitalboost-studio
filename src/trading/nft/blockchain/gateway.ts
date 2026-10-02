import {
  canTransitionBlockchainGateway,
} from "./stateMachine";

import type {
  NftBlockchainGatewayRequest,
  NftBlockchainGatewaySimulationResult,
  NftBlockchainGatewayState,
} from "./types";

export function createBlockchainGatewayState(
  id:
    string
): NftBlockchainGatewayState {
  return {
    id,

    stage:
      "IDLE",

    failureCode:
      "NONE",

    attempt:
      0,

    authoritative:
      false,
  };
}

export function simulateBlockchainGatewayRequest(
  request:
    NftBlockchainGatewayRequest
): NftBlockchainGatewaySimulationResult {
  if (
    request.id.trim().length === 0 ||
    request.chainRef.trim().length === 0
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_INVALID_REQUEST"
    );
  }

  return {
    requestId:
      request.id,

    success:
      true,

    simulationRef:
      `simulation:${request.id}`,

    stage:
      "SIMULATED",

    authoritative:
      false,
  };
}

export function advanceBlockchainGatewayState(
  state:
    NftBlockchainGatewayState,
  next:
    NftBlockchainGatewayState["stage"]
): NftBlockchainGatewayState {
  if (
    !canTransitionBlockchainGateway(
      state.stage,
      next
    )
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_INVALID_TRANSITION"
    );
  }

  return {
    ...state,

    stage:
      next,

    attempt:
      state.attempt + 1,
  };
}
