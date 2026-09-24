import test from "node:test";
import assert from "node:assert/strict";

import {
  mkdtempSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  tmpdir,
} from "node:os";

import {
  createPulseExecutionAttestation,
} from "../../src/DigitalBoostPulseOutcomeProof";

import {
  fingerprintPulseIdempotencyInput,
  FilesystemPulseDistributedIdempotencyStore,
} from "../../src/server/DigitalBoostPulseDistributedIdempotency";

import {
  FilesystemPulseDurableAuditRepository,
} from "../../src/server/DigitalBoostPulseDurableAuditRepository";

import {
  FilesystemPulseDistributedProofRepository,
} from "../../src/server/DigitalBoostPulseDistributedProof";

import {
  executePulseServerRequestWithDistributedProof,
} from "../../src/server/DigitalBoostPulseServerProofExecution";

import type {
  PulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseServerExecutor";

function root(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0432-",
    ),
  );
}

function fixture() {
  const storage = root();

  const requestId =
    "req-p0432";

  const tenantId =
    "tenant-p0432";

  const approvalId =
    "approval-p0432";

  const action =
    "hero";

  const proposalHash =
    "proposal-p0432";

  const policyVersion =
    "pulse-gov-v1";

  const contextVersion =
    "ctx-p0432";

  const missionId =
    "mission-p0432";

  const planId =
    "plan-p0432";

  const stepId =
    "step-p0432";

  const stepIndex =
    0;

  const auditId =
    "execution-audit-p0432";

  const auditEvent =
    "EXECUTION_COMPLETED";

  const timestamp =
    "2026-09-24T00:00:00.000Z";

  const request:
    PulseServerExecutionRequest = {
      boundary_version:
        "pulse-execution-boundary-v1",
      request_id:
        requestId,
      tenant_id:
        tenantId,
      approval_id:
        approvalId,
      action,
      proposal_hash:
        proposalHash,
      policy_version:
        policyVersion,
      expected_context_version:
        contextVersion,
      mission_id:
        missionId,
      plan_id:
        planId,
      step_id:
        stepId,
      step_index:
        stepIndex,
      issued_at:
        timestamp,
    };

  const attestation =
    createPulseExecutionAttestation({
      missionId,
      planId,
      stepId,
      stepIndex,
      action,
      executionRequestId:
        requestId,
      approvalId,
      policyVersion,
      proposalHash,
      expectedContextVersion:
        contextVersion,
      currentContextVersion:
        contextVersion,
      verificationStatus:
        "PASS",
      verified:
        true,
      executionAudit: {
        request_id:
          requestId,
        event:
          auditEvent,
        state:
          "COMPLETED",
        action,
        timestamp,
        execution_audit_id:
          auditId,
      },
      state:
        "COMPLETED",
    });

  const auditRepository =
    new FilesystemPulseDurableAuditRepository({
      tenantId,
      rootDir:
        join(
          storage,
          "audit",
        ),
    });

  auditRepository.append({
    execution_issuer:
      "executor",
    execution_audit_id:
      auditId,
    request_id:
      requestId,
    mission_id:
      missionId,
    plan_id:
      planId,
    step_id:
      stepId,
    step_index:
      stepIndex,
    tool:
      action,
    status:
      "COMPLETED",
    result_summary:
      auditEvent,
    timestamp,
    approval_id:
      approvalId,
    policy_version:
      policyVersion,
    proposal_hash:
      proposalHash,
    context_version:
      contextVersion,
    verification_status:
      "PASS",
    verified:
      true,
  });

  const idempotencyRepository =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId,
      rootDir:
        join(
          storage,
          "idempotency",
        ),
    });

  const fingerprint =
    fingerprintPulseIdempotencyInput({
      tenantId,
      requestId,
      approvalId,
      action,
      missionId,
      planId,
      stepId,
      stepIndex,
      proposalHash,
    });

  idempotencyRepository.begin({
    idempotency_key:
      requestId,
    request_fingerprint:
      fingerprint,
  });

  idempotencyRepository.complete({
    idempotency_key:
      requestId,
    request_fingerprint:
      fingerprint,
    outcome: {
      status:
        "EXECUTED",
      evidence_id:
        "evidence-p0432",
    },
  });

  const proofRepository =
    new FilesystemPulseDistributedProofRepository({
      tenantId,
      rootDir:
        join(
          storage,
          "proof",
        ),
    });

  const claimStore = {
    async claim() {
      return {
        claimed:
          true,
      };
    },
  };

  return {
    request,
    tenantId,
    attestation,
    auditRepository,
    idempotencyRepository,
    proofRepository,
    claimStore,
  };
}

test(
  "P0.4.32 EXECUTED + attestation produce PROVEN",
  async () => {
    const f =
      fixture();

    const result =
      await executePulseServerRequestWithDistributedProof(
        f.request,
        {
          claimStore:
            f.claimStore,
          executeAction:
            async () => ({
              completed:
                true,
              verified:
                true,
              evidence_id:
                "evidence-p0432",
              execution_attestation:
                f.attestation,
            }),
          auditRepository:
            f.auditRepository,
          idempotencyRepository:
            f.idempotencyRepository,
          proofRepository:
            f.proofRepository,
        },
      );

    assert.equal(
      result.status,
      "EXECUTED",
    );

    assert.equal(
      result.proof_status,
      "PROVEN",
    );

    assert.ok(
      result.proof,
    );

    assert.equal(
      result.proof_repository_missing ?? null,
      null,
    );
  },
);

test(
  "P0.4.32 EXECUTED sin attestation queda UNPROVEN",
  async () => {
    const f =
      fixture();

    const result =
      await executePulseServerRequestWithDistributedProof(
        f.request,
        {
          claimStore:
            f.claimStore,
          executeAction:
            async () => ({
              completed:
                true,
              verified:
                true,
              evidence_id:
                "evidence-p0432",
            }),
          auditRepository:
            f.auditRepository,
          idempotencyRepository:
            f.idempotencyRepository,
          proofRepository:
            f.proofRepository,
        },
      );

    assert.equal(
      result.status,
      "EXECUTED",
    );

    assert.equal(
      result.proof_status,
      "UNPROVEN",
    );

    assert.equal(
      f.proofRepository.count(),
      0,
    );
  },
);

test(
  "P0.4.32 replay del proof conserva content_hash",
  async () => {
    const f =
      fixture();

    const options = {
      claimStore:
        f.claimStore,
      executeAction:
        async () => ({
          completed:
            true,
          verified:
            true,
          evidence_id:
            "evidence-p0432",
          execution_attestation:
            f.attestation,
        }),
      auditRepository:
        f.auditRepository,
      idempotencyRepository:
        f.idempotencyRepository,
      proofRepository:
        f.proofRepository,
    };

    const first =
      await executePulseServerRequestWithDistributedProof(
        f.request,
        options,
      );

    const second =
      await executePulseServerRequestWithDistributedProof(
        f.request,
        options,
      );

    assert.equal(
      first.proof_status,
      "PROVEN",
    );

    assert.equal(
      second.proof_status,
      "PROVEN",
    );

    assert.equal(
      first.proof?.content_hash,
      second.proof?.content_hash,
    );

    assert.equal(
      f.proofRepository.count(),
      1,
    );
  },
);
