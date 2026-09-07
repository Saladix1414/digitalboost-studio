#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")
first = t.find("let dockRoot")
second = t.find("let dockRoot", first + 1) if first != -1 else -1
if second != -1:
    t = t[:second]
    print("ok corte segundo dockRoot")
elif first == -1:
    print("no habia dockRoot")

if "export default Dock" not in t:
    t = t.rstrip() + "\nexport default Dock;\n"
    print("ok export")

# una sola function boot
b1 = t.find("function boot()")
b2 = t.find("function boot()", b1 + 1) if b1 != -1 else -1
if b2 != -1 and (second == -1):
    t = t[:b2]
    if "export default Dock" not in t:
        t += "\nexport default Dock;\n"
    print("ok corte segundo boot")

p.write_text(t, encoding="utf-8")
print("LISTO DEDUPE")
print("dockRoot count", p.read_text(encoding="utf-8").count("let dockRoot"))
