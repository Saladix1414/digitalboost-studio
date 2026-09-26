import test from "node:test";
import assert from "node:assert/strict";

import {
  resolvePulseMissionFromSignal,
  PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT,
} from "../../src/DigitalBoostPulseAutonomyMissionResolver";

function signal(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "signal-resolver",
    kind: "opportunity" as const,
    title: "Resolver test",
    body: "Resolver test body",
    action: "hero",
    significance: 0.8,
    source: "test",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as any;
}

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
  id: "msn-resolver-c",
  store: "store-c",
  planId: "plan-c",
  state: "RUNNING",
  requestId: "req-resolver-c",
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

test(
  "P0.9.3-C resolver contract is explicit",
  () => {
    assert.equal(
      PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT,
      "p0.9.3-c-resolver",
    );
  },
);

test(
  "signal without missionId remains unresolved",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const result =
        resolvePulseMissionFromSignal(
          signal(),
        );

      assert.equal(
        result.mission,
        null,
      );

      assert.equal(
        result.reason,
        "NO_MISSION_ID",
      );
    } finally {
      restore();
    }
  },
);

test(
  "explicit missionId resolves exact Mission",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const result =
        resolvePulseMissionFromSignal(
          signal({
            missionId:
              "msn-resolver-c",
          }),
        );

      assert.equal(
        result.reason,
        "RESOLVED",
      );

      assert.ok(result.mission);
      assert.equal(
        result.mission?.id,
        "msn-resolver-c",
      );
    } finally {
      restore();
    }
  },
);

test(
  "unknown missionId fails closed",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const result =
        resolvePulseMissionFromSignal(
          signal({
            missionId:
              "msn-does-not-exist",
          }),
        );

      assert.equal(
        result.mission,
        null,
      );

      assert.equal(
        result.reason,
        "MISSION_NOT_FOUND",
      );
    } finally {
      restore();
    }
  },
);

test(
  "action cannot manufacture Mission correlation",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const result =
        resolvePulseMissionFromSignal(
          signal({
            action: "hero",
            store: "store-c",
          }),
        );

      assert.equal(
        result.mission,
        null,
      );

      assert.equal(
        result.reason,
        "NO_MISSION_ID",
      );
    } finally {
      restore();
    }
  },
);

test(
  "title/body/source cannot manufacture Mission correlation",
  () => {
    const restore =
      installStorage([mission]);

    try {
      const result =
        resolvePulseMissionFromSignal(
          signal({
            title: "Hero test",
            body: "store-c hero",
            source: "store-c",
          }),
        );

      assert.equal(
        result.mission,
        null,
      );

      assert.equal(
        result.reason,
        "NO_MISSION_ID",
      );
    } finally {
      restore();
    }
  },
);
