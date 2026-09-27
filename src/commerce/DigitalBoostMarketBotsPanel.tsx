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
  const [note, setNote] = useState("Bots de Market. Draft. No envían.");
  const [tick, setTick] = useState(0);
  const bots = listCommerceBots(tenantId);
  void tick;
  return (
    <section className="space-y-3 px-4 py-4 sm:px-6">
      <h2 className="text-sm font-semibold">Bots de ventas</h2>
      <p className="text-xs text-slate-500">{note}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 flex-1 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm" />
        <select value={skill} onChange={(e) => setSkill(e.target.value as CommerceBotSkill)} className="h-10 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm">
          {COMMERCE_BOT_SKILLS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="button" className="h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070d18]" onClick={() => {
          const result = createCommerceBot({ tenantId, name, skills: [skill] });
          setNote("ok" in result && result.ok === false ? result.reason : "Bot draft creado");
          setTick((n) => n + 1);
        }}>Crear</button>
      </div>
      {bots.map((bot) => (
        <div key={bot.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#070d18] px-3 py-2 text-sm">
          <input defaultValue={bot.name} id={"mbot-" + bot.id} className="h-9 min-w-[140px] flex-1 rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" />
          <span className="text-[11px] text-slate-500">{bot.skills.join(", ")}</span>
          <button type="button" className="h-9 rounded-md border border-white/10 px-2 text-[11px]" onClick={() => {
            const el = document.getElementById("mbot-" + bot.id) as HTMLInputElement;
            const result = renameCommerceBot(tenantId, bot.id, el?.value || "");
            setNote("ok" in result && "reason" in result ? result.reason : "Nombre actualizado");
            setTick((n) => n + 1);
          }}>Renombrar</button>
        </div>
      ))}
    </section>
  );
}
