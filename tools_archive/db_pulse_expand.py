#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseSkills.ts").write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
function mul(r: string) { return r === "90d" ? 12 : r === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
function studio(i: PulseInput) {
  return i.section === "website-builder" || i.section === "store-builder" || i.section === "builder";
}
export function skillBriefing(i: PulseInput) {
  if (studio(i)) {
    const hero = i.heroTitle ? "«" + i.heroTitle + "»" : "un texto genérico";
    return {
      title: "PULSE Design",
      body: "Estamos en " + (i.page || "Inicio") + " de " + i.store + ", con " + String(i.blockCount || 0) + " bloques. El hero dice " + hero + ". En tres segundos no se entiende qué vendés ni por qué entrar. Yo reescribiría esa línea, dejaría un solo botón y después unificaría los CTA de abajo. Te armo el copy para aplicar.",
      action: "website-builder",
      label: "Seguir en el canvas",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Piezas claras, una promesa, un botón. El resto sobra.", cta: "Entrar" }
    };
  }
  const m = mul(i.range);
  return {
    title: "PULSE",
    body: i.store + " viene " + i.range + (i.live ? " en live" : " en atención") + ". En este tramo el cálculo de demo da " + money(Math.round(474 * m)) + " y " + Math.max(1, Math.round(4 * m)) + " pedidos. Lo que realmente frena no es la vitrina: el 1047 sigue en preparación y el Cap Digital Blue está fino. Si el drop llega así, vendés vacío. ¿Cerramos despacho primero?",
    action: "dashboard",
    label: "Quedarme acá"
  };
}
export function skillPlan(i: PulseInput) {
  if (studio(i)) {
    return {
      title: "PULSE Design",
      body: "Plan para este canvas, no para el depósito. Primero el hero: una promesa y un CTA. Segundo, que Destacados también pida la compra. Tercero, un theme solo — Aura o Noir, no los dos. El 1047 y el cap los vemos cuando volvamos al OS. Abajo te dejo el copy del hero para aplicar.",
      action: "website-builder",
      label: "Seguir",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Piezas claras, una promesa, un botón.", cta: "Entrar" }
    };
  }
  return {
    title: "PULSE",
    body: "Orden de hoy, sin saltar pasos. 1) Despachar el 1047: es plata ya cobrada que no sale. 2) Anotar el cap para reponer — eso todavía no es una compra, no te abro Pulse Card. 3) Hero con un CTA cuando pases al canvas. 4) Campaña de carritos: eso sí es L3 y pide tu OK. ¿Arranco por Pedidos?",
    action: "orders",
    label: "Ir a Pedidos"
  };
}
export function skillAlerta(i: PulseInput) {
  if (studio(i)) {
    return {
      title: "PULSE Design",
      body: "En este canvas el riesgo no es el color: es que el hero no cierra y hay bloques que no piden nada. El visitante lee y se va. Unificar CTA y acortar el título arregla más que un preset. Te dejo una versión lista.",
      action: "website-builder",
      label: "Seguir",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }
    };
  }
  return {
    title: "PULSE",
    body: "Tres rojos juntos: cap fino, 1047 trabado y mobile recortando. Health te muestra el diagnóstico; yo no toco inventario ni despacho desde acá. Si querés manos, Pedidos es el siguiente golpe.",
    action: "__health",
    label: "Abrir Health"
  };
}
export function skillHero(i?: PulseInput) {
  const now = i && i.heroTitle ? i.heroTitle : "Crea algo extraordinario.";
  return {
    title: "PULSE Design",
    body: "Hoy el hero dice «" + now + "». Suena a plantilla: no dice qué es la marca ni qué pasa si toca el botón. Te propongo una línea más corta y un CTA único. Es L1, reversible con History. Si no te gusta, la descartás y seguimos.",
    action: "website-builder",
    label: "Aplicar hero",
    draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón. El resto del fold sobra.", cta: "Entrar" }
  };
}
""", encoding="utf-8")
print("ok skills largas")

kb = src / "DigitalBoostPulseKB.ts"
if kb.is_file():
    t = kb.read_text(encoding="utf-8")
    repls = [
        ('"PULSE", st(input) + ". Orquestador del OS. ¿Briefing del dia, un pedido, o el canvas?", "dashboard", "Seguir aca"',
         '"PULSE", st(input) + ". Estoy en el tablero. Puedo darte el pulso del día, un pedido puntual o pasar al canvas. Decime un frente y no te suelto el menú entero.", "dashboard", "Seguir acá"'),
        ('"PULSE · Ventas", "El hero actual no cierra',
         '"PULSE · Ventas", "El hero actual no cierra'),
    ]
    t = t.replace(
        'add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", "CALCULO sobre demo seed, no un hecho de pasarela. " + st(input) + ". " + money(salesN) + " · " + ordersN + " pedidos · ticket " + money(ticket) + ". Mobile recorta. ¿Abro Analytics?", "analytics", "Abrir Analytics");',
        'add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", st(input) + ". En este tramo el cálculo de demo da " + money(salesN) + ", " + ordersN + " pedidos y ticket " + money(ticket) + ". Mobile recorta. No es un dato de pasarela: es la semilla del OS. ¿Querés el desglose en Analytics?", "analytics", "Abrir Analytics");',
    )
    t = t.replace(
        'add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", "DB-1048 pagado, 1047 en preparacion. El cuello es despacho, no la vitrina.", "orders", "Abrir Pedidos");',
        'add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", "El 1048 está pagado. El 1047 sigue en preparación: el cuello es despacho, no la vitrina. Cada hora ahí es plata cobrada que no sale. ¿Entro a Pedidos?", "orders", "Abrir Pedidos");',
    )
    t = t.replace(
        'add(["stock", "invent", "sku", "producto", "cap"], "PULSE · Stock", "RECOMENDACION sobre seed: Cap Digital Blue fino. Reponer no es comprar: eso seria L3.", "products", "Abrir Productos");',
        'add(["stock", "invent", "sku", "producto", "cap"], "PULSE · Stock", "El Cap Digital Blue está fino. Si el drop llega sin reposición, la ficha se ve y no hay talle. Anotar el faltante es L0; comprar al proveedor ya sería L3 y Pulse Card. ¿Abrimos Productos?", "products", "Abrir Productos");',
    )
    t = t.replace(
        'add(["theme", "noir", "color", "preset"], "PULSE Design", "Aura es calma, Noir es filo. No mezcles los dos. ¿Aplicamos Noir en este canvas?", "website-builder", "Seguir en el canvas");',
        'add(["theme", "noir", "color", "preset"], "PULSE Design", "Aura es calma (luz, aire). Noir es filo (contraste, menos gris). Mezclar los dos hace que la tienda no tenga carácter. Yo iría Noir en este canvas y dejaría Aura para otra marca. El cambio es L1 y se revierte.", "website-builder", "Seguir en el canvas");',
    )
    t = t.replace(
        'add(["conver", "cta", "boton"], "PULSE Design", "Hay bloques que no piden nada. El cierre tiene que decir Comprar ahora. ¿Lo unificamos?", "website-builder", "Seguir en el canvas");',
        'add(["conver", "cta", "boton"], "PULSE Design", "Hay bloques que informan y no piden. El visitante no adivina el siguiente paso. Unificar a «Comprar ahora» / «Entrar» en hero, destacados y cierre. Es un cambio chico y se nota en mobile.", "website-builder", "Seguir en el canvas");',
    )
    t = t.replace(
        'else pick = { title: "PULSE", body: "¿Cifras, un pedido, o el canvas? No asumo la intencion.", action: input.section || "dashboard", label: "Seguir aca", score: 0 };',
        'else pick = { title: "PULSE", body: "No enganché un frente claro. ¿Lo vemos por ventas, por el 1047, o por el hero del canvas?", action: input.section || "dashboard", label: "Seguir acá", score: 0 };',
    )
    kb.write_text(t, encoding="utf-8")
    print("ok kb copy")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
o = o.replace('max-w-md', 'max-w-lg')
o = o.replace('min-h-[240px]', 'min-h-[280px]')
o = o.replace('text-xs leading-5', 'text-[13px] leading-6')
o = o.replace(
    'className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]"',
    'className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0C1427] shadow-[0_20px_60px_rgba(0,0,0,.45)] text-[#F7FAFF]"',
)
# pulse label on assistant bubbles
if "PULSE" not in o.split("msgs.map")[-1][:800]:
    o = o.replace(
        """: "max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] leading-6 text-[#D5E4F5]"}>
                  {m.text}""",
        """: "max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] leading-6 text-[#D5E4F5]"}>
                  <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300">PULSE</div>
                  {m.text}""",
    )
op.write_text(o, encoding="utf-8")
print("LISTO EXPAND")
