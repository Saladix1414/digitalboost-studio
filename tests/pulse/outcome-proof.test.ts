import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import { runCycle } from "../../src/DigitalBoostPulseCycle";
import { advancePulseMission } from "../../src/DigitalBoostPulseMission";
import { executePulseMissionStep } from "../../src/DigitalBoostPulseMissionExecutor";
import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";
import {
  createPulseOutcomeContract,
  verifyPulseOutcomeProof,
} from "../../src/DigitalBoostPulseOutcomeProof";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  (globalThis as any).localStorage = {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, String(v)),
    removeItem: (k: string) => storage.delete(k),
  };

  (globalThis as any).window = {
    __dbSetBlocks() {},
    dispatchEvent() { return true; },
  };
}

function cycle(store: string) {
  return runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store,
    action: "hero",
    title: "Hero",
    body: "Body",
    alreadyConfirm: false,
  });
}

function analyzeEnvelope(store: string) {
  return evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    "req_analyze_" + store,
    {
      action: "analyze",
      target: store + ":website-builder:analyze",
      actor: "merchant",
      tenant: store,
      context_version: "ctx:test",
      proposal: { action: "analyze" },
    },
  );
}

beforeEach(browser);

test("P0.4.6 crea contrato con proof steps mutantes", () => {
  const c = cycle("Contract");

  assert.ok(c.mission?.outcomeContract);
  assert.equal(
    c.mission!.outcomeContract!.version,
    "pulse-outcome-v1",
  );
  assert.equal(
    c.mission!.outcomeContract!.required_proof_steps[0].action,
    "hero",
  );
  assert.ok(c.mission!.outcomeContract!.contract_hash);
});

test("P0.4.6 COMPLETED produce PROVEN y detecta tampering", () => {
  const c = cycle("Proven");
  assert.ok(c.mission);

  const first = executePulseMissionStep(c.mission!.id, {
    envelope: analyzeEnvelope("Proven"),
  });
  assert.equal(first.execution.state, "COMPLETED");

  const draft = {
    kind: "hero",
    title: "Hero",
    body: "Body",
    cta: "Entrar",
  };

  const envelope = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_hero_Proven",
    {
      action: "hero",
      target: "Proven:website-builder:hero",
      actor: "merchant",
      tenant: "Proven",
      context_version: "ctx:test",
      proposal: draft,
    },
  );

  const approval = approvePulseAction(createPulseApproval(envelope)!);

  const second = executePulseMissionStep(c.mission!.id, {
    envelope,
    approval,
    draft,
  });

  assert.equal(second.execution.state, "COMPLETED");
  assert.equal(second.execution.verified, true);

  const explain = evaluatePulsePolicy(
    "explain",
    "L0",
    false,
    "req_explain_Proven",
    {
      action: "explain",
      target: "Proven:website-builder:explain",
      actor: "merchant",
      tenant: "Proven",
      context_version: "ctx:test",
      proposal: { action: "explain" },
    },
  );

  const third = executePulseMissionStep(c.mission!.id, {
    envelope: explain,
  });

  const proof = third.mission!.outcome!.proof!;
  const contract = third.mission!.outcomeContract!;

  assert.equal(third.mission!.outcome!.proofStatus, "PROVEN");
  assert.equal(third.mission!.outcome!.verified, false);
  assert.equal(proof.evidence.at(-1)?.verification_status, "SKIPPED");
  assert.equal(verifyPulseOutcomeProof(contract, proof), true);

  const tampered = { ...proof, plan_status: "READY" };
  assert.equal(
    verifyPulseOutcomeProof(contract, tampered),
    false,
  );
});

test("P0.4.6 FAILED marca el proof del step mutante", () => {
  const c = cycle("Failed");
  assert.ok(c.mission);

  const analyzed = advancePulseMission(c.mission!.id, {
    approved: true,
    ok: true,
    verificationStatus: "SKIPPED",
    verified: false,
  });

  assert.equal(analyzed?.stepIndex, 1);
  assert.equal(analyzed?.state, "AWAITING_APPROVAL");

  const failed = advancePulseMission(c.mission!.id, {
    approved: true,
    ok: false,
    terminal: true,
    error: "postcheck-failed",
    verificationStatus: "FAIL",
    verified: false,
  });

  assert.equal(failed?.state, "FAILED");
  assert.equal(failed?.outcome?.proofStatus, "FAILED");

  const proof = failed!.outcome!.proof!;
  const contract = failed!.outcomeContract!;

  assert.deepEqual(
    proof.failed_steps,
    [contract.required_proof_steps[0].step_id],
  );

  assert.equal(
    verifyPulseOutcomeProof(contract, proof),
    true,
  );
});
