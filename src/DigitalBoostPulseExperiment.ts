export type PulseExperimentStatus = "DRAFT" | "RUNNING" | "STOPPED" | "COMPLETED" | "REJECTED";
export type PulseVariant = { id: string; label: string; action: string; payload: Record<string, unknown> };
export type PulseHypothesis = { statement: string; metric: string; direction: "up" | "down" };
export type PulseExperiment = {
  id: string; store: string; tenantId?: string; status: PulseExperimentStatus;
  hypothesis: PulseHypothesis; variants: PulseVariant[];
  guardrails: string[]; stopConditions: string[];
  createdAt: string; updatedAt: string; result?: string;
};
const KEY = "db-pulse-experiments-v1";
function readAll(): PulseExperiment[] {
  if (typeof localStorage === "undefined") return [];
  try { const rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows : []; } catch { return []; }
}
function writeAll(rows: PulseExperiment[]) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-40))); } catch {}
}
function nid() { return "exp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 5); }
export function listPulseExperiments(): PulseExperiment[] { return readAll(); }

const ALLOWED_METRICS = new Set(["hero_title_present", "seo_issue_count", "canvas_block_count"]);
function save(row: PulseExperiment): PulseExperiment {
  const rows = readAll();
  const idx = rows.findIndex(function (e) { return e.id === row.id; });
  const next = Object.assign({}, row, { updatedAt: new Date().toISOString() });
  if (idx >= 0) rows[idx] = next; else rows.push(next);
  writeAll(rows);
  return next;
}
export function createPulseExperiment(input: {
  store: string;
  tenantId?: string;
  hypothesis: PulseHypothesis;
  variants: PulseVariant[];
}): PulseExperiment | null {
  if (!ALLOWED_METRICS.has(input.hypothesis.metric)) return null;
  if (!input.variants.length) return null;

  return save({
    id: nid(),
    store: input.store,
    tenantId: input.tenantId,
    status: "DRAFT",
    hypothesis: input.hypothesis,
    variants: input.variants,
    guardrails: [
      "no-invented-metrics",
      "governance-before-mutate",
      "rollback-on-verify-fail",
    ],
    stopConditions: [
      "manual-stop",
      "verify-fail",
      "max-one-running-per-store-and-tenant",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
export function startPulseExperiment(id: string): PulseExperiment | null {
  const rows = readAll();
  const exp = rows.filter(function (e) { return e.id === id; })[0];
  if (!exp || exp.status !== "DRAFT") return null;
  const running = rows.some(function (e) {
    if (e.store !== exp.store || e.status !== "RUNNING") return false;

    /*
     * Explicit tenant experiments are isolated from one another.
     * Legacy experiments without tenantId retain the historical
     * store-wide constraint.
     */
    if (exp.tenantId) {
      return e.tenantId === exp.tenantId;
    }

    return !e.tenantId;
  });
  if (running) return null;
  return save(Object.assign({}, exp, { status: "RUNNING" }));
}
export function stopPulseExperiment(id: string, reason: string): PulseExperiment | null {
  const exp = readAll().filter(function (e) { return e.id === id; })[0];
  if (!exp || exp.status !== "RUNNING") return null;
  return save(
    Object.assign({}, exp, {
      status: "STOPPED",
      result: reason,
    }),
  );
}
