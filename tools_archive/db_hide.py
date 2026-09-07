#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

repls = [
    ("{blocks.map((b) => {", "{blocks.filter(function (b) { return !(b && b.hidden); }).map((b) => {"),
    ("{blocks.map((b) => (", "{blocks.filter(function (b) { return !(b && b.hidden); }).map((b) => ("),
    ("blocks.map((block) => {", "blocks.filter(function (block) { return !(block && block.hidden); }).map((block) => {"),
    ("blocks.map((block) => (", "blocks.filter(function (block) { return !(block && block.hidden); }).map((block) => ("),
    ("{blocks.map((b, i) => {", "{blocks.filter(function (b) { return !(b && b.hidden); }).map((b, i) => {"),
]
nfiles = 0
for f in list(src.glob("*.tsx")) + list(src.glob("**/*.tsx")):
    t = f.read_text(encoding="utf-8")
    if "blocks.map" not in t:
        continue
    if "b.hidden" in t or "block.hidden" in t:
        print("ya", f.name)
        continue
    orig = t
    for a, b in repls:
        t = t.replace(a, b)
    if t != orig:
        f.write_text(t, encoding="utf-8")
        print("ok hide", f.name)
        nfiles += 1
print("archivos", nfiles)

dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    if "oculto" not in d:
        d = d.replace(
            "{mute ? \"sin CTA\" : \"CTA\"}",
            "{(b && b.hidden) ? \"oculto\" : (mute ? \"sin CTA\" : \"CTA\")}",
            1,
        )
        dock.write_text(d, encoding="utf-8")
        print("ok badge")
print("LISTO HIDE")
