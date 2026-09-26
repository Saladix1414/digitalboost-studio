import { buildPulseContext } from "./DigitalBoostPulseContext";
import { peekCanvasHero } from "./DigitalBoostPulseApply";
export type PulseSignalKind = "opportunity" | "risk" | "stale-context" | "approval-pending";
export type PulseSignal = {
  id: string; kind: PulseSignalKind; title: string; body: string;
  action: string; significance: number; source: string; createdAt: string;
  missionId?: string;
};
type BusHandler = (signal: PulseSignal) => void;
const handlers: BusHandler[] = [];
const KEY = "db-pulse-proactive-v1";
function readState(): { last: Record<string, number>; dismissed: Record<string, number> } {
  if (typeof localStorage === "undefined") return { last: {}, dismissed: {} };
  try { const raw = JSON.parse(localStorage.getItem(KEY) || "{}"); return { last: raw.last || {}, dismissed: raw.dismissed || {} }; } catch { return { last: {}, dismissed: {} }; }
}
function writeState(state: { last: Record<string, number> }) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
export function onPulseSignal(handler: BusHandler): () => void {
  handlers.push(handler);

  let active = true;

  return function unsubscribe() {
    if (!active) return;

    active = false;

    const index =
      handlers.indexOf(handler);

    if (index >= 0) {
      handlers.splice(index, 1);
    }
  };
}
export function emitPulseSignal(signal: PulseSignal) {
  handlers.forEach(function (h) { try { h(signal); } catch {} });
}
export function cooldownAllows(key: string, ms: number, now = Date.now()): boolean {
  const state = readState();
  if (state.dismissed[key]) return false;
  const prev = state.last[key] || 0;
  if (now - prev < ms) return false;
  state.last[key] = now;
  writeState(state);
  return true;
}

function sid(kind: string, action: string) { return kind + ":" + action; }
export function detectPulseOpportunities(input: { store?: string; section?: string } = {}): PulseSignal[] {
  const ctx = buildPulseContext({ store: input.store, section: input.section });
  const signals: PulseSignal[] = [];
  const now = new Date().toISOString();
  try {
    const hero = peekCanvasHero();
    const title = String(hero.title || "");
    const generic = !title || title.length < 8 || /extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(title);
    if (generic && ctx.storeBuilder.status !== "unavailable") {
      signals.push({
        id: sid("opportunity", "hero"), kind: "opportunity",
        title: "Hero generico", body: "El canvas tiene un hero debil o de plantilla. No hay ventas inventadas atras de esto: solo el titulo actual.",
        action: "hero", significance: 0.72, source: "db-store-canvas-v1", createdAt: now,
      });
    }
  } catch {}
  if (ctx.seo.status === "available" && (ctx.seo.data.issues || 0) > 0) {
    signals.push({
      id: sid("risk", "seo-fix"), kind: "risk",
      title: "SEO con issues persistidos", body: "Hay issues en db-seo-center-v1. PULSE no inventa el score si no esta en esa fuente.",
      action: "seo-fix", significance: 0.68, source: "db-seo-center-v1", createdAt: now,
    });
  }
  if (ctx.commerce.status === "unavailable") {
    signals.push({
      id: sid("stale-context", "analyze"), kind: "stale-context",
      title: "Commerce sin fuente", body: "No hay store autoritativo de ventas. No se emite oportunidad comercial.",
      action: "analyze", significance: 0.4, source: "no-authoritative-commerce-store", createdAt: now,
    });
  }
  return signals;
}
export function notifyPulseOpportunities(input: { store?: string; section?: string } = {}): PulseSignal[] {
  const out: PulseSignal[] = [];
  detectPulseOpportunities(input).forEach(function (signal) {
    if (signal.significance < 0.6) return;
    if (!cooldownAllows(signal.id, 30 * 60 * 1000)) return;
    emitPulseSignal(signal);
    out.push(signal);
  });
  return out;
}

export function dismissPulseSignal(id: string, now = Date.now()) {
  const state = readState();
  state.dismissed[id] = now;
  writeState(state);
}
