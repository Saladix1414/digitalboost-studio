#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
n = 0
if "blocks.filter(passFilt).map(function (b: any, i: number)" in d:
    d = d.replace(
        "blocks.filter(passFilt).map(function (b: any, i: number) {",
        "blocks.map(function (b: any, i: number) { if (!passFilt(b)) return null;",
        1,
    )
    n += 1
    print("ok index")
elif "if (!passFilt(b)) return null" in d:
    print("ya index")
else:
    print("no match map")
p.write_text(d, encoding="utf-8")
print("LISTO FILT2", n)

