#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

def patch(path, old, new, label):
    p = Path(path)
    if not p.is_file():
        print("skip missing", path)
        return
    t = p.read_text(encoding="utf-8")
    if new.strip() and new in t and old not in t:
        print("ya", label)
        return
    if old not in t:
        print("no match", label)
        return
    p.write_text(t.replace(old, new, 1), encoding="utf-8")
    print("ok", label)

# 1) PULSE open => body class (el dock se esconde)
patch(
    "src/DigitalBoostOperator.tsx",
    "const scroller = useRef<HTMLDivElement | null>(null);",
    "const scroller = useRef<HTMLDivElement | null>(null);\n  useEffect(function () { document.body.classList.add('db-pulse-open'); return function () { document.body.classList.remove('db-pulse-open'); }; }, []);",
    "pulse body class",
)

# 2) Dock: z-index + safe area + hide if pulse
dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    d = d.replace("z-[70]", "z-[90]")
    d = d.replace("z-[80]", "z-[90]")
    d = d.replace("pb-3", "pb-[max(10px,env(safe-area-inset-bottom))]")
    if "db-pulse-open" not in d:
        d = d.replace(
            "const open = tab !== null;",
            "const open = tab !== null;\n  if (typeof document !== 'undefined' && document.body.classList.contains('db-pulse-open')) return null;",
        )
    dock.write_text(d, encoding="utf-8")
    print("ok dock z/safe/hide")

# 3) History snapshot before apply
app = src / "DigitalBoostPulseApply.ts"
if app.is_file():
    a = app.read_text(encoding="utf-8")
    if "db-store-history-v1" not in a:
        needle = "export function applyPulseDraft"
        i = a.find(needle)
        if i != -1:
            helper = (
                "function snapHistory() {\n"
                "  try {\n"
                "    const page = localStorage.getItem('db-store-page-v1') || 'Inicio';\n"
                "    const raw = localStorage.getItem('db-store-canvas-v1:' + page) || localStorage.getItem('db-store-canvas-v1') || '[]';\n"
                "    const hist = JSON.parse(localStorage.getItem('db-store-history-v1') || '[]');\n"
                "    hist.push({ t: Date.now(), page: page, raw: raw });\n"
                "    localStorage.setItem('db-store-history-v1', JSON.stringify(hist.slice(-12)));\n"
                "  } catch {}\n"
                "}\n"
            )
            a = a[:i] + helper + a[i:]
            a = a.replace(
                "export function applyPulseDraft(draft: PulseDraft) {",
                "export function applyPulseDraft(draft: PulseDraft) {\n  snapHistory();",
                1,
            )
            if "export function appendPulseBlock" in a:
                a = a.replace(
                    "export function appendPulseBlock(block: { type: string; title: string; body: string; cta: string }) {",
                    "export function appendPulseBlock(block: { type: string; title: string; body: string; cta: string }) {\n  snapHistory();",
                    1,
                )
            app.write_text(a, encoding="utf-8")
            print("ok history snap")
        else:
            print("no match apply")

# 4) Undo from dock export tab
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    if "db-store-history-v1" not in d:
        d = d.replace(
            'Copiar JSON del canvas</button>',
            'Copiar JSON del canvas</button>\n'
            '            <button type="button" className="mt-2 h-11 w-full rounded-lg border border-white/10" onClick={function () {\n'
            "              try {\n"
            "                const hist = JSON.parse(localStorage.getItem('db-store-history-v1') || '[]');\n"
            "                const last = hist.pop();\n"
            "                if (!last) return;\n"
            "                localStorage.setItem('db-store-history-v1', JSON.stringify(hist));\n"
            "                if (last.page) localStorage.setItem('db-store-page-v1', last.page);\n"
            "                localStorage.setItem('db-store-canvas-v1:' + (last.page || 'Inicio'), last.raw);\n"
            "                localStorage.setItem('db-store-canvas-v1', last.raw);\n"
            "                window.dispatchEvent(new Event('db-canvas-reload'));\n"
            "                const w = window as any; if (w.__dbSetBlocks) w.__dbSetBlocks(JSON.parse(last.raw));\n"
            "              } catch {}\n"
            '            }}>Deshacer ultimo apply</button>',
        )
        dock.write_text(d, encoding="utf-8")
        print("ok undo")

# 5) Inspect: permiso = no plantilla
tools = src / "DigitalBoostPulseTools.ts"
if tools.is_file():
    t = tools.read_text(encoding="utf-8")
    if "permiso" not in t.split("genericHero")[1][:400] if "genericHero" in t else "":
        t = t.replace(
            "const genericHero = !heroTitle || heroTitle.length < 8 || /extraordinario",
            "const genericHero = !heroTitle || (heroTitle.length < 8) || (/extraordinario",
            1,
        )
        # if previous replace made broken paren, skip - try additive
        if "indexOf('permiso')" not in t:
            t = t.replace(
                "if (genericHero) { score -= 15; notes.push(\"Hero de plantilla\"); } else score += 12;",
                "if (heroTitle && heroTitle.indexOf('permiso') !== -1) { score += 12; } else if (genericHero) { score -= 15; notes.push('Hero de plantilla'); } else score += 12;",
                1,
            )
            tools.write_text(t, encoding="utf-8")
            print("ok score permiso")
    else:
        print("ya score")

# 6) Studio briefing menciona el dock
sk = src / "DigitalBoostPulseSkills.ts"
if sk.is_file():
    s = sk.read_text(encoding="utf-8")
    if "Outline" not in s:
        s = s.replace(
            "Yo tocaría el hero primero.",
            "Si querés el mapa, Outline está en la barra de abajo. Yo tocaría el hero primero.",
            1,
        )
        sk.write_text(s, encoding="utf-8")
        print("ok briefing dock")

# 7) Operator: chip Nueva if missing
op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if ">Nueva<" not in o:
        o = o.replace(
            '<button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>',
            '<div className="flex gap-1"><button type="button" onClick={function () { setMsgs([]); setOut(null); try { sessionStorage.removeItem(THREAD); } catch {} }} className="h-9 rounded-md border border-white/10 px-2 text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Nueva</button><button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button></div>',
            1,
        )
        op.write_text(o, encoding="utf-8")
        print("ok nueva")
    else:
        print("ya nueva")

print("LISTO POLISH")
