import test from "node:test";
import assert from "node:assert/strict";

import {
  executePulseServerRequest,
  type PulseServerExecutionClaimInput,
  type PulseServerExecutionClaimStore,
} from "../../src/DigitalBoostPulseServerExecutor";

import {
  createPulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

function request(
  overrides: Record<string, unknown> = {},
) {
  return createPulseServerExecutionRequest({
    request_id: "req-p0420-001",
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
    ...overrides,
  });
}

function makeStore(): PulseServerExecutionClaimStore & {
  calls: PulseServerExecutionClaimInput[];
} {
  const claims = new Set<string>();
  const calls: PulseServerExecutionClaimInput[] = [];

  return {
    calls,

    async claim(input) {
      calls.push(input);

      const key =
        `${input.tenant_id}::${input.approval_id}`;

      if (claims.has(key)) {
        return {
          claimed: false,
          reason: "replay",
        };
      }

      claims.add(key);

      return {
        claimed: true,
      };
    },
  };
}

test("P0.4.20 claim ocurre antes de ejecutar", async () => {
  const order: string[] = [];
  const store = makeStore();

  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: {
        async claim(input) {
          order.push("claim");
          return store.claim(input);
        },
      },

      async executeAction() {
        order.push("execute");

        return {
          completed: true,
          verified: true,
          evidence_id: "evidence-001",
        };
      },
    },
  );

  assert.equal(result.status, "EXECUTED");
  assert.deepEqual(order, ["claim", "execute"]);
});

test("P0.4.20 mismo approval no puede ejecutar dos veces", async () => {
  const store = makeStore();
  let executionCount = 0;

  const dependencies = {
    claimStore: store,

    async executeAction() {
      executionCount += 1;

      return {
        completed: true,
        verified: true,
        evidence_id: `evidence-${executionCount}`,
      };
    },
  };

  const first = await executePulseServerRequest(
    request(),
    dependencies,
  );

  const second = await executePulseServerRequest(
    request(),
    dependencies,
  );

  assert.equal(first.status, "EXECUTED");
  assert.equal(second.status, "REPLAY_REJECTED");
  assert.equal(executionCount, 1);
});

test("P0.4.20 fallo del claim store es fail-closed", async () => {
  let executionCount = 0;

  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: {
        async claim() {
          throw new Error("store unavailable");
        },
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
  assert.equal(result.code, "CLAIM_STORE_UNAVAILABLE");
  assert.equal(executionCount, 0);
});

test("P0.4.20 claim rechazado impide mutación", async () => {
  let executionCount = 0;

  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: {
        async claim() {
          return {
            claimed: false,
            reason: "replay",
          };
        },
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

  assert.equal(result.status, "REPLAY_REJECTED");
  assert.equal(result.code, "CLAIM_REJECTED");
  assert.equal(executionCount, 0);
});

test("P0.4.20 no declara EXECUTED sin verified", async () => {
  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: {
        async claim() {
          return {
            claimed: true,
          };
        },
      },

      async executeAction() {
        return {
          completed: true,
          verified: false,
          evidence_id: "unverified",
        };
      },
    },
  );

  assert.equal(result.status, "FAILED_UNVERIFIED");
  assert.equal(result.code, "EXECUTION_UNVERIFIED");
});

test("P0.4.20 no declara EXECUTED sin completed", async () => {
  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: {
        async claim() {
          return {
            claimed: true,
          };
        },
      },

      async executeAction() {
        return {
          completed: false,
          verified: false,
        };
      },
    },
  );

  assert.equal(result.status, "FAILED_UNVERIFIED");
});

test("P0.4.20 tenant_id y approval_id llegan al claim server", async () => {
  const store = makeStore();

  const result = await executePulseServerRequest(
    request(),
    {
      claimStore: store,

      async executeAction() {
        return {
          completed: true,
          verified: true,
        };
      },
    },
  );

  assert.equal(result.status, "EXECUTED");
  assert.equal(store.calls.length, 1);
  assert.equal(store.calls[0]?.tenant_id, "tenant-alpha");
  assert.equal(store.calls[0]?.approval_id, "approval-001");
});

test("P0.4.20 request inválido no llega al claim store", async () => {
  let claimCount = 0;

  const invalid = {
    ...request(),
    approval_id: "",
  };

  const result = await executePulseServerRequest(
    invalid,
    {
      claimStore: {
        async claim() {
          claimCount += 1;

          return {
            claimed: true,
          };
        },
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
  assert.equal(result.code, "INVALID_REQUEST");
  assert.equal(claimCount, 0);
});

test("P0.4.20 contract incluye contexto completo de ejecución", async () => {
  const store = makeStore();

  await executePulseServerRequest(
    request(),
    {
      claimStore: store,

      async executeAction() {
        return {
          completed: true,
          verified: true,
        };
      },
    },
  );

  const claim = store.calls[0];

  assert.equal(claim?.request_id, "req-p0420-001");
  assert.equal(claim?.tenant_id, "tenant-alpha");
  assert.equal(claim?.approval_id, "approval-001");
  assert.equal(claim?.action, "inventory");
  assert.equal(claim?.mission_id, "mission-001");
  assert.equal(claim?.plan_id, "plan-001");
  assert.equal(claim?.step_id, "step-001");
  assert.equal(claim?.step_index, 0);
});
