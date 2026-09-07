#!/usr/bin/env python3
from pathlib import Path

kb = Path("src/DigitalBoostPulseKB.ts")
br = Path("src/DigitalBoostPulseBrain.ts")
bt = br.read_text(encoding="utf-8")
kt = kb.read_text(encoding="utf-8") if kb.is_file() else ""

if "export function explain" not in kt and "export { explain }" not in kt:
    kb.write_text(kt + r"""

export function explain(input: PulseInput): PulseDecision {
  return {
    title: "PULSE · Debug",
    body: "Query «" + (input.q || "") + "». Debug activo.",
    action: "dashboard",
    actionLabel: "Seguir acá",
    confirm: false
  };
}
""", encoding="utf-8")
    print("ok stub explain KB")

if "explain" not in bt:
    if "from \"./DigitalBoostPulseKB\"" in bt:
        bt = bt.replace(
            'from "./DigitalBoostPulseKB";',
            'from "./DigitalBoostPulseKB";',
            1,
        )
        if "explain" not in bt.split("from")[0]:
            bt = bt.replace(
                "decide, type PulseInput",
                "decide, explain, type PulseInput",
                1,
            )
            bt = bt.replace(
                "import { decide, type PulseInput, type PulseDecision }",
                "import { decide, explain, type PulseInput, type PulseDecision }",
                1,
            )
    if "export { explain }" not in bt:
        bt += "\nexport { explain };\n"
    br.write_text(bt, encoding="utf-8")
    print("ok reexport")
else:
    if "export { explain }" not in bt and "export function explain" not in bt:
        if "explain," in bt or "explain }" in bt.split("from")[0]:
            br.write_text(bt + "\nexport { explain };\n", encoding="utf-8")
            print("ok export line")
        else:
            br.write_text(bt.replace(
                'from "./DigitalBoostPulseKB";',
                'from "./DigitalBoostPulseKB";',
            ) + "\nexport { explain } from \"./DigitalBoostPulseKB\";\n", encoding="utf-8")
            print("ok export from kb")
    else:
        print("brain ya exporta?")

# force
bt = br.read_text(encoding="utf-8")
if "export { explain }" not in bt and "export function explain" not in bt:
    br.write_text(bt.rstrip() + "\nexport { explain } from \"./DigitalBoostPulseKB\";\n", encoding="utf-8")
    print("ok force reexport")
print("LISTO EXPLAIN")
