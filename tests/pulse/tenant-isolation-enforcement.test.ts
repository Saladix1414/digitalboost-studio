import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_TENANT_ISOLATION_VERSION,
  PulseTenantIsolationError,
  assertPulseTenantIsolation,
} from "../../src/server/DigitalBoostPulseTenantIsolation.ts";

import {
  ServerExecutionClaimStore,
} from "../../src/server/DigitalBoostPulseServerExecutionClaimStore.ts";

test("P0.4.22 — canonical isolation version", () => {
  assert.equal(
    PULSE_TENANT_ISOLATION_VERSION,
    "pulse-tenant-isolation-v1",
  );
});

test("P0.4.22 — exact tenant match is accepted", () => {
  assert.equal(
    assertPulseTenantIsolation("tenant-a", "tenant-a"),
    "tenant-a",
  );
});

test("P0.4.22 — cross-tenant resource access is rejected", () => {
  assert.throws(
    () => assertPulseTenantIsolation("tenant-a", "tenant-b"),
    (error: unknown) => {
      assert.ok(error instanceof PulseTenantIsolationError);
      assert.equal(error.code, "TENANT_ISOLATION_VIOLATION");
      assert.equal(error.expectedTenantId, "tenant-a");
      assert.equal(error.actualTenantId, "tenant-b");
      return true;
    },
  );
});

test("P0.4.22 — wildcard tenant is rejected", () => {
  assert.throws(
    () => assertPulseTenantIsolation("*", "tenant-a"),
    PulseTenantIsolationError,
  );

  assert.throws(
    () => assertPulseTenantIsolation("tenant-a", "*"),
    PulseTenantIsolationError,
  );
});

test("P0.4.22 — empty tenant identifiers are rejected", () => {
  assert.throws(
    () => assertPulseTenantIsolation("", "tenant-a"),
    PulseTenantIsolationError,
  );

  assert.throws(
    () => assertPulseTenantIsolation("tenant-a", ""),
    PulseTenantIsolationError,
  );
});

test("P0.4.22 — tenant identifiers are not coerced", () => {
  assert.throws(
    () =>
      assertPulseTenantIsolation(
        "tenant-a",
        123 as unknown as string,
      ),
    PulseTenantIsolationError,
  );
});

test("P0.4.22 — legacy claim without tenant_id remains compatible", () => {
  const store = new ServerExecutionClaimStore({
    tenantId: "tenant-p0422-legacy",
  });

  const unique = `${process.pid}-${Date.now()}`;

  const result = store.claim({
    approval_id: `approval-p0422-legacy-${unique}`,
    request_id: `request-p0422-legacy-${unique}`,
    action: "analyze",
    mission_id: `mission-p0422-legacy-${unique}`,
    plan_id: `plan-p0422-legacy-${unique}`,
    step_id: `step-p0422-legacy-${unique}`,
    step_index: 0,
  });

  assert.equal(result.claimed, true);
  assert.equal(result.reason, undefined);
});

test("P0.4.22 — claim store rejects cross-tenant claim before mutation", () => {
  const store = new ServerExecutionClaimStore({
    tenantId: "tenant-a",
  });

  assert.throws(
    () =>
      store.claim({
        approval_id: "approval-p0422-cross-tenant",
        request_id: "request-p0422-cross-tenant",
        tenant_id: "tenant-b",
        action: "analyze",
        mission_id: "mission-p0422",
        plan_id: "plan-p0422",
        step_id: "step-p0422",
        step_index: 0,
      }),
    (error: unknown) => {
      assert.ok(error instanceof PulseTenantIsolationError);
      assert.equal(error.code, "TENANT_ISOLATION_VIOLATION");
      assert.equal(error.expectedTenantId, "tenant-a");
      assert.equal(error.actualTenantId, "tenant-b");
      return true;
    },
  );
});
