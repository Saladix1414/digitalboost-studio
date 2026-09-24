import test from "node:test";
import assert from "node:assert/strict";

import {
  mkdtempSync,
} from "node:fs";

import {
  createHash,
} from "node:crypto";

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
  issuePulseDistributedProof,
} from "../../src/server/DigitalBoostPulseProofIssuanceBoundary";

function root(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0431-",
    ),
  );
}

function fixture() {
  const storage = root();

  const tenantId =
    "tenant-p0431";

  const requestId =
    "req-p0431";

  const approvalId =
    "approval-p0431";

  const action =
    "hero";

  const proposalHash =
    "proposal-p0431";

  const policyVersion =
    "pulse-gov-v1";

  const contextVersion =
    "ctx-p0431";

  const missionId =
    "mission-p0431";

  const planId =
    "plan-p0431";

  const stepId =
    "step-p0431";

  const stepIndex = 0;

  const executionAuditId =
    "execution-audit-p0431";

  const executionAuditEvent =
    "EXECUTION_COMPLETED";

  const executionTimestamp =
    "2026-09-24T00:00:00.000Z";

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
      verified: true,
      executionAudit: {
        request_id:
          requestId,
        event:
          executionAuditEvent,
        state:
          "COMPLETED",
        action,
        timestamp:
          executionTimestamp,
        execution_audit_id:
          executionAuditId,
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
      executionAuditId,
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
      executionAuditEvent,
    timestamp:
      executionTimestamp,
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

  const idempotencyRepository =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId,
      rootDir:
        join(
          storage,
          "idempotency",
        ),
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
        "evidence-p0431",
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

  return {
    storage,
    tenantId,
    requestId,
    approvalId,
    proposalHash,
    policyVersion,
    contextVersion,
    missionId,
    planId,
    stepId,
    stepIndex,
    attestation,
    auditRepository,
    idempotencyRepository,
    proofRepository,
  };
}

test(
  "P0.4.31 emite proof desde evidencia durable",
  () => {
    const f =
      fixture();

    const proof =
      issuePulseDistributedProof({
        tenantId:
          f.tenantId,
        idempotencyKey:
          f.requestId,
        executionAttestation:
          f.attestation,
        auditRepository:
          f.auditRepository,
        idempotencyRepository:
          f.idempotencyRepository,
        proofRepository:
          f.proofRepository,
      });

    assert.equal(
      proof.proof_status,
      "PROVEN",
    );

    assert.equal(
      proof.verified,
      true,
    );

    assert.equal(
      f.proofRepository.count(),
      1,
    );
  },
);

test(
  "P0.4.31 replay devuelve el mismo proof",
  () => {
    const f =
      fixture();

    const first =
      issuePulseDistributedProof({
        tenantId:
          f.tenantId,
        idempotencyKey:
          f.requestId,
        executionAttestation:
          f.attestation,
        auditRepository:
          f.auditRepository,
        idempotencyRepository:
          f.idempotencyRepository,
        proofRepository:
          f.proofRepository,
      });

    const second =
      issuePulseDistributedProof({
        tenantId:
          f.tenantId,
        idempotencyKey:
          f.requestId,
        executionAttestation:
          f.attestation,
        auditRepository:
          f.auditRepository,
        idempotencyRepository:
          f.idempotencyRepository,
        proofRepository:
          f.proofRepository,
      });

    assert.deepEqual(
      second,
      first,
    );

    assert.equal(
      f.proofRepository.count(),
      1,
    );
  },
);

test(
  "P0.4.31 audit ausente bloquea emisión",
  () => {
    const f =
      fixture();

    const auditRows =
      f.auditRepository.readAll();

    assert.equal(
      auditRows.length,
      1,
    );

    const badAttestation =
      createPulseExecutionAttestation({
        missionId:
          "mission-other",
        planId:
          f.planId,
        stepId:
          f.stepId,
        stepIndex:
          f.stepIndex,
        action:
          f.attestation.action,
        executionRequestId:
          f.requestId,
        approvalId:
          f.approvalId,
        policyVersion:
          f.policyVersion,
        proposalHash:
          f.proposalHash,
        expectedContextVersion:
          f.contextVersion,
        currentContextVersion:
          f.contextVersion,
        verificationStatus:
          "PASS",
        verified: true,
        executionAudit: {
          request_id:
            f.requestId,
          event:
            "EXECUTION_COMPLETED",
          state:
            "COMPLETED",
          action:
            f.attestation.action,
          timestamp:
            f.attestation
              .execution_audit_timestamp,
          execution_audit_id:
            f.attestation
              .execution_audit_id,
        },
        state:
          "COMPLETED",
      });

    assert.throws(
      () =>
        issuePulseDistributedProof({
          tenantId:
            f.tenantId,
          idempotencyKey:
            f.requestId,
          executionAttestation:
            badAttestation,
          auditRepository:
            f.auditRepository,
          idempotencyRepository:
            f.idempotencyRepository,
          proofRepository:
            f.proofRepository,
        }),
      (error) =>
        error instanceof Error &&
        error.message.includes(
          "durable execution audit",
        ),
    );
  },
);

test(
  "P0.4.31 fingerprint inconsistente bloquea emisión",
  () => {
    const f =
      fixture();

    const badStore =
      new FilesystemPulseDistributedIdempotencyStore({
        tenantId:
          f.tenantId,
        rootDir:
          join(
            f.storage,
            "bad-idempotency",
          ),
      });

    const tamperedFingerprint =
      createHash("sha256")
        .update("tampered-fingerprint")
        .digest("hex");

    badStore.begin({
      idempotency_key:
        f.requestId,
      request_fingerprint:
        tamperedFingerprint,
    });

    badStore.complete({
      idempotency_key:
        f.requestId,
      request_fingerprint:
        tamperedFingerprint,
      outcome: {
        status:
          "EXECUTED",
      },
    });

    assert.throws(
      () =>
        issuePulseDistributedProof({
          tenantId:
            f.tenantId,
          idempotencyKey:
            f.requestId,
          executionAttestation:
            f.attestation,
          auditRepository:
            f.auditRepository,
          idempotencyRepository:
            badStore,
          proofRepository:
            f.proofRepository,
        }),
      (error) =>
        error instanceof Error &&
        error.message.includes(
          "fingerprint",
        ),
    );
  },
);

test(
  "P0.4.31 attestation no verificada bloquea emisión",
  () => {
    const f =
      fixture();

    const badAttestation =
      {
        ...f.attestation,
        verified:
          false,
      };

    assert.throws(
      () =>
        issuePulseDistributedProof({
          tenantId:
            f.tenantId,
          idempotencyKey:
            f.requestId,
          executionAttestation:
            badAttestation,
          auditRepository:
            f.auditRepository,
          idempotencyRepository:
            f.idempotencyRepository,
          proofRepository:
            f.proofRepository,
        }),
      (error) =>
        error instanceof Error &&
        error.message.includes(
          "not proven",
        ),
    );
  },
);
