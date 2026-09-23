import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import { runCycle } from "../../src/DigitalBoostPulseCycle";
import {
  executePulseMissionStep,
} from "../../src/DigitalBoostPulseMissionExecutor";

import {
  pausePulseMission,
} from "../../src/DigitalBoostPulseMission";
import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  (globalThis as any).localStorage = {
    getItem(key: string) {
      return storage.has(key) ? storage.get(key)! : null;
    },
    setItem(key: string, value: string) {
      storage.set(key, String(value));
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  };

  (globalThis as any).window = {
    __dbSetBlocks() {},
    dispatchEvent() {
      return true;
    },
  };
}

function heroEnvelope(requestId: string) {
  return evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    requestId,
    {
      action: "hero",
      target: "Nimbus:website-builder:hero",
      actor: "merchant",
      tenant: "Nimbus",
      context_version: "ctx:test",
      proposal: {
        kind: "hero",
        title: "Hero mission",
        body: "Body mission",
        cta: "Entrar",
      },
    },
  );
}

beforeEach(browser);

test("runCycle conecta Goal → Plan → Mission", () => {
  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "Nimbus",
    action: "hero",
    title: "Hero mission",
    body: "Body mission",
    alreadyConfirm: false,
  });

  assert.ok(cycle.plan);
  assert.ok(cycle.mission);
  assert.equal(
    cycle.mission?.planId,
    cycle.plan?.id,
  );
  assert.equal(cycle.mission?.stepIndex, 0);
  assert.equal(
    cycle.mission?.plan.steps[0].action,
    "analyze",
  );
});

test("Mission → Executor avanza paso completado y respeta approval", () => {
  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "Nimbus",
    action: "hero",
    title: "Hero mission",
    body: "Body mission",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);

  const first = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: evaluatePulsePolicy(
        "analyze",
        "L0",
        false,
        "req_p04_analyze",
        {
          action: "analyze",
          target: "Nimbus:website-builder:analyze",
          actor: "merchant",
          tenant: "Nimbus",
          context_version: "ctx:test",
          proposal: {
            action: "analyze",
          },
        },
      ),
    },
  );

  assert.equal(first.execution.state, "COMPLETED");
  assert.equal(first.mission?.stepIndex, 1);
  assert.equal(
    first.mission?.state,
    "AWAITING_APPROVAL",
  );
  assert.equal(
    first.mission?.plan.steps[1].action,
    "hero",
  );

  const envelope = heroEnvelope("req_p04_hero");

  const created = createPulseApproval(envelope);
  assert.ok(created);

  const approved = approvePulseAction(created);

  const second = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope,
      approval: approved,
      draft: {
        kind: "hero",
        title: "Hero mission",
        body: "Body mission",
        cta: "Entrar",
      },
    },
  );

  assert.equal(second.execution.state, "COMPLETED");
  assert.equal(second.execution.verified, true);
  assert.equal(second.mission?.stepIndex, 2);
  assert.equal(second.mission?.state, "RUNNING");

  assert.equal(
    second.execution.audit.metadata?.mission_id,
    cycle.mission.id,
  );
  assert.equal(
    second.execution.audit.metadata?.plan_id,
    cycle.plan?.id,
  );
  assert.equal(
    second.execution.audit.metadata?.step_id,
    cycle.mission.plan.steps[1].id,
  );
  assert.equal(
    second.execution.audit.metadata?.step_index,
    1,
  );

  const audits = JSON.parse(
    localStorage.getItem("db-pulse-audit-v1") || "[]",
  ) as Array<Record<string, unknown>>;

  const persisted = audits[audits.length - 1];

  assert.equal(persisted.mission_id, cycle.mission.id);
  assert.equal(persisted.plan_id, cycle.plan?.id);
  assert.equal(
    persisted.step_id,
    cycle.mission.plan.steps[1].id,
  );
  assert.equal(persisted.step_index, 1);
});


