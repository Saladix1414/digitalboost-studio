import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePulseTenantAttribution,
} from "../../src/DigitalBoostPulseTenant.ts";

test("explicit tenant has highest attribution precedence", () => {
  const result = resolvePulseTenantAttribution({
    explicitTenantId: "tenant-alpha",
    goalTenantId: "tenant-beta",
  });

  assert.deepEqual(result, {
    tenantId: "tenant-alpha",
    source: "EXPLICIT",
    legacy: false,
  });
});

test("goal tenant is used when explicit tenant is absent", () => {
  const result = resolvePulseTenantAttribution({
    goalTenantId: "tenant-beta",
  });

  assert.deepEqual(result, {
    tenantId: "tenant-beta",
    source: "GOAL",
    legacy: false,
  });
});

test("legacy fallback is explicitly classified as legacy", () => {
  const result = resolvePulseTenantAttribution({});

  assert.deepEqual(result, {
    tenantId: "digitalboost",
    source: "LEGACY_DEFAULT",
    legacy: true,
  });
});

test("blank explicit tenant does not override a valid goal tenant", () => {
  const result = resolvePulseTenantAttribution({
    explicitTenantId: "   ",
    goalTenantId: "tenant-gamma",
  });

  assert.deepEqual(result, {
    tenantId: "tenant-gamma",
    source: "GOAL",
    legacy: false,
  });
});

test("blank explicit and goal tenants remain legacy", () => {
  const result = resolvePulseTenantAttribution({
    explicitTenantId: " ",
    goalTenantId: "\t",
  });

  assert.deepEqual(result, {
    tenantId: "digitalboost",
    source: "LEGACY_DEFAULT",
    legacy: true,
  });
});

test("custom legacy default is preserved without being marked authoritative", () => {
  const result = resolvePulseTenantAttribution({
    legacyDefault: "legacy-tenant-x",
  });

  assert.deepEqual(result, {
    tenantId: "legacy-tenant-x",
    source: "LEGACY_DEFAULT",
    legacy: true,
  });
});
