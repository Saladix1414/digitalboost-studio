
import { PRESETS, type StoreTheme } from "./DigitalBoostTheme";

export default function DigitalBoostThemePanel({ theme, onChange, onClose }: {
  theme: StoreTheme; onChange: (t: StoreTheme) => void; onClose: () => void;
}) {
  const fields: Array<keyof StoreTheme> = ["bg", "surface", "text", "muted", "primary", "accent"];
  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Theme System</div>
            <div className="text-sm font-semibold">Tokens de la tienda</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" onClick={() => onChange(p)} className={"rounded-xl border p-3 text-left " + (theme.name === p.name ? "border-cyan-400 bg-[#101B32]" : "border-white/10 bg-[#101B32]") }>
              <div className="flex gap-1">
                {[p.bg, p.primary, p.accent].map((c) => <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />)}
              </div>
              <div className="mt-2 text-xs font-medium">{p.name}</div>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {fields.map((k) => (
            <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#AFC0D5]">{k}</span>
              <input type="color" value={theme[k]} onChange={(e) => onChange({ ...theme, name: "Custom", [k]: e.target.value })} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
