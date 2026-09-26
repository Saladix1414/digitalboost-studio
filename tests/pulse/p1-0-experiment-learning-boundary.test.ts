import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createPulseExperiment,
  startPulseExperiment,
  stopPulseExperiment,
} from "../../src/DigitalBoostPulseExperiment";

import {
  queryPulseMemory,
  queryTrustedPulseMemory,
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
  "RED TEAM: RUNNING experiment lesson remains untrusted until durable verification",
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

    assert.equal(lessons.length, 1);

    assert.notEqual(
      lessons[0].trust,
      "VERIFIED",
      "Experimental stop reason must not become trusted learning by itself.",
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
    const experiment = createPulseExperiment(
      experimentInput(),
    );

    assert.ok(experiment);

    const started = startPulseExperiment(experiment.id);

    assert.ok(started);

    const stopped = stopPulseExperiment(
      experiment.id,
      "unverified-learning",
    );

    assert.ok(stopped);

    const lessons = queryPulseMemory({
      kind: "lesson",
      scope: "P1Store",
    });

    assert.equal(lessons.length, 1);

    const report = compilePlaybook("P1Store");

    assert.equal(
      report.ok,
      false,
      "Legacy playbook compilation must not consume an unverified experimental lesson.",
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
