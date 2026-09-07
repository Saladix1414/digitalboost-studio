#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
for f in list(src.glob("*.tsx"))+list(src.glob("*.ts")):
    txt=f.read_text(encoding="utf-8")
    orig=txt
    txt=txt.replace("AURA","NIMBUS").replace("Aura","Nimbus").replace("aura","nimbus")
    txt=re.sub(r'aura\.com','nimbus.store',txt,flags=re.I)
    if txt!=orig:
        f.write_text(txt,encoding="utf-8")
        print(f"→ {f.name}")
