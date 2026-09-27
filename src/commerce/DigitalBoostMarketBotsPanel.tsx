import { useState } from "react";
import {
  COMMERCE_BOT_SKILLS,
  createCommerceBot,
  listCommerceBots,
  renameCommerceBot,
  type CommerceBotSkill,
} from "./DigitalBoostCommerceBots";

export default function DigitalBoostMarketBotsPanel({
  tenantId = "local-tenant",
}: {
  tenantId?: string;
}) {
  const [name, setName] = useState("Bot de ventas");
  const [skill, setSkill] = useState<CommerceBotSkill>("sales.pre_purchase");
  const [note, setNote] = useState("Draft. No envían.");
  const [openId, setOpenId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const bots = listCommerceBots(tenantId);
  void tick;
  return (
    <section className="space-y-3 px-4 py-4 sm:px-6">
      <h2 className="text-sm font-medium">Bots de ventas</h2>
      <p className="text-xs text-slate-500">{note}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 flex-1 rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm" />
        <select value={skill} onChange={(e) => setSkill(e.target.value as CommerceBotSkill)} className="h-10 rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm">
          {COMMERCE_BOT_SKILLS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="button" className="h-10 rounded-md bg-cyan-400 px-3 text-xs font-semibold text-[#0E1420]" onClick={() => {
          const result = createCommerceBot({ tenantId, name, skills: [skill] });
          setNote("ok" in result && result.ok === false ? result.reason : "Bot creado");
          setTick((n) => n + 1);
        }}>Crear</button>
      </div>
      {bots.map((bot) => (
        <div key={bot.id} className="bg-[#161D2B]">
          <div className="flex items-center gap-2 px-3 py-2">
            <input defaultValue={bot.name} id={"mbot-" + bot.id} className="h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-[#0E1420] px-2 text-sm" />
            <button
              type="button"
              className="h-9 w-9 shrink-0 rounded-md border border-white/10 text-slate-300"
              onClick={() => setOpenId(openId === bot.id ? null : bot.id)}
              aria-label="Opciones"
            >
              ▾
            </button>
          </div>
          {openId === bot.id && (
            <div className="space-y-2 border-t border-white/8 px-3 py-3 text-xs text-slate-400">
              <p>Skills: {bot.skills.join(", ")}</p>
              <p>Estado: {bot.state}. No captura pagos.</p>
              <button type="button" className="h-8 rounded-md border border-white/10 px-2" onClick={() => {
                const el = document.getElementById("mbot-" + bot.id) as HTMLInputElement;
                const result = renameCommerceBot(tenantId, bot.id, el?.value || "");
                setNote("ok" in result && "reason" in result ? result.reason : "Nombre actualizado");
                setTick((n) => n + 1);
              }}>Guardar nombre</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
