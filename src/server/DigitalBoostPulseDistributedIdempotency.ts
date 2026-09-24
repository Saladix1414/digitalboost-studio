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
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

export const PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION =
  "pulse-distributed-idempotency-v1";

export const PULSE_IDEMPOTENCY_DEFAULT_LEASE_MS =
  30_000;

export type PulseIdempotencyState =
  | "STARTED"
  | "COMPLETED"
  | "FAILED"
  | "RECOVERY_REQUIRED";

export interface PulseIdempotencyRecord<TOutcome = unknown> {
  readonly tenant_id: string;
  readonly idempotency_key: string;
  readonly request_fingerprint: string;
  readonly state: PulseIdempotencyState;
  readonly acquired_at?: string;
  readonly lease_expires_at?: string;
  readonly recovered_at?: string;
  readonly recovery_reason?: string;
  readonly outcome?: TOutcome;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export type PulseIdempotencyBeginResult<TOutcome = unknown> =
  | {
      readonly decision: "ACQUIRED";
      readonly record: PulseIdempotencyRecord<TOutcome>;
    }
  | {
      readonly decision: "REPLAY";
      readonly record: PulseIdempotencyRecord<TOutcome>;
    };

interface PersistedIdempotencyRecord<TOutcome = unknown> {
  readonly repository_version: string;
  readonly tenant_id: string;
  readonly idempotency_key: string;
  readonly request_fingerprint: string;
  readonly state: PulseIdempotencyState;
  readonly acquired_at?: string;
  readonly lease_expires_at?: string;
  readonly recovered_at?: string;
  readonly recovery_reason?: string;
  readonly outcome?: TOutcome;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
  readonly content_hash: string;
}

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

export class PulseIdempotencyError extends Error {
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_IDEMPOTENCY_KEY"
    | "INVALID_FINGERPRINT"
    | "IDEMPOTENCY_CONFLICT"
    | "IDEMPOTENCY_NOT_FOUND"
    | "IDEMPOTENCY_TAMPERED"
    | "IDEMPOTENCY_LOCKED"
    | "IDEMPOTENCY_LEASE_ACTIVE"
    | "IDEMPOTENCY_RECOVERY_REQUIRED"
    | "RECOVERY_UNAVAILABLE"
    | "INVALID_STATE"
    | "IDEMPOTENCY_STORAGE_ERROR";

