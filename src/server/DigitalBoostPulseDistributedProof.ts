import {
  createHash,
} from "node:crypto";

import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import type {
  PulseExecutionAttestation,
} from "../DigitalBoostPulseOutcomeProof";

export const PULSE_DISTRIBUTED_PROOF_VERSION =
  "pulse-distributed-proof-v1";

export type PulseDistributedProofStatus =
  "PROVEN";

export interface PulseDistributedProofRecord {
  readonly proof_id: string;
  readonly version: typeof PULSE_DISTRIBUTED_PROOF_VERSION;

  readonly tenant_id: string;

  readonly request_id: string;
  readonly approval_id: string;

  readonly action: string;
  readonly proposal_hash: string;
  readonly policy_version: string;
  readonly expected_context_version: string;

  readonly mission_id: string;
  readonly plan_id: string;
  readonly step_id: string;
  readonly step_index: number;

  readonly idempotency_key: string;
  readonly request_fingerprint: string;
  readonly idempotency_state: "COMPLETED";

  readonly execution_state: "COMPLETED";
  readonly verified: true;

  readonly execution_attestation_hash: string;
  readonly execution_audit_id: string;
  readonly execution_audit_content_hash: string;

  readonly evidence_id?: string;

  readonly proof_status: PulseDistributedProofStatus;

  readonly recorded_at: string;

  readonly content_hash: string;
}

export interface PulseDistributedProofAuditPayload {
  readonly execution_issuer?: unknown;
  readonly execution_audit_id?: unknown;
  readonly request_id?: unknown;
  readonly mission_id?: unknown;
  readonly plan_id?: unknown;
  readonly step_id?: unknown;
  readonly step_index?: unknown;
  readonly tool?: unknown;
  readonly status?: unknown;
  readonly result_summary?: unknown;
  readonly timestamp?: unknown;
  readonly approval_id?: unknown;
  readonly policy_version?: unknown;
  readonly proposal_hash?: unknown;
  readonly context_version?: unknown;
  readonly current_context_version?: unknown;
  readonly verification_status?: unknown;
  readonly verified?: unknown;
}

export interface PulseDistributedProofAuditRecord {
  readonly audit_id: string;
  readonly tenant_id: string;
  readonly sequence: number;
  readonly recorded_at: string;
  readonly previous_hash: string | null;
  readonly content_hash: string;
  readonly audit: PulseDistributedProofAuditPayload;
}

export interface PulseDistributedProofIdempotencyRecord {
  readonly tenant_id: string;
  readonly idempotency_key: string;
  readonly request_fingerprint: string;
  readonly state: string;
  readonly outcome?: unknown;
}

export class PulseDistributedProofError extends Error {
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_INPUT"
    | "PROOF_UNPROVEN"
    | "PROOF_TAMPERED"
    | "PROOF_CONFLICT"
    | "PROOF_STORAGE_ERROR";

  constructor(
    code: PulseDistributedProofError["code"],
    message: string,
  ) {
    super(message);
    this.name = "PulseDistributedProofError";
    this.code = code;
  }
}

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

function normalizeTenant(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new PulseDistributedProofError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  const tenant =
    value.trim();

  if (
    WILDCARD_TENANTS.has(
      tenant.toLowerCase(),
    )
  ) {
    throw new PulseDistributedProofError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenant;
}

function requireString(
  value: unknown,
  field: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new PulseDistributedProofError(
      "INVALID_INPUT",
      `${field} must be a non-empty string.`,
    );
  }

  return value;
}

function requireStepIndex(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new PulseDistributedProofError(
      "INVALID_INPUT",
      "step_index must be a non-negative integer.",
    );
  }

  return value;
}

function canonicalize(
  value: unknown,
): string {
  if (value === null) {
    return "null";
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PulseDistributedProofError(
        "INVALID_INPUT",
        "non-finite number cannot be canonicalized",
      );
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return (
      "[" +
      value
        .map(canonicalize)
        .join(",") +
      "]"
    );
  }

  if (typeof value === "object") {
    const object =
      value as Record<string, unknown>;

    const keys =
      Object.keys(object)
        .filter(
          (key) =>
            object[key] !== undefined,
        )
        .sort();

    return (
      "{" +
      keys
        .map(
          (key) =>
            JSON.stringify(key) +
            ":" +
            canonicalize(
              object[key],
            ),
        )
        .join(",") +
      "}"
    );
  }

  throw new PulseDistributedProofError(
    "INVALID_INPUT",
    `unsupported canonical value: ${typeof value}`,
  );
}

