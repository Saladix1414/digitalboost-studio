
const ROWS = [
  ["Ctrl + K", "Command Center"],
  ["Ctrl + /", "Atajos"],
  ["Esc", "Cerrar overlay"],
  ["Campana", "Notifications"],
  ["Open Operations Console", "Log de acciones"],
  ["Open AI Operator", "Analizar ventas / stock"],
  ["Open Store Health", "Errores y warnings"],
  ["Open Integrations", "Connect / Disconnect"],
  ["Open Automations", "Trigger - Condition - Action"],
  ["Store Builder", "Theme / History / Undo / Redo"]
];
export default function DigitalBoostShortcuts(props: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[140] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Shortcuts</div>
            <div className="text-sm font-semibold">Mapa de capas</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-1">
          {ROWS.map(function (row) {
            return (
              <div key={row[0]} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
                <span className="text-xs text-[#D7E2F0]">{row[1]}</span>
                <span className="shrink-0 rounded bg-[#0A1020] px-2 py-1 text-[10px] text-cyan-300">{row[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
