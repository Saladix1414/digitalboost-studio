#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
if "const [sel, setSel]" not in d:
    d = d.replace(
        "const [tab, setTab] = useState(null as string | null);",
        "const [tab, setTab] = useState(null as string | null);\n  const [sel, setSel] = useState(0);",
        1,
    )
    if "const [sel, setSel]" not in d:
        d = d.replace(
            "const [open, setOpen] = useState(false);",
            "const [open, setOpen] = useState(false);\n  const [sel, setSel] = useState(0);",
            1,
        )
    print("ok state")
else:
    print("ya state")

if "setSel(i)" not in d:
    d = d.replace(
        "<div key={i} className={",
        '<div key={i} onClick={function () { setSel(i); setTab("insp"); }} className={',
        1,
    )
    d = d.replace(
        "<div key={i} className={mut",
        '<div key={i} onClick={function () { setSel(i); setTab("insp"); }} className={mut',
        1,
    )
    print("ok click")

# inspector uses selected block
if "blocks[sel]" not in d and "db-insp-title" in d:
    d = d.replace(
        '<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Bloque · Hero · {facts.page}</p>',
        '<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Bloque · {(blocks[sel] && (blocks[sel].type || blocks[sel].kind)) || "hero"} · {sel + 1}/{blocks.length}</p>',
        1,
    )
    d = d.replace(
        "defaultValue={facts.heroTitle} key={facts.heroTitle}",
        "defaultValue={(blocks[sel] && blocks[sel].title) || facts.heroTitle} key={sel + '-' + ((blocks[sel] && blocks[sel].title) || '')}",
        1,
    )
    d = d.replace(
        "defaultValue={facts.heroBody} key={facts.heroBody}",
        "defaultValue={(blocks[sel] && (blocks[sel].body || blocks[sel].text)) || facts.heroBody} key={sel + '-b'}",
        1,
    )
    d = d.replace(
        'defaultValue={facts.heroCta || "Entrar"} key={facts.heroCta}',
        'defaultValue={(blocks[sel] && blocks[sel].cta) || facts.heroCta || "Entrar"} key={sel + "-c"}',
        1,
    )
    print("ok bind")
p.write_text(d, encoding="utf-8")
print("LISTO SEL")
