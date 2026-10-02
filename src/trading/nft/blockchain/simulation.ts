import type {
  NftBlockchainGatewayRequest,
  NftBlockchainSimulationCheck,
  NftBlockchainSimulationReport,
} from "./types";

function hasText(
  value:
    string | null
): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function simulateNftBlockchainRequest(
  request:
    NftBlockchainGatewayRequest
): NftBlockchainSimulationReport {
  const checks:
    NftBlockchainSimulationCheck[] = [
      {
        code:
          "CHAIN_REFERENCE",

        passed:
          hasText(
            request.chainRef
          ),

        message:
          "Chain reference must be present.",

        authoritative:
          false,
      },

      {
        code:
          "CONTRACT_REFERENCE",

        passed:
          hasText(
            request.contractRef
          ),

        message:
          "Contract reference must be present.",

        authoritative:
          false,
      },

      {
        code:
          "PAYLOAD_REFERENCE",

        passed:
          hasText(
            request.payloadRef
          ),

        message:
          "Payload reference must be present.",

        authoritative:
          false,
      },

      {
        code:
          "EXECUTION_BOUNDARY",

        passed:
          true,

        message:
          "Simulation performs no signing or transaction submission.",

        authoritative:
          false,
      },
    ];

  const passed =
    checks.every(
      (check) =>
        check.passed
    );

  return {
    requestId:
      request.id,

    status:
      passed
        ? "PASS"
        : "FAIL",

    checks,

    simulationRef:
      `simulation:${request.id}`,

    executable:
      false,

    authoritative:
      false,
  };
}
