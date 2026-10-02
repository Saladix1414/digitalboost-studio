import type {
  NftBlockchainGatewayRequest,
  NftBlockchainSendPreparation,
  NftBlockchainSimulationReport,
} from "./types";

export function prepareNftBlockchainSend(
  request:
    NftBlockchainGatewayRequest,
  simulation:
    NftBlockchainSimulationReport
): NftBlockchainSendPreparation {
  if (
    simulation.requestId !==
      request.id
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_SIMULATION_REQUEST_MISMATCH"
    );
  }

  if (
    simulation.status !==
      "PASS"
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_SIMULATION_REQUIRED"
    );
  }

  if (
    !request.contractRef ||
    !request.payloadRef
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_SEND_PREPARATION_INVALID"
    );
  }

  return {
    requestId:
      request.id,

    chainRef:
      request.chainRef,

    contractRef:
      request.contractRef,

    payloadRef:
      request.payloadRef,

    simulationRef:
      simulation.simulationRef,

    stage:
      "SEND_PREPARED",

    walletSigningRequired:
      true,

    transactionSubmitted:
      false,

    executable:
      false,

    authoritative:
      false,
  };
}
