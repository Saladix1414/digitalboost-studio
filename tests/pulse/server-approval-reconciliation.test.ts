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
  createPulseServerExecutionRequest,
} from "../../src/DigitalBoostPulseExecutionBoundary";

import {
  PersistentApprovalRepository,
} from "../../src/server/DigitalBoostPulsePersistentApprovalRepository";

import {
  reconcilePulseServerApproval,
} from "../../src/server/DigitalBoostPulseServerApprovalReconciliation";

function makeRequest(
  overrides: Record<string, unknown> = {},
) {
  return createPulseServerExecutionRequest({
    request_id: "req-p11b-001",
    tenant_id: "tenant-p11b",
    approval_id: "approval-p11b",
    action: "inventory",
    proposal_hash: "proposal-p11b",
    policy_version: "policy-v1",
    expected_context_version: "ctx-v1",
    mission_id: "mission-p11b",
    plan_id: "plan-p11b",
    step_id: "step-p11b",
    step_index: 0,
    ...overrides,
  });
}

function makeRepository() {
  const root = mkdtempSync(
    join(
      tmpdir(),
      "pulse-p11b-reconcile-",
    ),
  );

  return {
    root,
    repository:
      new PersistentApprovalRepository({
        tenantId: "tenant-p11b",
        rootDir: root,
      }),
  };
}

function makeBinding(
  overrides: Record<string, unknown> = {},
) {
  return {
    request_id: "req-p11b-001",
    action: "inventory",
    target: "inventory",
    risk: "L2" as const,
    policy_version: "policy-v1",
    proposal_hash: "proposal-p11b",
    context_version: "ctx-v1",
    actor: "runtime-user",
    tenant: "tenant-p11b",
    expires_at: new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString(),
    ...overrides,
  };
}

function persistApproval(
  repository: PersistentApprovalRepository,
  overrides: Record<string, unknown> = {},
) {
  const {
    omitBinding,
    ...approvalOverrides
  } = overrides as Record<string, unknown> & {
    omitBinding?: boolean;
  };

  repository.create({
    tenant_id: "tenant-p11b",
    approval_id: "approval-p11b",
    approval: {
      approval_id: "approval-p11b",
      request_id: "req-p11b-001",
      action: "inventory",
      state: "APPROVED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(omitBinding
        ? {}
        : { binding: makeBinding() }),
      ...approvalOverrides,
    },
  });
}

function cleanup(root: string) {
  rmSync(root, {
    recursive: true,
    force: true,
  });
}

test(
  "P1.1-B approval persistida inexistente bloquea reconciliación",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_NOT_FOUND",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B AWAITING_APPROVAL no es autoridad de ejecución",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(
        repository,
        {
          state:
            "AWAITING_APPROVAL",
        },
      );

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_NOT_APPROVED",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B REJECTED no es autoridad de ejecución",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(
        repository,
        {
          state: "REJECTED",
        },
      );

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_NOT_APPROVED",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B approval_id/request_id/action deben coincidir",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(repository);

      const requestMismatch =
        reconcilePulseServerApproval(
          repository,
          makeRequest({
            request_id:
              "req-attacker",
          }),
        );

      assert.deepEqual(
        requestMismatch,
        {
          ok: false,
          code: "APPROVAL_MISMATCH",
        },
      );

      const actionMismatch =
        reconcilePulseServerApproval(
          repository,
          makeRequest({
            action: "campaigns",
          }),
        );

      assert.deepEqual(
        actionMismatch,
        {
          ok: false,
          code: "APPROVAL_MISMATCH",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B proposal hash drift is rejected",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(repository);

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest({
            proposal_hash:
              "attacker-proposal",
          }),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_MISMATCH",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B policy/context drift is rejected",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(repository);

      const policyMismatch =
        reconcilePulseServerApproval(
          repository,
          makeRequest({
            policy_version:
              "policy-attacker",
          }),
        );

      assert.deepEqual(
        policyMismatch,
        {
          ok: false,
          code: "APPROVAL_MISMATCH",
        },
      );

      const contextMismatch =
        reconcilePulseServerApproval(
          repository,
          makeRequest({
            expected_context_version:
              "ctx-attacker",
          }),
        );

      assert.deepEqual(
        contextMismatch,
        {
          ok: false,
          code: "APPROVAL_MISMATCH",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B binding inexistente es rechazado",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(
        repository,
        {
          omitBinding: true,
        },
      );

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_BINDING_MISSING",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B binding expirado es rechazado",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(
        repository,
        {
          binding: makeBinding({
            expires_at:
              new Date(
                Date.now() - 1000,
              ).toISOString(),
          }),
        },
      );

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.deepEqual(
        result,
        {
          ok: false,
          code: "APPROVAL_EXPIRED",
        },
      );
    } finally {
      cleanup(root);
    }
  },
);

test(
  "P1.1-B approval persistida APPROVED y binding válido son aceptados",
  () => {
    const {
      root,
      repository,
    } = makeRepository();

    try {
      persistApproval(repository);

      const result =
        reconcilePulseServerApproval(
          repository,
          makeRequest(),
        );

      assert.equal(
        result.ok,
        true,
      );

      if (result.ok) {
        assert.equal(
          result.approval.state,
          "APPROVED",
        );

        assert.equal(
          result.approval.approval_id,
          "approval-p11b",
        );

        assert.equal(
          result.approval.request_id,
          "req-p11b-001",
        );
      }
    } finally {
      cleanup(root);
    }
  },
);
