import { test } from "node:test";
import assert from "node:assert/strict";
import { rememberPreference, queryPulseMemory, listPulseMemory } from "../../src/DigitalBoostPulseMemory";
import { compilePulseGoal } from "../../src/DigitalBoostPulsePlan";
import { startPulseMission, pausePulseMission, resumePulseMission, cancelPulseMission } from "../../src/DigitalBoostPulseMission";
import { createPulseExperiment } from "../../src/DigitalBoostPulseExperiment";
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem(k: string) { return store[k] ?? null; },
  setItem(k: string, v: string) { store[k] = v; },
  removeItem(k: string) { delete store[k]; },
};
test("preference supersede avoids silent contradiction", () => {
  const a = rememberPreference({ scope: "Nimbus", key: "theme", value: "Noir" });
  const b = rememberPreference({ scope: "Nimbus", key: "theme", value: "Nimbus" });
  const themes = queryPulseMemory({ kind: "preference", scope: "Nimbus", status: "ACTIVE" }).filter((row) => (row.content as any).key === "theme");
  assert.equal(themes.length, 1);
  assert.equal((themes[0].content as any).value, "Nimbus");
  assert.equal(listPulseMemory().find((row) => row.id === a!.id)?.status, "SUPERSEDED");
});
test("plan has dependencies and checkpoints", () => {
  const plan = compilePulseGoal({ action: "hero", store: "Nimbus" });
  assert.ok(plan.steps.length >= 3);
  assert.ok(plan.steps[1].dependsOn.includes(plan.steps[0].id));
});
test("mission pause persist resume cancel", () => {
  const started = startPulseMission({ store: "Nimbus", plan: compilePulseGoal({ action: "analyze", store: "Nimbus" }) });
  assert.equal(pausePulseMission(started.id)?.state, "PAUSED");
  assert.notEqual(resumePulseMission(started.id)?.state, "PAUSED");
  assert.equal(cancelPulseMission(started.id)?.state, "CANCELLED");
});
test("experiment rejects invented sales metric", () => {
  assert.equal(createPulseExperiment({ store: "Nimbus", hypothesis: { statement: "more sales", metric: "sales", direction: "up" }, variants: [{ id: "a", label: "A", action: "hero", payload: {} }] }), null);
});
