import {
  createHash,
} from "node:crypto";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  linkSync,
} from "node:fs";

import {
  join,
} from "node:path";

export const PULSE_APPROVAL_REPOSITORY_VERSION =
  "pulse-approval-repository-v1";

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

export interface PulsePersistentApprovalRecord<TApproval = unknown> {
  readonly tenant_id: string;
  readonly approval_id: string;
  readonly approval: TApproval;
}

interface PersistedApprovalEnvelope<TApproval = unknown> {
  readonly repository_version: string;
  readonly tenant_id: string;
  readonly approval_id: string;
  readonly content_hash: string;
  readonly approval: TApproval;
}

export class PulseApprovalRepositoryError extends Error {
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_APPROVAL_ID"
    | "DUPLICATE_APPROVAL"
    | "APPROVAL_NOT_FOUND"
    | "APPROVAL_TENANT_MISMATCH"
    | "APPROVAL_TAMPERED"
    | "APPROVAL_STORAGE_ERROR";

  constructor(
    code: PulseApprovalRepositoryError["code"],
    message: string,
  ) {
    super(message);
    this.name = "PulseApprovalRepositoryError";
    this.code = code;
  }
}

function normalizeTenantId(value: unknown): string {
  if (typeof value !== "string") {
    throw new PulseApprovalRepositoryError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  const tenantId = value.trim();

  if (!tenantId) {
    throw new PulseApprovalRepositoryError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  if (WILDCARD_TENANTS.has(tenantId.toLowerCase())) {
    throw new PulseApprovalRepositoryError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenantId;
}

function normalizeApprovalId(value: unknown): string {
  if (typeof value !== "string") {
    throw new PulseApprovalRepositoryError(
      "INVALID_APPROVAL_ID",
      "approval_id must be a non-empty string.",
    );
  }

  const approvalId = value.trim();

  if (!approvalId) {
    throw new PulseApprovalRepositoryError(
      "INVALID_APPROVAL_ID",
      "approval_id must be a non-empty string.",
    );
  }

  return approvalId;
}

function stableValue(value: unknown): unknown {
  if (value === null) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_STORAGE_ERROR",
        "Approval payload contains a non-finite number.",
      );
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stableValue(item));
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(object).sort()) {
      result[key] = stableValue(object[key]);
    }

    return result;
  }

  throw new PulseApprovalRepositoryError(
    "APPROVAL_STORAGE_ERROR",
    `Unsupported approval payload type: ${typeof value}`,
  );
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

function sha256(value: string): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

function tenantNamespace(tenantId: string): string {
  return sha256(
    `pulse-approval-tenant-v1:${tenantId}`,
  );
}

function approvalNamespace(approvalId: string): string {
  return sha256(
    `pulse-approval-id-v1:${approvalId}`,
  );
}

function defaultRoot(): string {
  const configured =
    process.env.DIGITALBOOST_PULSE_APPROVAL_REPOSITORY_ROOT;

  if (configured && configured.trim()) {
    return configured.trim();
  }

  return join(
    process.cwd(),
    "data",
    "pulse",
    "approvals",
  );
}

export class PersistentApprovalRepository {
  readonly tenantId: string;
  readonly rootDir: string;
  readonly tenantDir: string;

  constructor(options: {
    tenantId: string;
    rootDir?: string;
  }) {
    this.tenantId = normalizeTenantId(
      options.tenantId,
    );

    this.rootDir =
      options.rootDir?.trim()
        ? options.rootDir.trim()
        : defaultRoot();

    this.tenantDir = join(
      this.rootDir,
      tenantNamespace(this.tenantId),
    );

    mkdirSync(
      this.tenantDir,
      {
        recursive: true,
        mode: 0o700,
      },
    );
  }

  private approvalPath(
    approvalId: string,
  ): string {
    return join(
      this.tenantDir,
      `${approvalNamespace(approvalId)}.json`,
    );
  }

