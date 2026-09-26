import test from "node:test";
import assert from "node:assert/strict";

import {
  mkdtempSync,
  rmSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  createPulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

import {
  executePulseServerRequestWithServerClaimStore,
} from "../../src/server/DigitalBoostPulseServerExecutionRuntime";

import {
  PersistentApprovalRepository,
} from "../../src/server/DigitalBoostPulsePersistentApprovalRepository";

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

import {
  executeAuthorizedPulseServerRequest,
} from "../../src/server/DigitalBoostPulseServerExecutionRuntime";

import type {
  PulsePrincipal,
} from "../../src/server/DigitalBoostPulseAuthorizationBoundary";

function authPrincipal(
  overrides: Partial<PulsePrincipal> = {},
): PulsePrincipal {
  return {
    authenticated: true,
    subject_id: "runtime-user",
    active_tenant_id: "tenant-runtime-alpha",
    tenant_ids: ["tenant-runtime-alpha"],
    ...overrides,
  };
}

function authorizedRuntimeRequest() {
  return {
    boundary_version: "pulse-execution-boundary-v1",
    request_id: "req-p0421-runtime",
    tenant_id: "tenant-runtime-alpha",
    approval_id: "approval-runtime-p0421",
    action: "inventory",
    proposal_hash: "proposal-runtime-p0421",
    policy_version: "policy-v1",
    expected_context_version: "ctx-v1",
    mission_id: "mission-runtime-p0421",
    plan_id: "plan-runtime-p0421",
    step_id: "step-runtime-p0421",
    step_index: 0,
    issued_at: "2026-09-24T00:00:00.000Z",
  };
}

test("P0.4.21 runtime rechaza ejecución sin autenticación", async () => {
  let claims = 0;
  let executions = 0;

  const result =
    await executeAuthorizedPulseServerRequest(
      authorizedRuntimeRequest(),
      authPrincipal({
        authenticated: false,
      }),
      {
        authorizeAction: async () => true,

        createClaimStore() {
          return {
            async claim() {
              claims += 1;
              return {
                claimed: true,
              };
            },
          };
        },

        async executeAction() {
          executions += 1;

          return {
            completed: true,
            verified: true,
          };
        },
      },
    );

  assert.equal(result.status, "REJECTED");
  assert.equal(result.code, "AUTHENTICATION_REQUIRED");
  assert.equal(claims, 0);
  assert.equal(executions, 0);
});

test("P0.4.21 runtime rechaza tenant distinto antes del claim", async () => {
  let claims = 0;

  const result =
    await executeAuthorizedPulseServerRequest(
      {
        ...authorizedRuntimeRequest(),
        tenant_id: "tenant-attacker",
      },
      authPrincipal(),
      {
        authorizeAction: async () => true,

        createClaimStore() {
          return {
            async claim() {
              claims += 1;
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
  assert.equal(result.code, "TENANT_ACCESS_DENIED");
  assert.equal(claims, 0);
});

test("P0.4.21 runtime rechaza acción no autorizada antes del claim", async () => {
  let claims = 0;

  const result =
    await executeAuthorizedPulseServerRequest(
      authorizedRuntimeRequest(),
      authPrincipal(),
      {
        authorizeAction: async () => false,

        createClaimStore() {
          return {
            async claim() {
              claims += 1;
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
  assert.equal(result.code, "ACTION_NOT_AUTHORIZED");
  assert.equal(claims, 0);
});

test("P0.4.21 runtime autorizado llega al executor", async (t) => {
  let selectedTenant = "";
  let executions = 0;

  const input = authorizedRuntimeRequest();
  const root = mkdtempSync(
    join(
      tmpdir(),
      "pulse-p0421-runtime-",
    ),
  );

  t.after(() => {
    rmSync(
      root,
      {
        recursive: true,
        force: true,
      },
    );
  });

  const repository =
    new PersistentApprovalRepository({
      tenantId:
        input.tenant_id,
      rootDir:
        root,
    });

  repository.create({
    tenant_id:
      input.tenant_id,
    approval_id:
      input.approval_id,
    approval: {
      approval_id:
        input.approval_id,
      request_id:
        input.request_id,
      action:
        input.action,
      state:
        "APPROVED",
      created_at:
        "2026-09-26T12:00:00.000Z",
      updated_at:
        "2026-09-26T12:00:00.000Z",
      binding: {
        request_id:
          input.request_id,
        action:
          input.action,
        target:
          "inventory",
        risk:
          "L2",
        policy_version:
          input.policy_version,
        proposal_hash:
          input.proposal_hash,
        context_version:
          input.expected_context_version,
        actor:
          "runtime-user",
        tenant:
          input.tenant_id,
        expires_at:
          "2099-01-01T00:00:00.000Z",
      },
    },
  });

  const result =
    await executeAuthorizedPulseServerRequest(
      input,
      authPrincipal(),
      {
        authorizeAction: async (
          principal,
          request,
        ) => {
          return (
            principal.subject_id === "runtime-user" &&
            principal.active_tenant_id === "tenant-runtime-alpha" &&
            request.action === "inventory"
          );
        },

        createApprovalRepository(tenantId) {
          return new PersistentApprovalRepository({
            tenantId,
            rootDir:
              root,
          });
        },

        createClaimStore(tenantId) {
          selectedTenant = tenantId;

          return {
            async claim(input) {
              assert.equal(
                input.tenant_id,
                "tenant-runtime-alpha",
              );

              return {
                claimed: true,
              };
            },
          };
        },

        async executeAction(request) {
          executions += 1;

          assert.equal(
            request.tenant_id,
            "tenant-runtime-alpha",
          );

          return {
            completed: true,
            verified: true,
            evidence_id: "p0421-evidence",
          };
        },
      },
    );

  assert.equal(result.status, "EXECUTED");
  assert.equal(
    selectedTenant,
    "tenant-runtime-alpha",
  );
  assert.equal(executions, 1);
});
