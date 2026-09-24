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
  PULSE_APPROVAL_REPOSITORY_VERSION,
  PersistentApprovalRepository,
  PulseApprovalRepositoryError,
} from "../../src/server/DigitalBoostPulsePersistentApprovalRepository.ts";

function createRoot(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0423-",
    ),
  );
}

function approval(
  approvalId: string,
) {
  return {
    approval_id: approvalId,
    proposal_hash: "proposal-hash-p0423",
    policy_version: "pulse-policy-v1",
    context_version: "context-p0423",
    action: "analyze",
    risk: "L0",
  };
}

test("P0.4.23 canonical repository version", () => {
  assert.equal(
    PULSE_APPROVAL_REPOSITORY_VERSION,
    "pulse-approval-repository-v1",
  );
});

test("P0.4.23 persists approval between repository instances", () => {
  const root = createRoot();

  const repo1 =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo1.create({
    tenant_id: "tenant-a",
    approval_id: "approval-a",
    approval: approval("approval-a"),
  });

  const repo2 =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  assert.deepEqual(
    repo2.require("approval-a").approval,
    approval("approval-a"),
  );
});

test("P0.4.23 duplicate approval creation is rejected", () => {
  const root = createRoot();

  const repo =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const record = {
    tenant_id: "tenant-a",
    approval_id: "approval-duplicate",
    approval: approval("approval-duplicate"),
  };

  repo.create(record);

  assert.throws(
    () => repo.create(record),
    (error: unknown) => {
      assert.ok(
        error instanceof PulseApprovalRepositoryError,
      );
      assert.equal(
        error.code,
        "DUPLICATE_APPROVAL",
      );
      return true;
    },
  );
});

test("P0.4.23 same approval_id is isolated across tenants", () => {
  const root = createRoot();

  const repoA =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  const repoB =
    new PersistentApprovalRepository({
      tenantId: "tenant-b",
      rootDir: root,
    });

  repoA.create({
    tenant_id: "tenant-a",
    approval_id: "same-approval",
    approval: {
      owner: "tenant-a",
    },
  });

  repoB.create({
    tenant_id: "tenant-b",
    approval_id: "same-approval",
    approval: {
      owner: "tenant-b",
    },
  });

  assert.equal(
    repoA.require("same-approval").approval.owner,
    "tenant-a",
  );

  assert.equal(
    repoB.require("same-approval").approval.owner,
    "tenant-b",
  );
});

test("P0.4.23 wrong tenant cannot create into another tenant repository", () => {
  const root = createRoot();

  const repo =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  assert.throws(
    () =>
      repo.create({
        tenant_id: "tenant-b",
        approval_id: "approval-cross-tenant",
        approval: {},
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof PulseApprovalRepositoryError,
      );
      assert.equal(
        error.code,
        "APPROVAL_TENANT_MISMATCH",
      );
      return true;
    },
  );
});

test("P0.4.23 tampered persisted approval is rejected", () => {
  const root = createRoot();

  const repo =
    new PersistentApprovalRepository({
      tenantId: "tenant-a",
      rootDir: root,
    });

  repo.create({
    tenant_id: "tenant-a",
    approval_id: "approval-tamper",
    approval: {
      immutable: true,
    },
  });

  const tenantDir =
    readdirSync(root);

  assert.equal(tenantDir.length, 1);

  const namespaceDir =
    join(
      root,
      tenantDir[0],
    );

  const files =
    readdirSync(
      namespaceDir,
    );

  assert.equal(files.length, 1);

  const file =
    join(
      namespaceDir,
      files[0],
    );

  const parsed =
    JSON.parse(
      readFileSync(
        file,
        "utf8",
      ),
    ) as {
      approval: Record<string, unknown>;
    };

  parsed.approval.immutable = false;

  writeFileSync(
    file,
    JSON.stringify(
      parsed,
      null,
      2,
    ) + "\n",
  );

  assert.throws(
    () => repo.require("approval-tamper"),
    (error: unknown) => {
      assert.ok(
        error instanceof PulseApprovalRepositoryError,
      );
      assert.equal(
        error.code,
        "APPROVAL_TAMPERED",
      );
      return true;
    },
  );
});

test("P0.4.23 wildcard/global tenants are rejected", () => {
  const root = createRoot();

  assert.throws(
    () =>
      new PersistentApprovalRepository({
        tenantId: "*",
        rootDir: root,
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof PulseApprovalRepositoryError,
      );
      assert.equal(
        error.code,
        "INVALID_TENANT",
      );
      return true;
    },
  );

  assert.throws(
    () =>
      new PersistentApprovalRepository({
        tenantId: "global",
        rootDir: root,
      }),
    PulseApprovalRepositoryError,
  );
});

test("P0.4.23 tenant namespace does not expose raw tenant id in directory name", () => {
  const root = createRoot();

  new PersistentApprovalRepository({
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
