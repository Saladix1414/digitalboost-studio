#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
op = src / "DigitalBoostOperator.tsx"
ws = src / "StoreBuilderWorkspace.tsx"
if not op.is_file():
    raise SystemExit("Falta Operator")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))

t = op.read_text(encoding="utf-8")
if 'from "./DigitalBoostConsoleData"' not in t and (src / "DigitalBoostConsoleData.ts").is_file():
    t = t.replace(
        'import { analyze, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";',
        'import { analyze, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";\nimport { pushLog } from "./DigitalBoostConsoleData";',
        1,
    )
t = t.replace(
    """    try {
      const { pushLog } = require("./DigitalBoostConsoleData");
      if (pushLog) pushLog({ actor: "PULSE", action: out.title, resource: section, status: "completed", result: String(out.body).slice(0, 120) });
    } catch {}""",
    """    try {
      pushLog({ actor: "PULSE", action: out.title, resource: section, status: "completed", result: String(out.body).slice(0, 120) });
    } catch {}""",
    1,
)
op.write_text(t, encoding="utf-8")
print("ok operator import")

(src / "DigitalBoostStoreDesigner.tsx").write_text(r"""
import { useState } from "react";
import { designApply, type PulseBlock } from "./DigitalBoostPulseBrain";

export default function DigitalBoostStoreDesigner(props: {
  blocks: PulseBlock[];
  onApply: (next: PulseBlock[]) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  function run() {
    const r = designApply(q || "hero", props.blocks);
    setNote(r.note);
    props.onApply(r.next);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">PULSE Design</div>
            <div className="text-sm font-semibold">El mismo cerebro, modo canvas</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder="Crea una tienda premium / redisena este hero / conversion" value={q} onChange={function (e) { setQ(e.target.value); }} />
        <button type="button" onClick={run} className="mt-3 h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Aplicar al canvas</button>
        {note ? <p className="mt-3 text-xs text-[#AFC0D5]">{note}</p> : null}
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok designer")

if ws.is_file():
    w = ws.read_text(encoding="utf-8")
    chunk = w[w.find("DigitalBoostOperator"):w.find("DigitalBoostOperator")+700]
    if "onOpenIntegrations" not in chunk:
        w = w.replace(
            "onOpenConsole={() => setShowConsole(true)}",
            "onOpenConsole={() => setShowConsole(true)} onOpenIntegrations={() => setShowIntegrations(true)}",
            1,
        )
        print("ok integrations prop")
    ws.write_text(w, encoding="utf-8")

print("LISTO PULSE EXEC")
print("PULSE: health / automatizacion / integraciones / console")
print("Studio: AI Design usa el brain")
