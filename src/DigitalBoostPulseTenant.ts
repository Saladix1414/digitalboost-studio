/**
 * PULSE Tenant Attribution
 *
 * IMPORTANT:
 * This module is NOT a security authority.
 *
 * Authoritative tenant identity remains server-side:
 * principal.active_tenant_id
 *
 * This helper only provides deterministic tenant attribution for
 * client/runtime records such as audit rows and legacy missions.
 */

export type PulseTenantAttributionSource =
  | "EXPLICIT"
  | "GOAL"
  | "LEGACY_DEFAULT";

export type PulseTenantAttribution = {
  tenantId: string;
  source: PulseTenantAttributionSource;
  legacy: boolean;
};

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

export function resolvePulseTenantAttribution(input: {
  explicitTenantId?: unknown;
  goalTenantId?: unknown;
  legacyDefault?: string;
} = {}): PulseTenantAttribution {
  const explicit = clean(input.explicitTenantId);
  if (explicit) {
    return {
      tenantId: explicit,
      source: "EXPLICIT",
      legacy: false,
    };
  }

  const goal = clean(input.goalTenantId);
  if (goal) {
    return {
      tenantId: goal,
      source: "GOAL",
      legacy: false,
    };
  }

  const legacy = clean(input.legacyDefault) || "digitalboost";

  return {
    tenantId: legacy,
    source: "LEGACY_DEFAULT",
    legacy: true,
  };
}