  constructor(
    code: PulseIdempotencyError["code"],
    message: string,
  ) {
    super(message);
    this.name = "PulseIdempotencyError";
    this.code = code;
  }
}

function normalizeTenant(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseIdempotencyError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  const tenant = value.trim();

  if (!tenant) {
    throw new PulseIdempotencyError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  if (
    WILDCARD_TENANTS.has(
      tenant.toLowerCase(),
    )
  ) {
    throw new PulseIdempotencyError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenant;
}

function normalizeKey(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseIdempotencyError(
      "INVALID_IDEMPOTENCY_KEY",
      "idempotency_key must be a non-empty string.",
    );
  }

  const key = value.trim();

  if (!key) {
    throw new PulseIdempotencyError(
      "INVALID_IDEMPOTENCY_KEY",
      "idempotency_key must be a non-empty string.",
    );
  }

  return key;
}

function normalizeFingerprint(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseIdempotencyError(
      "INVALID_FINGERPRINT",
      "request_fingerprint must be a SHA-256 hex digest.",
    );
  }

  const fingerprint =
    value.trim().toLowerCase();

  if (!/^[0-9a-f]{64}$/.test(fingerprint)) {
    throw new PulseIdempotencyError(
      "INVALID_FINGERPRINT",
      "request_fingerprint must be a SHA-256 hex digest.",
    );
  }

  return fingerprint;
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
      throw new PulseIdempotencyError(
        "INVALID_FINGERPRINT",
        "Non-finite number cannot be fingerprinted.",
      );
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(canonicalize)
      .join(",")}]`;
  }

  if (typeof value === "object") {
    const object =
      value as Record<string, unknown>;

    const keys = Object.keys(object)
      .filter(
        (key) =>
          object[key] !== undefined,
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

  throw new PulseIdempotencyError(
    "INVALID_FINGERPRINT",
    `Unsupported fingerprint type: ${typeof value}`,
  );
}

export function fingerprintPulseIdempotencyInput(
  value: unknown,
): string {
  return createHash("sha256")
    .update(
      canonicalize(value),
      "utf8",
    )
    .digest("hex");
}

function namespace(
  prefix: string,
  value: string,
): string {
  return createHash("sha256")
    .update(
      `${prefix}:${value}`,
      "utf8",
    )
    .digest("hex");
}

function contentHash(
  value: unknown,
): string {
  return createHash("sha256")
    .update(
      canonicalize(value),
      "utf8",
    )
    .digest("hex");
}

function defaultRoot(): string {
  const configured =
    process.env
      .DIGITALBOOST_PULSE_IDEMPOTENCY_ROOT;

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
    "idempotency",
  );
}

function durableWrite(
  filePath: string,
  contents: string,
): void {
  const fd = openSync(
    filePath,
    "w",
    0o600,
  );

  try {
    writeFileSync(
      fd,
      contents,
      "utf8",
    );

    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

export class FilesystemPulseDistributedIdempotencyStore {
  readonly tenantId: string;
  readonly rootDir: string;
  readonly tenantDir: string;
  readonly leaseDurationMs: number;

  constructor(options: {
    tenantId: string;
    rootDir?: string;
    leaseDurationMs?: number;
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
        namespace(
          "pulse-idempotency-tenant-v1",
          this.tenantId,
        ),
      );

    this.leaseDurationMs =
      options.leaseDurationMs ??
      PULSE_IDEMPOTENCY_DEFAULT_LEASE_MS;

    if (
      !Number.isFinite(
        this.leaseDurationMs,
      ) ||
      this.leaseDurationMs <= 0
    ) {
      throw new PulseIdempotencyError(
        "INVALID_STATE",
        "leaseDurationMs must be a positive finite number.",
      );
    }

    mkdirSync(
      this.tenantDir,
      {
        recursive: true,
        mode: 0o700,
      },
    );
  }

  private recordPath(
    key: string,
  ): string {
    return join(
      this.tenantDir,
      `${namespace(
        "pulse-idempotency-key-v1",
        key,
      )}.json`,
    );
  }

  private lockPath(
    key: string,
  ): string {
    return `${this.recordPath(key)}.lock`;
  }

  private read<TOutcome = unknown>(
    key: string,
  ): PulseIdempotencyRecord<TOutcome> | null {
    const path =
      this.recordPath(key);

    if (!existsSync(path)) {
      return null;
    }

    let parsed:
      PersistedIdempotencyRecord<TOutcome>;

    try {
      parsed =
        JSON.parse(
          readFileSync(
            path,
            "utf8",
          ),
        ) as PersistedIdempotencyRecord<TOutcome>;
    } catch {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_STORAGE_ERROR",
        `Unable to read idempotency record "${key}".`,
      );
    }

    if (
      parsed.repository_version !==
      PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION
    ) {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_STORAGE_ERROR",
        "Unsupported idempotency repository version.",
      );
    }

    const expected =
      contentHash({
        repository_version:
          parsed.repository_version,
        tenant_id:
          parsed.tenant_id,
        idempotency_key:
          parsed.idempotency_key,
        request_fingerprint:
          parsed.request_fingerprint,
        state:
          parsed.state,
        acquired_at:
          parsed.acquired_at,
        lease_expires_at:
          parsed.lease_expires_at,
        recovered_at:
          parsed.recovered_at,
        recovery_reason:
          parsed.recovery_reason,
        outcome:
          parsed.outcome,
        error:
          parsed.error,
      });

    if (
      expected !==
      parsed.content_hash
    ) {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_TAMPERED",
        `Idempotency record "${key}" failed integrity verification.`,
      );
    }

    if (
      parsed.tenant_id !==
      this.tenantId
    ) {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_TAMPERED",
        `Idempotency record "${key}" belongs to another tenant.`,
      );
    }

    return {
      tenant_id:
        parsed.tenant_id,
      idempotency_key:
        parsed.idempotency_key,
      request_fingerprint:
        parsed.request_fingerprint,
      state:
        parsed.state,
      ...(parsed.acquired_at !== undefined
        ? {
            acquired_at:
              parsed.acquired_at,
          }
        : {}),
      ...(parsed.lease_expires_at !== undefined
        ? {
            lease_expires_at:
              parsed.lease_expires_at,
          }
        : {}),
      ...(parsed.recovered_at !== undefined
        ? {
            recovered_at:
              parsed.recovered_at,
          }
        : {}),
      ...(parsed.recovery_reason !== undefined
        ? {
            recovery_reason:
              parsed.recovery_reason,
          }
        : {}),
      ...(parsed.outcome !== undefined
        ? {
            outcome:
              parsed.outcome,
          }
        : {}),
      ...(parsed.error !== undefined
        ? {
            error:
              parsed.error,
          }
        : {}),
    };
  }

  private acquireLock(
    key: string,
  ): string {
    const path =
      this.lockPath(key);

    try {
      writeFileSync(
        path,
        `${process.pid}\n`,
        {
          encoding: "utf8",
          mode: 0o600,
          flag: "wx",
        },
      );
    } catch {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_LOCKED",
        `Idempotency key "${key}" is currently locked.`,
      );
    }

    return path;
  }

  private releaseLock(
    path: string,
  ): void {
    try {
      if (existsSync(path)) {
        unlinkSync(path);
      }
    } catch {
      /*
       * Stale lock recovery belongs to P0.4.26.
       */
    }
  }

  private persist<TOutcome>(
    record:
      PulseIdempotencyRecord<TOutcome>,
  ): void {
    const path =
      this.recordPath(
        record.idempotency_key,
      );

    const base = {
      repository_version:
        PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION,
      tenant_id:
        record.tenant_id,
      idempotency_key:
        record.idempotency_key,
      request_fingerprint:
        record.request_fingerprint,
      state:
        record.state,
      ...(record.acquired_at !== undefined
        ? {
            acquired_at:
              record.acquired_at,
          }
        : {}),
      ...(record.lease_expires_at !== undefined
        ? {
            lease_expires_at:
              record.lease_expires_at,
          }
        : {}),
      ...(record.recovered_at !== undefined
        ? {
            recovered_at:
              record.recovered_at,
          }
        : {}),
      ...(record.recovery_reason !== undefined
        ? {
            recovery_reason:
              record.recovery_reason,
          }
        : {}),
      ...(record.outcome !== undefined
        ? {
            outcome:
              record.outcome,
          }
        : {}),
      ...(record.error !== undefined
        ? {
            error:
              record.error,
          }
        : {}),
    };

    const envelope = {
      ...base,
      content_hash:
        contentHash(base),
    };

    const temp =
      `${path}.${process.pid}.${Date.now()}.tmp`;

    try {
      durableWrite(
        temp,
        JSON.stringify(
          envelope,
          null,
          2,
        ) + "\n",
      );

      renameSync(
        temp,
        path,
      );
    } catch {
      try {
        if (existsSync(temp)) {
          unlinkSync(temp);
        }
      } catch {
        /* preserve original error */
      }

      throw new PulseIdempotencyError(
        "IDEMPOTENCY_STORAGE_ERROR",
        `Unable to persist idempotency key "${record.idempotency_key}".`,
      );
    }
  }

  begin<TOutcome = unknown>(
    input: {
      idempotency_key: string;
      request_fingerprint: string;
    },
  ): PulseIdempotencyBeginResult<TOutcome> {
    const key =
      normalizeKey(
        input.idempotency_key,
      );

    const fingerprint =
      normalizeFingerprint(
        input.request_fingerprint,
      );

    const existing =
      this.read<TOutcome>(
        key,
      );

    if (existing) {
      if (
        existing.request_fingerprint !==
        fingerprint
      ) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_CONFLICT",
          `Idempotency key "${key}" is bound to another request.`,
        );
      }

      return {
        decision:
          "REPLAY",
        record:
          existing,
      };
    }

    const acquiredAt =
      new Date();

    const leaseExpiresAt =
      new Date(
        acquiredAt.getTime() +
          this.leaseDurationMs,
      );

    const record:
      PulseIdempotencyRecord = {
      tenant_id:
        this.tenantId,
      idempotency_key:
        key,
      request_fingerprint:
        fingerprint,
      state:
        "STARTED",
      acquired_at:
        acquiredAt.toISOString(),
      lease_expires_at:
        leaseExpiresAt.toISOString(),
    };

    const path =
      this.recordPath(
        key,
      );

    const envelope = {
      repository_version:
        PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION,
      tenant_id:
        record.tenant_id,
      idempotency_key:
        record.idempotency_key,
      request_fingerprint:
        record.request_fingerprint,
      state:
        record.state,
      acquired_at:
        record.acquired_at,
      lease_expires_at:
        record.lease_expires_at,
      content_hash:
        contentHash({
          repository_version:
            PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION,
          tenant_id:
            record.tenant_id,
          idempotency_key:
            record.idempotency_key,
          request_fingerprint:
            record.request_fingerprint,
          state:
            record.state,
          acquired_at:
            record.acquired_at,
          lease_expires_at:
            record.lease_expires_at,
        }),
    };

    try {
      writeFileSync(
        path,
        JSON.stringify(
          envelope,
          null,
          2,
        ) + "\n",
        {
          encoding: "utf8",
          mode: 0o600,
          flag: "wx",
        },
      );
    } catch (error) {
      const errorCode =
        error &&
        typeof error === "object" &&
        "code" in error
          ? (
              error as {
                code?: unknown;
              }
            ).code
          : undefined;

      if (errorCode === "EEXIST") {
        const raced =
          this.read<TOutcome>(
            key,
          );

        if (!raced) {
          throw new PulseIdempotencyError(
            "IDEMPOTENCY_STORAGE_ERROR",
            `Concurrent acquisition of "${key}" could not be resolved.`,
          );
        }

        if (
          raced.request_fingerprint !==
          fingerprint
        ) {
          throw new PulseIdempotencyError(
            "IDEMPOTENCY_CONFLICT",
            `Concurrent request "${key}" has a different fingerprint.`,
          );
        }

        return {
          decision:
            "REPLAY",
          record:
            raced,
        };
      }

      throw new PulseIdempotencyError(
        "IDEMPOTENCY_STORAGE_ERROR",
        `Unable to acquire idempotency key "${key}".`,
      );
    }

    return {
      decision:
        "ACQUIRED",
      record,
    };
  }

  get<TOutcome = unknown>(
    idempotencyKey: string,
  ): PulseIdempotencyRecord<TOutcome> | null {
    const key =
      normalizeKey(
        idempotencyKey,
      );

    return this.read<TOutcome>(
      key,
    );
  }

  complete<TOutcome>(
    input: {
      idempotency_key: string;
      request_fingerprint: string;
      outcome: TOutcome;
    },
  ): PulseIdempotencyRecord<TOutcome> {
    const key =
      normalizeKey(
        input.idempotency_key,
      );

    const fingerprint =
      normalizeFingerprint(
        input.request_fingerprint,
      );

    const lock =
      this.acquireLock(key);

    try {
      const current =
        this.read<TOutcome>(key);

      if (!current) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_NOT_FOUND",
          `Idempotency key "${key}" was not found.`,
        );
      }

      if (
        current.request_fingerprint !==
        fingerprint
      ) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_CONFLICT",
          "Request fingerprint mismatch.",
        );
      }

      if (
        current.state ===
        "FAILED"
      ) {
        throw new PulseIdempotencyError(
          "INVALID_STATE",
          "FAILED cannot transition to COMPLETED.",
        );
      }

      if (
        current.state ===
        "COMPLETED"
      ) {
        return current;
      }

      const next = {
        tenant_id:
          this.tenantId,
        idempotency_key:
          key,
        request_fingerprint:
          fingerprint,
        state:
          "COMPLETED" as const,
        acquired_at:
          current.acquired_at,
        lease_expires_at:
          current.lease_expires_at,
        outcome:
          input.outcome,
      };

      this.persist(next);
      return next;
    } finally {
      this.releaseLock(lock);
    }
  }

  recoverExpired<TOutcome = unknown>(
    input: {
      idempotency_key: string;
      request_fingerprint: string;
      now?: number;
      reason?: string;
    },
  ): PulseIdempotencyRecord<TOutcome> {
    const key =
      normalizeKey(
        input.idempotency_key,
      );

    const fingerprint =
      normalizeFingerprint(
        input.request_fingerprint,
      );

    const lock =
      this.acquireLock(key);

    try {
      const current =
        this.read<TOutcome>(key);

      if (!current) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_NOT_FOUND",
          `Idempotency key "${key}" was not found.`,
        );
      }

      if (
        current.request_fingerprint !==
        fingerprint
      ) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_CONFLICT",
          "Request fingerprint mismatch.",
        );
      }

      if (
        current.state ===
        "RECOVERY_REQUIRED"
      ) {
        return current;
      }

      if (
        current.state ===
        "COMPLETED" ||
        current.state ===
        "FAILED"
      ) {
        return current;
      }

      if (
        current.state !==
        "STARTED"
      ) {
        throw new PulseIdempotencyError(
          "INVALID_STATE",
          "Unsupported state for crash recovery.",
        );
      }

      if (
        !current.lease_expires_at
      ) {
        throw new PulseIdempotencyError(
          "RECOVERY_UNAVAILABLE",
          "Legacy STARTED record has no recovery lease.",
        );
      }

      const expiresAt =
        Date.parse(
          current.lease_expires_at,
        );

      if (
        !Number.isFinite(
          expiresAt,
        )
      ) {
        throw new PulseIdempotencyError(
          "RECOVERY_UNAVAILABLE",
          "STARTED record contains an invalid lease expiration.",
        );
      }

      const now =
        input.now ??
        Date.now();

      if (
        now < expiresAt
      ) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_LEASE_ACTIVE",
          `Idempotency key "${key}" still has an active recovery lease.`,
        );
      }

      const recoveredAt =
        new Date(
          now,
        ).toISOString();

      const next:
        PulseIdempotencyRecord<TOutcome> = {
        tenant_id:
          this.tenantId,
        idempotency_key:
          key,
        request_fingerprint:
          fingerprint,
        state:
          "RECOVERY_REQUIRED",
        acquired_at:
          current.acquired_at,
        lease_expires_at:
          current.lease_expires_at,
        recovered_at:
          recoveredAt,
        recovery_reason:
          input.reason ??
          "LEASE_EXPIRED",
      };

      this.persist(next);

      return next;
    } finally {
      this.releaseLock(lock);
    }
  }

  fail(input: {
    idempotency_key: string;
    request_fingerprint: string;
    code: string;
    message: string;
  }): PulseIdempotencyRecord {
    const key =
      normalizeKey(
        input.idempotency_key,
      );

    const fingerprint =
      normalizeFingerprint(
        input.request_fingerprint,
      );

    const lock =
      this.acquireLock(key);

    try {
      const current =
        this.read(key);

      if (!current) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_NOT_FOUND",
          `Idempotency key "${key}" was not found.`,
        );
      }

      if (
        current.request_fingerprint !==
        fingerprint
      ) {
        throw new PulseIdempotencyError(
          "IDEMPOTENCY_CONFLICT",
          "Request fingerprint mismatch.",
        );
      }

      if (
        current.state ===
        "COMPLETED"
      ) {
        throw new PulseIdempotencyError(
          "INVALID_STATE",
          "COMPLETED cannot transition to FAILED.",
        );
      }

      if (
        current.state ===
        "FAILED"
      ) {
        return current;
      }

      const next = {
        tenant_id:
          this.tenantId,
        idempotency_key:
          key,
        request_fingerprint:
          fingerprint,
        state:
          "FAILED" as const,
        acquired_at:
          current.acquired_at,
        lease_expires_at:
          current.lease_expires_at,
        error: {
          code:
            input.code,
          message:
            input.message,
        },
      };

      this.persist(next);
      return next;
    } finally {
      this.releaseLock(lock);
    }
  }
}

export async function executePulseIdempotently<TOutcome>(
  options: {
    store:
      FilesystemPulseDistributedIdempotencyStore;
    idempotency_key: string;
    request_fingerprint: string;
    execute: () => Promise<TOutcome> | TOutcome;
  },
): Promise<{
  outcome: TOutcome;
  replayed: boolean;
}> {
  const begin =
    options.store.begin<TOutcome>({
      idempotency_key:
        options.idempotency_key,
      request_fingerprint:
        options.request_fingerprint,
    });

  if (
    begin.decision ===
    "REPLAY"
  ) {
    if (
      begin.record.state ===
      "COMPLETED"
    ) {
      return {
        outcome:
          begin.record.outcome as TOutcome,
        replayed: true,
      };
    }

    if (
      begin.record.state ===
      "FAILED"
    ) {
      throw new PulseIdempotencyError(
        "INVALID_STATE",
        begin.record.error?.message ??
          "The operation previously failed.",
      );
    }

    if (
      begin.record.state ===
      "RECOVERY_REQUIRED"
    ) {
      throw new PulseIdempotencyError(
        "IDEMPOTENCY_RECOVERY_REQUIRED",
        "The operation requires recovery and a new authorized execution.",
      );
    }

    throw new PulseIdempotencyError(
      "IDEMPOTENCY_LOCKED",
      "The operation is already STARTED.",
    );
  }

  try {
    const outcome =
      await options.execute();

    options.store.complete({
      idempotency_key:
        options.idempotency_key,
      request_fingerprint:
        options.request_fingerprint,
      outcome,
    });

    return {
      outcome,
      replayed: false,
    };
  } catch (error) {
    const code =
      error instanceof Error
        ? error.name
        : "EXECUTION_ERROR";

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    options.store.fail({
      idempotency_key:
        options.idempotency_key,
      request_fingerprint:
        options.request_fingerprint,
      code,
      message,
    });

    throw error;
  }
}
