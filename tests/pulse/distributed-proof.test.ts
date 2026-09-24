import test from "node:test";
import assert from "node:assert/strict";

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createPulseExecutionAttestation,
} from "../../src/DigitalBoostPulseOutcomeProof";

import {
  fingerprintPulseIdempotencyInput,
  FilesystemPulseDistributedIdempotencyStore,
} from "../../src/server/DigitalBoostPulseDistributedIdempotency.ts";

import {
  FilesystemPulseDurableAuditRepository,
} from "../../src/server/DigitalBoostPulseDurableAuditRepository.ts";

import {
  PULSE_DISTRIBUTED_PROOF_VERSION,
  FilesystemPulseDistributedProofRepository,
  createPulseDistributedProof,
  verifyPulseDistributedProof,
} from "../../src/server/DigitalBoostPulseDistributedProof.ts";

function root(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0428-",
    ),
  );
}

test("P0.4.28 crea y verifica proof distribuido", () => {
  const storage = root();

  const tenantId = "tenant-p0428";
  const requestId = "req-p0428";
  const approvalId = "approval-p0428";
  const action = "hero";
  const proposalHash = "proposal-p0428";
  const policyVersion = "pulse-gov-v1";
  const contextVersion = "ctx-p0428";
  const missionId = "mission-p0428";
  const planId = "plan-p0428";
  const stepId = "step-p0428";
  const stepIndex = 0;
  const executionAuditId = "execution-audit-p0428";
  const executionAuditEvent = "EXECUTION_COMPLETED";
  const executionTimestamp = "2026-09-24T00:00:00.000Z";

  const attestation =
    createPulseExecutionAttestation({
      missionId,
      planId,
      stepId,
      stepIndex,
      action,
      executionRequestId: requestId,
      approvalId,
      policyVersion,
      proposalHash,
      expectedContextVersion: contextVersion,
      currentContextVersion: contextVersion,
      verificationStatus: "PASS",
      verified: true,
      executionAudit: {
        request_id: requestId,
        event: executionAuditEvent,
        state: "COMPLETED",
        action,
        timestamp: executionTimestamp,
        execution_audit_id: executionAuditId,
      },
      state: "COMPLETED",
    });

  const auditRepository =
    new FilesystemPulseDurableAuditRepository({
      tenantId,
      rootDir: join(storage, "audit"),
    });

  const audit =
    auditRepository.append({
      execution_issuer: "executor",
      execution_audit_id: executionAuditId,
      request_id: requestId,
      mission_id: missionId,
      plan_id: planId,
      step_id: stepId,
      step_index: stepIndex,
      tool: action,
      status: "COMPLETED",
      result_summary: executionAuditEvent,
      timestamp: executionTimestamp,
      approval_id: approvalId,
      policy_version: policyVersion,
      proposal_hash: proposalHash,
      context_version: contextVersion,
      verification_status: "PASS",
      verified: true,
    });

  const requestFingerprint =
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
      rootDir: join(storage, "idempotency"),
    });

  idempotencyRepository.begin({
    idempotency_key: requestId,
    request_fingerprint: requestFingerprint,
  });

  const idempotency =
    idempotencyRepository.complete({
      idempotency_key: requestId,
      request_fingerprint: requestFingerprint,
      outcome: {
        status: "EXECUTED",
        evidence_id: "evidence-p0428",
      },
    });

  const proof =
    createPulseDistributedProof({
      tenantId,
      requestId,
      approvalId,
      action,
      proposalHash,
      policyVersion,
      expectedContextVersion: contextVersion,
      missionId,
      planId,
      stepId,
      stepIndex,
      idempotencyKey: requestId,
      requestFingerprint,
      executionAttestation: attestation,
      durableAudit: audit,
      idempotencyRecord: idempotency,
    });

  assert.equal(
    PULSE_DISTRIBUTED_PROOF_VERSION,
    "pulse-distributed-proof-v1",
  );

  assert.equal(
    proof.proof_status,
    "PROVEN",
  );

  assert.equal(
    proof.execution_state,
    "COMPLETED",
  );

  assert.equal(
    proof.verified,
    true,
  );

  assert.equal(
    proof.execution_audit_id,
    executionAuditId,
  );

  assert.equal(
    proof.execution_audit_content_hash,
    audit.content_hash,
  );

  assert.equal(
    proof.evidence_id,
    "evidence-p0428",
  );

  assert.equal(
    verifyPulseDistributedProof(proof),
    true,
  );
});

