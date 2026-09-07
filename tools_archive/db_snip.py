#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    old = "applyPulseDraft({ kind: s.kind, title: s.title, body: s.body, cta: s.cta });"
    new = "if (s.kind === 'hero' || s.id === 'hero') applyPulseDraft({ kind: 'hero', title: s.title, body: s.body, cta: s.cta }); else appendPulseBlock({ type: s.id || 'cta', title: s.title, body: s.body, cta: s.cta });"
    if old in d:
        d = d.replace(old, new, 1)
        print("ok snip append")
    elif "appendPulseBlock" in d and "s.kind === 'hero'" in d:
        print("ya snip")
    else:
        print("no match snip")
    dock.write_text(d, encoding="utf-8")
else:
    print("skip dock")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if "publicar:" not in o:
        o = o.replace('hola: "Hola"', 'hola: "Hola", publicar: "Podemos publicar?"', 1)
        print("ok say")
    if '["publicar"' not in o:
        o = o.replace(
            '["theme", "Theme"]',
            '["theme", "Theme"], ["publicar", "Publicar"]',
            1,
        )
        print("ok tray")
    op.write_text(o, encoding="utf-8")
print("LISTO SNIP")
