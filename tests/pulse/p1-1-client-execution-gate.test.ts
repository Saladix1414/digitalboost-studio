import test from "node:test";
import assert from "node:assert/strict";
import {
  createPulseApproval,
  evaluatePulsePolicy,
} from "../../src/DigitalBoostPulseGovernance.ts";
import { executePulseClientAction } from "../../src/DigitalBoostPulseClientExecutionGate.ts";

function pending() {
  const envelope = evaluatePulsePolicy("hero", "L2", true);
  const approval = createPulseApproval(envelope);
  assert.ok(approval);
  assert.equal(approval.state, "AWAITING_APPROVAL");
  return { envelope, approval };
}

test("P1.1-B client gate cannot approve without user gesture", () => {
  const { envelope, approval } = pending();
  const result = executePulseClientAction({
    envelope,
    approval,
    userGesture: false,
  });
  assert.equal(result.state, "AWAITING_APPROVAL");
  assert.equal(approval.state, "AWAITING_APPROVAL");
});

test("P1.1-B client gate approves only with user gesture", () => {
  const { envelope, approval } = pending();
  const result = executePulseClientAction({
    envelope,
    approval,
    userGesture: true,
  });
  assert.notEqual(result.state, "AWAITING_APPROVAL");
});
