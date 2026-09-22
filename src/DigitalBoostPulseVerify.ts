import { getActionContract, isKnownPulseAction } from "./DigitalBoostPulseContracts";
export type PulseVerifyPhase = "PRECHECK" | "POSTCHECK";
export type PulseVerifyStatus = "PASS" | "FAIL" | "SKIPPED";
export type PulseVerifyDiff = { path: string; expected: unknown; actual: unknown };
export type PulseCheck = { name: string; ok: boolean; detail?: string };
export type PulseVerificationInput = {
  phase: PulseVerifyPhase;
  action: string;
  expected?: Record<string, unknown> | null;
  actual?: Record<string, unknown> | null;
  checks?: PulseCheck[];
};
export type PulseVerificationResult = {
  phase: PulseVerifyPhase;
  action: string;
  actionName?: string;
  status: PulseVerifyStatus;
  verified: boolean;
  diffs: PulseVerifyDiff[];
  failedChecks: string[];
  reasonCodes: string[];
};

export type PulsePrecheckInput = {
  action: string;
  executionState: string;
  draft?: Record<string, unknown> | null;
  proposal?: Record<string, unknown> | null;
};

const PRECHECK_PAYLOAD_ACTIONS = new Set([
  "hero",
  "seo-fix",
  "optimize",
]);

const PRECHECK_UNSUPPORTED_MUTATIONS = new Set([
  "campaigns",
]);

function precheckFailure(
  action: string,
  failedChecks: PulseCheck[],
): PulseVerificationResult {
  return {
    phase: "PRECHECK",
    action,
    status: "FAIL",
    verified: false,
    diffs: [],
    failedChecks: failedChecks.map((check) => check.name),
    reasonCodes: ["PRECONDITION_FAILED"],
  };
}

export function precheckPulseExecution(
  input: PulsePrecheckInput,
): PulseVerificationResult {
  const contract = getActionContract(input.action);

  const failedChecks: PulseCheck[] = [];

  if (!isKnownPulseAction(input.action) || !contract) {
    failedChecks.push({
      name: "known-action",
      ok: false,
      detail: "Action contract is missing.",
    });

    return precheckFailure(input.action, failedChecks);
  }

  if (input.executionState !== "EXECUTING") {
    failedChecks.push({
      name: "execution-state",
      ok: false,
      detail: "Executor reached precheck without EXECUTING governance state.",
    });
  }

  if (PRECHECK_UNSUPPORTED_MUTATIONS.has(input.action)) {
    failedChecks.push({
      name: "executor-capability",
      ok: false,
      detail: "No real mutation executor is registered for this action.",
    });
  }

  const hasDraft = Boolean(input.draft);
  const hasProposal = Boolean(input.proposal);

  if (PRECHECK_PAYLOAD_ACTIONS.has(input.action) && !hasDraft && !hasProposal) {
    failedChecks.push({
      name: "mutation-payload",
      ok: false,
      detail: "Mutating action requires a draft or proposal.",
    });
  }

  if (hasDraft) {
    const draft = input.draft as Record<string, unknown>;

    const validDraft =
      typeof draft.kind === "string" &&
      typeof draft.title === "string" &&
      typeof draft.body === "string" &&
      typeof draft.cta === "string";

    if (!validDraft) {
      failedChecks.push({
        name: "draft-shape",
        ok: false,
        detail: "Draft shape is incomplete.",
      });
    }

    if (
      input.action === "hero" &&
      draft.kind !== "hero"
    ) {
      failedChecks.push({
        name: "hero-draft-kind",
        ok: false,
        detail: "hero action requires a hero draft.",
      });
    }
  }

  if (hasProposal) {
    const proposal = input.proposal as Record<string, unknown>;

    if (typeof proposal.type !== "string") {
      failedChecks.push({
        name: "proposal-type",
        ok: false,
        detail: "Proposal type is missing.",
      });
    }

    if (
      input.action === "seo-fix" &&
      proposal.type !== "seo-fix"
    ) {
      failedChecks.push({
        name: "seo-proposal-type",
        ok: false,
        detail: "seo-fix action requires a seo-fix proposal.",
      });
    }

    if (
      input.action === "optimize" &&
      proposal.type !== "optimize"
    ) {
      failedChecks.push({
        name: "optimize-proposal-type",
        ok: false,
        detail: "optimize action requires an optimize proposal.",
      });
    }

    if (
      input.action === "hero" &&
      proposal.type !== "optimize" &&
      !hasDraft
    ) {
      failedChecks.push({
        name: "hero-proposal-type",
        ok: false,
        detail: "hero action requires a hero draft or optimize proposal.",
      });
    }
  }

  if (failedChecks.length > 0) {
    return precheckFailure(input.action, failedChecks);
  }

  return {
    phase: "PRECHECK",
    action: input.action,
    status: "PASS",
    verified: true,
    diffs: [],
    failedChecks: [],
    reasonCodes: ["OK"],
  };
}

function diffRecords(expected?: Record<string, unknown> | null, actual?: Record<string, unknown> | null) {
  if (!expected) return [];
  const diffs: PulseVerifyDiff[] = [];
  for (const key of Object.keys(expected)) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual ? actual[key] : undefined)) {
      diffs.push({ path: key, expected: expected[key], actual: actual ? actual[key] : undefined });
    }
  }
  return diffs;
}

export function verifyPulseAction(input: PulseVerificationInput): PulseVerificationResult {
  const failedChecks = (input.checks || []).filter((c) => !c.ok).map((c) => c.name);
  const hasExpected = Boolean(input.expected && Object.keys(input.expected).length);
  const hasActual = Boolean(input.actual && Object.keys(input.actual).length);
  if (!hasExpected && (!input.checks || input.checks.length === 0)) {
    return { phase: input.phase, action: input.action, status: "SKIPPED", verified: false, diffs: [], failedChecks, reasonCodes: ["VERIFICATION_SKIPPED"] };
  }
  if (hasExpected && !hasActual) {
    return { phase: input.phase, action: input.action, status: "FAIL", verified: false, diffs: diffRecords(input.expected, input.actual), failedChecks, reasonCodes: ["VERIFICATION_FAILED"] };
  }
  const diffs = diffRecords(input.expected, input.actual);
  const failed = diffs.length > 0 || failedChecks.length > 0;
  return { phase: input.phase, action: input.action, status: failed ? "FAIL" : "PASS", verified: !failed, diffs, failedChecks, reasonCodes: failed ? ["VERIFICATION_FAILED"] : ["OK"] };
}

export function combineVerifications(action: string, pre: PulseVerificationResult, post: PulseVerificationResult): PulseVerificationResult {
  if (pre.status === "FAIL") return pre;
  if (post.status === "FAIL") return post;
  if (pre.status === "SKIPPED" && post.status === "SKIPPED") {
    return { phase: "POSTCHECK", action, status: "SKIPPED", verified: false, diffs: [], failedChecks: [], reasonCodes: ["VERIFICATION_SKIPPED"] };
  }
  return post.status === "PASS" ? post : pre;
}
