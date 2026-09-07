#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
if '["insp"' not in d and "['insp'" not in d:
    d = d.replace('["export", "Export"]', '["export", "Export"], ["insp", "Inspector"]', 1)
    print("ok tab")
else:
    print("ya tab")

panel = (
    '{tab === "insp" && ('
    '<div className="space-y-2">'
    '<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Bloque · Hero · ' + '{facts.page}</p>'
    '<label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Titulo</label>'
    '<input id="db-insp-title" className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" defaultValue={facts.heroTitle} key={facts.heroTitle} />'
    '<label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Cuerpo</label>'
    '<textarea id="db-insp-body" className="min-h-16 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" defaultValue={facts.heroBody} key={facts.heroBody} />'
    '<label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Boton</label>'
    '<input id="db-insp-cta" className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" defaultValue={facts.heroCta || "Entrar"} key={facts.heroCta} />'
    '<button type="button" className="h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]" onClick={function () {'
    ' const title = (document.getElementById("db-insp-title") as HTMLInputElement).value;'
    ' const body = (document.getElementById("db-insp-body") as HTMLTextAreaElement).value;'
    ' const cta = (document.getElementById("db-insp-cta") as HTMLInputElement).value;'
    ' applyPulseDraft({ kind: "hero", title: title, body: body, cta: cta });'
    " }}>Aplicar al canvas</button>"
    '<p className="text-[11px] text-[#AFC0D5]">L1 · History / Export · Deshacer</p>'
    "</div>)}"
)
if '{tab === "insp"' not in d:
    mark = '{tab === "export"'
    i = d.find(mark)
    if i < 0:
        print("no export, append fail")
    else:
        j = d.find(")}", i)
        if j < 0:
            print("no close")
        else:
            d = d[: j + 2] + panel + d[j + 2 :]
            print("ok panel")
else:
    print("ya panel")
p.write_text(d, encoding="utf-8")
print("LISTO INSP")
