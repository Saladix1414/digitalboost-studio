import test from "node:test";
import assert from "node:assert/strict";

import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION,
  PersistentMissionPlanStateRepository,
  PulseMissionPlanStateRepositoryError,
} from "../../src/server/DigitalBoostPulsePersistentMissionPlanStateRepository.ts";

function createRoot(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0424-",
    ),
  );
}

function createState(
  suffix: string,
) {
  return {
    tenant_id: "tenant-a",
    mission_id: `mission-${suffix}`,
    plan_id: `plan-${suffix}`,
    mission: {
      id: `mission-${suffix}`,
      status: "EXECUTING",
      checkpoint: 0,
    },
    plan: {
      id: `plan-${suffix}`,
      status: "EXECUTING",
      version: 1,
    },
  };
}

test("P0.4.24 canonical repository version", () => {
  assert.equal(
    PULSE_MISSION_PLAN_STATE_REPOSITORY_VERSION,
    "pulse-mission-plan-state-repository-v1",
  );
});

test("P0.4.24 persists Mission + Plan between repository instances", () => {
  const root = createRoot();

  const repo1 =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo1.create(
    createState("persist"),
  );

  const repo2 =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const loaded =
    repo2.require(
      "mission-persist",
    );

  assert.equal(
    loaded.revision,
    1,
  );

  assert.deepEqual(
    loaded.mission,
    createState("persist").mission,
  );

  assert.deepEqual(
    loaded.plan,
    createState("persist").plan,
  );
});

test("P0.4.24 duplicate Mission creation is rejected", () => {
  const root = createRoot();

  const repo =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const state =
    createState("duplicate");

  repo.create(state);

  assert.throws(
    () => repo.create(state),
    (error: unknown) => {
      assert.ok(
        error instanceof
        PulseMissionPlanStateRepositoryError,
      );

      assert.equal(
        error.code,
        "DUPLICATE_MISSION",
      );

      return true;
    },
  );
});

test("P0.4.24 same Mission id is isolated across tenants", () => {
  const root = createRoot();

  const repoA =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const repoB =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-b",
      rootDir: root,
    });

  repoA.create({
    tenant_id: "tenant-a",
    mission_id: "same-mission",
    plan_id: "plan-a",
    mission: {
      owner: "tenant-a",
    },
    plan: {
      owner: "tenant-a",
    },
  });

  repoB.create({
    tenant_id: "tenant-b",
    mission_id: "same-mission",
    plan_id: "plan-b",
    mission: {
      owner: "tenant-b",
    },
    plan: {
      owner: "tenant-b",
    },
  });

  assert.equal(
    repoA.require("same-mission").mission.owner,
    "tenant-a",
  );

  assert.equal(
    repoB.require("same-mission").mission.owner,
    "tenant-b",
  );
});

test("P0.4.24 wrong tenant cannot create state in another tenant repository", () => {
  const root = createRoot();

  const repo =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  assert.throws(
    () =>
      repo.create({
        tenant_id: "tenant-b",
        mission_id: "cross-tenant",
        plan_id: "plan-cross-tenant",
        mission: {},
        plan: {},
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof
        PulseMissionPlanStateRepositoryError,
      );

      assert.equal(
        error.code,
        "MISSION_TENANT_MISMATCH",
      );

      return true;
    },
  );
});

test("P0.4.24 revision increments on save", () => {
  const root = createRoot();

  const repo =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo.create(
    createState("revision"),
  );

  const saved =
    repo.save(
      {
        ...createState("revision"),
        mission: {
          ...createState("revision").mission,
          checkpoint: 1,
        },
      },
      1,
    );

  assert.equal(
    saved.revision,
    2,
  );

  assert.equal(
    saved.mission.checkpoint,
    1,
  );

  assert.equal(
    repo.require("mission-revision").revision,
    2,
  );
});

test("P0.4.24 stale revision is rejected", () => {
  const root = createRoot();

  const repo1 =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const repo2 =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const state =
    createState("conflict");

  repo1.create(state);

  repo1.save(
    {
      ...state,
      mission: {
        ...state.mission,
        checkpoint: 1,
      },
    },
    1,
  );

  assert.throws(
    () =>
      repo2.save(
        {
          ...state,
          mission: {
            ...state.mission,
            checkpoint: 99,
          },
        },
        1,
      ),
    (error: unknown) => {
      assert.ok(
        error instanceof
        PulseMissionPlanStateRepositoryError,
      );

      assert.equal(
        error.code,
        "REVISION_CONFLICT",
      );

      return true;
    },
  );
});

test("P0.4.24 plan identity cannot change silently", () => {
  const root = createRoot();

  const repo =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo.create(
    createState("plan-binding"),
  );

  assert.throws(
    () =>
      repo.save(
        {
          ...createState("plan-binding"),
          plan_id: "different-plan",
        },
        1,
      ),
    (error: unknown) => {
      assert.ok(
        error instanceof
        PulseMissionPlanStateRepositoryError,
      );

      assert.equal(
        error.code,
        "PLAN_TENANT_MISMATCH",
      );

      return true;
    },
  );
});

test("P0.4.24 tampered state is rejected", () => {
  const root = createRoot();

  const repo =
    new PersistentMissionPlanStateRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo.create(
    createState("tamper"),
  );

  const tenantDirs =
    readdirSync(root);

  assert.equal(
    tenantDirs.length,
    1,
  );

  const tenantDir =
    join(
      root,
      tenantDirs[0],
    );

  const files =
    readdirSync(
      tenantDir,
    );

  assert.equal(
    files.length,
    1,
  );

  const file =
    join(
      tenantDir,
      files[0],
    );

  const parsed =
    JSON.parse(
      readFileSync(
        file,
        "utf8",
      ),
    ) as {
      mission: Record<string, unknown>;
    };

  parsed.mission.checkpoint =
    999;

  writeFileSync(
    file,
    JSON.stringify(
      parsed,
      null,
      2,
    ) + "\n",
  );

  assert.throws(
    () =>
      repo.require("mission-tamper"),
    (error: unknown) => {
      assert.ok(
        error instanceof
        PulseMissionPlanStateRepositoryError,
      );

      assert.equal(
        error.code,
        "STATE_TAMPERED",
      );

      return true;
    },
  );
});

test("P0.4.24 wildcard/global tenants are rejected", () => {
  const root = createRoot();

  assert.throws(
    () =>
      new PersistentMissionPlanStateRepository({
        tenantId: "*",
        rootDir: root,
      }),
    PulseMissionPlanStateRepositoryError,
  );

  assert.throws(
    () =>
      new PersistentMissionPlanStateRepository({
        tenantId: "global",
        rootDir: root,
      }),
    PulseMissionPlanStateRepositoryError,
  );
});

test("P0.4.24 tenant identifier is not exposed in directory name", () => {
  const root = createRoot();

  new PersistentMissionPlanStateRepository({
    tenantId: "tenant-secret-name",
    rootDir: root,
  });

  const entries =
    readdirSync(root);

  assert.equal(
    entries.length,
    1,
  );

  assert.notEqual(
    entries[0],
    "tenant-secret-name",
  );
});
