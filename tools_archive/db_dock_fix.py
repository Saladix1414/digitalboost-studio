#!/usr/bin/env python3
from pathlib import Path

p = Path("src/StoreBuilderWorkspace.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
w = p.read_text(encoding="utf-8")

# 1) revert the broken return wrap
for bad in (
    "return (<><DigitalBoostStudioDock />",
    "return (<DigitalBoostStudioDock />",
    "return (<><DigitalBoostStudioDock/>",
):
    if bad in w:
        w = w.replace(bad, "return (", 1)
        print("ok revert return")

# 2) pull dock out of adjacent pairs, we'll remount once
w = w.replace("<DigitalBoostStudioDock />", "")
w = w.replace("<DigitalBoostStudioDock/>", "")

# 3) mount as sibling of Operator — that node already lives inside a parent
if "<DigitalBoostOperator" in w:
    w = w.replace("<DigitalBoostOperator", "<DigitalBoostStudioDock /><DigitalBoostOperator", 1)
    print("ok mount beside Operator")
elif "<DigitalBoostOsKpiPaint" in w:
    w = w.replace(
        "<DigitalBoostOsKpiPaint />",
        "<><DigitalBoostOsKpiPaint /><DigitalBoostStudioDock /></>",
        1,
    )
    print("ok mount with fragment around KPI")
else:
    print("WARN no ancla — el import queda, montalo a mano dentro de un <div>")

# 4) keep a single import
lines = w.splitlines(True)
kept = []
seen = 0
for ln in lines:
    if 'from "./DigitalBoostStudioDock"' in ln or "from './DigitalBoostStudioDock'" in ln:
        seen += 1
        if seen > 1:
            continue
        if "DigitalBoostStudioDock" not in "".join(kept[:40]) and "import DigitalBoostStudioDock" not in ln:
            pass
    kept.append(ln)
w = "".join(kept)
if "from \"./DigitalBoostStudioDock\"" not in w and "from './DigitalBoostStudioDock'" not in w:
    w = 'import DigitalBoostStudioDock from "./DigitalBoostStudioDock";\n' + w
    print("ok import")

p.write_text(w, encoding="utf-8")
print("LISTO FIX DOCK")
print("Si Vite sigue en rojo, recarga fuerte")
