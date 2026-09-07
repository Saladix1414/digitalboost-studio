#!/usr/bin/env python3
from pathlib import Path
import time
src = Path("src")
app = src / "App.tsx"
if app.exists():
    t=app.read_text(encoding="utf-8")
    app.write_text(t + f"\n// bust {time.time()}\n", encoding="utf-8")
    print("✅ App.tsx tocado")
ws = src / "StoreBuilderWorkspace.tsx"
txt = ws.read_text(encoding="utf-8")
if 'commerce-os-navy-identity.css' not in txt:
    txt = txt.replace('import "./digitalboost-tokens.css";','import "./digitalboost-tokens.css";\nimport "./commerce-os-navy-identity.css";')
    ws.write_text(txt, encoding="utf-8")
    print("✅ navy identity al final")
