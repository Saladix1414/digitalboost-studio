import test from "node:test";
import assert from "node:assert/strict";

import {
  createPulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

import {
  executePulseServerRequestWithServerClaimStore,
} from "../../src/server/DigitalBoostPulseServerExecutionRuntime";

import type {
  PulseServerExecutionClaimInput,
  PulseServerExecutionClaimStore,
} from "../../src/DigitalBoostPulseServerExecutor";

function request(
  overrides: Record<string, unknown> = {},
) {
  return createPulseServerExecutionRequest({
    request_id: "req-p0420-runtime-001",
    tenant_id: "tenant-runtime-alpha",
    approval_id: "approval-runtime-001",
    action: "inventory",
    proposal_hash: "proposal-runtime-001",
    policy_version: "policy-v1",
    expected_context_version: "ctx-v1",
    mission_id: "mission-runtime-001",
    plan_id: "plan-runtime-001",
    step_id: "step-runtime-001",
    step_index: 0,
    ...overrides,
  });
}

function makeClaimStore() {
  const calls: PulseServerExecutionClaimInput[] = [];

  const store: PulseServerExecutionClaimStore = {
    async claim(input) {
      calls.push(input);

      return {
        claimed: true,
      };
    },
  };

  return {
    store,
    calls,
  };
}

test("P0.4.20 runtime selecciona el claim store por tenant validado", async () => {
  const selectedTenants: string[] = [];
  const { store, calls } = makeClaimStore();

  const result =
    await executePulseServerRequestWithServerClaimStore(
      request(),
      {
        createClaimStore(tenantId) {
          selectedTenants.push(tenantId);
          return store;
        },

        async executeAction() {
          return {
            completed: true,
            verified: true,
            evidence_id: "runtime-evidence-001",
          };
        },
      },
    );

  assert.equal(result.status, "EXECUTED");
  assert.deepEqual(
    selectedTenants,
    ["tenant-runtime-alpha"],
  );

  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.tenant_id,
    "tenant-runtime-alpha",
  );
});

test("P0.4.20 runtime preserva toda la identidad de ejecución", async () => {
  const { store, calls } = makeClaimStore();

  const result =
    await executePulseServerRequestWithServerClaimStore(
      request(),
      {
        createClaimStore() {
          return store;
        },

        async executeAction() {
          return {
            completed: true,
            verified: true,
          };
        },
      },
    );

  assert.equal(result.status, "EXECUTED");

  const claim = calls[0];

  assert.equal(claim?.request_id, "req-p0420-runtime-001");
  assert.equal(claim?.tenant_id, "tenant-runtime-alpha");
  assert.equal(claim?.approval_id, "approval-runtime-001");
  assert.equal(claim?.action, "inventory");
  assert.equal(claim?.mission_id, "mission-runtime-001");
  assert.equal(claim?.plan_id, "plan-runtime-001");
  assert.equal(claim?.step_id, "step-runtime-001");
  assert.equal(claim?.step_index, 0);
});

test("P0.4.20 request inválido no crea claim store", async () => {
  let createCount = 0;

  const invalid = {
    ...request(),
    tenant_id: "",
  };

  const result =
    await executePulseServerRequestWithServerClaimStore(
      invalid,
      {
        createClaimStore() {
          createCount += 1;

          return {
            async claim() {
              return {
                claimed: true,
              };
            },
          };
        },

        async executeAction() {
          return {
            completed: true,
            verified: true,
          };
        },
      },
    );

  assert.equal(result.status, "REJECTED");
  assert.equal(createCount, 0);
});

test("P0.4.20 approved=true nunca se convierte en autorización", async () => {
  const { store } = makeClaimStore();
  let executionCount = 0;

  const invalid = {
    ...request(),
    approval_id: "",
    approved: true,
  };

  const result =
    await executePulseServerRequestWithServerClaimStore(
      invalid,
      {
        createClaimStore() {
          return store;
        },

        async executeAction() {
          executionCount += 1;

          return {
            completed: true,
            verified: true,
          };
        },
      },
    );

  assert.equal(result.status, "REJECTED");
  assert.equal(executionCount, 0);
});

test("P0.4.20 claim store no puede saltarse el executor", async () => {
  let executed = false;

  const result =
    await executePulseServerRequestWithServerClaimStore(
      request(),
      {
        createClaimStore() {
          return {
            async claim() {
              return {
                claimed: true,
              };
            },
          };
        },

        async executeAction() {
          executed = true;

          return {
            completed: true,
            verified: true,
          };
        },
      },
    );

  assert.equal(result.status, "EXECUTED");
  assert.equal(executed, true);
});
