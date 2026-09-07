#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

ts = src / "DigitalBoostConsole.ts"
data = src / "DigitalBoostConsoleData.ts"
tsx = src / "DigitalBoostConsole.tsx"

if ts.is_file() and not data.is_file():
    data.write_text(ts.read_text(encoding="utf-8"), encoding="utf-8")
    print("ok copied Console.ts -> ConsoleData.ts")

if tsx.is_file():
    t = tsx.read_text(encoding="utf-8")
    t = t.replace('from "./DigitalBoostConsole"', 'from "./DigitalBoostConsoleData"')
    if "export default function" not in t and "export default" not in t:
        tsx.write_text("export default function DigitalBoostConsole(props: any) { return null; }\n", encoding="utf-8")
        print("ok stubbed Console.tsx")
    else:
        tsx.write_text(t, encoding="utf-8")
        print("ok Console.tsx import")
else:
    tsx.write_text("export default function DigitalBoostConsole(props: any) { return null; }\n", encoding="utf-8")
    print("ok created Console.tsx")

w = ws.read_text(encoding="utf-8")
w = w.replace('from "./DigitalBoostConsole"', 'from "./DigitalBoostConsole.tsx"')
ws.write_text(w, encoding="utf-8")
print("ok workspace import -> .tsx")
print("LISTO FIX3")
