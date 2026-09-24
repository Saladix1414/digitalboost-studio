const KEY = "db-pulse-execution-claims-v1";

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
      reason: "ALREADY_CLAIMED" | "STORAGE_UNAVAILABLE";
    };

function readClaims(): PulseExecutionClaim[] {
  const storage = (globalThis as any).localStorage;

  if (!storage) {
    throw new Error("Execution claim storage unavailable.");
  }

  const raw = storage.getItem(KEY);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Execution claim storage is invalid.");
  }

  return parsed as PulseExecutionClaim[];
}

function writeClaims(rows: PulseExecutionClaim[]) {
  const storage = (globalThis as any).localStorage;

  if (!storage) {
    throw new Error("Execution claim storage unavailable.");
  }

  storage.setItem(
    KEY,
    JSON.stringify(rows.slice(-400)),
  );
}

export function claimPulseExecution(input: {
  approvalId: string;
  requestId: string;
  action: string;
  missionId?: string;
  planId?: string;
  stepId?: string;
  stepIndex?: number;
}): PulseExecutionClaimResult {
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

  try {
    const rows = readClaims();

    const existing = rows.find(
      (row) =>
        row.approval_id === input.approvalId,
    );

    if (existing) {
      return {
        claimed: false,
        reason: "ALREADY_CLAIMED",
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

    writeClaims([
      ...rows,
      claim,
    ]);

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
}
