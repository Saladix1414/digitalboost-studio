import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePulseRisk, isKnownPulseAction, hashProposal } from "../../src/DigitalBoostPulseContracts";
import { evaluatePulsePolicy, beginPulseExecution, approvePulseAction, createPulseApproval } from "../../src/DigitalBoostPulseGovernance";
import {
  verifyPulseAction,
  precheckPulseExecution,
} from "../../src/DigitalBoostPulseVerify";
import { executePulseAction } from "../../src/DigitalBoostPulseExecutor";
import { currentContextVersion } from "../../src/DigitalBoostPulseContext";
test("invalid risk does not become L0", () => {
  const parsed = parsePulseRisk("L9");
  assert.equal(parsed.ok, false);
  const env = evaluatePulsePolicy("analyze", "not-a-risk", false, "req_test");
  assert.equal(env.policy, "REJECT");
  assert.equal(env.reason_code, "INVALID_RISK");
});
test("unknown action is rejected", () => {
  const env = evaluatePulsePolicy("delete_database", "L0", false, "req_test");
  assert.equal(env.policy, "REJECT");
  assert.equal(isKnownPulseAction("delete_database"), false);
});
test("campaigns cannot drop below L3", () => {
  const env = evaluatePulsePolicy("campaigns", "L0", false, "req_test");
  assert.equal(env.risk, "L3");
  assert.equal(env.policy, "REQUIRE_APPROVAL");
});
test("approval copies proposal binding", () => {
  const env = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_bind_copy",
    {
      action: "hero",
      target: "Nimbus:builder:hero",
      context_version: currentContextVersion({
        store: "Nimbus",
        section: "builder",
      }),
      proposal: { title: "A" },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(env.binding);
  assert.ok(approval);
  assert.deepEqual(approval?.binding, env.binding);
});

test("approval binding rejects stale proposal hash in normal flow", () => {
  const env = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_bind_stale",
    {
      action: "hero",
      target: "Nimbus:builder:hero",
      context_version: currentContextVersion({
        store: "Nimbus",
        section: "builder",
      }),
      proposal: { title: "A" },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(env.binding);
  assert.ok(approval);

  const approved = approvePulseAction(approval);

  const tampered = {
    ...approved,
    binding: {
      ...approved.binding!,
      proposal_hash: hashProposal({ title: "B" }),
    },
  };

  const started = beginPulseExecution(env, tampered);

  assert.equal(started.state, "REJECTED");
  assert.equal(started.reason_code, "STALE_PROPOSAL");
});

test("approval execution rejects missing binding", () => {
  const env = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_bind_missing",
    {
      action: "hero",
      target: "Nimbus:builder:hero",
      context_version: currentContextVersion({
        store: "Nimbus",
        section: "builder",
      }),
      proposal: { title: "A" },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(approval);

  const approved = approvePulseAction({
    ...approval,
    binding: undefined,
  });

  const started = beginPulseExecution(env, approved);

  assert.equal(started.state, "REJECTED");
  assert.equal(started.reason_code, "BINDING_MISSING");
});

test("valid approval binding reaches execution", () => {
  const env = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_bind_valid",
    {
      action: "hero",
      target: "Nimbus:builder:hero",
      context_version: currentContextVersion({
        store: "Nimbus",
        section: "builder",
      }),
      proposal: { title: "A" },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(approval);

  const approved = approvePulseAction(approval);
  const started = beginPulseExecution(env, approved);

  assert.equal(started.state, "EXECUTING");
});
test("precheck requires payload for hero mutation", () => {
  const result = precheckPulseExecution({
    action: "hero",
    executionState: "EXECUTING",
  });

  assert.equal(result.status, "FAIL");
  assert.equal(result.reasonCodes[0], "PRECONDITION_FAILED");
  assert.ok(result.failedChecks.includes("mutation-payload"));
});

test("precheck accepts a valid hero draft", () => {
  const result = precheckPulseExecution({
    action: "hero",
    executionState: "EXECUTING",
    draft: {
      kind: "hero",
      title: "Nueva propuesta",
      body: "Una promesa clara.",
      cta: "Entrar",
    },
  });

  assert.equal(result.status, "PASS");
  assert.equal(result.verified, true);
});

test("precheck rejects SEO action with wrong proposal type", () => {
  const result = precheckPulseExecution({
    action: "seo-fix",
    executionState: "EXECUTING",
    proposal: {
      type: "optimize",
    },
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.failedChecks.includes("seo-proposal-type"));
});

test("precheck rejects unsupported campaigns execution", () => {
  const result = precheckPulseExecution({
    action: "campaigns",
    executionState: "EXECUTING",
    proposal: {
      type: "campaign",
    },
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.failedChecks.includes("executor-capability"));
});

test("precheck rejects execution outside EXECUTING state", () => {
  const result = precheckPulseExecution({
    action: "hero",
    executionState: "AWAITING_APPROVAL",
    draft: {
      kind: "hero",
      title: "Nueva propuesta",
      body: "Una promesa clara.",
      cta: "Entrar",
    },
  });

  assert.equal(result.status, "FAIL");
  assert.ok(result.failedChecks.includes("execution-state"));
});

test("executor blocks hero mutation before apply when payload is missing", () => {
  const env = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_precheck_executor",
    {
      action: "hero",
      target: "Nimbus:builder:hero",
      context_version: currentContextVersion({
        store: "Nimbus",
        section: "builder",
      }),
      proposal: {
        title: "A",
      },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(approval);

  const approved = approvePulseAction(approval);

  const result = executePulseAction({
    envelope: env,
    approval: approved,
  });

  assert.equal(result.state, "FAILED");
  assert.equal(result.error, "PRECHECK failed");
});

test("verified is not completed", () => {
  const post = verifyPulseAction({ phase: "POSTCHECK", action: "hero", expected: { title: "A" }, actual: { title: "B" } });
  assert.equal(post.status, "FAIL");
});
