import type { PulsePlan } from "./DigitalBoostPulsePlan";
export type PulseMissionState = "RUNNING" | "PAUSED" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PulseMission = {
  id: string; store: string; planId: string; state: PulseMissionState;
  stepIndex: number; retries: number; maxRetries: number;
  createdAt: string; updatedAt: string; lastError?: string; plan: PulsePlan;
};
const KEY = "db-pulse-missions-v1";
function readAll(): PulseMission[] {
  if (typeof localStorage === "undefined") return [];
  try { const rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows : []; } catch { return []; }
}
function writeAll(rows: PulseMission[]) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-80))); } catch {}
}
function nid() { return "msn_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 5); }
export function listPulseMissions(): PulseMission[] { return readAll(); }
export function getPulseMission(id: string): PulseMission | null {
  return readAll().filter(function (m) { return m.id === id; })[0] || null;
}

function save(mission: PulseMission): PulseMission {
  const rows = readAll();
  const idx = rows.findIndex(function (m) { return m.id === mission.id; });
  const next = Object.assign({}, mission, { updatedAt: new Date().toISOString() });
  if (idx >= 0) rows[idx] = next; else rows.push(next);
  writeAll(rows);
  return next;
}
export function startPulseMission(input: { store: string; plan: PulsePlan }): PulseMission {
  const first = input.plan.steps[0];
  const awaiting = Boolean(first && first.approvalLikely);
  return save({
    id: nid(), store: input.store, planId: input.plan.id,
    state: awaiting ? "AWAITING_APPROVAL" : "RUNNING",
    stepIndex: 0, retries: 0, maxRetries: 2,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    plan: input.plan,
  });
}
export function pausePulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || (m.state !== "RUNNING" && m.state !== "AWAITING_APPROVAL")) return null;
  return save(Object.assign({}, m, { state: "PAUSED" }));
}
export function resumePulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state !== "PAUSED") return null;
  const step = m.plan.steps[m.stepIndex];
  return save(Object.assign({}, m, { state: step && step.approvalLikely ? "AWAITING_APPROVAL" : "RUNNING" }));
}
export function cancelPulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state === "COMPLETED" || m.state === "CANCELLED") return null;
  return save(Object.assign({}, m, { state: "CANCELLED" }));
}
export function retryPulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state !== "FAILED") return null;
  if (m.retries >= m.maxRetries) return m;
  return save(Object.assign({}, m, { state: "RUNNING", retries: m.retries + 1, lastError: undefined }));
}
export function advancePulseMission(id: string, input: { approved?: boolean; ok?: boolean; error?: string } = {}): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state === "CANCELLED" || m.state === "COMPLETED" || m.state === "PAUSED") return null;
  const step = m.plan.steps[m.stepIndex];
  if (!step) return save(Object.assign({}, m, { state: "COMPLETED" }));
  if (m.state === "AWAITING_APPROVAL" && !input.approved) return m;
  if (input.ok === false) {
    const failed = m.retries + 1 > m.maxRetries;
    return save(Object.assign({}, m, { state: failed ? "FAILED" : "RUNNING", retries: m.retries + (failed ? 0 : 1), lastError: input.error || "step-failed" }));
  }
  const nextIndex = m.stepIndex + 1;
  if (nextIndex >= m.plan.steps.length) return save(Object.assign({}, m, { stepIndex: nextIndex, state: "COMPLETED" }));
  const nxt = m.plan.steps[nextIndex];
  return save(Object.assign({}, m, { stepIndex: nextIndex, state: nxt && nxt.approvalLikely ? "AWAITING_APPROVAL" : "RUNNING" }));
}
