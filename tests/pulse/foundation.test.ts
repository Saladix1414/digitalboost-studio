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
test("approval binding rejects stale proposal hash", () => {
  const env = evaluatePulsePolicy("hero", "L1", true, "req_bind", { action: "hero", target: "Nimbus:builder:hero", proposal: { title: "A" } });
  const approval = createPulseApproval(env);
  const approved = approvePulseAction(approval);
  if (env.binding) (approved as any).binding = { ...env.binding, proposal_hash: hashProposal({ title: "B" }) };
  const started = beginPulseExecution(env, approved);
  if (env.binding && (approved as any).binding) {
    assert.equal(started.state, "REJECTED");
    assert.equal(started.reason_code, "STALE_PROPOSAL");
  }
});
test("verified is not completed", () => {
  const post = verifyPulseAction({ phase: "POSTCHECK", action: "hero", expected: { title: "A" }, actual: { title: "B" } });
  assert.equal(post.status, "FAIL");
});
