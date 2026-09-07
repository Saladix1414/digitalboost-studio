#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostPulseTools.ts")
t = p.read_text(encoding="utf-8")
old = "const genericHero = !heroTitle || (heroTitle.length < 8) || (/extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(heroTitle);"
new = "const genericHero = !heroTitle || heroTitle.length < 8 || /extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(heroTitle);"
if old not in t:
    # any broken version
    import re
    t2, n = re.subn(
        r"const genericHero = !heroTitle.*?;",
        new,
        t,
        count=1,
    )
    if n:
        t = t2
        print("ok regex")
    else:
        print("NO MATCH")
        for i, ln in enumerate(t.splitlines(), 1):
            if "genericHero" in ln:
                print(i, ln)
else:
    t = t.replace(old, new, 1)
    print("ok exact")
p.write_text(t, encoding="utf-8")
print("LISTO HERO")
