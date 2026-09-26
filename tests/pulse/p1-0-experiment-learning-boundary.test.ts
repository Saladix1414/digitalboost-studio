import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createPulseExperiment,
  startPulseExperiment,
  stopPulseExperiment,

  completePulseExperiment,
  rejectPulseExperiment,} from "../../src/DigitalBoostPulseExperiment";

import {
  queryPulseMemory,
  queryTrustedPulseMemory,
  rememberPulse,
} from "../../src/DigitalBoostPulseMemory";

import { compilePlaybook } from "../../src/DigitalBoostPulseIntel";

const storage: Record<string, string> = {};

globalThis.localStorage = {
  getItem(key: string): string | null {
    return storage[key] ?? null;
  },

  setItem(key: string, value: string): void {
    storage[key] = value;
  },

  removeItem(key: string): void {
    delete storage[key];
  },

  clear(): void {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  },

  key(index: number): string | null {
    return Object.keys(storage)[index] ?? null;
  },

  get length(): number {
    return Object.keys(storage).length;
  },
} as Storage;

function reset(): void {
  for (const key of Object.keys(storage)) {
    delete storage[key];
  }
}

function experimentInput(tenantId?: string) {
  return {
    store: "P1Store",
    tenantId,
    hypothesis: {
      statement: "hero title is present",
      metric: "hero_title_present",
      direction: "up" as const,
    },
    variants: [
      {
        id: "a",
        label: "A",
        action: "hero",
        payload: {},
      },
    ],
  };
}

beforeEach(() => {
  reset();
});

test(
  "RED TEAM: DRAFT experiment cannot transition to STOPPED",
  () => {
    const experiment = createPulseExperiment(
      experimentInput("tenant-a"),
    );

    assert.ok(experiment);
    assert.equal(experiment.status, "DRAFT");

    const stopped = stopPulseExperiment(
      experiment.id,
      "manual-stop-before-start",
    );

    assert.equal(
      stopped,
      null,
      "A DRAFT experiment cannot be stopped as a completed experimental lifecycle event.",
    );

    const lessons = queryPulseMemory({
      kind: "lesson",
      tenantId: "tenant-a",
      scope: "P1Store",
    });

    assert.equal(
      lessons.length,
      0,
      "A DRAFT experiment must never produce a learning lesson.",
    );
  },
);

test(
  "RED TEAM: stopping RUNNING experiment without outcome evidence cannot create trusted learning",
  () => {
    const experiment = createPulseExperiment(
      experimentInput("tenant-b"),
    );

    assert.ok(experiment);

    const started = startPulseExperiment(experiment.id);

    assert.ok(started);
    assert.equal(started.status, "RUNNING");

    const stopped = stopPulseExperiment(
      experiment.id,
      "manual-stop-without-measurement",
    );

    assert.ok(stopped);
    assert.equal(stopped.status, "STOPPED");

    const trusted = queryTrustedPulseMemory({
      tenantId: "tenant-b",
      kind: "lesson",
      scope: "P1Store",
      minimumTrust: "VERIFIED",
    });

    assert.equal(
      trusted.length,
      0,
      "A stop without durable evidence cannot yield VERIFIED learning.",
    );
  },
);

test(
  "RED TEAM: STOPPING RUNNING experiment creates no lesson",
  () => {
    const experiment = createPulseExperiment(
      experimentInput("tenant-c"),
    );

    assert.ok(experiment);

    const started = startPulseExperiment(experiment.id);

    assert.ok(started);

    const stopped = stopPulseExperiment(
      experiment.id,
      "manual-stop-without-measurement",
    );

    assert.ok(stopped);

    const lessons = queryPulseMemory({
      kind: "lesson",
      tenantId: "tenant-c",
      scope: "P1Store",
    });

    assert.equal(
      lessons.length,
      0,
      "Stopping an experiment must not create learning.",
    );

    const trusted = queryTrustedPulseMemory({
      tenantId: "tenant-c",
      kind: "lesson",
      scope: "P1Store",
      minimumTrust: "VERIFIED",
    });

    assert.equal(trusted.length, 0);
  },
);

