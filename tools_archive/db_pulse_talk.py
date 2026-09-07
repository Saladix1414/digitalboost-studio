#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseSkills.ts").write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
function mul(r: string) { return r === "90d" ? 12 : r === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
function studio(i: PulseInput) {
  return i.section === "website-builder" || i.section === "store-builder" || i.section === "builder";
}
export function skillBriefing(i: PulseInput) {
  if (studio(i)) {
    const hero = i.heroTitle ? "«" + i.heroTitle + "»" : "el hero genérico";
    return {
      title: "PULSE Design · Pulso",
      body: (i.page || "Inicio") + " · " + String(i.blockCount || 0) + " bloques. Ahora mismo manda " + hero + ". Yo tocaría copy del hero, un CTA en destacados y un pase de theme. ¿Cuál primero?",
      action: "website-builder",
      label: "Seguir en el canvas"
    };
  }
  const m = mul(i.range);
  return {
    title: "PULSE · Briefing",
    body: i.store + " " + i.range + (i.live ? ", live" : "") + ". Cálculo de demo: " + money(Math.round(474 * m)) + " y " + Math.max(1, Math.round(4 * m)) + " pedidos. Rojo: cap fino, 1047 sin despachar, mobile. ¿Arrancamos por despacho?",
    action: "dashboard",
    label: "Seguir en Overview"
  };
}
export function skillPlan(i: PulseInput) {
  if (studio(i)) {
    return {
      title: "PULSE Design · Plan",
      body: "Orden en este canvas: 1) Hero con una sola promesa. 2) CTA en destacados. 3) Theme Aura o Noir, no mezclar. 4) Preview en el teléfono. El depósito y el 1047 los vemos cuando volvamos al OS.",
      action: "website-builder",
      label: "Seguir en el canvas"
    };
  }
  return {
    title: "PULSE · Plan",
    body: "Orden de hoy: 1) Despachar 1047. 2) Anotar el cap para reponer — eso no es comprar todavía. 3) Hero con un CTA. 4) Campaña de carritos: Pulse Card, no se publica sola.",
    action: "orders",
    label: "Empezar por Pedidos"
  };
}
export function skillAlerta(i: PulseInput) {
  if (studio(i)) {
    return {
      title: "PULSE Design · Alerta",
      body: "El hero no está vendiendo en 3 segundos y hay bloques sin CTA. Eso recorta más que el color. ¿Reescribimos el hero?",
      action: "website-builder",
      label: "Seguir en el canvas"
    };
  }
  return {
    title: "PULSE · Alerta",
    body: "Tres rojos: cap fino, 1047 trabado, mobile. Te abro Health. No toco inventario.",
    action: "__health",
    label: "Abrir Store Health"
  };
}
export function skillHero() {
  try { localStorage.setItem("db-pulse-skill", "hero"); } catch {}
  return {
    title: "PULSE Design · Hero",
    body: "Una línea. Un CTA. El chip AI Design lo escribe en el canvas y History lo revierte.",
    action: "website-builder",
    label: "Aplicar en el canvas"
  };
}
""", encoding="utf-8")
print("ok skills contexto")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
old = '''  const tag = " · " + meta.agent + " · " + meta.risk + " · " + meta.intent;
  return {
    title: pick.title,
    body: pick.body + tag + (meta.confirm ? " · Aprobacion " + meta.risk : ""),'''
new = '''  return {
    title: pick.title,
    body: pick.body,'''
if old in t:
    t = t.replace(old, new, 1)
    print("ok sin tag robot")
else:
    t = t.replace(
        "body: pick.body + tag + (meta.confirm ? \" · Aprobacion \" + meta.risk : \"\"),",
        "body: pick.body,",
        1,
    )
    t = t.replace(
        'body: pick.body + tag',
        'body: pick.body',
        1,
    )
    print("ok tag patch alt")
kb.write_text(t, encoding="utf-8")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
o = o.replace(
    "{builder ? \"Design\" : \"OS\"} · {canvas.page} · {canvas.n} bloques",
    "{builder ? \"Estudio\" : \"Commerce OS\"} · {canvas.page}" + " · {out && out.agent ? out.agent : \"pulse\"}",
)
o = o.replace(
    '{builder ? "Design" : "OS"} · {canvas.page} · {canvas.n} bloques',
    '{builder ? "Estudio" : "Commerce OS"} · {canvas.page}{out && out.risk ? " · " + out.risk : ""}',
)
# dedupe think
if "lastUser" not in o:
    o = o.replace(
        "setMsgs(function (m) {\n      return m.concat([{ role: \"user\", text: word || \"hola\" }, { role: \"pulse\", text: r.body }]);\n    });",
        """setMsgs(function (m) {
      const line = word || "hola";
      const last = m[m.length - 2];
      if (last && last.role === "user" && last.text === line) {
        return m.slice(0, -1).concat([{ role: "pulse", text: r.body }]);
      }
      return m.concat([{ role: "user", text: line }, { role: "pulse", text: r.body }]).slice(-8);
    });""",
        1,
    )
    print("ok dedupe")
# hide "abrir store builder" when already there
o = o.replace(
    "{out && !out.card && (",
    "{out && !out.card && out.action !== \"website-builder\" && section !== \"website-builder\" && (",
)
op.write_text(o, encoding="utf-8")
print("LISTO TALK")
print("En el studio, plan = canvas. Sin L0/information en la burbuja.")
