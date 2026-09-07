#!/usr/bin/env python3
from pathlib import Path

kb = Path("src/DigitalBoostPulseKB.ts")
t = kb.read_text(encoding="utf-8")
if "Estudio listo" not in t and "canvas Aura" not in t:
    t = t.replace(
        "export function decide(input: PulseInput): PulseDecision {",
        """export function decide(input: PulseInput): PulseDecision {
  const inStudio = input.section === "website-builder" || input.section === "store-builder" || input.section === "builder";
  const qn = expand((input.q || "").toLowerCase().trim());
  if (inStudio && (!qn || qn.indexOf("hola") !== -1 || qn.indexOf("quien") !== -1 || qn.indexOf("sos") !== -1)) {
    return { title: "PULSE Design", body: "Estamos en el canvas de " + input.store + ". El hero sigue genérico. ¿Lo reescribimos, cambiamos theme, o miramos los CTA?", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
  }
""",
        1,
    )
    kb.write_text(t, encoding="utf-8")
    print("ok studio hola")
else:
    print("kb hola ok")

op = Path("src/DigitalBoostOperator.tsx")
o = op.read_text(encoding="utf-8")
if "¿Reescribimos el hero?" not in o:
    o = o.replace(
        "function think(word: string) {",
        """function follows(action: string) {
    if (action === "website-builder" || action.indexOf("website") !== -1 || builder) {
      return [["hero", "¿Reescribimos el hero?"], ["theme", "¿Probamos Noir?"], ["conversion", "¿Dónde falta el CTA?"]];
    }
    if (action === "orders") return [["plan", "¿Cerramos el 1047?"], ["stock", "¿Reponemos el cap?"], ["alerta", "¿Qué más está rojo?"]];
    if (action === "analytics") return [["stock", "¿El recorte es stock?"], ["plan", "Armame el orden del día"], ["pedidos", "¿Y los envíos?"]];
    if (action === "__health") return [["plan", "Dame el orden"], ["stock", "Vamos al cap"], ["pedidos", "Vamos a 1047"]];
    return [["briefing", "¿Cómo está el día?"], ["plan", "¿Por dónde empiezo?"], ["alerta", "¿Qué está en rojo?"]];
  }
  function think(word: string) {""",
        1,
    )
    # replace the follow chips map of strings
    start = o.find("out.action === \"orders\" ? [\"plan\"")
    if start == -1:
        start = o.find("out.action === \"orders\" ? [\"plan\", \"stock\", \"alerta\"]")
    if "seguir: {s}" in o:
        o = o.replace(
            """{(
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
              })}""",
            """{follows(out.action).map(function (pair) {
                return (
                  <button key={pair[0]} type="button" onClick={function () { setQ(pair[0]); think(pair[0]); }} className="max-w-full rounded-full border border-cyan-400/35 px-3 py-2 text-left text-[11px] leading-4 text-cyan-200">
                    {pair[1]}
                  </button>
                );
              })}""",
            1,
        )
        print("ok questions")
    elif "seguir:" in o:
        print("WARN chips distintos, no toque el map")
    else:
        print("WARN no encontre chips")
op.write_text(o, encoding="utf-8")
print("LISTO HUMAN")
