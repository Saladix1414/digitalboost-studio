import {
  advanceBlockchainGatewayState,
  createBlockchainGatewayState,
} from "./gateway";

import {
  simulateNftBlockchainRequest,
} from "./simulation";

import {
  prepareNftBlockchainSend,
} from "./sendPreparation";

import type {
  NftBlockchainGatewayRequest,
} from "./types";

export function prepareNftBlockchainGatewayRequest(
  request:
    NftBlockchainGatewayRequest
) {
  let state =
    createBlockchainGatewayState(
      `gateway-state:${request.id}`
    );

  const simulation =
    simulateNftBlockchainRequest(
      request
    );

  if (
    simulation.status !==
      "PASS"
  ) {
    return {
      state: {
        ...state,

        stage:
          "FAILED" as const,

        failureCode:
          "SIMULATION_FAILED" as const,

        attempt:
          state.attempt + 1,
      },

      simulation,

      preparation:
        null,

      authoritative:
        false as const,
    };
  }

  state =
    advanceBlockchainGatewayState(
      state,
      "SIMULATED"
    );

  const preparation =
    prepareNftBlockchainSend(
      request,
      simulation
    );

  state =
    advanceBlockchainGatewayState(
      state,
      "SEND_PREPARED"
    );

  return {
    state,

    simulation,

    preparation,

    authoritative:
      false as const,
  };
}
