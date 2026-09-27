import { useState } from "react";
import {
  COMMERCE_BOT_SKILLS,
  createCommerceBot,
  listCommerceBots,
  renameCommerceBot,
  updateCommerceBot,
  type CommerceBotSkill,
} from "./DigitalBoostCommerceBots";
import { addBotRule, listBotRules, type BotRuleTrigger } from "./DigitalBoostCommerceBotRules";

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
              <label className="block text-slate-500">Regla</label>
              <select id={"mbot-rule-" + bot.id} className="h-8 w-full rounded-md border border-white/10 bg-[#0E1420] px-2">
                <option value="cart.idle">carrito idle → aviso</option>
                <option value="order.unpaid">pedido unpaid → aviso</option>
                <option value="stock.zero">stock 0 → alerta</option>
                <option value="listing.listed">listing nuevo → oferta draft</option>
              </select>
              <button type="button" className="h-8 rounded-md bg-cyan-400 px-2 text-[#0E1420]" onClick={() => {
                const sel = document.getElementById("mbot-rule-" + bot.id) as HTMLSelectElement;
                const result = addBotRule({
                  tenantId,
                  botId: bot.id,
                  trigger: (sel?.value || "cart.idle") as BotRuleTrigger,
                  action: sel?.value === "listing.listed" ? "draft_offer" : "draft_notice",
                });
                setNote("ok" in result && result.ok === false ? result.reason : "Regla on");
                setTick((n) => n + 1);
              }}>Guardar regla</button>
              <p>{listBotRules(tenantId, bot.id).length} reglas</p>
              <label className="block">Personalidad</label>
              <input defaultValue={bot.personality || "directo y breve"} id={"mbot-per-" + bot.id} className="h-8 w-full rounded-md border border-white/10 bg-[#0E1420] px-2" />
              <label className="block">Canal</label>
              <select id={"mbot-ch-" + bot.id} defaultValue={bot.channel || "in_app"} className="h-8 w-full rounded-md border border-white/10 bg-[#0E1420] px-2">
                <option value="in_app">in-app</option>
                <option value="mail_draft">mail draft</option>
              </select>
              <button type="button" className="h-8 rounded-md border border-white/10 px-2" onClick={() => {
                const per = document.getElementById("mbot-per-" + bot.id) as HTMLInputElement;
                const ch = document.getElementById("mbot-ch-" + bot.id) as HTMLSelectElement;
                updateCommerceBot(tenantId, bot.id, {
                  personality: per?.value || "directo y breve",
                  channel: (ch?.value === "mail_draft" ? "mail_draft" : "in_app"),
                });
                setNote("Perfil actualizado");
                setTick((n) => n + 1);
              }}>Guardar perfil</button>

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
