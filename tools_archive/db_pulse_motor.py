#!/usr/bin/env python3
from pathlib import Path

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("Falta Operator")
t = op.read_text(encoding="utf-8")
t = t.replace(
    'from "./DigitalBoostPulseBrain";',
    'from "./DigitalBoostPulseBrain";',
    1,
)
if "analyzeSmart" not in t:
    t = t.replace("analyze,", "analyzeSmart,")
    t = t.replace("from \"./DigitalBoostPulseBrain\"", "from \"./DigitalBoostPulseBrain\"")
if "analyzeSmart" not in t.split("from")[0]:
    t = t.replace(
        "import { analyze, isBuilder, type PulseDecision }",
        "import { analyzeSmart, isBuilder, type PulseDecision }",
    )
    t = t.replace(
        "import { analyze, isBuilder, type PulseDecision } from \"./DigitalBoostPulseBrain\";",
        "import { analyzeSmart, isBuilder, type PulseDecision } from \"./DigitalBoostPulseBrain\";",
    )
# force async speak/run if still sync analyze(
t = t.replace(
    "analyze({ q:",
    "/* use smart */ analyze({ q:",
)
if "await analyzeSmart" not in t:
    print("WARN reescribo run via marca")
# engine always visible
if "motor:" not in t:
    t = t.replace(
        "{(builder ? \"Estudio · canvas\" : \"Operador · \" + section) + (engine === \"ollama\" ? \" · llama\" : \" · reglas\")}",
        '{(builder ? "Estudio · canvas" : "Operador · " + section) + " · motor " + engine}',
    )
    t = t.replace(
        '{builder ? "Estudio · canvas" : "Operador · " + section}',
        '{(builder ? "Estudio · canvas" : "Operador · " + section) + " · motor " + (engine || "rules")}',
    )
op.write_text(t, encoding="utf-8")
print("analyzeSmart", "analyzeSmart" in t, "await", "await analyzeSmart" in t)
print("LISTO MOTOR")
