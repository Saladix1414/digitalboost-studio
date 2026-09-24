export const PULSE_TENANT_ISOLATION_VERSION =
  "pulse-tenant-isolation-v1";

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
]);

export class PulseTenantIsolationError extends Error {
  readonly code = "TENANT_ISOLATION_VIOLATION" as const;
  readonly expectedTenantId?: string;
  readonly actualTenantId?: string;

  constructor(
    message: string,
    expectedTenantId?: string,
    actualTenantId?: string,
  ) {
    super(message);
    this.name = "PulseTenantIsolationError";
    this.expectedTenantId = expectedTenantId;
    this.actualTenantId = actualTenantId;
  }
}

function normalizeTenantId(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new PulseTenantIsolationError(
      `${label} must be a non-empty string`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new PulseTenantIsolationError(
      `${label} must be a non-empty string`,
    );
  }

  if (WILDCARD_TENANTS.has(normalized.toLowerCase())) {
    throw new PulseTenantIsolationError(
      `${label} cannot use a wildcard/global tenant`,
      normalized,
      normalized,
    );
  }

  return normalized;
}

/**
 * P0.4.22 — Physical/resource tenant isolation guard.
 *
 * The tenant used to authorize an operation must exactly match the
 * tenant boundary of the resource being accessed.
 *
 * This is intentionally fail-closed and never performs coercion,
 * fallback, wildcard matching, or implicit tenant selection.
 */
export function assertPulseTenantIsolation(
  expectedTenantId: unknown,
  actualTenantId: unknown,
): string {
  const expected = normalizeTenantId(expectedTenantId, "expectedTenantId");
  const actual = normalizeTenantId(actualTenantId, "actualTenantId");

  if (expected !== actual) {
    throw new PulseTenantIsolationError(
      `Tenant isolation violation: expected "${expected}" but received "${actual}"`,
      expected,
      actual,
    );
  }

  return actual;
}
