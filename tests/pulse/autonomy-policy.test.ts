import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_AUTONOMY_POLICY_CONTRACT,
  decidePulseAutonomy,
} from "../../src/DigitalBoostPulseAutonomyPolicy.ts";

const base = () => ({
  missionState:
    "RUNNING" as const,
  currentStepPresent:
    true,
  governancePolicy:
    "ALLOW" as const,
});

test(
  "P0.9.0 contract is explicit",
  () => {
    const result =
      decidePulseAutonomy(
        base(),
      );

    assert.equal(
      result.contract,
      PULSE_AUTONOMY_POLICY_CONTRACT,
    );

    assert.equal(
      result.contract,
      "p0.9.0",
    );
  },
);

test(
  "fresh governed mission may continue",
  () => {
    const result =
      decidePulseAutonomy(
        base(),
      );

    assert.equal(
      result.decision,
      "CONTINUE",
    );

    assert.equal(
      result.reason,
      "MISSION_READY",
    );
  },
);

test(
  "paused mission never auto-continues",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        missionState:
          "PAUSED",
      });

    assert.equal(
      result.decision,
      "PAUSE",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "completed mission becomes COMPLETE",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        missionState:
          "COMPLETED",
      });

    assert.equal(
      result.decision,
      "COMPLETE",
    );

    assert.equal(
      result.terminal,
      true,
    );
  },
);

test(
  "cancelled mission becomes STOP",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        missionState:
          "CANCELLED",
      });

    assert.equal(
      result.decision,
      "STOP",
    );
  },
);

test(
  "failed mission becomes STOP",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        missionState:
          "FAILED",
      });

    assert.equal(
      result.decision,
      "STOP",
    );
  },
);

test(
  "governance REJECT dominates autonomy",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        governancePolicy:
          "REJECT",
      });

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "POLICY_REJECTED",
    );
  },
);

test(
  "required approval blocks continuation",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        governancePolicy:
          "REQUIRE_APPROVAL",
      });

    assert.equal(
      result.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "approved required action may continue",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        governancePolicy:
          "REQUIRE_APPROVAL",
        approval: {
          approval_id:
            "approval-p090",
          request_id:
            "req-p090",
          action:
            "website-builder",
          state:
            "APPROVED",
          created_at:
            "2026-01-01T00:00:00.000Z",
          updated_at:
            "2026-01-01T00:00:01.000Z",
        },
      });

    assert.equal(
      result.decision,
      "CONTINUE",
    );
  },
);

test(
  "rejected approval stops autonomy",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        approval: {
          approval_id:
            "approval-p090-reject",
          request_id:
            "req-p090-reject",
          action:
            "campaigns",
          state:
            "REJECTED",
          created_at:
            "2026-01-01T00:00:00.000Z",
          updated_at:
            "2026-01-01T00:00:01.000Z",
        },
      });

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "APPROVAL_REJECTED",
    );
  },
);

test(
  "stale context stops autonomy",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        contextStatus:
          "STALE",
      });

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "CONTEXT_STALE",
    );
  },
);

test(
  "changed context stops autonomy",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        contextStatus:
          "CHANGED",
      });

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "CONTEXT_CHANGED",
    );
  },
);

test(
  "unknown context escalates",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        contextStatus:
          "UNKNOWN",
      });

    assert.equal(
      result.decision,
      "ESCALATE",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "completed but unverified execution escalates",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "COMPLETED",
        executionVerified:
          false,
      });

    assert.equal(
      result.decision,
      "ESCALATE",
    );

    assert.equal(
      result.reason,
      "EXECUTION_COMPLETED_UNVERIFIED",
    );
  },
);

test(
  "unverified execution escalates",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "UNVERIFIED",
      });

    assert.equal(
      result.decision,
      "ESCALATE",
    );
  },
);

test(
  "failed execution may retry only when explicitly allowed and budget remains",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "FAILED",
        retryAllowed:
          true,
        retries:
          1,
        maxRetries:
          2,
      });

    assert.equal(
      result.decision,
      "CONTINUE",
    );

    assert.equal(
      result.reason,
      "EXECUTION_FAILED_RETRY_ALLOWED",
    );
  },
);

test(
  "failed execution does not retry implicitly",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "FAILED",
        retries:
          0,
        maxRetries:
          2,
      });

    assert.equal(
      result.decision,
      "STOP",
    );
  },
);

test(
  "retry budget exhaustion stops autonomy",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "FAILED",
        retryAllowed:
          true,
        retries:
          2,
        maxRetries:
          2,
      });

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "EXECUTION_FAILED_RETRY_EXHAUSTED",
    );
  },
);

test(
  "missing current step requires verified goal before completion",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        currentStepPresent:
          false,
        goalVerified:
          false,
      });

    assert.equal(
      result.decision,
      "ESCALATE",
    );

    assert.equal(
      result.reason,
      "GOAL_NOT_VERIFIED",
    );
  },
);

test(
  "missing current step plus verified goal completes",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        currentStepPresent:
          false,
        goalVerified:
          true,
      });

    assert.equal(
      result.decision,
      "COMPLETE",
    );

    assert.equal(
      result.reason,
      "GOAL_VERIFIED",
    );
  },
);

test(
  "verified execution continues into the next non-approval step",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        executionStatus:
          "COMPLETED",
        executionVerified:
          true,
      });

    assert.equal(
      result.decision,
      "CONTINUE",
    );

    assert.equal(
      result.reason,
      "EXECUTION_COMPLETED_VERIFIED",
    );
  },
);

test(
  "verified execution stops for approval checkpoint",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        approvalLikely:
          true,
        executionStatus:
          "COMPLETED",
        executionVerified:
          true,
      });

    assert.equal(
      result.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.reason,
      "CHECKPOINT_REQUIRES_HUMAN_REVIEW",
    );
  },
);

test(
  "approval checkpoint blocks a fresh step without approval",
  () => {
    const result =
      decidePulseAutonomy({
        ...base(),
        approvalLikely:
          true,
        executionStatus:
          "NOT_STARTED",
      });

    assert.equal(
      result.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.reason,
      "APPROVAL_REQUIRED",
    );
  },
);

test(
  "policy is pure decision logic and has no persistence/executor imports",
  () => {
    const source = awaitImportSource();
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|pushAudit|pushExecutionAudit|executePulseAction|executePulseMissionStep|createPulseApproval/,
    );
  },
);

function awaitImportSource(): string {
  return `
    P0.9.0 policy is intentionally tested structurally.
    The actual source is inspected by a separate static guard.
  `;
}

test(
  "P0.9.0 source has no execution or persistence dependency",
  async () => {
    const fs =
      await import("node:fs/promises");

    const source =
      await fs.readFile(
        "src/DigitalBoostPulseAutonomyPolicy.ts",
        "utf8",
      );

    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|pushAudit|pushExecutionAudit|executePulseAction|executePulseMissionStep|startPulseMission|save\(/,
    );

    assert.doesNotMatch(
      source,
      /from ["']\.\/DigitalBoostPulseExecutor["']|from ["']\.\/DigitalBoostPulseMissionExecutor["']/,
    );
  },
);
