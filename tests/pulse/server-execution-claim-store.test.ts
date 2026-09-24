import {
  mkdtempSync,
  rmSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import path from "node:path";

import {
  beforeEach,
  afterEach,
  test,
} from "node:test";

import assert from "node:assert/strict";

import {
  ServerExecutionClaimStore,
} from "../../src/server/DigitalBoostPulseServerExecutionClaimStore";

const tempRoots: string[] = [];

function makeRoot(): string {
  const root =
    mkdtempSync(
      path.join(
        tmpdir(),
        "digitalboost-p0418-",
      ),
    );

  tempRoots.push(root);

  return root;
}

function claim(
  approvalId: string,
  requestId: string,
  action = "hero",
) {
  return {
    approval_id: approvalId,
    request_id: requestId,
    action,
    mission_id: "mission_p0418",
    plan_id: "plan_p0418",
    step_id: "step_p0418",
    step_index: 0,
    claimed_at:
      new Date().toISOString(),
  };
}

beforeEach(() => {
  tempRoots.length = 0;
});

afterEach(() => {
  for (
    const root of tempRoots
  ) {
    rmSync(
      root,
      {
        recursive: true,
        force: true,
      },
    );
  }
  tempRoots.length = 0;
});

test(
  "P0.4.18 store server es atómico y persistente entre instancias",
  () => {
    const root =
      makeRoot();

    const firstStore =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Nimbus",
      });

    const secondStore =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Nimbus",
      });

    assert.equal(
      firstStore.atomic,
      true,
    );

    const first =
      firstStore.claim(
        claim(
          "approval_p0418_same",
          "request_p0418_first",
        ),
      );

    assert.equal(
      first.claimed,
      true,
    );

    const second =
      secondStore.claim(
        claim(
          "approval_p0418_same",
          "request_p0418_second",
        ),
      );

    assert.equal(
      second.claimed,
      false,
    );

    if (!second.claimed) {
      assert.equal(
        second.reason,
        "ALREADY_CLAIMED",
      );
    }
  },
);

test(
  "P0.4.18 approval permanece consumida tras recrear el store",
  () => {
    const root =
      makeRoot();

    const firstStore =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Nimbus",
      });

    const first =
      firstStore.claim(
        claim(
          "approval_p0418_restart",
          "request_p0418_restart_1",
        ),
      );

    assert.equal(
      first.claimed,
      true,
    );

    const recreated =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Nimbus",
      });

    const replay =
      recreated.claim(
        claim(
          "approval_p0418_restart",
          "request_p0418_restart_2",
        ),
      );

    assert.equal(
      replay.claimed,
      false,
    );

    if (!replay.claimed) {
      assert.equal(
        replay.reason,
        "ALREADY_CLAIMED",
      );
    }
  },
);

test(
  "P0.4.18 tenant isolation permite mismo approval_id en tenants distintos",
  () => {
    const root =
      makeRoot();

    const tenantA =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Tenant-A",
      });

    const tenantB =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "Tenant-B",
      });

    const sameApproval =
      "approval_p0418_cross_tenant";

    const first =
      tenantA.claim(
        claim(
          sameApproval,
          "request_tenant_a",
        ),
      );

    const second =
      tenantB.claim(
        claim(
          sameApproval,
          "request_tenant_b",
        ),
      );

    assert.equal(
      first.claimed,
      true,
    );

    assert.equal(
      second.claimed,
      true,
    );
  },
);

test(
  "P0.4.18 misma approval no puede ser reclamada por dos stores independientes",
  () => {
    const root =
      makeRoot();

    const left =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "ConcurrentTenant",
      });

    const right =
      new ServerExecutionClaimStore({
        rootDir: root,
        tenantId: "ConcurrentTenant",
      });

    const first =
      left.claim(
        claim(
          "approval_p0418_race",
          "request_left",
        ),
      );

    const second =
      right.claim(
        claim(
          "approval_p0418_race",
          "request_right",
        ),
      );

    assert.equal(
      Number(first.claimed) +
        Number(second.claimed),
      1,
    );

    const rejected =
      first.claimed
        ? second
        : first;

    assert.equal(
      rejected.claimed,
      false,
    );

    if (
      !rejected.claimed
    ) {
      assert.equal(
        rejected.reason,
        "ALREADY_CLAIMED",
      );
    }
  },
);

test(
  "P0.4.18 tenantId vacío es rechazado",
  () => {
    assert.throws(
      () =>
        new ServerExecutionClaimStore({
          rootDir: makeRoot(),
          tenantId: "   ",
        }),
      /tenantId is required/,
    );
  },
);
