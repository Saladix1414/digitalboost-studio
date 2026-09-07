#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
cc = src / "DigitalBoostCommandCenter.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

if cc.is_file():
    shutil.copy2(cc, cc.with_name("DigitalBoostCommandCenter.before_visual_rebuild_" + stamp + ".tsx"))
    t = cc.read_text(encoding="utf-8")
    if "onOpenConsole" not in t:
        t = t.replace(
            "onOpenNotes?: () => void;",
            "onOpenNotes?: () => void;\n  onOpenConsole?: () => void;",
            1,
        )
        if "onOpenConsole?: () => void;" not in t:
            t = t.replace(
                "onOpenAI: () => void;",
                "onOpenAI: () => void;\n  onOpenConsole?: () => void;",
                1,
            )
        t = t.replace(
            "else if (id === \"ai\") props.onOpenAI();",
            "else if (id === \"ai\") props.onOpenAI();\n    else if (id === \"console\" && props.onOpenConsole) props.onOpenConsole();",
            1,
        )
        if 'id === "console"' not in t:
            t = t.replace(
                "if (id === \"ai\") props.onOpenAI();",
                "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"console\" && props.onOpenConsole) props.onOpenConsole();",
                1,
            )
    if 'id: "console"' not in t:
        t = t.replace(
            '{ id: "ai", label: "Open AI Operator"',
            '{ id: "console", label: "Open Operations Console", k: "console operaciones log" },\n  { id: "ai", label: "Open AI Operator"',
            1,
        )
    cc.write_text(t, encoding="utf-8")
    print("ok command center")
else:
    print("skip command center (no file)")

w = ws.read_text(encoding="utf-8")
w = w.replace('from "./DigitalBoostConsole"', 'from "./DigitalBoostConsole.tsx"')
if "onOpenConsole={() => setShowConsole(true)}" not in w:
    if "onOpenAI={() => setShowAI(true)}" in w:
        w = w.replace(
            "onOpenAI={() => setShowAI(true)}",
            "onOpenAI={() => setShowAI(true)} onOpenConsole={() => setShowConsole(true)}",
            1,
        )
if "showConsole" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showConsole, setShowConsole] = useState(false);",
        1,
    )
if "<DigitalBoostConsole" not in w:
    w = w.replace(
        "{showAI &&",
        "{showConsole && (<DigitalBoostConsole onClose={() => setShowConsole(false)} />)}\n      {showAI &&",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")
print("LISTO OPEN CONSOLE")
print("Ctrl+K -> Open Operations Console")
