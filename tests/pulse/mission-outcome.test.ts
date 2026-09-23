import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import {
  advancePulseMission,
  cancelPulseMission,
  startPulseMission,
} from "../../src/DigitalBoostPulseMission";

import {
  queryPulseMemory,
} from "../../src/DigitalBoostPulseMemory";

import {
  verifyPulseGoalEvidenceBinding,
} from "../../src/DigitalBoostPulseOutcomeProof";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  (globalThis as any).localStorage = {
    getItem(key: string) {
      return storage.has(key)
        ? storage.get(key)!
        : null;
    },

    setItem(key: string, value: string) {
      storage.set(key, String(value));
    },

    removeItem(key: string) {
      storage.delete(key);
    },
  };
}

beforeEach(browser);

test(
  "P0.4.5 COMPLETED cierra Mission + Plan + Memory + Audit",
  () => {
    const plan = compilePulseGoal({
      action: "analyze",
      store: "OutcomeComplete",
    });

    const started =
      startPulseMission({
        store: "OutcomeComplete",
        plan,
        requestId:
          "req_outcome_complete",
      });

    advancePulseMission(
      started.id,
      { ok: true },
    );

    advancePulseMission(
      started.id,
      { ok: true },
    );

    const completed =
      advancePulseMission(
        started.id,
        {
          ok: true,
          verificationStatus: "PASS",
          verified: true,
        },
      );

    assert.equal(
      completed?.state,
      "COMPLETED",
    );

    assert.equal(
      completed?.plan.status,
      "COMPLETED",
    );

    assert.equal(
      completed?.outcome?.status,
      "COMPLETED",
    );

    assert.equal(
      completed?.requestId,
      "req_outcome_complete",
    );

    assert.equal(
      completed?.outcome?.requestId,
      "req_outcome_complete",
    );

    assert.equal(
      completed?.outcome?.verified,
      true,
    );

      assert.ok(completed?.goalEvidenceBinding);
      assert.ok(completed?.goalEvidenceBinding?.id);
      assert.ok(completed?.goalEvidenceBinding?.binding_hash);
      assert.equal(
        verifyPulseGoalEvidenceBinding(
          completed!.goalEvidenceBinding!,
        ),
        true,
      );
      assert.equal(
        completed?.outcome?.goalEvidenceBindingId,
        completed?.goalEvidenceBinding?.id,
      );
      assert.equal(
        completed?.outcome?.goalEvidenceBindingHash,
        completed?.goalEvidenceBinding?.binding_hash,
      );

const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeComplete",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId === completed?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    assert.equal(
      (memories[0].content as any)
        .outcome,
      "COMPLETED",
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    const outcomeAudits =
      audits.filter(
        (row) =>
          row.mission_id ===
            completed?.id &&
          row.mission_outcome ===
            "COMPLETED",
      );

    assert.equal(
      outcomeAudits.length,
      1,
    );

    assert.equal(
      outcomeAudits[0].plan_status,
      "COMPLETED",
    );

      assert.equal(
        outcomeAudits[0].goal_evidence_binding_id,
        completed?.goalEvidenceBinding?.id,
      );
      assert.equal(
        outcomeAudits[0].goal_evidence_binding_hash,
        completed?.goalEvidenceBinding?.binding_hash,
      );},
);

test(
  "P0.4.5 FAILED bloquea Plan y conserva error",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeFailed",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeFailed",
        }),
        requestId:
          "req_outcome_failed",
      });

    const failed =
      advancePulseMission(
        started.id,
        {
          ok: false,
          terminal: true,
          error:
            "external-check-failed",
        },
      );

    assert.equal(
      failed?.state,
      "FAILED",
    );

    assert.equal(
      failed?.plan.status,
      "BLOCKED",
    );

    assert.equal(
      failed?.outcome?.status,
      "FAILED",
    );

    assert.equal(
      failed?.outcome?.lastError,
      "external-check-failed",
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeFailed",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId === failed?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    assert.equal(
      (memories[0].content as any)
        .lastError,
      "external-check-failed",
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            failed?.id &&
          row.mission_outcome ===
            "FAILED",
      ).length,
      1,
    );
  },
);

test(
  "P0.4.5 CANCELLED cierra Plan y Memory",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeCancelled",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeCancelled",
        }),
        requestId:
          "req_outcome_cancelled",
      });

    const cancelled =
      cancelPulseMission(
        started.id,
      );

    assert.equal(
      cancelled?.state,
      "CANCELLED",
    );

    assert.equal(
      cancelled?.plan.status,
      "CANCELLED",
    );

    assert.equal(
      cancelled?.outcome?.status,
      "CANCELLED",
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeCancelled",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId ===
          cancelled?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            cancelled?.id &&
          row.mission_outcome ===
            "CANCELLED",
      ).length,
      1,
    );
  },
);

test(
  "P0.4.5 outcome es idempotente",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeIdempotent",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeIdempotent",
        }),
        requestId:
          "req_outcome_idempotent",
      });

    advancePulseMission(
      started.id,
      { ok: true },
    );

    advancePulseMission(
      started.id,
      { ok: true },
    );

    const completed =
      advancePulseMission(
        started.id,
        {
          ok: true,
          verificationStatus: "PASS",
          verified: true,
        },
      );

    const firstId =
      completed?.outcome?.id;

    const second =
      advancePulseMission(
        started.id,
        { ok: true },
      );

    assert.equal(
      second?.outcome?.id,
      firstId,
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeIdempotent",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId ===
          started.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            started.id &&
          row.mission_outcome ===
            "COMPLETED",
      ).length,
      1,
    );
  },
);
