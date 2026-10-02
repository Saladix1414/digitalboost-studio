import type {
  NftBlockchainGatewayStage,
} from "./types";

const transitions:
  Record<
    NftBlockchainGatewayStage,
    readonly NftBlockchainGatewayStage[]
  > = {
    IDLE: [
      "READ",
      "SIMULATED",
      "FAILED",
    ],

    READ: [
      "SIMULATED",
      "FAILED",
    ],

    SIMULATED: [
      "SEND_PREPARED",
      "FAILED",
    ],

    SEND_PREPARED: [
      "SUBMITTED",
      "FAILED",
    ],

    SUBMITTED: [
      "VERIFIED",
      "FAILED",
    ],

    VERIFIED: [
      "INDEXED",
      "FAILED",
    ],

    INDEXED: [],

    FAILED: [],
  };

export function canTransitionBlockchainGateway(
  from:
    NftBlockchainGatewayStage,
  to:
    NftBlockchainGatewayStage
): boolean {
  return transitions[from].includes(
    to
  );
}
