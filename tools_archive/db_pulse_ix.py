#!/usr/bin/env python3
from pathlib import Path

op = Path("src/DigitalBoostOperator.tsx")
o = op.read_text(encoding="utf-8")
if "→ {s}" not in o and "SUGGEST_PULSE" not in o:
    o = o.replace(
        "{out && (",
        """{out && (
            <div className="flex flex-wrap gap-1">
              {(
                out.action === "orders" ? ["plan", "stock", "alerta"] :
                out.action === "analytics" ? ["stock", "pedidos", "briefing"] :
                out.action === "products" ? ["pedidos", "alerta", "plan"] :
                out.action === "campaigns" ? ["briefing", "clientes", "plan"] :
                (out.action.indexOf("website") !== -1 || out.action === "website-builder") ? ["hero", "theme", "plan"] :
                out.action === "__health" ? ["plan", "stock", "pedidos"] :
                ["briefing", "plan", "alerta"]
              ).map(function (s) {
                return (
                  <button key={s} type="button" onClick={function () { setQ(s); think(s); }} className="h-9 rounded-full border border-cyan-400/35 px-3 text-[11px] text-cyan-300">
                    seguir: {s}
                  </button>
                );
              })}
            </div>
          )}
          {out && (""",
        1,
    )
    print("ok follow chips")
op.write_text(o, encoding="utf-8")

kb = Path("src/DigitalBoostPulseKB.ts")
if kb.is_file():
    t = kb.read_text(encoding="utf-8")
    repls = [
        ("¿Qué frente? Ventas, pedidos, stock o health. Una cosa a la vez.",
         "Estoy en el tablero. Elegí un frente o pedime un briefing — yo tiro números y el próximo golpe."),
        ("No enganché el frente. Proba ventas, pedidos, stock, health, hero o campaña.",
         "No enganché el frente. Tirame ventas, 1048, stock, o tocá briefing."),
        ("El cuello no es la vitrina.",
         "El cuello no es la vitrina. ¿Despacho o stock?"),
    ]
    n = 0
    for a, b in repls:
        if a in t:
            t = t.replace(a, b)
            n += 1
    kb.write_text(t, encoding="utf-8")
    print("ok copy", n)
print("LISTO IX")
print("Despues de cada respuesta: 3 chips seguir:")
