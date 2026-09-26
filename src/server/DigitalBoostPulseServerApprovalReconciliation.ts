import {
  diffProposalBinding,
  isPulseRiskLevel,
  type PulseProposalBinding,
} from "../DigitalBoostPulseContracts";

import type {
  PulseServerExecutionRequest,
} from "../DigitalBoostPulseExecutionBoundary";

import type {
  PulseApproval,
} from "../DigitalBoostPulseGovernance";

import {
  PersistentApprovalRepository,
  PulseApprovalRepositoryError,
} from "./DigitalBoostPulsePersistentApprovalRepository";

export type PulseServerApprovalReconciliationCode =
  | "APPROVAL_NOT_FOUND"
  | "APPROVAL_NOT_APPROVED"
  | "APPROVAL_BINDING_MISSING"
  | "APPROVAL_MISMATCH"
  | "APPROVAL_EXPIRED"
  | "APPROVAL_STORAGE_ERROR";

export type PulseServerApprovalReconciliationResult =
  | {
      readonly ok: true;
      readonly approval: PulseApproval;
    }
  | {
      readonly ok: false;
      readonly code: PulseServerApprovalReconciliationCode;
    };

function nonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isPulseProposalBinding(
  value: unknown,
): value is PulseProposalBinding {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const binding =
    value as Partial<PulseProposalBinding>;

  return (
    nonEmptyString(binding.request_id) &&
    nonEmptyString(binding.action) &&
    nonEmptyString(binding.target) &&
    isPulseRiskLevel(binding.risk) &&
    nonEmptyString(binding.policy_version) &&
    nonEmptyString(binding.proposal_hash) &&
    nonEmptyString(binding.context_version) &&
    nonEmptyString(binding.actor) &&
    nonEmptyString(binding.tenant) &&
    nonEmptyString(binding.expires_at)
  );
}

function isPulseApproval(
  value: unknown,
): value is PulseApproval {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const approval =
    value as Partial<PulseApproval>;

  return (
    nonEmptyString(approval.approval_id) &&
    nonEmptyString(approval.request_id) &&
    nonEmptyString(approval.action) &&
    (
      approval.state === "AWAITING_APPROVAL" ||
      approval.state === "APPROVED" ||
      approval.state === "REJECTED"
    )
  );
}

function mapBindingMismatch(
  mismatch: string,
): PulseServerApprovalReconciliationCode {
  if (
    mismatch === "APPROVAL_EXPIRED"
  ) {
    return "APPROVAL_EXPIRED";
  }

  return "APPROVAL_MISMATCH";
}

/**
 * Canonical server-side approval reconciliation.
 *
 * IMPORTANT:
 * - PersistentApprovalRepository is storage, not authority by itself.
 * - The caller must already have a trusted authenticated principal.
 * - The request tenant must already be rebound to that principal.
 * - This boundary only admits an approval that was already persisted
 *   and is internally consistent with the current execution request.
 * - No claim or execution happens here.
 */
export function reconcilePulseServerApproval(
  repository: PersistentApprovalRepository,
  request: PulseServerExecutionRequest,
): PulseServerApprovalReconciliationResult {
  try {
    const record =
      repository.get<PulseApproval>(
        request.approval_id,
      );

    if (!record) {
      return {
        ok: false,
        code: "APPROVAL_NOT_FOUND",
      };
    }

    if (
      record.tenant_id !==
      request.tenant_id
    ) {
      return {
        ok: false,
        code: "APPROVAL_MISMATCH",
      };
    }

    const approval = record.approval;

    if (!isPulseApproval(approval)) {
      return {
        ok: false,
        code: "APPROVAL_STORAGE_ERROR",
      };
    }

    if (
      approval.approval_id !==
      request.approval_id ||
      approval.request_id !==
      request.request_id ||
      approval.action !==
      request.action
    ) {
      return {
        ok: false,
        code: "APPROVAL_MISMATCH",
      };
    }

    if (
      approval.state !==
      "APPROVED"
    ) {
      return {
        ok: false,
        code: "APPROVAL_NOT_APPROVED",
      };
    }

    if (
      !approval.binding ||
      !isPulseProposalBinding(
        approval.binding,
      )
    ) {
      return {
        ok: false,
        code: "APPROVAL_BINDING_MISSING",
      };
    }

    const expected =
      approval.binding;

    /*
     * The persisted binding remains authoritative for fields that are
     * not transported by the execution request (target/risk/actor/expiry).
     *
     * The current request is reconciled only against the fields that the
     * execution boundary actually carries.
     */
    const actual: PulseProposalBinding = {
      ...expected,
      request_id:
        request.request_id,
      action:
        request.action,
      policy_version:
        request.policy_version,
      proposal_hash:
        request.proposal_hash,
      context_version:
        request.expected_context_version,
      tenant:
        request.tenant_id,
    };

    const mismatch =
      diffProposalBinding(
        expected,
        actual,
      );

    if (mismatch !== "OK") {
      return {
        ok: false,
        code:
          mapBindingMismatch(
            mismatch,
          ),
      };
    }

    return {
      ok: true,
      approval,
    };
  } catch (error) {
    if (
      error instanceof
      PulseApprovalRepositoryError
    ) {
      return {
        ok: false,
        code:
          error.code ===
          "APPROVAL_NOT_FOUND"
            ? "APPROVAL_NOT_FOUND"
            : "APPROVAL_STORAGE_ERROR",
      };
    }

    return {
      ok: false,
      code: "APPROVAL_STORAGE_ERROR",
    };
  }
}