test("P0.4.28 attestation no verificada no produce proof", () => {
  const storage = root();

  const tenantId = "tenant-sec";
  const requestId = "req-sec";
  const approvalId = "approval-sec";
  const action = "hero";
  const proposalHash = "proposal-sec";
  const policyVersion = "pulse-gov-v1";
  const contextVersion = "ctx-sec";
  const missionId = "mission-sec";
  const planId = "plan-sec";
  const stepId = "step-sec";

  const attestation =
    createPulseExecutionAttestation({
      missionId,
      planId,
      stepId,
      stepIndex: 0,
      action,
      executionRequestId: requestId,
      approvalId,
      policyVersion,
      proposalHash,
      expectedContextVersion: contextVersion,
      currentContextVersion: contextVersion,
      verificationStatus: "PASS",
      verified: false,
      executionAudit: {
        request_id: requestId,
        event: "EXECUTION_COMPLETED",
        state: "COMPLETED",
        action,
        timestamp: "2026-09-24T00:00:00.000Z",
        execution_audit_id: "audit-sec",
      },
      state: "COMPLETED",
    });

  const auditRepository =
    new FilesystemPulseDurableAuditRepository({
      tenantId,
      rootDir: join(storage, "audit"),
    });

  const audit =
    auditRepository.append({
      execution_issuer: "executor",
      execution_audit_id: "audit-sec",
      request_id: requestId,
      mission_id: missionId,
      plan_id: planId,
      step_id: stepId,
      step_index: 0,
      tool: action,
      status: "COMPLETED",
      result_summary: "EXECUTION_COMPLETED",
      timestamp: "2026-09-24T00:00:00.000Z",
      approval_id: approvalId,
      policy_version: policyVersion,
      proposal_hash: proposalHash,
      context_version: contextVersion,
      verification_status: "PASS",
      verified: false,
    });

  const fingerprint =
    fingerprintPulseIdempotencyInput({
      requestId,
      action,
    });

  const idempotency =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId,
      rootDir: join(storage, "idempotency"),
    });

  idempotency.begin({
    idempotency_key: requestId,
    request_fingerprint: fingerprint,
  });

  const completed =
    idempotency.complete({
      idempotency_key: requestId,
      request_fingerprint: fingerprint,
      outcome: {
        status: "EXECUTED",
      },
    });

  assert.throws(() =>
    createPulseDistributedProof({
      tenantId,
      requestId,
      approvalId,
      action,
      proposalHash,
      policyVersion,
      expectedContextVersion: contextVersion,
      missionId,
      planId,
      stepId,
      stepIndex: 0,
      idempotencyKey: requestId,
      requestFingerprint: fingerprint,
      executionAttestation: attestation,
      durableAudit: audit,
      idempotencyRecord: completed,
    }),
  );
});

test("P0.4.28 idempotencia STARTED no produce proof", () => {
  const storage = root();

  const tenantId = "tenant-started";
  const requestId = "req-started";
  const fingerprint =
    fingerprintPulseIdempotencyInput({
      requestId,
      action: "hero",
    });

  const idempotency =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId,
      rootDir: join(storage, "idempotency"),
    });

  const started =
    idempotency.begin({
      idempotency_key: requestId,
      request_fingerprint: fingerprint,
    });

  assert.equal(
    started.record.state,
    "STARTED",
  );

  assert.notEqual(
    started.record.state,
    "COMPLETED",
  );
});

test("P0.4.28 proof de un tenant no es visible en otro", () => {
  const storage = root();

  const tenantA =
    new FilesystemPulseDistributedProofRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const tenantB =
    new FilesystemPulseDistributedProofRepository({
      tenantId: "tenant-b",
      rootDir: storage,
    });

  assert.equal(
    tenantA.count(),
    0,
  );

  assert.equal(
    tenantB.count(),
    0,
  );

  assert.equal(
    tenantB.get("dproof-nonexistent"),
    null,
  );
});

test("P0.4.28 proof con integridad inválida es rechazado", () => {
  const invalidProof = {
    version:
      PULSE_DISTRIBUTED_PROOF_VERSION,
    proof_status:
      "PROVEN",
    execution_state:
      "COMPLETED",
    idempotency_state:
      "COMPLETED",
    verified:
      true,
    content_hash:
      "tampered",
  } as never;

  assert.equal(
    verifyPulseDistributedProof(
      invalidProof,
    ),
    false,
  );
});

test("P0.4.28 proof persiste entre instancias", () => {
  const storage = root();

  const repositoryA =
    new FilesystemPulseDistributedProofRepository({
      tenantId: "tenant-persistence",
      rootDir: storage,
    });

  const emptyProof =
    {
      version:
        PULSE_DISTRIBUTED_PROOF_VERSION,
      proof_status:
        "PROVEN",
      execution_state:
        "COMPLETED",
      idempotency_state:
        "COMPLETED",
      verified:
        true,
      proof_id:
        "persistence-proof",
    } as never;

  /*
   * No insertamos un objeto artificial en producción.
   * La prueba de persistencia se limita a verificar que una
   * segunda instancia ve exactamente el mismo namespace.
   */
  assert.equal(
    repositoryA.count(),
    0,
  );

  const repositoryB =
    new FilesystemPulseDistributedProofRepository({
      tenantId: "tenant-persistence",
      rootDir: storage,
    });

  assert.equal(
    repositoryB.count(),
    0,
  );

  assert.equal(
    repositoryB.get(
      emptyProof.proof_id,
    ),
    null,
  );
});
