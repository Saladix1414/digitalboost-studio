#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostPulseTools.ts")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")
t = t.replace(
    "const genericHero = !heroTitle || (heroTitle.length < 8) || (/extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(heroTitle);",
    "const genericHero = !heroTitle || heroTitle.length < 8 || /extraordinario|welcome|bienvenid|lorem|crea algo|nueva tienda|hello world/i.test(heroTitle);",
)
if "indexOf('permiso')" not in t and 'indexOf("permiso")' not in t:
    t = t.replace(
        "if (genericHero) { score -= 15; notes.push(\"Hero de plantilla\"); } else score += 12;",
        "if (heroTitle.indexOf('permiso') !== -1) { score += 12; } else if (genericHero) { score -= 15; notes.push('Hero de plantilla'); } else score += 12;",
        1,
    )
p.write_text(t, encoding="utf-8")
print("ok tools", p.stat().st_size)
