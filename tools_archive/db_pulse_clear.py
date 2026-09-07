#!/usr/bin/env python3
from pathlib import Path

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("cd digitalboost-studio")
o = op.read_text(encoding="utf-8")

# header button Nueva
if ">Nueva<" not in o and "Nueva" not in o[o.find("PULSE"):o.find("PULSE")+800]:
    o = o.replace(
        '<button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>',
        '''<div className="flex items-center gap-1">
            <button type="button" onClick={function () { setMsgs([]); setOut(null); setApplied(false); try { sessionStorage.removeItem(THREAD); } catch {} }} className="h-9 rounded-md border border-white/10 px-2 text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Nueva</button>
            <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
          </div>''',
        1,
    )
    print("ok nueva")

# don't autohola if thread exists
o = o.replace(
    "if (builder && msgs.length === 0) think(\"hola\");",
    "if (builder && msgs.length === 0) think(\"hola\");",
)

# wrap autohola so seed OR empty only once
old_fx = """  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); return; }
    } catch {}
    if (builder && msgs.length === 0) think("hola");
  }, []);"""
new_fx = """  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); return; }
    } catch {}
    try {
      const saved = JSON.parse(sessionStorage.getItem(THREAD) || "[]");
      if (Array.isArray(saved) && saved.length) return;
    } catch {}
    if (msgs.length === 0) think(builder ? "hola" : "briefing");
  }, []);"""
if old_fx in o:
    o = o.replace(old_fx, new_fx, 1)
    print("ok un solo saludo")

# hide follow chips — tray is enough
if "follows(out.action" in o and "/* tray only" not in o:
    # comment out the follow chip row by wrapping false &&
    o = o.replace(
        "{out && !out.card && (",
        "{false && out && !out.card && (",
        1,
    )
    print("ok sin chips duplicados")

# dedupe think consecutive same pulse
if "last && last.text === r.body && last.role === \"pulse\"" not in o:
    o = o.replace(
        "setMsgs(function (m) { return m.concat([{ role: \"user\", text: line }, { role: \"pulse\", text: r.body }]).slice(-10); });",
        """setMsgs(function (m) {
      const last = m[m.length - 1];
      if (last && last.role === "pulse" && last.text === r.body) return m;
      const prev = m[m.length - 2];
      if (prev && prev.role === "user" && prev.text === line && last && last.text === r.body) return m;
      return m.concat([{ role: "user", text: line }, { role: "pulse", text: r.body }]).slice(-12);
    });""",
        1,
    )
    print("ok dedupe")

op.write_text(o, encoding="utf-8")
print("LISTO CLEAR")
