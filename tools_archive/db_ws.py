#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("index.html")
if not p.is_file():
    raise SystemExit("No estas en digitalboost-studio")
t = p.read_text(encoding="utf-8")
t2 = re.sub(r'\s*<script>\s*window\.addEventListener\("error"[\s\S]*?</script>', "", t)
if t2 == t:
    print("no habia overlay (ok)")
else:
    p.write_text(t2, encoding="utf-8")
    print("ok quite overlay agresivo")
print("LISTO WS")
