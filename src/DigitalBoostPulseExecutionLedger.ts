const LEGACY_KEY = "db-pulse-execution-claims-v1";
const KEY_PREFIX = "db-pulse-execution-claim-v2:";

export const PULSE_EXECUTION_CLAIM_KEY_PREFIX = KEY_PREFIX;

export type PulseExecutionClaim = {
  approval_id: string;
  request_id: string;
  action: string;
  mission_id?: string;
  plan_id?: string;
  step_id?: string;
  step_index?: number;
  claimed_at: string;
};

export type PulseExecutionClaimResult =
  | {
      claimed: true;
      claim: PulseExecutionClaim;
    }
  | {
      claimed: false;
      reason:
        | "ALREADY_CLAIMED"
        | "STORAGE_UNAVAILABLE"
        | "ATOMIC_CLAIM_UNAVAILABLE";
    };

export type PulseExecutionClaimStore = {
  /**
   * true  = el store puede garantizar single-use atómico.
   * false = el store sólo ofrece semántica best-effort.
   *
   * Las mutaciones aprobadas deben exigir atomic=true.
   */
  readonly atomic: boolean;

  /**
   * Debe intentar registrar la claim.
   *
   * Un store atómico debe implementar esta operación con una
   * primitiva de compare-and-set / unique constraint / transaction.
   */
  claim(
    claim: PulseExecutionClaim,
  ): PulseExecutionClaimResult;
};

function getStorage() {
  const storage = (globalThis as any).localStorage;

  if (!storage) {
    throw new Error("Execution claim storage unavailable.");
  }

  return storage;
}

function keyForApproval(
  approvalId: string,
): string {
  return (
    KEY_PREFIX +
    encodeURIComponent(approvalId)
  );
}

function readV2Claim(
  approvalId: string,
): PulseExecutionClaim | null {
  const storage = getStorage();
  const raw = storage.getItem(
    keyForApproval(approvalId),
  );

  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw);

  if (
    !parsed ||
    typeof parsed !== "object" ||
    parsed.approval_id !== approvalId
  ) {
    throw new Error(
      "Execution claim storage is invalid.",
    );
  }

  return parsed as PulseExecutionClaim;
}

function readLegacyClaim(
  approvalId: string,
): PulseExecutionClaim | null {
  const storage = getStorage();
  const raw = storage.getItem(LEGACY_KEY);

  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Legacy execution claim storage is invalid.",
    );
  }

  const found = parsed.find(
    (row) =>
      row &&
      typeof row === "object" &&
      row.approval_id === approvalId,
  );

  return found
    ? (found as PulseExecutionClaim)
    : null;
}

/**
 * Adapter actual de navegador.
 *
 * IMPORTANTE:
 * localStorage NO posee compare-and-set atómico.
 * Por eso este adapter se declara explícitamente como
 * best-effort y NO puede satisfacer una mutación crítica
 * que exija atomic=true.
 *
 * Se conserva para:
 * - compatibilidad con claims v1/v2 existentes;
 * - tests del ledger;
 * - lectura/replay detection fuera del camino crítico.
 */
const LOCAL_STORAGE_CLAIM_STORE: PulseExecutionClaimStore = {
  atomic: false,

  claim(claim: PulseExecutionClaim): PulseExecutionClaimResult {
    try {
      const existingV2 =
        readV2Claim(claim.approval_id);

      if (existingV2) {
        return {
          claimed: false,
          reason: "ALREADY_CLAIMED",
        };
      }

      const existingLegacy =
        readLegacyClaim(claim.approval_id);

      if (existingLegacy) {
        return {
          claimed: false,
          reason: "ALREADY_CLAIMED",
        };
      }

      const storage = getStorage();

      storage.setItem(
        keyForApproval(claim.approval_id),
        JSON.stringify(claim),
      );

      return {
        claimed: true,
        claim,
      };
    } catch {
      return {
        claimed: false,
        reason: "STORAGE_UNAVAILABLE",
      };
    }
  },
};

function defaultStore(): PulseExecutionClaimStore {
  return LOCAL_STORAGE_CLAIM_STORE;
}

export function claimPulseExecution(
  input: {
    approvalId: string;
    requestId: string;
    action: string;
    missionId?: string;
    planId?: string;
    stepId?: string;
    stepIndex?: number;
  },
  options?: {
    store?: PulseExecutionClaimStore;
    requireAtomic?: boolean;
  },
): PulseExecutionClaimResult {
  if (
    !input.approvalId ||
    !input.requestId ||
    !input.action
  ) {
    return {
      claimed: false,
      reason: "STORAGE_UNAVAILABLE",
    };
  }

  const store =
    options?.store ??
    defaultStore();

  if (
    options?.requireAtomic === true &&
    store.atomic !== true
  ) {
    return {
      claimed: false,
      reason: "ATOMIC_CLAIM_UNAVAILABLE",
    };
  }

  const claim: PulseExecutionClaim = {
    approval_id: input.approvalId,
    request_id: input.requestId,
    action: input.action,
    mission_id: input.missionId,
    plan_id: input.planId,
    step_id: input.stepId,
    step_index: input.stepIndex,
    claimed_at: new Date().toISOString(),
  };

  return store.claim(claim);
}
