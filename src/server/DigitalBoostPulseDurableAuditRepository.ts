import {
  createHash,
  randomUUID,
} from "node:crypto";

import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

export const PULSE_DURABLE_AUDIT_VERSION =
  "pulse-durable-audit-v1";

export interface PulseDurableAuditRecord<TAudit = unknown> {
  readonly audit_id: string;
  readonly tenant_id: string;
  readonly sequence: number;
  readonly recorded_at: string;
  readonly previous_hash: string | null;
  readonly audit: TAudit;
  readonly content_hash: string;
}

interface PersistedDurableAuditRecord<TAudit = unknown> {
  readonly version: string;
  readonly audit_id: string;
  readonly tenant_id: string;
  readonly sequence: number;
  readonly recorded_at: string;
  readonly previous_hash: string | null;
  readonly audit: TAudit;
  readonly content_hash: string;
}

const GENESIS_HASH = "GENESIS";

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

export class PulseDurableAuditError extends Error {
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_AUDIT"
    | "AUDIT_STORAGE_ERROR"
    | "AUDIT_LOCKED"
    | "AUDIT_TAMPERED"
    | "AUDIT_SEQUENCE_INVALID"
    | "AUDIT_HASH_INVALID";

  constructor(
    code: PulseDurableAuditError["code"],
    message: string,
  ) {
    super(message);
    this.name = "PulseDurableAuditError";
    this.code = code;
  }
}

function normalizeTenant(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseDurableAuditError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  const tenant =
    value.trim();

  if (!tenant) {
    throw new PulseDurableAuditError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  if (
    WILDCARD_TENANTS.has(
      tenant.toLowerCase(),
    )
  ) {
    throw new PulseDurableAuditError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenant;
}

function assertAuditPayload(
  audit: unknown,
): void {
  if (
    audit === null ||
    typeof audit !== "object"
  ) {
    throw new PulseDurableAuditError(
      "INVALID_AUDIT",
      "audit payload must be an object.",
    );
  }
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
      throw new PulseDurableAuditError(
        "INVALID_AUDIT",
        "Audit payload contains a non-finite number.",
      );
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(
        (item) =>
          canonicalize(item),
      )
      .join(",")}]`;
  }

  if (typeof value === "object") {
    const object =
      value as Record<string, unknown>;

    const keys =
      Object.keys(object)
        .filter(
          (key) =>
            object[key] !==
            undefined,
        )
        .sort();

    return `{${keys
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalize(
            object[key],
          )}`,
      )
      .join(",")}}`;
  }

  throw new PulseDurableAuditError(
    "INVALID_AUDIT",
    `Unsupported audit payload type: ${typeof value}`,
  );
}

function sha256(
  value: string,
): string {
  return createHash("sha256")
    .update(
      value,
      "utf8",
    )
    .digest("hex");
}

function tenantNamespace(
  tenantId: string,
): string {
  return sha256(
    `pulse-durable-audit-tenant-v1:${tenantId}`,
  );
}

function tenantDirectory(
  root: string,
  tenantId: string,
): string {
  return join(
    root,
    tenantNamespace(tenantId),
  );
}

function tenantAuditFile(
  tenantDir: string,
): string {
  return join(
    tenantDir,
    "audit.jsonl",
  );
}

function tenantLockFile(
  tenantDir: string,
): string {
  return join(
    tenantDir,
    ".audit.lock",
  );
}

function recordHash<TAudit>(
  record: {
    version: string;
    audit_id: string;
    tenant_id: string;
    sequence: number;
    recorded_at: string;
    previous_hash: string | null;
    audit: TAudit;
  },
): string {
  return sha256(
    canonicalize(record),
  );
}

function defaultRoot(): string {
  const configured =
    process.env
      .DIGITALBOOST_PULSE_DURABLE_AUDIT_ROOT;

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
    "audit",
  );
}

