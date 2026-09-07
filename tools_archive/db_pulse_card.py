#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

ov = Path("src/CommerceOSOverview.tsx")
if not ov.is_file():
    raise SystemExit("Falta CommerceOSOverview.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ov, ov.with_name("CommerceOSOverview.before_visual_rebuild_" + stamp + ".tsx"))
t = ov.read_text(encoding="utf-8")

# labels
t = t.replace("AI Operator", "PULSE")
t = t.replace("AI OPERADOR", "PULSE")
t = t.replace("¿Qué querés mejorar?", "¿Qué quiere PULSE tocar?")

# common button patterns
repls = [
    ('>Mejorar homepage<', ' onClick={() => onNavigate?.("website-builder")}>Mejorar homepage<'),
    ("Mejorar homepage", "Mejorar homepage"),
]
# if buttons already have onClick, don't double
if 'onNavigate?.("website-builder")' not in t and "Mejorar homepage" in t:
    t = t.replace(
        "Mejorar homepage",
        'Mejorar homepage',
        1,
    )
    # wrap: look for button that contains the text without onClick nearby
    if "Mejorar homepage" in t:
        t = t.replace(
            "<span>Mejorar homepage</span>",
            '<span>Mejorar homepage</span>',
            1,
        )

# brute: add onClick on lines that only contain the label as children
import re
def add_click(html, needle, code):
    if code in html:
        return html, False
    # <button ...> ... needle
    def repl(m):
        tag = m.group(0)
        if "onClick" in tag:
            return tag
        return tag.replace("<button", "<button onClick=" + code, 1)
    nhtml, n = re.subn(
        r"<button\b[^>]*>[^<]*" + re.escape(needle),
        repl,
        html,
        count=1,
    )
    return nhtml, n > 0

t, a = add_click(t, "Mejorar homepage", '{() => onNavigate?.("website-builder")}')
print("homepage btn", a)
t, b = add_click(t, "Crear campaña", '{() => onNavigate?.("campaigns")}')
if not b:
    t, b = add_click(t, "Crear campana", '{() => onNavigate?.("campaigns")}')
print("campaign btn", b)

# ensure prop name
if "onNavigate" not in t and "onSection" in t:
    t, a = add_click(t.replace("onNavigate", "onSection"), "Mejorar homepage", '{() => onSection("website-builder")}')

ov.write_text(t, encoding="utf-8")
print("LISTO PULSE CARD")
print("Overview -> Mejorar homepage / Crear campana")
