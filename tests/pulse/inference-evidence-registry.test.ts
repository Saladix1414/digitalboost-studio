import test from "node:test";
import assert from "node:assert/strict";

import {
  hashProposal,
} from "../../src/DigitalBoostPulseContracts.ts";


import {
  PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT,
  countPulseInferenceEvidenceRecords,
  createPulseInferenceEvidenceRecord,
  findPulseInferenceEvidenceRecord,
  listPulseInferenceEvidenceRecords,
  recordPulseInferenceEvidence,
  savePulseInferenceEvidenceRecord,
  validatePulseInferenceEvidenceRegistry,
  verifyPulseInferenceEvidenceRecord,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceRegistry.ts";

import {
  createPulseInferenceEvidence,
} from "../../src/ai/DigitalBoostPulseInferenceEvidence.ts";

class MemoryStorage {
  private readonly data =
    new Map<string, string>();

  getItem(
    key: string,
  ): string | null {
    return this.data.has(key)
      ? this.data.get(key)!
      : null;
  }

  setItem(
    key: string,
    value: string,
  ): void {
    this.data.set(
      key,
      value,
    );
  }

  removeItem(
    key: string,
  ): void {
    this.data.delete(
      key,
    );
  }

  clear(): void {
    this.data.clear();
  }
}

const storage =
  new MemoryStorage();

Object.defineProperty(
  globalThis,
  "localStorage",
  {
    value: storage,
    configurable: true,
  },
);

function reset(): void {
  storage.clear();
}

function makeReceipt(
  requestId:
    string,
) {
  return createPulseInferenceEvidence({
    requestId,

    selectionFingerprint:
      "pmi_registry_test",

    selectionModelRef:
      "ollama/qwen3",

    expectedRuntimeModelRef:
      "ollama/qwen3",

    runtimeModelRef:
      "ollama/qwen3",

    provider:
      "ollama",

    status:
      "COMPLETED",

    bindingStatus:
      "MATCH",

    output:
      {
        answer:
          "registry-test",
      },
  });
}

test(
  "registry contract identity is p0.7.2.5",
  () => {
    reset();

    assert.equal(
      PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT,
      "p0.7.2.5",
    );
  },
);

test(
  "valid receipt becomes a verifiable durable record",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-001",
      );

    const record =
      createPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",

        store:
          "store-a",

        contextId:
          "ctx-a",

        contextVersion:
          7,

        receipt,
      });

    assert.equal(
      record.contract,
      PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT,
    );

    assert.equal(
      record.tenantId,
      "tenant-a",
    );

    assert.equal(
      record.requestId,
      receipt.requestId,
    );

    assert.equal(
      record.evidenceId,
      receipt.evidenceId,
    );

    assert.ok(
      record.registryHash,
    );

    assert.equal(
      verifyPulseInferenceEvidenceRecord(
        record,
      ),
      true,
    );
  },
);

test(
  "record persists and can be recovered",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-002",
      );

    const saved =
      recordPulseInferenceEvidence({
        tenantId:
          "tenant-a",
        store:
          "store-a",
        receipt,
      });

    const found =
      findPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",
        evidenceId:
          saved.evidenceId,
      });

    assert.ok(found);

    assert.equal(
      found!.registryHash,
      saved.registryHash,
    );

    assert.equal(
      countPulseInferenceEvidenceRecords(
        "tenant-a",
      ),
      1,
    );
  },
);

test(
  "tenant isolation prevents cross-tenant retrieval",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-003",
      );

    const saved =
      recordPulseInferenceEvidence({
        tenantId:
          "tenant-a",
        receipt,
      });

    assert.equal(
      listPulseInferenceEvidenceRecords({
        tenantId:
          "tenant-a",
      }).length,
      1,
    );

    assert.equal(
      listPulseInferenceEvidenceRecords({
        tenantId:
          "tenant-b",
      }).length,
      0,
    );

    assert.equal(
      findPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-b",
        evidenceId:
          saved.evidenceId,
      }),
      null,
    );
  },
);

test(
  "same record can be saved idempotently",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-004",
      );

    const record =
      createPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",
        receipt,
      });

    const first =
      savePulseInferenceEvidenceRecord(
        record,
      );

    const second =
      savePulseInferenceEvidenceRecord(
        record,
      );

    assert.equal(
      first.recordId,
      second.recordId,
    );

    assert.equal(
      countPulseInferenceEvidenceRecords(
        "tenant-a",
      ),
      1,
    );
  },
);

