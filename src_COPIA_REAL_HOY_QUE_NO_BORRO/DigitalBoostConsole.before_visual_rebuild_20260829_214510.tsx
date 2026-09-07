
import { useEffect, useState } from "react";
import { formatWhen, loadLog, pushLog, saveLog, type LogItem } from "./DigitalBoostConsole";

export default function DigitalBoostConsole(props: { onClose: () => void }) {
  const [list, setList] = useState<LogItem[]>([]);
  useEffect(function () { setList(loadLog()); }, []);
  function tone(s: LogItem["status"]) {
    if (s === "completed") return "text-emerald-400";
    if (s === "failed") return "text-red-400";
    return "text-amber-300";
  }
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Operations Console</div>
            <div className="text-sm font-semibold">Action · Status · Result</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="flex gap-2 px-4 pt-3">
          <button type="button" onClick={function () { setList(pushLog({ actor: "User", action: "Manual ping", resource: "Commerce OS", status: "completed", result: "Ok" })); }} className="h-9 rounded-md bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]">Log event</button>
          <button type="button" onClick={function () { saveLog([]); setList([]); }} className="h-9 rounded-md border border-white/10 px-3 text-xs">Clear</button>
        </div>
        <div className="space-y-2 p-4">
          {list.map(function (row) {
            return (
              <div key={row.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{row.action}</div>
                  <div className={"text-[10px] uppercase tracking-[0.12em] " + tone(row.status)}>{row.status}</div>
                </div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{row.actor} · {row.resource}</div>
                <div className="mt-1 text-[11px] text-[#D7E2F0]">{row.result}</div>
                <div className="mt-1 text-[10px] text-slate-500">{formatWhen(row.at)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