function durableAppend(
  filePath: string,
  serialized: string,
): void {
  const fd =
    openSync(
      filePath,
      "a",
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

export class FilesystemPulseDurableAuditRepository {
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
      tenantDirectory(
        this.rootDir,
        this.tenantId,
      );

    mkdirSync(
      this.tenantDir,
      {
        recursive: true,
        mode: 0o700,
      },
    );
  }

  private acquireLock(): string {
    const lock =
      tenantLockFile(
        this.tenantDir,
      );

    try {
      writeFileSync(
        lock,
        `${process.pid}\n`,
        {
          encoding: "utf8",
          mode: 0o600,
          flag: "wx",
        },
      );
    } catch {
      throw new PulseDurableAuditError(
        "AUDIT_LOCKED",
        "Audit repository is currently locked.",
      );
    }

    return lock;
  }

  private releaseLock(
    lock: string,
  ): void {
    try {
      if (existsSync(lock)) {
        unlinkSync(lock);
      }
    } catch {
      /*
       * Recovery/stale-lock policy is deliberately outside this phase.
       */
    }
  }

  private readAllInternal<
    TAudit = unknown,
  >(): PersistedDurableAuditRecord<TAudit>[] {
    const path =
      tenantAuditFile(
        this.tenantDir,
      );

    if (!existsSync(path)) {
      return [];
    }

    const contents =
      readFileSync(
        path,
        "utf8",
      );

    const lines =
      contents
        .split("\n")
        .filter(
          (line) =>
            line.trim() !== "",
        );

    const records:
      PersistedDurableAuditRecord<TAudit>[] =
      [];

    for (
      let index = 0;
      index < lines.length;
      index += 1
    ) {
      let parsed:
        PersistedDurableAuditRecord<TAudit>;

      try {
        parsed =
          JSON.parse(
            lines[index],
          ) as PersistedDurableAuditRecord<TAudit>;
      } catch {
        throw new PulseDurableAuditError(
          "AUDIT_TAMPERED",
          `Audit line ${index + 1} is not valid JSON.`,
        );
      }

      if (
        parsed.version !==
        PULSE_DURABLE_AUDIT_VERSION
      ) {
        throw new PulseDurableAuditError(
          "AUDIT_TAMPERED",
          `Unsupported audit version at sequence ${parsed.sequence}.`,
        );
      }

      if (
        parsed.tenant_id !==
        this.tenantId
      ) {
        throw new PulseDurableAuditError(
          "AUDIT_TAMPERED",
          `Audit sequence ${parsed.sequence} belongs to another tenant.`,
        );
      }

      const expectedSequence =
        index + 1;

      if (
        parsed.sequence !==
        expectedSequence
      ) {
        throw new PulseDurableAuditError(
          "AUDIT_SEQUENCE_INVALID",
          `Expected audit sequence ${expectedSequence}, received ${parsed.sequence}.`,
        );
      }

      const expectedPrevious =
        index === 0
          ? null
          : records[
              index - 1
            ].content_hash;

      if (
        parsed.previous_hash !==
        expectedPrevious
      ) {
        throw new PulseDurableAuditError(
          "AUDIT_HASH_INVALID",
          `Audit sequence ${parsed.sequence} has an invalid previous_hash.`,
        );
      }

      const expectedHash =
        recordHash({
          version:
            parsed.version,
          audit_id:
            parsed.audit_id,
          tenant_id:
            parsed.tenant_id,
          sequence:
            parsed.sequence,
          recorded_at:
            parsed.recorded_at,
          previous_hash:
            parsed.previous_hash,
          audit:
            parsed.audit,
        });

      if (
        expectedHash !==
        parsed.content_hash
      ) {
        throw new PulseDurableAuditError(
          "AUDIT_TAMPERED",
          `Audit sequence ${parsed.sequence} failed hash verification.`,
        );
      }

      records.push(
        parsed,
      );
    }

    return records;
  }

  append<TAudit = unknown>(
    audit: TAudit,
  ): PulseDurableAuditRecord<TAudit> {
    assertAuditPayload(audit);

    const lock =
      this.acquireLock();

    try {
      const records =
        this.readAllInternal<TAudit>();

      const sequence =
        records.length + 1;

      const previousHash =
        records.length === 0
          ? null
          : records[
              records.length - 1
            ].content_hash;

      const base = {
        version:
          PULSE_DURABLE_AUDIT_VERSION,
        audit_id:
          randomUUID(),
        tenant_id:
          this.tenantId,
        sequence,
        recorded_at:
          new Date().toISOString(),
        previous_hash:
          previousHash,
        audit,
      };

      const persisted = {
        ...base,
        content_hash:
          recordHash(base),
      };

      durableAppend(
        tenantAuditFile(
          this.tenantDir,
        ),
        JSON.stringify(
          persisted,
        ) + "\n",
      );

      return {
        audit_id:
          persisted.audit_id,
        tenant_id:
          persisted.tenant_id,
        sequence:
          persisted.sequence,
        recorded_at:
          persisted.recorded_at,
        previous_hash:
          persisted.previous_hash,
        audit:
          persisted.audit,
        content_hash:
          persisted.content_hash,
      };
    } finally {
      this.releaseLock(
        lock,
      );
    }
  }

  readAll<TAudit = unknown>():
    PulseDurableAuditRecord<TAudit>[] {
    return this.readAllInternal<TAudit>()
      .map(
        (record) => ({
          audit_id:
            record.audit_id,
          tenant_id:
            record.tenant_id,
          sequence:
            record.sequence,
          recorded_at:
            record.recorded_at,
          previous_hash:
            record.previous_hash,
          audit:
            record.audit,
          content_hash:
            record.content_hash,
        }),
      );
  }

  verifyIntegrity():
    void {
    this.readAllInternal();
  }

  count(): number {
    return this.readAllInternal().length;
  }
}

export const PULSE_DURABLE_AUDIT_GENESIS =
  GENESIS_HASH;
