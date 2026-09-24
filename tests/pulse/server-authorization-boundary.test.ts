import test from "node:test";
import assert from "node:assert/strict";

import {
  authorizePulseServerExecution,
  PULSE_AUTHORIZATION_BOUNDARY_VERSION,
  type PulsePrincipal,
} from "../../src/server/DigitalBoostPulseAuthorizationBoundary";

import {
  createPulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

function request(
  tenant_id = "tenant-alpha",
) {
  return createPulseServerExecutionRequest({
    request_id: "req-p0421-001",
    tenant_id,
    approval_id: "approval-p0421-001",
    action: "inventory",
    proposal_hash: "proposal-p0421",
    policy_version: "policy-v1",
    expected_context_version: "ctx-v1",
    mission_id: "mission-p0421",
    plan_id: "plan-p0421",
    step_id: "step-p0421",
    step_index: 0,
  });
}

function principal(
  overrides: Partial<PulsePrincipal> = {},
): PulsePrincipal {
  return {
    authenticated: true,
    subject_id: "user-001",
    active_tenant_id: "tenant-alpha",
    tenant_ids: ["tenant-alpha"],
    ...overrides,
  };
}

test("P0.4.21 rechaza principal ausente", async () => {
  const result = await authorizePulseServerExecution(
    null,
    request(),
    async () => true,
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.code, "AUTHENTICATION_REQUIRED");
  }
});

test("P0.4.21 rechaza principal no autenticado", async () => {
  const result = await authorizePulseServerExecution(
    principal({
      authenticated: false,
    }),
    request(),
    async () => true,
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.code, "AUTHENTICATION_REQUIRED");
  }
});

test("P0.4.21 requiere active tenant válido", async () => {
  const result = await authorizePulseServerExecution(
    principal({
      active_tenant_id: "tenant-missing",
      tenant_ids: ["tenant-alpha"],
    }),
    request(),
    async () => true,
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.code, "INVALID_PRINCIPAL");
  }
});

test("P0.4.21 tenant del request no puede cambiar de tenant autenticado", async () => {
  const result = await authorizePulseServerExecution(
    principal(),
    request("tenant-beta"),
    async () => true,
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.code, "TENANT_ACCESS_DENIED");
  }
});

test("P0.4.21 autorización de acción es obligatoria", async () => {
  const result = await authorizePulseServerExecution(
    principal(),
    request(),
    async () => false,
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.code, "ACTION_NOT_AUTHORIZED");
  }
});

test("P0.4.21 acción autorizada atraviesa la frontera", async () => {
  const result = await authorizePulseServerExecution(
    principal(),
    request(),
    async (p, r) => {
      return (
        p.subject_id === "user-001" &&
        p.active_tenant_id === "tenant-alpha" &&
        r.action === "inventory"
      );
    },
  );

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.subject_id, "user-001");
    assert.equal(result.tenant_id, "tenant-alpha");
  }
});

test("P0.4.21 conserva versión canónica", () => {
  assert.equal(
    PULSE_AUTHORIZATION_BOUNDARY_VERSION,
    "pulse-authorization-boundary-v1",
  );
});
