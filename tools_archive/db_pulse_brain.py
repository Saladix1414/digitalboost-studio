#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(src / "DigitalBoostOperator.tsx", src / ("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))

(src / "DigitalBoostPulseBrain.ts").write_text(r"""
export type PulseInput = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
};
export type PulseDecision = {
  title: string;
  body: string;
  action: string;
  actionLabel: string;
  confirm: boolean;
};
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };

export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function analyze(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase();
  const section = input.section || "dashboard";
  const stamp = stampOf(input);
  const builder = isBuilder(section);
  if (q.indexOf("hola") !== -1 || q.indexOf("quien") !== -1 || q.indexOf("sos") !== -1) {
    return builder
      ? { title: "PULSE Design", body: stamp + ". Estoy en el estudio. Hero, CTA, theme o copy. El canvas es el terreno.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false }
      : { title: "PULSE", body: stamp + ". Soy el operador de Commerce OS. Ventas, pedidos, stock, campanas y health.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (builder) {
    if (q.indexOf("hero") !== -1 || q.indexOf("redisen") !== -1)
      return { title: "PULSE Design · Hero", body: "El hero tiene que vender en 3 segundos. Chip AI Design aplica el copy.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("conver") !== -1 || q.indexOf("cta") !== -1)
      return { title: "PULSE Design · Conversion", body: "Todo bloque sin accion es ruido. CTA en hero, productos y cierre.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1 || q.indexOf("color") !== -1)
      return { title: "PULSE Design · Theme", body: "Aura vende calma. Noir vende precisio. Preset desde Theme.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    return { title: "PULSE Design", body: stamp + ". Pedime hero, conversion, theme o copy.", action: "website-builder", actionLabel: "Seguir disenando", confirm: false };
  }
  if (q.indexOf("health") !== -1 || q.indexOf("salud") !== -1 || q.indexOf("diagnost") !== -1)
    return { title: "PULSE · Health", body: stamp + ". Checkout y stock piden atencion. Te abro Store Health.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("automat") !== -1 || q.indexOf("flujo") !== -1)
    return { title: "PULSE · Automations", body: "Trigger, condicion, accion. Te abro flujos.", action: "__automations", actionLabel: "Abrir Automations", confirm: false };
  if (q.indexOf("console") !== -1 || q.indexOf("log") !== -1)
    return { title: "PULSE · Console", body: "Cada accion mia queda en Operations Console.", action: "__console", actionLabel: "Abrir Console", confirm: false };
  if (q.indexOf("integr") !== -1 || q.indexOf("stripe") !== -1)
    return { title: "PULSE · Integrations", body: "Connect / Disconnect del marketplace base.", action: "__integrations", actionLabel: "Abrir Integrations", confirm: false };
  if (section === "orders" || q.indexOf("pedido") !== -1)
    return { title: "PULSE · Pedidos", body: stamp + ". DB-1048 pagado. El cuello esta entre pago y envio.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (section === "products" || q.indexOf("stock") !== -1 || q.indexOf("producto") !== -1)
    return { title: "PULSE · Catalogo", body: stamp + ". Hay SKUs finos. Reponer antes del drop.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  if (section === "customers" || q.indexOf("cliente") !== -1 || q.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: stamp + ". Valor concentrado. Tag VIP, no otra campana masiva.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (section === "analytics" || q.indexOf("venta") !== -1 || q.indexOf("analytics") !== -1)
    return { title: "PULSE · Ventas", body: stamp + ". Semana en alza. Mobile recorta conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("campan") !== -1 || q.indexOf("promo") !== -1)
    return { title: "PULSE · Campana", body: stamp + ". Recuperacion de carritos 10% / 48h. Primero eso.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (q.indexOf("conver") !== -1 || q.indexOf("homepage") !== -1 || q.indexOf("tienda") !== -1)
    return { title: "PULSE · Conversion", body: stamp + ". El hero sostiene. El grid no. Pase al estudio.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  return { title: "PULSE · Commerce OS", body: stamp + ". Frente: " + section + ". Pedime ventas, pedidos, stock, health o una campana.", action: section, actionLabel: "Seguir aca", confirm: false };
}
export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const copy = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("premium") !== -1 || s.indexOf("tecnolog") !== -1) {
    copy.forEach(function (b) {
      if (b.type === "hero") { b.title = "Ingenieria que se siente lujo."; b.body = "Una tienda precisa, oscura y rapida."; b.cta = "Ver drop"; }
    });
    return { note: "Hero a estetica tech premium.", next: copy };
  }
  if (s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1 || s.indexOf("moderna") !== -1) {
    copy.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Mas tension. Un solo CTA."; b.cta = "Entrar"; }
    });
    return { note: "Hero reescrito para conversion.", next: copy };
  }
  if (s.indexOf("conver") !== -1 || s.indexOf("cta") !== -1) {
    copy.forEach(function (b) {
      if (!b.cta && (b.type === "hero" || b.type === "cta" || b.type === "products")) b.cta = "Comprar ahora";
    });
    return { note: "CTAs en bloques que no tenian.", next: copy };
  }
  if (s.indexOf("copy") !== -1 || s.indexOf("texto") !== -1) {
    copy.forEach(function (b) {
      if (b.type === "text") { b.title = "Una marca se lee en 3 segundos."; b.body = "Si el primer bloque no vende, el resto no llega."; }
    });
    return { note: "Copy del bloque texto regenerado.", next: copy };
  }
  return { note: "Proba: premium / redesena el hero / conversion / copy.", next: blocks };
}
""", encoding="utf-8")
print("ok brain")