test(
  "conflicting replay of same record id is rejected",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-005",
      );

    const record =
      createPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",
        receipt,
      });

    savePulseInferenceEvidenceRecord(
      record,
    );

    /*
     * Preserve the same record identity while changing a registry
     * field and recomputing the registry hash. The record therefore
     * remains structurally valid, but represents a different durable
     * state for the same recordId.
     */
    const changed =
      {
        ...record,
        recordedAt:
          "2099-01-01T00:00:00.000Z",
      };

    const {
      registryHash: _ignored,
      ...changedBase
    } = changed;

    const conflicting =
      {
        ...changed,
        registryHash:
          hashProposal(
            changedBase,
          ),
      };

    assert.equal(
      verifyPulseInferenceEvidenceRecord(
        conflicting,
      ),
      true,
    );

    assert.throws(
      () =>
        savePulseInferenceEvidenceRecord(
          conflicting,
        ),
      /EVIDENCE_REPLAY_CONFLICT/,
    );

    assert.equal(
      countPulseInferenceEvidenceRecords(
        "tenant-a",
      ),
      1,
    );
  },
);

test(
  "tampered receipt invalidates the registry record",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-006",
      );

    const record =
      createPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",
        receipt,
      });

    const tampered =
      {
        ...record,
        evidence: {
          ...record.evidence,
          outputHash:
            "tampered",
        },
      };

    assert.equal(
      verifyPulseInferenceEvidenceRecord(
        tampered,
      ),
      false,
    );
  },
);

test(
  "tampered registry fields invalidate registry hash",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-007",
      );

    const record =
      createPulseInferenceEvidenceRecord({
        tenantId:
          "tenant-a",
        receipt,
      });

    const tampered =
      {
        ...record,
        store:
          "other-store",
      };

    assert.equal(
      verifyPulseInferenceEvidenceRecord(
        tampered,
      ),
      false,
    );

    storage.setItem(
      "db-pulse-inference-evidence-v1",
      JSON.stringify([
        tampered,
      ]),
    );

    const validation =
      validatePulseInferenceEvidenceRegistry(
        "tenant-a",
      );

    assert.equal(
      validation.valid,
      false,
    );

    assert.equal(
      validation.invalidRecordIds.length,
      1,
    );
  },
);

test(
  "invalid inference evidence cannot enter registry",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-008",
      );

    const invalid =
      {
        ...receipt,
        evidenceHash:
          "tampered",
      };

    assert.throws(
      () =>
        createPulseInferenceEvidenceRecord({
          tenantId:
            "tenant-a",
          receipt:
            invalid,
        }),
      /invalid inference evidence/,
    );

    assert.equal(
      countPulseInferenceEvidenceRecords(
        "tenant-a",
      ),
      0,
    );
  },
);

test(
  "request and evidence filters are deterministic",
  () => {
    reset();

    const first =
      makeReceipt(
        "req-registry-009",
      );

    const second =
      makeReceipt(
        "req-registry-010",
      );

    const firstRecord =
      recordPulseInferenceEvidence({
        tenantId:
          "tenant-a",
        receipt:
          first,
      });

    recordPulseInferenceEvidence({
      tenantId:
        "tenant-a",
      receipt:
        second,
    });

    assert.equal(
      listPulseInferenceEvidenceRecords({
        tenantId:
          "tenant-a",
        requestId:
          "req-registry-009",
      }).length,
      1,
    );

    assert.equal(
      listPulseInferenceEvidenceRecords({
        tenantId:
          "tenant-a",
        evidenceId:
          firstRecord.evidenceId,
      }).length,
      1,
    );
  },
);

test(
  "registry does not contain execution authority",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-011",
      );

    const record =
      recordPulseInferenceEvidence({
        tenantId:
          "tenant-a",
        receipt,
      });

    const json =
      JSON.stringify(
        record,
      );

    assert.equal(
      json.includes(
        "executionAttestation",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "approval_id",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "policy_mutation",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "execution_issuer",
      ),
      false,
    );
  },
);

test(
  "wildcard and global tenants are rejected",
  () => {
    reset();

    const receipt =
      makeReceipt(
        "req-registry-012",
      );

    assert.throws(
      () =>
        createPulseInferenceEvidenceRecord({
          tenantId:
            "*",
          receipt,
        }),
      /wildcard\/global/,
    );

    assert.throws(
      () =>
        createPulseInferenceEvidenceRecord({
          tenantId:
            "global",
          receipt,
        }),
      /wildcard\/global/,
    );
  },
);
