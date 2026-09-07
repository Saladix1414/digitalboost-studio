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
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "rules" | "ollama"; raw?: string }> {
  try {
    const mod = await import("./ollama/client");
    const status = await mod.checkOllama();
    if (status.ok) {
      const ctx = (input.section + " | " + ((input as any).q || "") + " | page:" + ((input as any).page || "")).slice(0, 300);
      const prompt = 'Contexto: ' + ctx + '. Genera briefing PULSE corto JSON {"title":"...","body":"...","action":"website-builder","label":"Aplicar"}';
      const raw = await mod.ollamaChat([
        { role: "system", content: "Sos PULSE, asistente DigitalBoost OS navy. Tono directo, argentino. Responde solo JSON." },
        { role: "user", content: prompt }
      ]);
      if (raw) {
        try {
          const m = raw.match(/\{.*\}/s);
          const j = JSON.parse(m? m[0] : raw);
          if (j.title && j.body) {
            return { decision: { title: j.title, body: j.body, action: j.action || "website-builder", actionLabel: j.label || "Aplicar", confirm: false, draft: j.draft } as any, engine: "ollama", raw };
          }
        } catch {}
      }
    }
  } catch {}
  return { decision: decide(input), engine: "rules" };
}
export function designApply(q: string, blocks: PulseBlock[]) {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("hero")!== -1 || s.indexOf("premium")!== -1) {
    next.forEach(function (b) { if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; } });
    return { note: "L1 Design: hero tocado.", next: next };
  }
  return { note: "Proba hero / premium.", next: blocks };
}