  private assertRecordTenant(
    recordTenantId: unknown,
  ): void {
    const normalized = normalizeTenantId(
      recordTenantId,
    );

    if (normalized !== this.tenantId) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_TENANT_MISMATCH",
        `Approval tenant "${normalized}" does not match repository tenant "${this.tenantId}".`,
      );
    }
  }

  create<TApproval>(
    record: PulsePersistentApprovalRecord<TApproval>,
  ): void {
    const approvalId =
      normalizeApprovalId(
        record.approval_id,
      );

    this.assertRecordTenant(
      record.tenant_id,
    );

    const envelope: PersistedApprovalEnvelope<TApproval> = {
      repository_version:
        PULSE_APPROVAL_REPOSITORY_VERSION,
      tenant_id: this.tenantId,
      approval_id: approvalId,
      content_hash: "",
      approval: record.approval,
    };

    const contentHash = sha256(
      canonicalJson({
        repository_version:
          envelope.repository_version,
        tenant_id: envelope.tenant_id,
        approval_id: envelope.approval_id,
        approval: envelope.approval,
      }),
    );

    const persisted: PersistedApprovalEnvelope<TApproval> = {
      ...envelope,
      content_hash: contentHash,
    };

    const finalPath =
      this.approvalPath(
        approvalId,
      );

    if (existsSync(finalPath)) {
      throw new PulseApprovalRepositoryError(
        "DUPLICATE_APPROVAL",
        `Approval "${approvalId}" already exists.`,
      );
    }

    const tempPath =
      join(
        this.tenantDir,
        `.${approvalNamespace(approvalId)}.${process.pid}.${Date.now()}.tmp`,
      );

    const serialized =
      JSON.stringify(
        persisted,
        null,
        2,
      ) + "\n";

    try {
      writeFileSync(
        tempPath,
        serialized,
        {
          encoding: "utf8",
          mode: 0o600,
          flag: "wx",
        },
      );

      /*
       * Hard-link publication:
       *
       * link(temp, final) fails atomically if final already exists.
       * This preserves immutable approval creation semantics without
       * silently replacing an already persisted approval.
       */
      linkSync(
        tempPath,
        finalPath,
      );

      unlinkSync(tempPath);
    } catch (error) {
      try {
        if (existsSync(tempPath)) {
          unlinkSync(tempPath);
        }
      } catch {
        /* Preserve original failure. */
      }

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (
          error as {
            code?: unknown;
          }
        ).code === "EEXIST"
      ) {
        throw new PulseApprovalRepositoryError(
          "DUPLICATE_APPROVAL",
          `Approval "${approvalId}" already exists.`,
        );
      }

      throw new PulseApprovalRepositoryError(
        "APPROVAL_STORAGE_ERROR",
        `Unable to persist approval "${approvalId}".`,
      );
    }
  }

  get<TApproval = unknown>(
    approvalIdValue: unknown,
  ): PulsePersistentApprovalRecord<TApproval> | null {
    const approvalId =
      normalizeApprovalId(
        approvalIdValue,
      );

    const filePath =
      this.approvalPath(
        approvalId,
      );

    if (!existsSync(filePath)) {
      return null;
    }

    let parsed: PersistedApprovalEnvelope<TApproval>;

    try {
      parsed = JSON.parse(
        readFileSync(
          filePath,
          "utf8",
        ),
      ) as PersistedApprovalEnvelope<TApproval>;
    } catch {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_STORAGE_ERROR",
        `Unable to read approval "${approvalId}".`,
      );
    }

    if (
      parsed.repository_version !==
      PULSE_APPROVAL_REPOSITORY_VERSION
    ) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_STORAGE_ERROR",
        `Unsupported approval repository version for "${approvalId}".`,
      );
    }

    if (
      parsed.approval_id !==
      approvalId
    ) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_STORAGE_ERROR",
        `Approval identifier mismatch for "${approvalId}".`,
      );
    }

    this.assertRecordTenant(
      parsed.tenant_id,
    );

    const expectedHash = sha256(
      canonicalJson({
        repository_version:
          parsed.repository_version,
        tenant_id:
          parsed.tenant_id,
        approval_id:
          parsed.approval_id,
        approval:
          parsed.approval,
      }),
    );

    if (
      expectedHash !==
      parsed.content_hash
    ) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_TAMPERED",
        `Approval "${approvalId}" failed integrity verification.`,
      );
    }

    return {
      tenant_id:
        parsed.tenant_id,
      approval_id:
        parsed.approval_id,
      approval:
        parsed.approval,
    };
  }

  require<TApproval = unknown>(
    approvalIdValue: unknown,
  ): PulsePersistentApprovalRecord<TApproval> {
    const approvalId =
      normalizeApprovalId(
        approvalIdValue,
      );

    const record =
      this.get<TApproval>(
        approvalId,
      );

    if (!record) {
      throw new PulseApprovalRepositoryError(
        "APPROVAL_NOT_FOUND",
        `Approval "${approvalId}" was not found.`,
      );
    }

    return record;
  }

  exists(
    approvalIdValue: unknown,
  ): boolean {
    const approvalId =
      normalizeApprovalId(
        approvalIdValue,
      );

    return existsSync(
      this.approvalPath(
        approvalId,
      ),
    );
  }
}