(src / "DigitalBoostOperator.tsx").write_text(r"""
import { useState } from "react";
import { analyze, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

function ctx() {
  let range = "7d";
  let store = "Aura";
  let live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Aura";
    live = localStorage.getItem("db-os-live-v1") !== "0";
  } catch {}
  return { range: range, store: store, live: live };
}

export default function DigitalBoostOperator(props: {
  onClose: () => void;
  onNavigate: (id: any) => void;
  section?: string;
  onOpenHealth?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
  onOpenIntegrations?: () => void;
}) {
  const section = props.section || "dashboard";
  const builder = isBuilder(section);
  const [q, setQ] = useState("");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [ask, setAsk] = useState(false);
  function run() {
    const c = ctx();
    const r = analyze({ q: q || "hola", section: section, store: c.store, range: c.range, live: c.live });
    setOut(r);
    setAsk(Boolean(r.confirm));
  }
  function exec() {
    if (!out) return;
    try {
      const { pushLog } = require("./DigitalBoostConsoleData");
      if (pushLog) pushLog({ actor: "PULSE", action: out.title, resource: section, status: "completed", result: String(out.body).slice(0, 120) });
    } catch {}
    props.onClose();
    if (out.action === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (out.action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (out.action === "__console" && props.onOpenConsole) props.onOpenConsole();
    else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else props.onNavigate(out.action);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400 text-xs font-bold text-[#070D18]">P</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{builder ? "PULSE Design" : "PULSE · Commerce OS"}</div>
              <div className="text-sm font-semibold">{builder ? "Estudio · canvas" : "Operador · " + section}</div>
            </div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs leading-5 text-[#AFC0D5]">{builder ? "Modo estudio. El chip AI Design aplica al canvas." : "Modo OS. Analizo esta pantalla y ejecuto herramientas."}</p>
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder={builder ? "Redesena el hero / conversion / theme" : "Hola PULSE / ventas / health / pedidos"} value={q} onChange={function (e) { setQ(e.target.value); }} />
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>
          {out && (
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              {ask ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={exec} className="h-11 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                  <button type="button" onClick={function () { setAsk(false); }} className="h-11 flex-1 rounded-lg border border-white/10 text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={exec} className="mt-3 h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok operator")

des = src / "DigitalBoostStoreDesigner.tsx"
if des.is_file():
    d = des.read_text(encoding="utf-8")
    if "designApply" not in d:
        d = d.replace(
            'import { useState } from "react";',
            'import { useState } from "react";\nimport { designApply } from "./DigitalBoostPulseBrain";',
            1,
        )
        d = d.replace("function apply(q: string, blocks: Block[]): { note: string; next: Block[] } {", "function apply(q: string, blocks: Block[]): { note: string; next: Block[] } {\n  return designApply(q, blocks) as any;\n  function _dead(q: string, blocks: Block[]): { note: string; next: Block[] } {", 1)
        if "return designApply" not in d:
            print("WARN designer no reenrole apply")
        else:
            print("ok designer brain")
        des.write_text(d, encoding="utf-8")
    else:
        print("designer ya usa brain")
else:
    print("skip designer")

ov = src / "CommerceOSOverview.tsx"
if ov.is_file():
    o = ov.read_text(encoding="utf-8")
    o = o.replace("AI Operator", "PULSE")
    o = o.replace("AI OPERADOR", "PULSE")
    ov.write_text(o, encoding="utf-8")
    print("ok overview label")

print("LISTO PULSE BRAIN")
print("src/DigitalBoostPulseBrain.ts = cerebro")