test("P0.4.5 terminal Outcome conserva SKIPPED como no verificado", () => {
  const blocks = [{
    id: "hero",
    type: "hero",
    title: "Original",
    body: "Original body",
    cta: "Original CTA",
  }];

  localStorage.setItem("db-store-page-v1", "Inicio");
  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify(blocks),
  );
  localStorage.setItem(
    "db-store-canvas-v1",
    JSON.stringify(blocks),
  );

  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "IntegrationOutcome",
    action: "hero",
    title: "Hero terminal",
    body: "Body terminal",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);

  const analyzeEnvelope = evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    "req_p045_integration_analyze",
    {
      action: "analyze",
      target: "IntegrationOutcome:website-builder:analyze",
      actor: "merchant",
      tenant: "IntegrationOutcome",
      context_version: "ctx:test",
      proposal: {
        action: "analyze",
      },
    },
  );

  const first = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: analyzeEnvelope,
    },
  );

  assert.equal(first.execution.state, "COMPLETED");
  assert.equal(first.mission?.stepIndex, 1);

  const draft = {
    kind: "hero",
    title: "Hero terminal",
    body: "Body terminal",
    cta: "Entrar",
  };

  const heroEnvelope = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_p045_integration_hero",
    {
      action: "hero",
      target: "IntegrationOutcome:website-builder:hero",
      actor: "merchant",
      tenant: "IntegrationOutcome",
      context_version: "ctx:test",
      proposal: draft,
    },
  );

  const created = createPulseApproval(heroEnvelope);
  assert.ok(created);

  const approved = approvePulseAction(created);

  const second = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: heroEnvelope,
      approval: approved,
      draft,
    },
  );

  assert.equal(second.execution.state, "COMPLETED");
  assert.equal(second.execution.verified, true);
  assert.equal(
    second.execution.audit.metadata?.verification_status,
    "PASS",
  );
  assert.equal(second.mission?.stepIndex, 2);

  const explainEnvelope = evaluatePulsePolicy(
    "explain",
    "L0",
    false,
    "req_p045_integration_explain",
    {
      action: "explain",
      target: "IntegrationOutcome:website-builder:explain",
      actor: "merchant",
      tenant: "IntegrationOutcome",
      context_version: "ctx:test",
      proposal: {
        action: "explain",
      },
    },
  );

  const third = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: explainEnvelope,
    },
  );

  assert.equal(third.execution.state, "COMPLETED");
  assert.equal(third.execution.verified, false);
  assert.equal(
    third.execution.audit.metadata?.verification_status,
    "SKIPPED",
  );

  assert.equal(third.mission?.state, "COMPLETED");
  assert.equal(third.mission?.plan.status, "COMPLETED");
  assert.equal(third.mission?.outcome?.status, "COMPLETED");
  assert.equal(third.mission?.outcome?.verified, false);
  assert.equal(
    third.mission?.outcome?.verificationStatus,
    "SKIPPED",
  );

  const audits = JSON.parse(
    localStorage.getItem("db-pulse-audit-v1") || "[]",
  ) as Array<Record<string, unknown>>;

  const outcomeAudits = audits.filter(
    (row) =>
      row.mission_id === cycle.mission?.id &&
      row.mission_outcome === "COMPLETED",
  );

  assert.equal(outcomeAudits.length, 1);
  assert.equal(
    outcomeAudits[0].mission_outcome,
    "COMPLETED",
  );
  assert.equal(
    outcomeAudits[0].verification_status,
    "SKIPPED",
  );
  assert.equal(
    outcomeAudits[0].verified,
    false,
  );
});

test("Mission no ejecuta si está pausada", () => {
  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "Nimbus",
    action: "hero",
    title: "Hero",
    body: "Body",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);

  pausePulseMission(cycle.mission!.id);

  assert.throws(
    () =>
      executePulseMissionStep(
        cycle.mission!.id,
        {
          envelope: evaluatePulsePolicy(
            "analyze",
            "L0",
            false,
            "req_p04_paused",
            {
              action: "analyze",
              target: "Nimbus:website-builder:analyze",
            },
          ),
        },
      ),
    /not executable/,
  );
});

test("Governance REJECTED deja Mission en FAILED sin retry", () => {
  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "Nimbus",
    action: "hero",
    title: "Hero",
    body: "Body",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);

  const rejectedEnvelope = evaluatePulsePolicy(
    "analyze",
    "L9",
    false,
    "req_p04_rejected",
    {
      action: "analyze",
      target: "Nimbus:website-builder:analyze",
    },
  );

  const result = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: rejectedEnvelope,
    },
  );

  assert.equal(result.execution.state, "REJECTED");
  assert.equal(result.mission?.state, "FAILED");
  assert.equal(result.mission?.retries, 0);
});

test("Policy REJECT no crea Mission", () => {
  const cycle = runCycle({
    q: "elimina la base",
    section: "website-builder",
    store: "Nimbus",
    action: "delete_database",
    title: "Delete",
    body: "Delete",
    alreadyConfirm: false,
  });

  assert.equal(cycle.envelope.policy, "REJECT");
  assert.equal(cycle.mission, undefined);
});

