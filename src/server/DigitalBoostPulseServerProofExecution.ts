import {
  executePulseServerRequest,
  type PulseServerExecutionClaimStore,
  type PulseServerExecutionEvidence,
  type PulseServerExecutionRequest,
  type PulseServerExecutionResult,
} from "../DigitalBoostPulseServerExecutor";

import {
  issuePulseDistributedProof,
} from "./DigitalBoostPulseProofIssuanceBoundary";

import type {
  PulseDistributedProofAuditRecord,
  PulseDistributedProofIdempotencyRecord,
  PulseDistributedProofRecord,
} from "./DigitalBoostPulseDistributedProof";

export const
  PULSE_SERVER_PROOF_EXECUTION_VERSION =
    "pulse-server-proof-execution-v1";

export type PulseServerProofStatus =
  | "PROVEN"
  | "UNPROVEN"
  | "NOT_APPLICABLE";

export type PulseServerProofExecutionResult =
  PulseServerExecutionResult & {
    readonly proof_status:
      PulseServerProofStatus;
    readonly proof?:
      PulseDistributedProofRecord;
    readonly proof_error?: string;
  };

export type PulseServerProofExecutionOptions = {
  readonly claimStore:
    PulseServerExecutionClaimStore;

  readonly executeAction: (
    request: PulseServerExecutionRequest,
  ) =>
    | PulseServerExecutionEvidence
    | Promise<PulseServerExecutionEvidence>;

  readonly auditRepository: {
    readAll():
      PulseDistributedProofAuditRecord[];
  };

  readonly idempotencyRepository: {
    get(
      idempotencyKey: string,
    ):
      PulseDistributedProofIdempotencyRecord |
      null;
  };

  readonly proofRepository: {
    get(
      proofId: string,
    ):
      PulseDistributedProofRecord |
      null;

    save(
      proof: PulseDistributedProofRecord,
    ):
      PulseDistributedProofRecord;
  };

  readonly proofRecordedAt?: string;
};

function requestIdFromInput(
  input: unknown,
): string | null {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return null;
  }

  const candidate =
    input as {
      request_id?: unknown;
    };

  return typeof candidate.request_id ===
    "string" &&
    candidate.request_id.length > 0
    ? candidate.request_id
    : null;
}

export async function
  executePulseServerRequestWithDistributedProof(
    input: unknown,
    options:
      PulseServerProofExecutionOptions,
  ): Promise<
    PulseServerProofExecutionResult
  > {
  const result =
    await executePulseServerRequest(
      input,
      {
        claimStore:
          options.claimStore,
        executeAction:
          options.executeAction,
      },
    );

  if (
    result.status !==
    "EXECUTED"
  ) {
    return {
      ...result,
      proof_status:
        "NOT_APPLICABLE",
    };
  }

  const attestation =
    result.evidence
      ?.execution_attestation;

  if (
    !attestation
  ) {
    return {
      ...result,
      proof_status:
        "UNPROVEN",
      proof_error:
        "EXECUTED result has no execution attestation",
    };
  }

  try {
    const requestId =
      requestIdFromInput(input) ??
      attestation.execution_request_id;

    const proof =
      issuePulseDistributedProof({
        tenantId:
          result.tenant_id as string,
        idempotencyKey:
          requestId,
        executionAttestation:
          attestation,
        auditRepository:
          options.auditRepository,
        idempotencyRepository:
          options.idempotencyRepository,
        proofRepository:
          options.proofRepository,
        recordedAt:
          options.proofRecordedAt,
      });

    return {
      ...result,
      proof_status:
        "PROVEN",
      proof,
    };
  } catch (error) {
    return {
      ...result,
      proof_status:
        "UNPROVEN",
      proof_error:
        error instanceof Error
          ? error.message
          : "distributed proof issuance failed",
    };
  }
}
