#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

rt = src / "DigitalBoostPulseRouter.ts"
if rt.is_file():
    t = rt.read_text(encoding="utf-8")
    if "publicar" not in t:
        t = t.replace(
            "if (hit(q, [\"rango\", \"7d\", \"30d\", \"90d\", \"comparar ventas\"])) {",
            "if (hit(q, ['publicar', 'publish', 'aire', 'lanzar'])) {\n"
            "    const ok = f.score >= 70 && !f.genericHero;\n"
            "    return finish(input, { title: 'PULSE · Publicar', body: toolScoreLine(f) + '. ' + (ok ? 'El fold esta listo para Preview. Publicar no dispara campana ni cambia precios (eso seria L3).' : 'Todavia no: ' + (f.notes.join(', ') || 'sube el score') + '. Hero y CTA primero.'), action: 'website-builder', label: 'Seguir en el canvas' });\n"
            "  }\n"
            "  if (hit(q, [\"rango\", \"7d\", \"30d\", \"90d\", \"comparar ventas\"])) {",
            1,
        )
        rt.write_text(t, encoding="utf-8")
        print("ok publicar")
    else:
        print("ya publicar")
else:
    print("skip router")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if "publicar:" not in o:
        o = o.replace(
            "hola: \"Hola\"",
            "hola: \"Hola\",\n  publicar: \"Podemos publicar?\"",
            1,
        )
        op.write_text(o, encoding="utf-8")
        print("ok say publicar")

dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    if "db-open-pulse" not in d:
        d = d.replace(
            "{facts.notes.map(function (n) { return <p key={n} className=\"text-amber-200\">· {n}</p>; })}",
            "{facts.notes.map(function (n) { return <p key={n} className=\"text-amber-200\">· {n}</p>; })}\n"
            "                <button type=\"button\" className=\"mt-3 h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]\" onClick={function () { try { localStorage.setItem('db-pulse-seed', 'inspeccionar'); window.dispatchEvent(new Event('db-open-pulse')); } catch {} }}>Preguntar a PULSE</button>",
            1,
        )
        if "db-open-pulse" not in d:
            d = d.replace(
                "<p className=\"font-semibold\">Problems · {facts.score}/100</p>",
                "<p className=\"font-semibold\">Problems · {facts.score}/100</p>\n"
                "                <button type=\"button\" className=\"mt-3 h-10 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]\" onClick={function () { try { localStorage.setItem('db-pulse-seed', 'inspeccionar'); window.dispatchEvent(new Event('db-open-pulse')); } catch {} }}>Preguntar a PULSE</button>",
                1,
            )
        dock.write_text(d, encoding="utf-8")
        print("ok problems->pulse")
    else:
        print("ya pulse btn")

# OS tray includes publicar if TRAY exists
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if '["publicar"' not in o and "Siguiente golpe" in o:
        o = o.replace(
            '[["golpe", "Siguiente golpe"], ["mapa", "Mapa"], ["diff", "Diff"], ["hero", "Hero"], ["theme", "Theme"]]',
            '[["golpe", "Siguiente golpe"], ["mapa", "Mapa"], ["diff", "Diff"], ["hero", "Hero"], ["publicar", "Publicar"]]',
            1,
        )
        op.write_text(o, encoding="utf-8")
        print("ok tray publicar")

print("LISTO GO")
print("PULSE: escribir publicar")
print("Studio Problems: Preguntar a PULSE")
