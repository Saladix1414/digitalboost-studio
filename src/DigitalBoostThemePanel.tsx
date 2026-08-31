
import { PRESETS, type StoreTheme } from "./DigitalBoostTheme";
export default function DigitalBoostThemePanel(props: { theme: StoreTheme; onChange: (t: StoreTheme) => void; onClose: () => void }) {
  const fields: Array<keyof StoreTheme> = ["bg", "surface", "text", "muted", "primary", "accent"];
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Theme System</div>
            <div className="text-sm font-semibold">Tokens de la tienda</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {PRESETS.map(function (p) {
            return (
              <button key={p.name} type="button" onClick={function () { props.onChange(p); }} className={props.theme.name === p.name ? "rounded-xl border border-cyan-400 bg-[#101B32] p-3 text-left" : "rounded-xl border border-white/10 bg-[#101B32] p-3 text-left"}>
                <div className="flex gap-1">
                  {[p.bg, p.primary, p.accent].map(function (c) { return <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />; })}
                </div>
                <div className="mt-2 text-xs font-medium">{p.name}</div>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {fields.map(function (k) {
            return (
              <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#AFC0D5]">{k}</span>
                <input type="color" value={props.theme[k]} onChange={function (e) { const n: StoreTheme = Object.assign({}, props.theme, { name: "Custom" }); n[k] = e.target.value; props.onChange(n); }} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
