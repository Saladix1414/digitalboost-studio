#!/usr/bin/env python3
import shutil, sys
from datetime import datetime
from pathlib import Path

ROOT = Path.cwd()
SRC = ROOT / "src"

def bak(path):
    d = ROOT / "backups" / datetime.now().strftime("db-patch-%Y%m%d-%H%M%S")
    d.mkdir(parents=True, exist_ok=True)
    dest = d / path.name
    shutil.copy2(path, dest)
    print("backup", dest)

def span(text, start, end, new):
    a = text.find(start)
    b = text.find(end, a)
    if a < 0 or b < 0:
        raise SystemExit("no encuentro bloque " + start)
    return text[:a] + new + text[b:]

def patch_qwen():
    brain = SRC / "DigitalBoostPulseBrain.ts"
    server = SRC / "server" / "DigitalBoostOpenClawServer.ts"
    bak(brain); bak(server)
    bt = brain.read_text(encoding="utf-8")
    st = server.read_text(encoding="utf-8")
    prompt = (
        "    const prompt = [\n"
        '      "Rol: socio de la tienda. Idioma: espanol rioplatense.",\n'
        '      "Hechos:",\n'
        '      "- tienda " + String(input.store || "Nimbus"),\n'
        '      "- pagina " + String(input.page || "Inicio"),\n'
        '      "- hero " + String(input.heroTitle || "sin titulo"),\n'
        '      "Pedido: " + String(input.q || "hola"),\n'
        '      "Escribe 4 oraciones. Propone. No apliques. No uses JSON.",\n'
        '    ].join("\\n");\n\n'
    )
    sysb = (
        '      const systemInstruction = "Espanol. Propone. No ejecutes.";\n'
        '      const finalPrompt = systemInstruction + "\\n\\n" + prompt;\n\n'
    )
    brain.write_text(span(bt, "    const prompt = [", "    const ai = await bridge.runTask", prompt), encoding="utf-8")
    server.write_text(span(st, "      const systemInstruction", "      const result = await runOpenClaw", sysb), encoding="utf-8")
    print("OK qwen-prompt")

PATCHES = {"qwen-prompt": patch_qwen}

if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "qwen-prompt"
    PATCHES[name]()
