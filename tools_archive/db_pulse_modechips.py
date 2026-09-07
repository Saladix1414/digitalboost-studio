#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("Falta DigitalBoostOperator.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))
t = op.read_text(encoding="utf-8")
old = 'const CHIPS = ["hola", "ventas", "pedidos", "health", "campaña"];'
new = 'const CHIPS = builder ? ["hola", "hero", "conversion", "theme"] : ["hola", "ventas", "pedidos", "health", "campaña"];'
if old in t:
    t = t.replace(old, new, 1)
    print("ok mode chips")
else:
    t = t.replace(
        'const CHIPS = ["hola"',
        'const CHIPS = builder ? ["hola", "hero", "conversion", "theme"] : ["hola"',
        1,
    )
    if "builder ?" in t:
        print("ok mode chips alt")
    else:
        print("WARN no encontre CHIPS")
op.write_text(t, encoding="utf-8")
print("LISTO MODE CHIPS")
