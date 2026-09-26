import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import type {
  PulseMission,
} from "../../src/DigitalBoostPulseMission";

import type {
  PulseSignal,
} from "../../src/DigitalBoostPulseProactive";

import {
  emitPulseSignal,
} from "../../src/DigitalBoostPulseProactive";

import {
  PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
  subscribePulseAutonomyToSignalBus,
} from "../../src/DigitalBoostPulseAutonomySignalSubscriber";

function makeMission(
  id =
    "msn-p093b",
): PulseMission {
  const plan =
    compilePulseGoal({
      action:
        "analyze",
      store:
        "SignalBus",
    });

  return {
    id,
    store:
      "SignalBus",
    planId:
      plan.id,
    state:
      "RUNNING",
    requestId:
      `req-${id}`,
    section:
      "website-builder",
    stepIndex:
      0,
    retries:
      0,
    maxRetries:
      2,
    createdAt:
      "2026-09-26T00:00:00.000Z",
    updatedAt:
      "2026-09-26T00:00:00.000Z",
    plan,
  };
}

function signal(
  id =
    "opportunity:hero",
  action =
    "hero",
): PulseSignal {
  return {
    id,
    kind:
      "opportunity",
    title:
      "Hero opportunity",
    body:
      "Test signal",
    action,
    significance:
      0.72,
    source:
      "test",
    createdAt:
      "2026-09-26T00:00:00.000Z",
  };
}

test(
  "P0.9.3-B contract is explicit",
  () => {
    const events:
      unknown[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission:
              makeMission(),
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(),
    );

    subscription.unsubscribe();

    assert.equal(
      PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
      "p0.9.3-b",
    );

    assert.equal(
      events.length,
      1,
    );

    assert.equal(
      (
        events[0] as any
      ).contract,
      "p0.9.3-b",
    );
  },
);

test(
  "signal with resolved Mission is evaluated through the bridge",
  () => {
    const events:
      any[] =
      [];

    const mission =
      makeMission();

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission,
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(),
    );

    subscription.unsubscribe();

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
      mission.id,
    );

    assert.equal(
      events[0].evaluation
        .controller
        .decision
        .decision,
      "CONTINUE",
    );

    assert.equal(
      events[0].evaluation
        .signalAction,
      "hero",
    );
  },
);

test(
  "signal without Mission becomes SIGNAL_ONLY",
  () => {
    const events:
      any[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission:
              null,
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(
        "opportunity:no-mission",
      ),
    );

    subscription.unsubscribe();

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

    assert.equal(
      events[0].evaluation,
      undefined,
    );
  },
);

test(
  "signal never creates a Mission",
  () => {
    const events:
      any[] =
      [];

    let resolverCalls =
      0;

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          signalInput => {
            resolverCalls += 1;

            assert.equal(
              signalInput.action,
              "hero",
            );

            return {
              mission:
                null,
            };
          },
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(
        "opportunity:no-create",
      ),
    );

    subscription.unsubscribe();

    assert.equal(
      resolverCalls,
      1,
    );

    assert.equal(
      events[0].status,
      "SIGNAL_ONLY",
    );
  },
);

test(
  "repeated signal is deduplicated",
  () => {
    const events:
      any[] =
      [];

    const mission =
      makeMission();

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission,
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    const repeated =
      signal(
        "risk:seo",
        "seo-fix",
      );

    emitPulseSignal(
      repeated,
    );

    emitPulseSignal(
      repeated,
    );

    subscription.unsubscribe();

    assert.equal(
      events.length,
      2,
    );

    assert.equal(
      events[0].status,
      "EVALUATED",
    );

    assert.equal(
      events[1].status,
      "DUPLICATE",
    );
  },
);

test(
  "same signal may evaluate separately for a different Mission",
  () => {
    const events:
      any[] =
      [];

    let current =
      makeMission(
        "msn-a",
      );

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission:
              current,
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    const repeated =
      signal(
        "opportunity:hero-shared",
      );

    emitPulseSignal(
      repeated,
    );

    current =
      makeMission(
        "msn-b",
      );

    emitPulseSignal(
      repeated,
    );

    subscription.unsubscribe();

    assert.equal(
      events.length,
      2,
    );

    assert.equal(
      events[0].status,
      "EVALUATED",
    );

    assert.equal(
      events[1].status,
      "EVALUATED",
    );

    assert.notEqual(
      events[0].missionId,
      events[1].missionId,
    );
  },
);

