import { hashProposal } from "./DigitalBoostPulseContracts";
export type PulseSnapshotMode = "CURRENT" | "PROPOSED" | "EXPECTED" | "ACTUAL" | "SIMULATED";
export type PulseFreshness = "fresh" | "aging" | "stale" | "unknown";
export type PulseFact<T = unknown> = {
  value: T; source: string; timestamp: string; freshness: PulseFreshness;
  confidence: number; provenance: string; scope: string; present: boolean;
};
export type PulseStateSnapshot = {
  id: string; mode: PulseSnapshotMode; capturedAt: string; tenant: string;
  store: string; version: string; facts: Record<string, PulseFact>;
};
export function freshnessOf(timestamp: string, now = Date.now()): PulseFreshness {
  const t = Date.parse(timestamp);
  if (!Number.isFinite(t)) return "unknown";
  const age = now - t;
  if (age < 30 * 1000) return "fresh";
  if (age < 10 * 60 * 1000) return "aging";
  return "stale";
}
export function fact<T>(value: T, source: string, present: boolean, scope: string, nowIso: string): PulseFact<T> {
  return { value, source, timestamp: nowIso, freshness: present ? "fresh" : "unknown", confidence: present ? 0.8 : 0, provenance: source, scope, present };
}
export function snapshotVersion(facts: Record<string, PulseFact>): string {
  const slim: Record<string, unknown> = {};
  for (const key of Object.keys(facts).sort()) {
    const f = facts[key];
    slim[key] = { v: f.value, s: f.source, p: f.present };
  }
  return hashProposal(slim);
}
export function buildStateSnapshot(input: { store?: string; tenant?: string; mode?: PulseSnapshotMode; facts: Record<string, PulseFact>; }): PulseStateSnapshot {
  const capturedAt = new Date().toISOString();
  const version = snapshotVersion(input.facts);
  return { id: "snap_" + version, mode: input.mode || "CURRENT", capturedAt, tenant: input.tenant || "digitalboost", store: input.store || "unknown", version, facts: input.facts };
}
export function snapshotIsFresh(snapshot: PulseStateSnapshot, now = Date.now()): boolean {
  return freshnessOf(snapshot.capturedAt, now) !== "stale";
}
