import test, {
  afterEach,
} from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  emitPulseSignal,
} from "../../src/DigitalBoostPulseProactive";

import {
  isPulseAutonomyRuntimeStarted,
  startPulseAutonomyRuntime,
  stopPulseAutonomyRuntime,
} from "../../src/DigitalBoostPulseAutonomyRuntime";

function installStorage(
  rows: unknown[],
): () => void {
  const previous =
    Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );

  const data = new Map<string, string>();

  data.set(
    "db-pulse-missions-v1",
    JSON.stringify(rows),
  );

  Object.defineProperty(
    globalThis,
    "localStorage",
    {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        getItem(key: string) {
          return data.get(key) ?? null;
        },
        setItem(
          key: string,
          value: string,
        ) {
          data.set(key, value);
        },
        removeItem(key: string) {
          data.delete(key);
        },
        clear() {
          data.clear();
        },
      },
    },
  );

  return () => {
    if (previous) {
      Object.defineProperty(
        globalThis,
        "localStorage",
        previous,
      );
    } else {
      delete (globalThis as any).localStorage;
    }
  };
}

const mission = {
  id: "msn-runtime-c",
  store: "store-c",
  planId: "plan-c",
  state: "RUNNING",
  requestId: "req-runtime-c",
  stepIndex: 0,
  retries: 0,
  maxRetries: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  plan: {
    steps: [
      {
        id: "step-c",
        action: "hero",
        approvalLikely: false,
      },
    ],
  },
} as any;

afterEach(() => {
  stopPulseAutonomyRuntime();
});

test(
  "P0.9.3-C runtime starts exactly once",
  () => {
    assert.equal(
      isPulseAutonomyRuntimeStarted(),
      false,
    );

    const first =
      startPulseAutonomyRuntime();

    const second =
      startPulseAutonomyRuntime();

    assert.equal(
      first.status,
      "STARTED",
    );

    assert.equal(
      second.status,
      "ALREADY_STARTED",
    );

    assert.equal(
      first.subscriber,
      second.subscriber,
    );
  },
);

test(
  "runtime evaluates mission-bound Signal through existing subscriber",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const events: any[] = [];

      startPulseAutonomyRuntime({
        onEvent(event) {
          events.push(event);
        },
      });

      emitPulseSignal({
        id: "signal-runtime-c",
        kind: "opportunity",
        title: "Runtime test",
        body: "Runtime test body",
        action: "hero",
        significance: 0.8,
        source: "test-runtime",
        createdAt:
          "2026-01-01T00:00:00.000Z",
        missionId:
          "msn-runtime-c",
      });

      assert.equal(
        events.length,
        1,
      );

      assert.equal(
        events[0].status,
        "EVALUATED",
      );

      assert.equal(
        events[0].missionId,
        "msn-runtime-c",
      );

      assert.equal(
        events[0].evaluation?.controller.decision.decision,
        "CONTINUE",
      );
    } finally {
      restore();
    }
  },
);

test(
  "runtime keeps a Signal without Mission as SIGNAL_ONLY",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const events: any[] = [];

      startPulseAutonomyRuntime({
        onEvent(event) {
          events.push(event);
        },
      });

      emitPulseSignal({
        id: "signal-runtime-no-mission",
        kind: "risk",
        title: "Risk",
        body: "No mission",
        action: "seo-fix",
        significance: 0.8,
        source: "test-runtime",
        createdAt:
          "2026-01-01T00:00:00.000Z",
      });

      assert.equal(
        events.length,
        1,
      );

      assert.equal(
        events[0].status,
        "SIGNAL_ONLY",
      );
    } finally {
      restore();
    }
  },
);

test(
  "runtime fails closed for unknown Mission",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const events: any[] = [];

      startPulseAutonomyRuntime({
        onEvent(event) {
          events.push(event);
        },
      });

      emitPulseSignal({
        id: "signal-runtime-unknown",
        kind: "opportunity",
        title: "Unknown Mission",
        body: "Unknown Mission",
        action: "hero",
        significance: 0.8,
        source: "test-runtime",
        createdAt:
          "2026-01-01T00:00:00.000Z",
        missionId:
          "msn-not-found",
      });

      assert.equal(
        events.length,
        1,
      );

      assert.equal(
        events[0].status,
        "SIGNAL_ONLY",
      );

      assert.equal(
        events[0].reason,
        "NO_MISSION_RESOLVED",
      );
    } finally {
      restore();
    }
  },
);

test(
  "runtime owner is connected to PulseCycle",
  () => {
    const source =
      readFileSync(
        new URL(
          "../../src/DigitalBoostPulseCycle.ts",
          import.meta.url,
        ),
        "utf8",
      );

    assert.match(
      source,
      /startPulseAutonomyRuntime/,
    );

    assert.match(
      source,
      /startPulseAutonomyRuntime\(\);/,
    );
  },
);

test(
  "runtime integration does not directly execute or approve",
  () => {
    const runtimeSource =
      readFileSync(
        new URL(
          "../../src/DigitalBoostPulseAutonomyRuntime.ts",
          import.meta.url,
        ),
        "utf8",
      );

    assert.doesNotMatch(
      runtimeSource,
      /executePulseAction|executePulseMissionStep/,
    );

    assert.doesNotMatch(
      runtimeSource,
      /createPulseApproval/,
    );

    assert.doesNotMatch(
      runtimeSource,
      /startPulseMission/,
    );

    assert.doesNotMatch(
      runtimeSource,
      /pushAudit/,
    );
  },
);
