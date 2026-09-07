#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

cc = Path("src/DigitalBoostCommandCenter.tsx")
if not cc.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(cc, cc.with_name("DigitalBoostCommandCenter.before_visual_rebuild_" + stamp + ".tsx"))

t = cc.read_text(encoding="utf-8")
old = 'className="h-9 rounded-full border border-white/10 px-3 text-[11px] text-cyan-300"'
new = 'className="fixed bottom-4 right-4 z-[90] h-12 rounded-full bg-cyan-400 px-4 text-sm font-semibold text-[#070D18] shadow-lg"'
if old in t:
    t = t.replace(old, new, 1)
    print("ok fab class")
else:
    t = t.replace(
        ">Cmd</button>",
        ' className="fixed bottom-4 right-4 z-[90] h-12 rounded-full bg-cyan-400 px-4 text-sm font-semibold text-[#070D18] shadow-lg">Cmd</button>',
        1,
    )
    print("ok fab fallback")
cc.write_text(t, encoding="utf-8")
print("LISTO CMD FAB")
print("Abajo a la derecha: Cmd")
