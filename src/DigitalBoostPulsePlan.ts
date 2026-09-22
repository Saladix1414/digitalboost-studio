export type PulsePlanStatus = "DRAFT" | "READY" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type PulseGoal = {
  id: string; statement: string; constraints: string[];
  successCriteria: string[]; riskFloor: string;
};
export type PulsePlanStep = {
  id: string; action: string; title: string; dependsOn: string[];
  expected: Record<string, unknown>; checkpoint: boolean; approvalLikely: boolean;
};
export type PulsePlan = {
  id: string; goal: PulseGoal; steps: PulsePlanStep[];
  status: PulsePlanStatus; createdAt: string;
};
function nid(prefix: string) { return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 5); }
function step(action: string, title: string, expected: Record<string, unknown>, extra: Partial<PulsePlanStep> = {}): PulsePlanStep {
  return Object.assign({ id: nid("stp"), action, title, dependsOn: [], expected, checkpoint: false, approvalLikely: false }, extra);
}

export function compilePulseGoal(input: { q?: string; action: string; section?: string; store?: string }): PulsePlan {
  const action = input.action;
  const statement =
    action === "seo-fix" ? "Corregir el problema SEO prioritario sin inventar metricas." :
    action === "campaigns" ? "Preparar una campana solo despues de approval L3." :
    action === "website-builder" || action === "hero" || action === "optimize" ? "Mejorar el canvas con un cambio reversible." :
    action === "analyze" || action === "reason" || action === "explain" ? "Explicar el estado actual sin mutar." :
    "Evaluar la peticion y no ejecutar nada fuera de contrato.";
  const goal: PulseGoal = {
    id: nid("goal"),
    statement,
    constraints: ["governance-first", "no-invented-metrics", "verify-after-write"],
    successCriteria: ["policy-evaluated", "expected-outcome-declared"],
    riskFloor: action === "campaigns" ? "L3" : action === "seo-fix" || action === "hero" || action === "optimize" || action === "website-builder" ? "L1" : "L0",
  };
  const inspect = step("analyze", "Leer snapshot actual", { snapshot: "CURRENT" });
  const propose = step(action, "Proponer accion contratada", { action: action }, { dependsOn: [inspect.id], approvalLikely: goal.riskFloor !== "L0", checkpoint: goal.riskFloor !== "L0" });
  const verify = step("explain", "Declarar expected outcome", { verified: true }, { dependsOn: [propose.id], checkpoint: true });
  return { id: nid("plan"), goal, steps: [inspect, propose, verify], status: "READY", createdAt: new Date().toISOString() };
}
export function planCheckpointActions(plan: PulsePlan): string[] {
  return plan.steps.filter(function (s) { return s.checkpoint; }).map(function (s) { return s.action; });
}
