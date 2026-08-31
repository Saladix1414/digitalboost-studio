
import { decide, explain, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";
export type { PulseInput, PulseDecision };
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };
export { explain };
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function analyze(input: PulseInput): PulseDecision {
  return decide(input);
}
export async function analyzeSmart(input: PulseInput) {
  return { decision: decide(input), engine: "rules" as const };
}
export function designApply(q: string, blocks: PulseBlock[]) {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "L1 Design: hero tocado. Reversible con History.", next: next };
  }
  return { note: "Proba hero / premium.", next: blocks };
}
