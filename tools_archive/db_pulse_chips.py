#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("Falta DigitalBoostOperator.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))
t = op.read_text(encoding="utf-8")
if "PULSE_CHIPS" not in t:
    t = t.replace(
        "function run() {",
        """const CHIPS = ["hola", "ventas", "pedidos", "health", "campaña"];
  function speak(word: string) {
    setQ(word);
    const c = ctx();
    const r = analyze({ q: word, section: section, store: c.store, range: c.range, live: c.live });
    setOut(r);
    setAsk(Boolean(r.confirm));
  }
  function run() {""",
        1,
    )
    t = t.replace(
        '<button type="button" onClick={run} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>',
        """<div className="flex flex-wrap gap-1">
            {CHIPS.map(function (c) {
              return <button key={c} type="button" onClick={function () { speak(c); }} className="h-9 rounded-full border border-white/10 px-3 text-[11px] text-cyan-300">{c}</button>;
            })}
          </div>
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>""",
        1,
    )
    print("ok chips")
else:
    print("chips ya estaban")
op.write_text(t, encoding="utf-8")
print("LISTO PULSE CHIPS")
