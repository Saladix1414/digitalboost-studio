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