test(
  "RED TEAM: legacy playbook path rejects an unverified experimental lesson",
  () => {
    rememberPulse({
      kind: "lesson",
      scope: "P1Store",
      store: "P1Store",
      source: "executor",
      evidenceRefs: ["fixture-unverified-evidence"],
      confidence: 0.6,
      content: {
        experimentId: "fixture-experiment",
        hypothesis: {
          statement: "hero title is present",
          metric: "hero_title_present",
          direction: "up",
        },
        result: "unverified-learning",
      },
    });

    const lessons = queryPulseMemory({
      kind: "lesson",
      scope: "P1Store",
    });

    assert.equal(lessons.length, 1);
    assert.notEqual(
      lessons[0].trust,
      "VERIFIED",
    );

    const report = compilePlaybook("P1Store");

    assert.equal(
      report.ok,
      false,
      "Legacy playbook compilation must not consume an unverified experimental lesson.",
    );
  },
);

test(
  "GREEN: stopped experiment can complete only through explicit completion",
  () => {
    const experiment =
      createPulseExperiment(
        experimentInput(
          "tenant-e",
        ),
      );

    assert.ok(
      experiment,
    );

    const started =
      startPulseExperiment(
        experiment.id,
      );

    assert.ok(
      started,
    );

    assert.equal(
      completePulseExperiment(
        started.id,
        "completed-with-explicit-path",
      ),
      null,
    );

    const stopped =
      stopPulseExperiment(
        started.id,
        "manual-stop-before-completion",
      );

    assert.ok(
      stopped,
    );

    assert.equal(
      stopped.status,
      "STOPPED",
    );

    const completed =
      completePulseExperiment(
        stopped.id,
        "evaluation-finished",
      );

    assert.ok(
      completed,
    );

    assert.equal(
      completed.status,
      "COMPLETED",
    );

    assert.equal(
      completed.result,
      "evaluation-finished",
    );

    assert.equal(
      completePulseExperiment(
        completed.id,
        "second-completion",
      ),
      null,
    );
  },
);

test(
  "GREEN: draft experiment can be explicitly rejected",
  () => {
    const experiment =
      createPulseExperiment(
        experimentInput(
          "tenant-reject",
        ),
      );

    assert.ok(
      experiment,
    );

    const rejected =
      rejectPulseExperiment(
        experiment.id,
        "proposal-rejected",
      );

    assert.ok(
      rejected,
    );

    assert.equal(
      rejected.status,
      "REJECTED",
    );

    assert.equal(
      rejected.result,
      "proposal-rejected",
    );

    assert.equal(
      startPulseExperiment(
        rejected.id,
      ),
      null,
    );

    assert.equal(
      rejectPulseExperiment(
        rejected.id,
        "second-rejection",
      ),
      null,
    );
  },
);

test(
  "RED TEAM: running experiment cannot be rejected",
  () => {
    const experiment =
      createPulseExperiment(
        experimentInput(
          "tenant-running-reject",
        ),
      );

    assert.ok(
      experiment,
    );

    const started =
      startPulseExperiment(
        experiment.id,
      );

    assert.ok(
      started,
    );

    assert.equal(
      rejectPulseExperiment(
        started.id,
        "forged-rejection",
      ),
      null,
    );
  },
);

test(
  "RED TEAM: stopped experiment cannot be rejected",
  () => {
    const experiment =
      createPulseExperiment(
        experimentInput(
          "tenant-stopped-reject",
        ),
      );

    assert.ok(
      experiment,
    );

    const started =
      startPulseExperiment(
        experiment.id,
      );

    assert.ok(
      started,
    );

    const stopped =
      stopPulseExperiment(
        started.id,
        "manual-stop",
      );

    assert.ok(
      stopped,
    );

    assert.equal(
      rejectPulseExperiment(
        stopped.id,
        "forged-rejection",
      ),
      null,
    );
  },
);

test(
  "RED TEAM: blank lifecycle reason cannot transition state",
  () => {
    const draft =
      createPulseExperiment(
        experimentInput(
          "tenant-blank",
        ),
      );

    assert.ok(
      draft,
    );

    assert.equal(
      rejectPulseExperiment(
        draft.id,
        "   ",
      ),
      null,
    );

    const started =
      startPulseExperiment(
        draft.id,
      );

    assert.ok(
      started,
    );

    const stopped =
      stopPulseExperiment(
        started.id,
        "stop",
      );

    assert.ok(
      stopped,
    );

    assert.equal(
      completePulseExperiment(
        stopped.id,
        "   ",
      ),
      null,
    );

    assert.equal(
      stopped.status,
      "STOPPED",
    );
  },
);


test(
  "RED TEAM: experiment lifecycle must not claim COMPLETED without an explicit completion path",
  () => {
    const experiment = createPulseExperiment(
      experimentInput("tenant-d"),
    );

    assert.ok(experiment);

    assert.notEqual(
      experiment.status,
      "COMPLETED",
    );
  },
);
