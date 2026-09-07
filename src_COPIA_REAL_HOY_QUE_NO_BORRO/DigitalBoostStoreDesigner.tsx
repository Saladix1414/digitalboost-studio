
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
