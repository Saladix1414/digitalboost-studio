#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
ws = src / "StoreBuilderWorkspace.tsx"
t = ws.read_text(encoding="utf-8")
if 'digitalboost-tokens.css' not in t:
    t = t.replace(
        "import './store-builder-vibrant-global.css';",
        "import './digitalboost-tokens.css';\nimport './commerce-os-navy-identity.css';\nimport './store-builder-vibrant-global.css';"
    )
    if 'digitalboost-tokens.css' not in t:
        t = t.replace(
            "import './store-builder-visual-v2.css';",
            "import './digitalboost-tokens.css';\nimport './commerce-os-navy-identity.css';\nimport './store-builder-visual-v2.css';"
        )
ws.write_text(t, encoding="utf-8")
print("✅ Workspace tokens")

ov = src / "CommerceOSOverview.tsx"
ot = ov.read_text(encoding="utf-8")
ot = ot.replace("Experiencia lista para evolucionar", "Nimbus Store · lista para evolucionar")
ov.write_text(ot, encoding="utf-8")
print("✅ Overview texto Nimbus")
