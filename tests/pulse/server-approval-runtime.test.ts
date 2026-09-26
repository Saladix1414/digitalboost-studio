import assert from "node:assert/strict";
import test from "node:test";

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
  executeAuthorizedPulseServerRequest,
} from "../../src/server/DigitalBoostPulseServerExecutionRuntime";

import {
  PersistentApprovalRepository,
} from "../../src/server/DigitalBoostPulsePersistentApprovalRepository";

function request(
  overrides: Record<string, unknown> = {},
) {
  return {
    boundary_version:
      "pulse-execution-boundary-v1",
    request_id:
      "req-p11b-runtime",
    tenant_id:
      "tenant-p11b-runtime",
    approval_id:
      "approval-p11b-runtime",
    action:
      "inventory",
    proposal_hash:
      "proposal-p11b-runtime",
    policy_version:
      "policy-v1",
    expected_context_version:
      "ctx-v1",
    mission_id:
      "mission-p11b-runtime",
    plan_id:
      "plan-p11b-runtime",
    step_id:
      "step-p11b-runtime",
    step_index:
      0,
    issued_at:
      new Date().toISOString(),
    ...overrides,
  };
}

function principal() {
  return {
    authenticated: true,
    subject_id:
      "runtime-user",
    active_tenant_id:
      "tenant-p11b-runtime",
    tenant_ids: [
      "tenant-p11b-runtime",
    ],
  };
}

function openRoot() {
  return mkdtempSync(
    join(
      tmpdir(),
      "pulse-p11b-runtime-",
    ),
  );
}

function persistApproval(
  root: string,
  state:
    | "AWAITING_APPROVAL"
    | "APPROVED"
    | "REJECTED" = "APPROVED",
  overrides: Record<string, unknown> = {},
) {
  const input =
    request() as {
      request_id: string;
      tenant_id: string;
      approval_id: string;
      action: string;
      proposal_hash: string;
      policy_version: string;
      expected_context_version: string;
    };

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
      state,
      created_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
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
          new Date(
            Date.now() +
              60 * 60 * 1000,
          ).toISOString(),
      },
      ...overrides,
    },
  });
}

async function execute(
  root: string,
  input:
    Record<string, unknown> = request(),
) {
  let claims = 0;
  let executions = 0;

  const result =
    await executeAuthorizedPulseServerRequest(
      input,
      principal(),
      {
        authorizeAction:
          async () => true,

        createApprovalRepository(
          tenantId,
        ) {
          return new PersistentApprovalRepository({
            tenantId,
            rootDir:
              root,
          });
        },

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
            evidence_id:
              "evidence-p11b-runtime",
          };
        },
      },
    );

  return {
    result,
    claims,
    executions,
  };
}

test(
  "P1.1-B runtime rejects nonexistent persisted approval before claim",
  async () => {
    const root = openRoot();

    try {
      const outcome =
        await execute(root);

      assert.equal(
        outcome.result.status,
        "REJECTED",
      );

      assert.equal(
        outcome.result.code,
        "APPROVAL_NOT_FOUND",
      );

      assert.equal(
        outcome.claims,
        0,
      );

      assert.equal(
        outcome.executions,
        0,
      );
    } finally {
      rmSync(root, {
        recursive: true,
        force: true,
      });
    }
  },
);

test(
  "P1.1-B runtime rejects unapproved persisted approval before claim",
  async () => {
    const root = openRoot();

    try {
      persistApproval(
        root,
        "AWAITING_APPROVAL",
      );

      const outcome =
        await execute(root);

      assert.equal(
        outcome.result.status,
        "REJECTED",
      );

      assert.equal(
        outcome.result.code,
        "APPROVAL_NOT_APPROVED",
      );

      assert.equal(
        outcome.claims,
        0,
      );

      assert.equal(
        outcome.executions,
        0,
      );
    } finally {
      rmSync(root, {
        recursive: true,
        force: true,
      });
    }
  },
);

test(
  "P1.1-B runtime rejects proposal drift before claim",
  async () => {
    const root = openRoot();

    try {
      persistApproval(root);

      const outcome =
        await execute(
          root,
          request({
            proposal_hash:
              "attacker-proposal",
          }),
        );

      assert.equal(
        outcome.result.status,
        "REJECTED",
      );

      assert.equal(
        outcome.result.code,
        "APPROVAL_MISMATCH",
      );

      assert.equal(
        outcome.claims,
        0,
      );

      assert.equal(
        outcome.executions,
        0,
      );
    } finally {
      rmSync(root, {
        recursive: true,
        force: true,
      });
    }
  },
);

test(
  "P1.1-B runtime allows only reconciled APPROVED execution",
  async () => {
    const root = openRoot();

    try {
      persistApproval(root);

      const outcome =
        await execute(root);

      assert.equal(
        outcome.result.status,
        "EXECUTED",
      );

      assert.equal(
        outcome.claims,
        1,
      );

      assert.equal(
        outcome.executions,
        1,
      );
    } finally {
      rmSync(root, {
        recursive: true,
        force: true,
      });
    }
  },
);
