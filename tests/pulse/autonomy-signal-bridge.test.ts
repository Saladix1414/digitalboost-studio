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
  evaluatePulseAutonomyFromSignal,
  PULSE_AUTONOMY_SIGNAL_BRIDGE_CONTRACT,
} from "../../src/DigitalBoostPulseAutonomySignalBridge";

function makeMission(
  overrides: Partial<PulseMission> = {},
): PulseMission {
  const plan =
    compilePulseGoal({
      action:
        "analyze",
      store:
        "SignalBridge",
    });

  return {
    id:
      "msn-p093-signal",
    store:
      "SignalBridge",
    planId:
      plan.id,
    state:
      "RUNNING",
    requestId:
      "req-p093-signal",
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
    ...overrides,
  };
}

function signal(
  kind:
    PulseSignal["kind"],
  action =
    "hero",
): PulseSignal {
  return {
    id:
      `${kind}:${action}`,
    kind,
    title:
      "Signal",
    body:
      "Signal body",
    action,
    significance:
      0.72,
    source:
      "test-source",
    createdAt:
      "2026-09-26T00:00:00.000Z",
  };
}

test(
  "P0.9.3-A contract is explicit",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal("opportunity"),
      });

    assert.equal(
      result.contract,
      "p0.9.3-a",
    );

    assert.equal(
      result.contract,
      PULSE_AUTONOMY_SIGNAL_BRIDGE_CONTRACT,
    );
  },
);

test(
  "opportunity maps to OPPORTUNITY trigger",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal("opportunity"),
      });

    assert.equal(
      result.trigger,
      "OPPORTUNITY",
    );

    assert.equal(
      result.controller.trigger,
      "OPPORTUNITY",
    );
  },
);

test(
  "risk maps to RISK trigger",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal("risk", "seo-fix"),
      });

    assert.equal(
      result.trigger,
      "RISK",
    );
  },
);

test(
  "stale-context maps to STALE_CONTEXT trigger",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal(
            "stale-context",
            "analyze",
          ),
      });

    assert.equal(
      result.trigger,
      "STALE_CONTEXT",
    );
  },
);

test(
  "approval-pending maps to APPROVAL_PENDING trigger",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal(
            "approval-pending",
            "hero",
          ),
      });

    assert.equal(
      result.trigger,
      "APPROVAL_PENDING",
    );
  },
);

test(
  "signal does not manufacture approval",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal(
            "approval-pending",
            "hero",
          ),
      });

    /*
     * The mission has no governance approval fact.
     * Therefore the signal alone cannot authorize anything.
     */
    assert.equal(
      result.controller.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.controller.control,
      "REENTER",
    );
  },
);

test(
  "signal action is metadata, not execution authority",
  () => {
    const analyzeMission =
      makeMission();

    const heroSignal =
      signal(
        "opportunity",
        "hero",
      );

    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          analyzeMission,
        signal:
          heroSignal,
      });

    assert.equal(
      result.signalAction,
      "hero",
    );

    assert.equal(
      result.controller.decision.decision,
      "CONTINUE",
    );

    /*
     * The bridge does not rewrite the Mission step or create
     * an execution authorization for the signal action.
     */
    assert.equal(
      analyzeMission.plan.steps[
        analyzeMission.stepIndex
      ].action,
      "analyze",
    );
  },
);

test(
  "signal does not bypass a paused mission",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission({
            state:
              "PAUSED",
          }),
        signal:
          signal("opportunity"),
      });

    assert.equal(
      result.controller.decision.decision,
      "PAUSE",
    );

    assert.equal(
      result.controller.control,
      "WAIT_CONTROL",
    );
  },
);

test(
  "signal does not bypass stale context supplied by governed runtime",
  () => {
    const result =
      evaluatePulseAutonomyFromSignal({
        mission:
          makeMission(),
        signal:
          signal("opportunity"),
      });

    /*
     * The bridge itself does not manufacture context.
     * This test verifies that the controller remains the sole
     * decision authority for runtime facts.
     */
    assert.equal(
      result.controller.decision.decision,
      "CONTINUE",
    );
  },
);

test(
  "bridge does not mutate Mission",
  () => {
    const mission =
      makeMission();

    const before =
      JSON.stringify(
        mission,
      );

    evaluatePulseAutonomyFromSignal({
      mission,
      signal:
        signal("risk", "seo-fix"),
    });

    assert.equal(
      JSON.stringify(mission),
      before,
    );
  },
);

test(
  "bridge is pure and has no execution/persistence authority",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalBridge.ts",
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
  "bridge delegates to controller rather than policy directly",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalBridge.ts",
        "utf8",
      );

    assert.match(
      source,
      /evaluatePulseAutonomyController/,
    );

    assert.doesNotMatch(
      source,
      /decidePulseAutonomy\s*\(/,
    );

    assert.doesNotMatch(
      source,
      /decidePulseMissionAutonomy\s*\(/,
    );
  },
);

test(
  "bridge may consume the Proactive signal contract but not its authority",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomySignalBridge.ts",
        "utf8",
      );

    assert.match(
      source,
      /from ["']\.\/DigitalBoostPulseProactive["']/,
    );

    assert.doesNotMatch(
      source,
      /emitPulseSignal|notifyPulseOpportunities|cooldownAllows|dismissPulseSignal/,
    );
  },
);
