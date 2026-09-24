import type {
  PulseExecutionAttestation,
} from "../DigitalBoostPulseOutcomeProof";

import {
  fingerprintPulseIdempotencyInput,
} from "./DigitalBoostPulseDistributedIdempotency";

import {
  createPulseDistributedProof,
  type PulseDistributedProofAuditRecord,
  type PulseDistributedProofIdempotencyRecord,
  type PulseDistributedProofRecord,
} from "./DigitalBoostPulseDistributedProof";

export const
  PULSE_DISTRIBUTED_PROOF_ISSUANCE_VERSION =
    "pulse-distributed-proof-issuance-v1";

export class PulseDistributedProofIssuanceError
  extends Error {
  readonly code:
    | "INVALID_INPUT"
    | "ATTESTATION_UNPROVEN"
    | "AUDIT_NOT_FOUND"
    | "AUDIT_MISMATCH"
    | "IDEMPOTENCY_NOT_FOUND"
    | "IDEMPOTENCY_MISMATCH"
    | "TENANT_MISMATCH";

  constructor(
    code:
      PulseDistributedProofIssuanceError["code"],
    message: string,
  ) {
    super(message);
    this.name =
      "PulseDistributedProofIssuanceError";
    this.code = code;
  }
}

type AuditRepository = {
  readAll():
    PulseDistributedProofAuditRecord[];
};

type IdempotencyRepository = {
  get(
    idempotencyKey: string,
  ):
    PulseDistributedProofIdempotencyRecord |
    null;
};

type ProofRepository = {
  get(
    proofId: string,
  ): PulseDistributedProofRecord | null;

  save(
    proof: PulseDistributedProofRecord,
  ): PulseDistributedProofRecord;
};

function required(
  value: unknown,
  name: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new PulseDistributedProofIssuanceError(
      "INVALID_INPUT",
      `${name} is required`,
    );
  }

  return value.trim();
}

export function issuePulseDistributedProof(
  input: {
    tenantId: string;
    idempotencyKey: string;
    executionAttestation:
      PulseExecutionAttestation;
    auditRepository:
      AuditRepository;
    idempotencyRepository:
      IdempotencyRepository;
    proofRepository:
      ProofRepository;
    recordedAt?: string;
  },
): PulseDistributedProofRecord {
  const tenantId =
    required(
      input.tenantId,
      "tenantId",
    );

  if (
    tenantId === "*" ||
    tenantId === "global"
  ) {
    throw new PulseDistributedProofIssuanceError(
      "INVALID_INPUT",
      "tenantId is invalid",
    );
  }

  const idempotencyKey =
    required(
      input.idempotencyKey,
      "idempotencyKey",
    );

  const attestation =
    input.executionAttestation;

  if (
    attestation.source !== "executor" ||
    attestation.state !== "COMPLETED" ||
    attestation.verified !== true ||
    attestation.version !==
      "pulse-execution-attestation-v1"
  ) {
    throw new PulseDistributedProofIssuanceError(
      "ATTESTATION_UNPROVEN",
      "execution attestation is not proven",
    );
  }

  const approvalId =
    required(
      attestation.approval_id,
      "approval_id",
    );

  const proposalHash =
    required(
      attestation.proposal_hash,
      "proposal_hash",
    );

  const policyVersion =
    required(
      attestation.policy_version,
      "policy_version",
    );

  const expectedContextVersion =
    required(
      attestation.expected_context_version,
      "expected_context_version",
    );

  const requestId =
    required(
      attestation.execution_request_id,
      "execution_request_id",
    );

  const auditRows =
    input.auditRepository.readAll();

  const audit =
    auditRows.find(
      (row) => {
        if (
          row.tenant_id !==
          tenantId
        ) {
          return false;
        }

        const a =
          row.audit;

        return (
          a.execution_issuer ===
            "executor" &&
          a.execution_audit_id ===
            attestation.execution_audit_id &&
          a.request_id ===
            requestId &&
          a.mission_id ===
            attestation.mission_id &&
          a.plan_id ===
            attestation.plan_id &&
          a.step_id ===
            attestation.step_id &&
          a.step_index ===
            attestation.step_index &&
          a.tool ===
            attestation.action &&
          a.status ===
            "COMPLETED" &&
          a.result_summary ===
            attestation.execution_audit_event &&
          a.approval_id ===
            approvalId &&
          a.policy_version ===
            policyVersion &&
          a.proposal_hash ===
            proposalHash &&
          a.context_version ===
            expectedContextVersion &&
          a.verification_status ===
            attestation.verification_status &&
          a.verified === true
        );
      },
    );

  if (!audit) {
    throw new PulseDistributedProofIssuanceError(
      "AUDIT_NOT_FOUND",
      "matching durable execution audit was not found",
    );
  }

  const idempotency =
    input.idempotencyRepository.get(
      idempotencyKey,
    );

  if (!idempotency) {
    throw new PulseDistributedProofIssuanceError(
      "IDEMPOTENCY_NOT_FOUND",
      "matching durable idempotency record was not found",
    );
  }

  if (
    idempotency.tenant_id !==
    tenantId
  ) {
    throw new PulseDistributedProofIssuanceError(
      "TENANT_MISMATCH",
      "idempotency record belongs to another tenant",
    );
  }

  if (
    idempotency.idempotency_key !==
    idempotencyKey ||
    idempotency.state !==
    "COMPLETED"
  ) {
    throw new PulseDistributedProofIssuanceError(
      "IDEMPOTENCY_MISMATCH",
      "idempotency record is not completed",
    );
  }

  const expectedFingerprint =
    fingerprintPulseIdempotencyInput({
      tenantId,
      requestId,
      approvalId,
      action:
        attestation.action,
      missionId:
        attestation.mission_id,
      planId:
        attestation.plan_id,
      stepId:
        attestation.step_id,
      stepIndex:
        attestation.step_index,
      proposalHash,
    });

  if (
    idempotency.request_fingerprint !==
    expectedFingerprint
  ) {
    throw new PulseDistributedProofIssuanceError(
      "IDEMPOTENCY_MISMATCH",
      "idempotency fingerprint does not match execution context",
    );
  }

  const proofInput = {
    tenantId,
    requestId,
    approvalId,
    action:
      attestation.action,
    proposalHash,
    policyVersion,
    expectedContextVersion,
    missionId:
      attestation.mission_id,
    planId:
      attestation.plan_id,
    stepId:
      attestation.step_id,
    stepIndex:
      attestation.step_index,
    idempotencyKey,
    requestFingerprint:
      idempotency.request_fingerprint,
    executionAttestation:
      attestation,
    durableAudit:
      audit,
    idempotencyRecord:
      idempotency,
  };

  const proof =
    createPulseDistributedProof({
      ...proofInput,
      recordedAt:
        input.recordedAt,
    });

  const existing =
    input.proofRepository.get(
      proof.proof_id,
    );

  if (existing) {
    const replay =
      createPulseDistributedProof({
        ...proofInput,
        recordedAt:
          existing.recorded_at,
      });

    if (
      replay.content_hash !==
      existing.content_hash
    ) {
      throw new PulseDistributedProofIssuanceError(
        "IDEMPOTENCY_MISMATCH",
        "existing proof does not match the durable execution evidence",
      );
    }

    return existing;
  }

  return input.proofRepository.save(
    proof,
  );
}
