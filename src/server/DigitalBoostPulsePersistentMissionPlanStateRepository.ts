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

export const PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION =
  "pulse-mission-plan-state-repository-v1";

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

export interface PulsePersistentMissionPlanState<
  TMission = unknown,
  TPlan = unknown,
> {
  readonly tenant_id: string;
  readonly mission_id: string;
  readonly plan_id: string;
  readonly mission: TMission;
  readonly plan: TPlan;
}

export interface PulsePersistentMissionPlanStateRecord<
  TMission = unknown,
  TPlan = unknown,
> extends PulsePersistentMissionPlanState<TMission, TPlan> {
  readonly revision: number;
}

interface PersistedEnvelope<
  TMission = unknown,
  TPlan = unknown,
> {
  readonly repository_version: string;
  readonly tenant_id: string;
  readonly mission_id: string;
  readonly plan_id: string;
  readonly revision: number;
  readonly mission: TMission;
  readonly plan: TPlan;
  readonly content_hash: string;
}

export class PulseMissionPlanStateRepositoryError extends Error {
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_MISSION_ID"
    | "INVALID_PLAN_ID"
    | "DUPLICATE_MISSION"
    | "MISSION_NOT_FOUND"
    | "MISSION_TENANT_MISMATCH"
    | "PLAN_TENANT_MISMATCH"
    | "REVISION_CONFLICT"
    | "STATE_TAMPERED"
    | "STATE_STORAGE_ERROR";

  constructor(
    code: PulseMissionPlanStateRepositoryError["code"],
    message: string,
  ) {
    super(message);
    this.name =
      "PulseMissionPlanStateRepositoryError";
    this.code = code;
  }
}

