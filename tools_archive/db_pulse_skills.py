#!/usr/bin/env python3
from pathlib import Path

src = Path("src")

(src / "DigitalBoostPulseSkills.ts").write_text(r"""
import type { PulseInput, PulseDecision } from "./DigitalBoostPulseKB";

function mul(r: string) {
  return r === "90d" ? 12 : r === "30d" ? 4 : 1;
}
function money(n: number) {
  return "US$ " + n.toLocaleString("es-AR");
}

export function skillBriefing(i: PulseInput): PulseDecision {
  const m = mul(i.range);
  const sales = Math.round(474 * m);
  const orders = Math.max(1, Math.round(4 * m));
  const body =
    i.store + " " + i.range + (i.live ? " live" : " atención") + ". " +
    money(sales) + " · " + orders + " pedidos · ticket " + money(Math.round(118 * m)) + ". " +
    "Rojo: Cap Digital Blue fino, 1047 sin despachar, mobile recorta conversion. " +
    "Siguiente golpe: reponer cap, cerrar 1047, CTA en el hero.";
  return { title: "PULSE · Briefing", body: body, action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
}

export function skillPlan(i: PulseInput): PulseDecision {
  return {
    title: "PULSE · Plan",
    body: "1) Despachar DB-1047. 2) Reponer Cap Digital Blue. 3) Hero con un solo CTA. 4) Campaña carritos 10%/48h. En ese orden, " + i.store + ".",
    action: "orders",
    actionLabel: "Empezar por Pedidos",
    confirm: false
  };
}

export function skillAlerta(i: PulseInput): PulseDecision {
  return {
    title: "PULSE · Alerta",
    body: (i.live ? "Live, pero " : "Attention: ") + "stock cap crítico + pedido trabado + conversion mobile. Te abro Health para el diagnóstico.",
    action: "__health",
    actionLabel: "Abrir Store Health",
    confirm: false
  };
}

export function skillHero(): PulseDecision {
  try { localStorage.setItem("db-pulse-skill", "hero"); } catch {}
  return {
    title: "PULSE Design · Hero",
    body: "Marqué skill hero. En el studio, AI Design aplica el copy de conversion. Te mando al canvas.",
    action: "website-builder",
    actionLabel: "Abrir Store Builder",
    confirm: false
  };
}
""", encoding="utf-8")
print("ok skills")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8") if kb.is_file() else ""
if "skillBriefing" not in t:
    t = 'import { skillAlerta, skillBriefing, skillHero, skillPlan } from "./DigitalBoostPulseSkills";\n' + t
    needle = "export function decide(input: PulseInput): PulseDecision {"
    inject = """export function decide(input: PulseInput): PulseDecision {
  const raw = (input.q || "").toLowerCase().trim();
  if (raw.indexOf("brief") !== -1 || raw === "estado" || raw === "resumen") return skillBriefing(input);
  if (raw.indexOf("plan") !== -1 || raw === "que hago" || raw.indexOf("prioridad") !== -1) return skillPlan(input);
  if (raw.indexOf("alerta") !== -1 || raw.indexOf("urgente") !== -1 || raw.indexOf("rojo") !== -1) return skillAlerta(input);
  if (raw === "hero" || raw.indexOf("arreglar hero") !== -1) return skillHero();
"""
    if needle in t:
        t = t.replace(needle, inject, 1)
    kb.write_text(t, encoding="utf-8")
    print("ok kb skills")
else:
    print("kb ya tenia skills")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    o = o.replace(
        '["hola", "ventas", "pedidos", "stock", "health", "buscar"]',
        '["briefing", "plan", "alerta", "hola", "ventas", "pedidos", "stock"]',
        1,
    )
    o = o.replace(
        '["hola", "hero", "theme"]',
        '["briefing", "hero", "plan"]',
        1,
    )
    op.write_text(o, encoding="utf-8")
    print("ok chips")
print("LISTO SKILLS")
print("Chips: briefing / plan / alerta")
