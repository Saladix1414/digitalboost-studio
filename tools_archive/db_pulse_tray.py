#!/usr/bin/env python3
from pathlib import Path

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("cd digitalboost-studio")
o = op.read_text(encoding="utf-8")

if "const TRAY" not in o:
    o = o.replace(
        "const showGo = out && !out.card && !builder && out.action !== \"dashboard\";",
        """const showGo = out && !out.card && !builder && out.action !== "dashboard";
  const TRAY = builder
    ? [["golpe", "Siguiente golpe"], ["mapa", "Mapa"], ["diff", "Diff"], ["hero", "Hero"], ["theme", "Theme"]]
    : [["golpe", "Siguiente golpe"], ["inspeccionar", "Inspect"], ["pedidos", "Pedidos"], ["stock", "Stock"], ["plan", "Plan"]];""",
        1,
    )
    if "const TRAY" not in o:
        o = o.replace(
            "function exec() {",
            """const TRAY = builder
    ? [["golpe", "Siguiente golpe"], ["mapa", "Mapa"], ["diff", "Diff"], ["hero", "Hero"], ["theme", "Theme"]]
    : [["golpe", "Siguiente golpe"], ["inspeccionar", "Inspect"], ["pedidos", "Pedidos"], ["stock", "Stock"], ["plan", "Plan"]];
  function exec() {""",
            1,
        )

block = '''        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {TRAY.map(function (pair) {
              return (
                <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="h-8 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 text-[11px] text-cyan-200">
                  {pair[1]}
                </button>
              );
            })}
          </div>
          <form'''

if "TRAY.map" not in o:
    if '        <div className="border-t border-white/10 p-3">\n          <form' in o:
        o = o.replace(
            '        <div className="border-t border-white/10 p-3">\n          <form',
            block,
            1,
        )
        print("ok tray")
    elif '<div className="border-t border-white/10 p-3">' in o:
        o = o.replace(
            '<div className="border-t border-white/10 p-3">',
            '''<div className="border-t border-white/10 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {TRAY.map(function (pair) {
              return (
                <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="h-8 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 text-[11px] text-cyan-200">
                  {pair[1]}
                </button>
              );
            })}
          </div>''',
            1,
        )
        print("ok tray alt")
    else:
        print("WARN no encontre el footer del chat")
else:
    print("tray ya estaba")

# empty-state mention
o = o.replace(
    "Estoy en el canvas de {c0.store}. Decime si tocamos el hero, el theme o los CTA.",
    "Estoy en el canvas de {c0.store}. Abajo tenés las herramientas: golpe, mapa, diff, hero, theme.",
)
o = o.replace(
    "Estoy en {c0.store}. ¿El pulso del día, un pedido, o el hero?",
    "Estoy en {c0.store}. Elegí una herramienta abajo o escribí.",
)

op.write_text(o, encoding="utf-8")
print("LISTO TRAY")
print("OS: golpe · inspect · pedidos · stock · plan")
print("Canvas: golpe · mapa · diff · hero · theme")
