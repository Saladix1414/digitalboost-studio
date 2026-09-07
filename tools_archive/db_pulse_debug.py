#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
kb = src / "DigitalBoostPulseKB.ts"
if not kb.is_file():
    raise SystemExit("Falta PulseKB")

t = kb.read_text(encoding="utf-8")
if "export function explain" not in t:
    t += r"""

export function explain(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase().trim() || "ventas y stock";
  const keys: { title: string; ks: string[] }[] = [
    { title: "Hola", ks: ["hola", "quien", "sos", "pulse"] },
    { title: "Ventas", ks: ["venta", "plata", "ingreso", "analytics", "factur"] },
    { title: "Pedidos", ks: ["pedido", "orden", "envio", "despacho", "1048", "1047"] },
    { title: "Stock", ks: ["stock", "invent", "sku", "producto", "cap", "hoodie"] },
    { title: "Clientes", ks: ["cliente", "vip", "martin", "sofia"] },
    { title: "Health", ks: ["health", "salud", "error", "diagnost"] },
    { title: "Search", ks: ["buscar", "search"] },
    { title: "Campaña", ks: ["campan", "promo"] },
    { title: "Hero", ks: ["hero", "homepage", "redisen", "canvas"] },
    { title: "Theme", ks: ["theme", "noir", "color"] },
    { title: "Briefing", ks: ["brief", "estado", "resumen"] },
    { title: "Plan", ks: ["plan", "prioridad"] },
    { title: "Alerta", ks: ["alerta", "urgente", "rojo"] }
  ];
  const ranked = keys.map(function (row) {
    let s = 0;
    const hit: string[] = [];
    for (let i = 0; i < row.ks.length; i++) {
      if (q.indexOf(row.ks[i]) !== -1) {
        s += row.ks[i].length > 4 ? 2 : 1;
        hit.push(row.ks[i]);
      }
    }
    return { title: row.title, score: s, hit: hit };
  }).filter(function (r) { return r.score > 0; }).sort(function (a, b) { return b.score - a.score; });
  const win = ranked[0];
  const rank = ranked.map(function (r) { return r.score + "pts " + r.title + (r.hit.length ? " [" + r.hit.join(",") + "]" : ""); }).join(" · ");
  return {
    title: "PULSE · Debug",
    body: "Query «" + q + "». " + (win ? ("Ganó " + win.title + " con " + win.score + " pts. Ranking: " + rank) : "Nadie matcheó. Caería a fallback de sección."),
    action: "dashboard",
    actionLabel: "Seguir acá",
    confirm: false
  };
}
"""
    kb.write_text(t, encoding="utf-8")
    print("ok explain")

br = src / "DigitalBoostPulseBrain.ts"
b = br.read_text(encoding="utf-8")
if "explain" not in b:
    b = b.replace(
        'import { decide, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";',
        'import { decide, explain, type PulseInput, type PulseDecision } from "./DigitalBoostPulseKB";',
        1,
    )
    if "export { explain }" not in b:
        b = b.replace(
            "export function analyze(input: PulseInput): PulseDecision { return decide(input); }",
            "export function analyze(input: PulseInput): PulseDecision { return decide(input); }\nexport { explain };",
            1,
        )
    br.write_text(b, encoding="utf-8")
    print("ok brain export")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
o = o.replace(
    'from "./DigitalBoostPulseBrain";',
    'from "./DigitalBoostPulseBrain";',
    1,
)
if "explain" not in o.split("from")[0]:
    o = o.replace(
        "import { analyze, isBuilder, type PulseDecision } from \"./DigitalBoostPulseBrain\";",
        "import { analyze, explain, isBuilder, type PulseDecision } from \"./DigitalBoostPulseBrain\";",
        1,
    )
if "word === \"debug\"" not in o:
    o = o.replace(
        "const r = analyze({ q: word || \"hola\", section: section, store: c.store, range: c.range, live: c.live });",
        "const r = (word === \"debug\" || (word || \"\").indexOf(\"debug\") === 0) ? explain({ q: q && q !== \"debug\" ? q : \"ventas y stock\", section: section, store: c.store, range: c.range, live: c.live }) : analyze({ q: word || \"hola\", section: section, store: c.store, range: c.range, live: c.live });",
        1,
    )
if '"debug"' not in o.split("CHIPS")[-1][:200]:
    o = o.replace(
        '["briefing", "plan", "alerta", "hola", "ventas", "pedidos", "stock"]',
        '["briefing", "plan", "alerta", "debug", "ventas", "stock"]',
        1,
    )
op.write_text(o, encoding="utf-8")
print("ok operator")
print("LISTO DEBUG")
print("Escribi: ventas y stock  ->  chip debug")
