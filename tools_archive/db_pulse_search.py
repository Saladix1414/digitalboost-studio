#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
brain = src / "DigitalBoostPulseBrain.ts"
op = src / "DigitalBoostOperator.tsx"
ws = src / "StoreBuilderWorkspace.tsx"
if not brain.is_file() or not op.is_file():
    raise SystemExit("Falta brain u operator")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(brain, brain.with_name("DigitalBoostPulseBrain.before_visual_rebuild_" + stamp + ".ts"))

b = brain.read_text(encoding="utf-8")
if '"__search"' not in b:
    b = b.replace(
        "if (q.indexOf(\"health\") !== -1",
        """if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1 || q.indexOf("1048") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search del OS.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("health") !== -1""",
        1,
    )
    brain.write_text(b, encoding="utf-8")
    print("ok brain")
else:
    print("brain ya tenia search")

t = op.read_text(encoding="utf-8")
t = t.replace(
    "onOpenIntegrations?: () => void;",
    "onOpenIntegrations?: () => void;\n  onOpenSearch?: () => void;",
    1,
)
if 'out.action === "__search"' not in t:
    t = t.replace(
        'else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();',
        'else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();\n    else if (out.action === "__search" && props.onOpenSearch) props.onOpenSearch();',
        1,
    )
if 'builder ? ["hola", "hero"' in t:
    t = t.replace(
        '["hola", "ventas", "pedidos", "health", "campaña"]',
        '["hola", "ventas", "pedidos", "health", "buscar"]',
        1,
    )
op.write_text(t, encoding="utf-8")
print("ok operator")

if ws.is_file():
    w = ws.read_text(encoding="utf-8")
    chunk = w[w.find("<DigitalBoostOperator"):w.find("<DigitalBoostOperator")+800]
    if "onOpenSearch" not in chunk:
        w = w.replace(
            "<DigitalBoostOperator ",
            "<DigitalBoostOperator onOpenSearch={() => setShowSearch(true)} ",
            1,
        )
        print("ok workspace")
    ws.write_text(w, encoding="utf-8")
print("LISTO PULSE SEARCH")
print("PULSE chip buscar / escribi 1048")
