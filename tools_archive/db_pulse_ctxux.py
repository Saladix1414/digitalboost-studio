#!/usr/bin/env python3
from pathlib import Path

kb = Path("src/DigitalBoostPulseKB.ts")
t = kb.read_text(encoding="utf-8")
if "heroTitle" not in t:
    t = t.replace(
        "live: boolean;\n};",
        "live: boolean;\n  page?: string;\n  blockCount?: number;\n  heroTitle?: string;\n};",
        1,
    )
t = t.replace(
    'body: "No enganché el frente. Tirame ventas, 1048, stock, o tocá briefing."',
    'body: "¿Cifras del OS o el canvas? Decime ventas, 1048, o hero."',
)
t = t.replace(
    "No enganché un frente claro. Proba: ventas, pedidos, stock, health, hero o campaña.",
    "¿Lo vemos por ventas, por un pedido, o por el hero?",
)
t = t.replace(
    "No enganché el frente. Proba ventas, pedidos, stock, health, hero o campaña.",
    "¿Cifras, un pedido, o el canvas?",
)
# studio fallback
t = t.replace(
    'body: "Estás en el estudio. Pedime hero, theme o conversion."',
    'body: (input.heroTitle ? ("Hero actual: «" + input.heroTitle + "». ¿Lo reescribimos o cambiamos theme?") : "El canvas está listo. ¿Hero, theme o CTA?")',
)
kb.write_text(t, encoding="utf-8")
print("ok repair")

op = Path("src/DigitalBoostOperator.tsx")
o = op.read_text(encoding="utf-8")
if "readCanvas" not in o:
    o = o.replace(
        "function ctx() {",
        """function readCanvas() {
  let page = "Inicio";
  let n = 0;
  let hero = "";
  try {
    page = localStorage.getItem("db-store-page-v1") || localStorage.getItem("db-os-page") || "Inicio";
    const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const blocks = JSON.parse(raw);
    if (Array.isArray(blocks)) {
      n = blocks.length;
      const h = blocks.find(function (b: any) { return b && b.type === "hero"; });
      if (h) hero = String(h.title || "");
    }
  } catch {}
  return { page: page, n: n, hero: hero };
}
function ctx() {""",
        1,
    )
    o = o.replace(
        "const r = analyze({ q: word || \"hola\", section: section, store: c.store, range: c.range, live: c.live });",
        """const cv = readCanvas();
    const r = analyze({ q: word || "hola", section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero });""",
        1,
    )
    o = o.replace(
        "{section} · instantaneo",
        "{section} · {readCanvas().page} · {readCanvas().n} bloques",
    )
    o = o.replace(
        '{section} · instantaneo',
        '{section} · {readCanvas().page} · {readCanvas().n} bloques',
    )
    op.write_text(o, encoding="utf-8")
    print("ok operator ctx")
else:
    print("operator ya tenia canvas")
print("LISTO CTXUX")