test(
  "reset allows a previously seen signal to be reevaluated",
  () => {
    const events:
      any[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission:
              makeMission(),
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    const repeated =
      signal(
        "opportunity:resettable",
      );

    emitPulseSignal(
      repeated,
    );

    subscription.reset();

    emitPulseSignal(
      repeated,
    );

    subscription.unsubscribe();

    assert.equal(
      events.length,
      2,
    );

    assert.equal(
      events[0].status,
      "EVALUATED",
    );

    assert.equal(
      events[1].status,
      "EVALUATED",
    );
  },
);

test(
  "unsubscribe removes the subscriber",
  () => {
    const events:
      any[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission:
              makeMission(),
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    subscription.unsubscribe();

    emitPulseSignal(
      signal(
        "opportunity:unsubscribed",
      ),
    );

    assert.equal(
      events.length,
      0,
    );
  },
);

test(
  "resolver failure fails closed without execution",
  () => {
    const events:
      any[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => {
            throw new Error(
              "resolver-failure",
            );
          },
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(
        "opportunity:resolver-error",
      ),
    );

    subscription.unsubscribe();

    assert.equal(
      events.length,
      1,
    );

    assert.equal(
      events[0].status,
      "RESOLUTION_FAILED",
    );

    assert.equal(
      events[0].evaluation,
      undefined,
    );
  },
);

test(
  "signal action cannot change Mission step",
  () => {
    const mission =
      makeMission();

    const before =
      mission.plan.steps[
        mission.stepIndex
      ].action;

    const events:
      any[] =
      [];

    const subscription =
      subscribePulseAutonomyToSignalBus({
        resolveMission:
          () => ({
            mission,
          }),
        onEvent:
          event => {
            events.push(
              event,
            );
          },
      });

    emitPulseSignal(
      signal(
        "opportunity:hero-action",
        "hero",
      ),
    );

    subscription.unsubscribe();

    assert.equal(
      events[0].status,
      "EVALUATED",
    );

    assert.equal(
      mission.plan.steps[
        mission.stepIndex
      ].action,
      before,
    );

    assert.equal(
      mission.plan.steps[
        mission.stepIndex
      ].action,
      "analyze",
    );
  },
);

test(
  "subscriber has no execution or persistence dependency",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalSubscriber.ts",
        "utf8",
      );

    const executableSource =
      source
        .replace(
          /\/\*[\s\S]*?\*\//g,
          "",
        )
        .replace(
          /\/\/.*$/gm,
          "",
        );

    assert.doesNotMatch(
      executableSource,
      /executePulseAction|executePulseMissionStep|startPulseMission|advancePulseMission|createPulseApproval|approvePulseAction|beginPulseExecution|pushAudit|pushExecutionAudit|localStorage|sessionStorage|DigitalBoostPulseExecutionBoundary|DigitalBoostPulseMissionExecutor|DigitalBoostPulseExecutor/,
    );
  },
);

test(
  "subscriber uses the existing signal bus",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalSubscriber.ts",
        "utf8",
      );

    assert.match(
      source,
      /onPulseSignal/,
    );

    assert.match(
      source,
      /evaluatePulseAutonomyFromSignal/,
    );
  },
);

test(
  "subscriber uses explicit Mission resolution",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalSubscriber.ts",
        "utf8",
      );

    assert.match(
      source,
      /resolveMission/,
    );

    assert.doesNotMatch(
      source,
      /startPulseMission/,
    );
  },
);

test(
  "onPulseSignal now exposes unsubscribe",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseProactive.ts",
        "utf8",
      );

    assert.match(
      source,
      /return function unsubscribe/,
    );
  },
);

test(
  "subscriber contract is explicit",
  () => {
    assert.equal(
      PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
      "p0.9.3-b",
    );
  },
);