function normalizeTenantId(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseMissionPlanStateRepositoryError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  const tenantId = value.trim();

  if (!tenantId) {
    throw new PulseMissionPlanStateRepositoryError(
      "INVALID_TENANT",
      "tenant_id must be a non-empty string.",
    );
  }

  if (
    WILDCARD_TENANTS.has(
      tenantId.toLowerCase(),
    )
  ) {
    throw new PulseMissionPlanStateRepositoryError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenantId;
}

function normalizeId(
  value: unknown,
  type: "mission" | "plan",
): string {
  if (typeof value !== "string") {
    throw new PulseMissionPlanStateRepositoryError(
      type === "mission"
        ? "INVALID_MISSION_ID"
        : "INVALID_PLAN_ID",
      `${type}_id must be a non-empty string.`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new PulseMissionPlanStateRepositoryError(
      type === "mission"
        ? "INVALID_MISSION_ID"
        : "INVALID_PLAN_ID",
      `${type}_id must be a non-empty string.`,
    );
  }

  return normalized;
}

function hashNamespace(
  prefix: string,
  value: string,
): string {
  return createHash("sha256")
    .update(`${prefix}:${value}`, "utf8")
    .digest("hex");
}

function contentHash(
  envelope: {
    repository_version: string;
    tenant_id: string;
    mission_id: string;
    plan_id: string;
    revision: number;
    mission: unknown;
    plan: unknown;
  },
): string {
  return createHash("sha256")
    .update(
      JSON.stringify(envelope),
      "utf8",
    )
    .digest("hex");
}

function defaultRoot(): string {
  const configured =
    process.env
      .DIGITALBOOST_PULSE_MISSION_PLAN_STATE_ROOT;

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
    "mission-plan-state",
  );
}

function writeDurably(
  path: string,
  serialized: string,
): void {
  const fd = openSync(
    path,
    "w",
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

export class PersistentMissionPlanStateRepository {
  readonly tenantId: string;
  readonly rootDir: string;
  readonly tenantDir: string;

  constructor(options: {
    tenantId: string;
    rootDir?: string;
  }) {
    this.tenantId =
      normalizeTenantId(
        options.tenantId,
      );

    this.rootDir =
      options.rootDir?.trim()
        ? options.rootDir.trim()
        : defaultRoot();

    this.tenantDir =
      join(
        this.rootDir,
        hashNamespace(
          "pulse-mission-plan-tenant-v1",
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

  private statePath(
    missionId: string,
  ): string {
    return join(
      this.tenantDir,
      `${hashNamespace(
        "pulse-mission-v1",
        missionId,
      )}.json`,
    );
  }

  private lockPath(
    missionId: string,
  ): string {
    return `${this.statePath(missionId)}.lock`;
  }

  private assertTenant(
    suppliedTenantId: unknown,
  ): void {
    const supplied =
      normalizeTenantId(
        suppliedTenantId,
      );

    if (
      supplied !== this.tenantId
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "MISSION_TENANT_MISMATCH",
        `State tenant "${supplied}" does not match repository tenant "${this.tenantId}".`,
      );
    }
  }

  private acquireLock(
    missionId: string,
  ): string {
    const lock =
      this.lockPath(missionId);

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
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_STORAGE_ERROR",
        `Mission "${missionId}" is currently locked.`,
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
       * Deliberately preserve the main operation result.
       * Crash-recovery/stale-lock policy belongs to a later phase.
       */
    }
  }

  create<
    TMission = unknown,
    TPlan = unknown,
  >(
    state: PulsePersistentMissionPlanState<
      TMission,
      TPlan
    >,
  ): void {
    const missionId =
      normalizeId(
        state.mission_id,
        "mission",
      );

    const planId =
      normalizeId(
        state.plan_id,
        "plan",
      );

    this.assertTenant(
      state.tenant_id,
    );

    const path =
      this.statePath(
        missionId,
      );

    const lock =
      this.acquireLock(
        missionId,
      );

    try {
      if (existsSync(path)) {
        throw new PulseMissionPlanStateRepositoryError(
          "DUPLICATE_MISSION",
          `Mission "${missionId}" already exists.`,
        );
      }

      const envelopeBase = {
        repository_version:
          PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION,
        tenant_id: this.tenantId,
        mission_id: missionId,
        plan_id: planId,
        revision: 1,
        mission: state.mission,
        plan: state.plan,
      };

      const envelope: PersistedEnvelope<
        TMission,
        TPlan
      > = {
        ...envelopeBase,
        content_hash:
          contentHash(
            envelopeBase,
          ),
      };

      const temp =
        `${path}.${process.pid}.${Date.now()}.tmp`;

      try {
        writeDurably(
          temp,
          JSON.stringify(
            envelope,
            null,
            2,
          ) + "\n",
        );

        /*
         * Initial creation must not overwrite another state.
         * rename() is used after the lock check because the lock
         * serializes writers within this repository boundary.
         */
        if (existsSync(path)) {
          throw new PulseMissionPlanStateRepositoryError(
            "DUPLICATE_MISSION",
            `Mission "${missionId}" already exists.`,
          );
        }

        renameSync(
          temp,
          path,
        );
      } catch (error) {
        try {
          if (existsSync(temp)) {
            unlinkSync(temp);
          }
        } catch {
          /* Preserve original error. */
        }

        if (
          error instanceof
          PulseMissionPlanStateRepositoryError
        ) {
          throw error;
        }

        throw new PulseMissionPlanStateRepositoryError(
          "STATE_STORAGE_ERROR",
          `Unable to persist mission "${missionId}".`,
        );
      }
    } finally {
      this.releaseLock(
        lock,
      );
    }
  }

  load<
    TMission = unknown,
    TPlan = unknown,
  >(
    missionIdValue: unknown,
  ): PulsePersistentMissionPlanStateRecord<
    TMission,
    TPlan
  > | null {
    const missionId =
      normalizeId(
        missionIdValue,
        "mission",
      );

    const path =
      this.statePath(
        missionId,
      );

    if (!existsSync(path)) {
      return null;
    }

    let parsed:
      PersistedEnvelope<
        TMission,
        TPlan
      >;

    try {
      parsed =
        JSON.parse(
          readFileSync(
            path,
            "utf8",
          ),
        ) as PersistedEnvelope<
          TMission,
          TPlan
        >;
    } catch {
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_STORAGE_ERROR",
        `Unable to read mission "${missionId}".`,
      );
    }

    if (
      parsed.repository_version !==
      PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_STORAGE_ERROR",
        `Unsupported repository version for mission "${missionId}".`,
      );
    }

    if (
      parsed.mission_id !==
      missionId
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_STORAGE_ERROR",
        `Mission identifier mismatch for "${missionId}".`,
      );
    }

    this.assertTenant(
      parsed.tenant_id,
    );

    if (
      parsed.revision < 1 ||
      !Number.isInteger(parsed.revision)
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_STORAGE_ERROR",
        `Invalid revision for mission "${missionId}".`,
      );
    }

    const expectedHash =
      contentHash({
        repository_version:
          parsed.repository_version,
        tenant_id:
          parsed.tenant_id,
        mission_id:
          parsed.mission_id,
        plan_id:
          parsed.plan_id,
        revision:
          parsed.revision,
        mission:
          parsed.mission,
        plan:
          parsed.plan,
      });

    if (
      expectedHash !==
      parsed.content_hash
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "STATE_TAMPERED",
        `Mission "${missionId}" failed integrity verification.`,
      );
    }

    return {
      tenant_id:
        parsed.tenant_id,
      mission_id:
        parsed.mission_id,
      plan_id:
        parsed.plan_id,
      revision:
        parsed.revision,
      mission:
        parsed.mission,
      plan:
        parsed.plan,
    };
  }

  save<
    TMission = unknown,
    TPlan = unknown,
  >(
    state: PulsePersistentMissionPlanState<
      TMission,
      TPlan
    >,
    expectedRevision: number,
  ): PulsePersistentMissionPlanStateRecord<
    TMission,
    TPlan
  > {
    const missionId =
      normalizeId(
        state.mission_id,
        "mission",
      );

    const planId =
      normalizeId(
        state.plan_id,
        "plan",
      );

    this.assertTenant(
      state.tenant_id,
    );

    if (
      !Number.isInteger(
        expectedRevision,
      ) ||
      expectedRevision < 1
    ) {
      throw new PulseMissionPlanStateRepositoryError(
        "REVISION_CONFLICT",
        "expectedRevision must be a positive integer.",
      );
    }

    const lock =
      this.acquireLock(
        missionId,
      );

    try {
      const current =
        this.load<
          TMission,
          TPlan
        >(missionId);

      if (!current) {
        throw new PulseMissionPlanStateRepositoryError(
          "MISSION_NOT_FOUND",
          `Mission "${missionId}" was not found.`,
        );
      }

      if (
        current.plan_id !==
        planId
      ) {
        throw new PulseMissionPlanStateRepositoryError(
          "PLAN_TENANT_MISMATCH",
          `Plan "${planId}" does not match persisted plan "${current.plan_id}".`,
        );
      }

      if (
        current.revision !==
        expectedRevision
      ) {
        throw new PulseMissionPlanStateRepositoryError(
          "REVISION_CONFLICT",
          `Mission "${missionId}" expected revision ${expectedRevision} but current revision is ${current.revision}.`,
        );
      }

      const nextRevision =
        current.revision + 1;

      const envelopeBase = {
        repository_version:
          PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION,
        tenant_id:
          this.tenantId,
        mission_id:
          missionId,
        plan_id:
          planId,
        revision:
          nextRevision,
        mission:
          state.mission,
        plan:
          state.plan,
      };

      const envelope: PersistedEnvelope<
        TMission,
        TPlan
      > = {
        ...envelopeBase,
        content_hash:
          contentHash(
            envelopeBase,
          ),
      };

      const path =
        this.statePath(
          missionId,
        );

      const temp =
        `${path}.${process.pid}.${Date.now()}.tmp`;

      try {
        writeDurably(
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
          /* Preserve write failure. */
        }

        throw new PulseMissionPlanStateRepositoryError(
          "STATE_STORAGE_ERROR",
          `Unable to persist mission "${missionId}".`,
        );
      }

      return {
        tenant_id:
          this.tenantId,
        mission_id:
          missionId,
        plan_id:
          planId,
        revision:
          nextRevision,
        mission:
          state.mission,
        plan:
          state.plan,
      };
    } finally {
      this.releaseLock(
        lock,
      );
    }
  }

  require<
    TMission = unknown,
    TPlan = unknown,
  >(
    missionIdValue: unknown,
  ): PulsePersistentMissionPlanStateRecord<
    TMission,
    TPlan
  > {
    const missionId =
      normalizeId(
        missionIdValue,
        "mission",
      );

    const state =
      this.load<
        TMission,
        TPlan
      >(missionId);

    if (!state) {
      throw new PulseMissionPlanStateRepositoryError(
        "MISSION_NOT_FOUND",
        `Mission "${missionId}" was not found.`,
      );
    }

    return state;
  }
}
