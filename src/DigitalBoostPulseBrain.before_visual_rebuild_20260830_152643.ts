
import { decide, explain, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";

export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };

export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}
export function analyze(input: PulseInput): PulseDecision {
  return decide(input);
}
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  return { decision: decide(input), engine: "rules" };
}
export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("premium") !== -1 || s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "PULSE Design toco el hero.", next: next };
  }
  return { note: "Proba: hero / premium / conversion.", next: blocks };
}

export { explain };
