import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePulseRisk, isKnownPulseAction, hashProposal } from "../../src/DigitalBoostPulseContracts";
import { evaluatePulsePolicy, beginPulseExecution, approvePulseAction, createPulseApproval } from "../../src/DigitalBoostPulseGovernance";
import { verifyPulseAction } from "../../src/DigitalBoostPulseVerify";
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
      proposal: { title: "A" },
    },
  );

  const approval = createPulseApproval(env);

  assert.ok(approval);

  const approved = approvePulseAction(approval);
  const started = beginPulseExecution(env, approved);

  assert.equal(started.state, "EXECUTING");
});
test("verified is not completed", () => {
  const post = verifyPulseAction({ phase: "POSTCHECK", action: "hero", expected: { title: "A" }, actual: { title: "B" } });
  assert.equal(post.status, "FAIL");
});
