import { buildPulseContext } from "./DigitalBoostPulseContext";
import {
  queryPulseMemory,
  queryTrustedPulseMemory,
} from "./DigitalBoostPulseMemory";
import { listPulseMissions } from "./DigitalBoostPulseMission";
import type { PulsePlan } from "./DigitalBoostPulsePlan";

export type PulseDebugReport = {
  store: string;
  tenantId?: string;
  generatedAt: string;
  contextVersion: string;
  available: string[];
  unavailable: string[];
  openMissions: number;
  decisions: number;
  lessons: number;
  claims: string[];
};

export function debugBusiness(
  store: string,
  tenantId?: string,
): PulseDebugReport {
  const ctx = buildPulseContext({
    store,
    tenant: tenantId,
  });

  const decisions = queryPulseMemory({
    kind: "decision",
    scope: store,
    tenantId,
  });

  const lessons = queryPulseMemory({
    kind: "lesson",
    scope: store,
    tenantId,
  });

  const openMissions = listPulseMissions().filter(
    function (m) {
      return (
        m.store === store &&
        (m.state === "RUNNING" ||
          m.state === "PAUSED" ||
          m.state === "AWAITING_APPROVAL")
      );
    },
  ).length;

  return {
    store,
    tenantId,
    generatedAt: ctx.generatedAt,
    contextVersion: ctx.summary.contextVersion,
    available: ctx.summary.availableDomains,
    unavailable: ctx.summary.unavailableDomains,
    openMissions,
    decisions: decisions.length,
    lessons: lessons.length,
    claims: [
      "Commerce/analytics remain unavailable without an authoritative store.",
      "Multimodal and A2A are not implemented.",
      "Model routing stays in existing Brain/OpenClaw paths.",
    ],
  };
}

export type PulseGraphNode = {
  id: string;
  kind: string;
  label: string;
};

export function decisionGraph(
  store: string,
  tenantId?: string,
): PulseGraphNode[] {
  return queryPulseMemory({
    kind: "decision",
    scope: store,
    tenantId,
  }).map(function (row) {
    const content =
      row.content &&
      typeof row.content === "object"
        ? (row.content as Record<string, unknown>)
        : {};

    return {
      id: row.id,
      kind: "decision",
      label:
        String(content.action || row.id) +
        ":" +
        String(content.policy || ""),
    };
  });
}

export function goalDrift(
  plan: PulsePlan,
  store: string,
  tenantId?: string,
): {
  drifted: boolean;
  reason: string;
} {
  const ctx = buildPulseContext({
    store,
    tenant: tenantId,
  });

  if (
    tenantId &&
    plan.goal.tenantId &&
    plan.goal.tenantId !== tenantId
  ) {
    return {
      drifted: true,
      reason: "Goal tenant does not match requested tenant.",
    };
  }

  if (
    plan.goal.riskFloor === "L3" &&
    ctx.commerce.status === "unavailable"
  ) {
    return {
      drifted: true,
      reason:
        "Goal assumes commercial movement but commerce source is unavailable.",
    };
  }

  if (!ctx.snapshot.version) {
    return {
      drifted: true,
      reason: "No snapshot version.",
    };
  }

  return {
    drifted: false,
    reason: "No evidenced drift.",
  };
}

export function businessTwin(
  store: string,
  tenantId?: string,
) {
  const ctx = buildPulseContext({
    store,
    tenant: tenantId,
  });

  return {
    mode: ctx.snapshot.mode,
    version: ctx.snapshot.version,
    facts: ctx.snapshot.facts,
    unavailable: ctx.summary.unavailableDomains,
  };
}

export function compilePlaybook(
  store: string,
  tenantId?: string,
): {
  ok: boolean;
  steps: string[];
  reason: string;
} {
  /*
   * Explicit tenant = trusted retrieval only.
   *
   * Legacy caller without tenantId retains the old behavior for
   * compatibility but does not gain the P0.6 trusted boundary.
   */
  const lessons = tenantId
    ? queryTrustedPulseMemory({
        tenantId,
        kind: "lesson",
        scope: store,
        minimumTrust: "VERIFIED",
      })
    : queryPulseMemory({
        kind: "lesson",
        scope: store,
        status: "ACTIVE",
      });

  if (!lessons.length) {
    return {
      ok: false,
      steps: [],
      reason: tenantId
        ? "No verified lessons to compile."
        : "No active lessons to compile.",
    };
  }

  return {
    ok: true,
    steps: lessons.map(function (row) {
      return "review:" + row.id;
    }),
    reason:
      "Playbook is a review list, not an autonomous runner.",
  };
}
