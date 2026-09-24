import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_EXECUTION_BOUNDARY_VERSION,
  acceptPulseServerExecutionRequest,
  createPulseServerExecutionRequest,
  validatePulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

function validRequest() {
  return createPulseServerExecutionRequest({
    request_id: "req-p0419-001",
    tenant_id: "tenant-alpha",
    approval_id: "approval-001",
    action: "inventory",
    proposal_hash: "proposal-hash-001",
    policy_version: "policy-v1",
    expected_context_version: "ctx-v1",
    mission_id: "mission-001",
    plan_id: "plan-001",
    step_id: "step-001",
    step_index: 0,
  });
}

test("P0.4.19 acepta envelope estructural válido sin declararlo ejecutado", () => {
  const response = acceptPulseServerExecutionRequest(validRequest());

  assert.equal(response.result, "READY_FOR_SERVER_EXECUTOR");
  assert.equal(response.request_id, "req-p0419-001");
  assert.equal(response.tenant_id, "tenant-alpha");
  assert.equal(response.approval_id, "approval-001");

  assert.equal("completed" in response, false);
  assert.equal("verified" in response, false);
});

test("P0.4.19 approved=true no sustituye approval_id", () => {
  const request = {
    ...validRequest(),
    approval_id: "",
    approved: true,
  };

  const response = acceptPulseServerExecutionRequest(request);

  assert.equal(response.result, "REJECTED");

  if (response.result === "REJECTED") {
    assert.equal(response.code, "MISSING_APPROVAL_ID");
  }
});

test("P0.4.19 rechaza tenant wildcard/global", () => {
  const request = {
    ...validRequest(),
    tenant_id: "*",
  };

  const result = validatePulseServerExecutionRequest(request);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.response.code, "INVALID_TENANT_ID");
  }
});

test("P0.4.19 rechaza proposal hash ausente", () => {
  const request = {
    ...validRequest(),
    proposal_hash: "",
  };

  const result = validatePulseServerExecutionRequest(request);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.response.code, "MISSING_PROPOSAL_HASH");
  }
});

test("P0.4.19 rechaza step index negativo", () => {
  const request = {
    ...validRequest(),
    step_index: -1,
  };

  const result = validatePulseServerExecutionRequest(request);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.response.code, "INVALID_STEP_INDEX");
  }
});

test("P0.4.19 conserva la versión canónica", () => {
  assert.equal(
    PULSE_EXECUTION_BOUNDARY_VERSION,
    "pulse-execution-boundary-v1",
  );
});

test("P0.4.19 rechaza una versión de boundary desconocida", () => {
  const request = {
    ...validRequest(),
    boundary_version: "pulse-execution-boundary-v999",
  };

  const result = validatePulseServerExecutionRequest(request);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.response.code, "INVALID_VERSION");
  }
});
