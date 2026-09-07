#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
ov = src / "CommerceOSOverview.tsx"
ws = src / "StoreBuilderWorkspace.tsx"
if not ov.is_file() or not ws.is_file():
    raise SystemExit("Faltan archivos")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ov, ov.with_name("CommerceOSOverview.before_visual_rebuild_" + stamp + ".tsx"))

t = ov.read_text(encoding="utf-8")
t = t.replace("AI Operator", "PULSE")
t = t.replace("AI OPERADOR", "PULSE")
if "onPulse?: () => void;" not in t:
    t = t.replace(
        "onNavigate?: (section: string) => void;",
        "onNavigate?: (section: string) => void;\n  onPulse?: () => void;",
        1,
    )
if "onPulse," not in t and "function CommerceOSOverview" in t:
    t = t.replace(
        "{ onNavigate, products, orders, customers }",
        "{ onNavigate, onPulse, products, orders, customers }",
        1,
    )
    t = t.replace(
        "{ onNavigate?: (section: string) => void; products?: any[]; orders?: any[]; customers?: any[] }",
        "{ onNavigate?: (section: string) => void; onPulse?: () => void; products?: any[]; orders?: any[]; customers?: any[] }",
        1,
    )

if 'onNavigate?.("website-builder")' not in t and "Mejorar homepage" in t:
    t = t.replace(
        'onClick={() => onNavigate?.("store-builder")}',
        'onClick={() => onNavigate?.("website-builder")}',
    )
    t = t.replace(
        'onClick={() => onNavigate("store-builder")}',
        'onClick={() => onNavigate("website-builder")}',
    )

if "Hablar con PULSE" not in t and "Crear campaña" in t:
    t = t.replace(
        "Crear campaña",
        """Crear campaña""",
        1,
    )
    # insert extra button after campaign block if a unique closer exists
    needle = "Crear campaña"
    # add a sibling button markup after the campaign button's closing
    if "onPulse" in t:
        extra = '''
                <button type="button" onClick={() => onPulse?.()} className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 p-3 text-left">
                  <div className="text-sm font-medium text-cyan-300">Hablar con PULSE</div>
                </button>'''
        # after Crear campaña button - find first </button> after the phrase
        i = t.find("Crear campaña")
        if i != -1:
            j = t.find("</button>", i)
            if j != -1 and "Hablar con PULSE" not in t:
                t = t[:j+9] + extra + t[j+9:]
                print("ok pulse button")
        else:
            print("skip extra btn")
    else:
        print("WARN onPulse no quedo en props")
ov.write_text(t, encoding="utf-8")
print("ok overview")

w = ws.read_text(encoding="utf-8")
if "onPulse={() => setShowAI(true)}" not in w:
    w = w.replace(
        "<CommerceOSOverview",
        "<CommerceOSOverview onPulse={() => setShowAI(true)} ",
        1,
    )
    print("ok workspace onPulse")
ws.write_text(w, encoding="utf-8")
print("LISTO PULSE OPEN")