function sha256(
  value: string,
): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

function tenantNamespace(
  tenantId: string,
): string {
  return sha256(
    `pulse-distributed-proof-tenant-v1:${tenantId}`,
  );
}

function proofNamespace(
  proofId: string,
): string {
  return sha256(
    `pulse-distributed-proof-id-v1:${proofId}`,
  );
}

function defaultRoot(): string {
  const configured =
    process.env
      .DIGITALBOOST_PULSE_DISTRIBUTED_PROOF_ROOT;

  if (
    configured &&
    configured.trim()
  ) {
    return configured.trim();
  }

  return join(
    process.cwd(),
    "data",
    "pulse",
    "proof",
  );
}

function durableWrite(
  filePath: string,
  serialized: string,
): void {
  const fd =
    openSync(
      filePath,
      "wx",
      0o600,
    );

  try {
    writeFileSync(
      fd,
      serialized,
      "utf8",
    );

    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function proofContentHash(
  proof: Omit<
    PulseDistributedProofRecord,
    "content_hash"
  >,
): string {
  return sha256(
    canonicalize(proof),
  );
}

function proofIdentity(
  input: {
    tenant_id: string;
    request_id: string;
    approval_id: string;
    mission_id: string;
    plan_id: string;
    step_id: string;
    idempotency_key: string;
  },
): string {
  return sha256(
    canonicalize(input),
  );
}

function verifyAttestation(
  attestation:
    PulseExecutionAttestation,
): void {
  const {
    attestation_hash,
    ...base
  } = attestation;

  if (
    attestation.version !==
      "pulse-execution-attestation-v1" ||
    attestation.source !==
      "executor" ||
    attestation.state !==
      "COMPLETED" ||
    attestation.verified !==
      true
  ) {
    throw new PulseDistributedProofError(
      "PROOF_UNPROVEN",
      "execution attestation is not a verified COMPLETED executor attestation",
    );
  }

  if (
    hashProposal(base) !==
    attestation_hash
  ) {
    throw new PulseDistributedProofError(
      "PROOF_TAMPERED",
      "execution attestation hash is invalid",
    );
  }
}

export function createPulseDistributedProof(
  input: {
    tenantId: string;
    requestId: string;
    approvalId: string;

    action: string;
    proposalHash: string;
    policyVersion: string;
    expectedContextVersion: string;

    missionId: string;
    planId: string;
    stepId: string;
    stepIndex: number;

    idempotencyKey: string;
    requestFingerprint: string;

    executionAttestation:
      PulseExecutionAttestation;

    durableAudit:
      PulseDistributedProofAuditRecord;

    idempotencyRecord:
      PulseDistributedProofIdempotencyRecord;

    recordedAt?: string;
  },
): PulseDistributedProofRecord {
  const tenantId =
    normalizeTenant(
      input.tenantId,
    );

  verifyAttestation(
    input.executionAttestation,
  );

  const attestation =
    input.executionAttestation;

  const audit =
    input.durableAudit;

  const idempotency =
    input.idempotencyRecord;

  if (
    audit.tenant_id !==
      tenantId ||
    idempotency.tenant_id !==
      tenantId
  ) {
    throw new PulseDistributedProofError(
      "PROOF_TAMPERED",
      "evidence belongs to another tenant",
    );
  }

  if (
    idempotency.state !==
    "COMPLETED"
  ) {
    throw new PulseDistributedProofError(
      "PROOF_UNPROVEN",
      "idempotency state is not COMPLETED",
    );
  }

  if (
    !idempotency.outcome ||
    typeof idempotency.outcome !==
      "object"
  ) {
    throw new PulseDistributedProofError(
      "PROOF_UNPROVEN",
      "completed idempotency record has no outcome",
    );
  }

  const outcome =
    idempotency.outcome as Record<
      string,
      unknown
    >;

  if (
    outcome.status !==
    "EXECUTED"
  ) {
    throw new PulseDistributedProofError(
      "PROOF_UNPROVEN",
      "idempotency outcome is not EXECUTED",
    );
  }

  const same =
    (
      actual: unknown,
      expected: unknown,
    ) =>
      (actual ?? null) ===
      (expected ?? null);

  if (
    attestation.execution_request_id !==
      input.requestId ||
    attestation.approval_id !==
      input.approvalId ||
    attestation.action !==
      input.action ||
    attestation.proposal_hash !==
      input.proposalHash ||
    attestation.policy_version !==
      input.policyVersion ||
    attestation.expected_context_version !==
      input.expectedContextVersion ||
    attestation.mission_id !==
      input.missionId ||
    attestation.plan_id !==
      input.planId ||
    attestation.step_id !==
      input.stepId ||
    attestation.step_index !==
      input.stepIndex ||
    audit.audit.execution_issuer !==
      "executor" ||
    audit.audit.execution_audit_id !==
      attestation.execution_audit_id ||
    audit.audit.request_id !==
      input.requestId ||
    audit.audit.mission_id !==
      input.missionId ||
    audit.audit.plan_id !==
      input.planId ||
    audit.audit.step_id !==
      input.stepId ||
    audit.audit.step_index !==
      input.stepIndex ||
    audit.audit.tool !==
      input.action ||
    audit.audit.status !==
      "COMPLETED" ||
    audit.audit.result_summary !==
      attestation.execution_audit_event ||
    !same(
      audit.audit.approval_id,
      input.approvalId,
    ) ||
    !same(
      audit.audit.policy_version,
      input.policyVersion,
    ) ||
    !same(
      audit.audit.proposal_hash,
      input.proposalHash,
    ) ||
    !same(
      audit.audit.context_version,
      input.expectedContextVersion,
    ) ||
    audit.audit.verified !==
      true ||
    idempotency.idempotency_key !==
      input.idempotencyKey ||
    idempotency.request_fingerprint !==
      input.requestFingerprint
  ) {
    throw new PulseDistributedProofError(
      "PROOF_UNPROVEN",
      "proof evidence does not form one execution identity",
    );
  }

  if (
    !/^[0-9a-f]{64}$/.test(
      audit.content_hash,
    )
  ) {
    throw new PulseDistributedProofError(
      "PROOF_TAMPERED",
      "durable audit content hash is invalid",
    );
  }

  const proof_id =
    "dproof_" +
    proofIdentity({
      tenant_id:
        tenantId,
      request_id:
        input.requestId,
      approval_id:
        input.approvalId,
      mission_id:
        input.missionId,
      plan_id:
        input.planId,
      step_id:
        input.stepId,
      idempotency_key:
        input.idempotencyKey,
    });

  const base: Omit<
    PulseDistributedProofRecord,
    "content_hash"
  > = {
    proof_id,
    version:
      PULSE_DISTRIBUTED_PROOF_VERSION,

    tenant_id:
      tenantId,

    request_id:
      requireString(
        input.requestId,
        "request_id",
      ),

    approval_id:
      requireString(
        input.approvalId,
        "approval_id",
      ),

    action:
      requireString(
        input.action,
        "action",
      ),

    proposal_hash:
      requireString(
        input.proposalHash,
        "proposal_hash",
      ),

    policy_version:
      requireString(
        input.policyVersion,
        "policy_version",
      ),

    expected_context_version:
      requireString(
        input.expectedContextVersion,
        "expected_context_version",
      ),

    mission_id:
      requireString(
        input.missionId,
        "mission_id",
      ),

    plan_id:
      requireString(
        input.planId,
        "plan_id",
      ),

    step_id:
      requireString(
        input.stepId,
        "step_id",
      ),

    step_index:
      requireStepIndex(
        input.stepIndex,
      ),

    idempotency_key:
      requireString(
        input.idempotencyKey,
        "idempotency_key",
      ),

    request_fingerprint:
      requireString(
        input.requestFingerprint,
        "request_fingerprint",
      ),

    idempotency_state:
      "COMPLETED",

    execution_state:
      "COMPLETED",

    verified:
      true,

    execution_attestation_hash:
      attestation.attestation_hash,

    execution_audit_id:
      attestation.execution_audit_id,

    execution_audit_content_hash:
      audit.content_hash,

    ...(typeof outcome.evidence_id ===
      "string"
      ? {
          evidence_id:
            outcome.evidence_id,
        }
      : {}),

    proof_status:
      "PROVEN",

    recorded_at:
      input.recordedAt ??
      new Date().toISOString(),
  };

  return {
    ...base,
    content_hash:
      proofContentHash(
        base,
      ),
  };
}

export function verifyPulseDistributedProof(
  proof:
    PulseDistributedProofRecord,
): boolean {
  try {
    if (
      proof.version !==
        PULSE_DISTRIBUTED_PROOF_VERSION ||
      proof.proof_status !==
        "PROVEN" ||
      proof.execution_state !==
        "COMPLETED" ||
      proof.idempotency_state !==
        "COMPLETED" ||
      proof.verified !==
        true
    ) {
      return false;
    }

    const {
      content_hash,
      ...base
    } = proof;

    return (
      proofContentHash(
        base,
      ) ===
      content_hash
    );
  } catch {
    return false;
  }
}

function proofPath(
  rootDir: string,
  tenantId: string,
  proofId: string,
): string {
  return join(
    rootDir,
    tenantNamespace(
      tenantId,
    ),
    `${proofNamespace(
      proofId,
    )}.json`,
  );
}

export class FilesystemPulseDistributedProofRepository {
  readonly tenantId: string;
  readonly rootDir: string;
  readonly tenantDir: string;

  constructor(options: {
    tenantId: string;
    rootDir?: string;
  }) {
    this.tenantId =
      normalizeTenant(
        options.tenantId,
      );

    this.rootDir =
      options.rootDir?.trim()
        ? options.rootDir.trim()
        : defaultRoot();

    this.tenantDir =
      join(
        this.rootDir,
        tenantNamespace(
          this.tenantId,
        ),
      );

    mkdirSync(
      this.tenantDir,
      {
        recursive: true,
        mode: 0o700,
      },
    );
  }

  save(
    proof:
      PulseDistributedProofRecord,
  ): PulseDistributedProofRecord {
    if (
      proof.tenant_id !==
      this.tenantId
    ) {
      throw new PulseDistributedProofError(
        "PROOF_TAMPERED",
        "proof belongs to another tenant",
      );
    }

    if (
      !verifyPulseDistributedProof(
        proof,
      )
    ) {
      throw new PulseDistributedProofError(
        "PROOF_TAMPERED",
        "proof failed integrity verification",
      );
    }

    const path =
      proofPath(
        this.rootDir,
        this.tenantId,
        proof.proof_id,
      );

    if (
      existsSync(path)
    ) {
      const existing =
        JSON.parse(
          readFileSync(
            path,
            "utf8",
          ),
        ) as PulseDistributedProofRecord;

      if (
        !verifyPulseDistributedProof(
          existing,
        )
      ) {
        throw new PulseDistributedProofError(
          "PROOF_TAMPERED",
          "existing proof failed integrity verification",
        );
      }

      if (
        existing.content_hash !==
        proof.content_hash
      ) {
        throw new PulseDistributedProofError(
          "PROOF_CONFLICT",
          "proof id already contains different content",
        );
      }

      return existing;
    }

    const serialized =
      JSON.stringify(
        proof,
        null,
        2,
      ) + "\n";

    durableWrite(
      path,
      serialized,
    );

    return proof;
  }

  get(
    proofId: string,
  ):
    PulseDistributedProofRecord |
    null {
    const id =
      requireString(
        proofId,
        "proof_id",
      );

    const path =
      proofPath(
        this.rootDir,
        this.tenantId,
        id,
      );

    if (
      !existsSync(path)
    ) {
      return null;
    }

    const proof =
      JSON.parse(
        readFileSync(
          path,
          "utf8",
        ),
      ) as PulseDistributedProofRecord;

    if (
      proof.tenant_id !==
      this.tenantId
    ) {
      throw new PulseDistributedProofError(
        "PROOF_TAMPERED",
        "stored proof belongs to another tenant",
      );
    }

    if (
      !verifyPulseDistributedProof(
        proof,
      )
    ) {
      throw new PulseDistributedProofError(
        "PROOF_TAMPERED",
        "stored proof failed integrity verification",
      );
    }

    return proof;
  }

  count(): number {
    return this.list().length;
  }

  list():
    PulseDistributedProofRecord[] {
    if (
      !existsSync(
        this.tenantDir,
      )
    ) {
      return [];
    }

    return readdirSafe(
      this.tenantDir,
    ).map(
      (name) =>
        this.get(
          name.slice(
            0,
            -5,
          ),
        )!,
    );
  }

  verifyIntegrity(): void {
    for (
      const proof of this.list()
    ) {
      if (
        !verifyPulseDistributedProof(
          proof,
        )
      ) {
        throw new PulseDistributedProofError(
          "PROOF_TAMPERED",
          "proof integrity verification failed",
        );
      }
    }
  }
}

function readdirSafe(
  directory: string,
): string[] {
  return readdirSync(
    directory,
  );
}
