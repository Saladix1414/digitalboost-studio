#!/usr/bin/env python3
from pathlib import Path

Path("src/DigitalBoostPulseKB.ts").write_text(r"""
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

let lastAction = "dashboard";

function st(i: PulseInput) {
  return i.store + " · " + i.range + (i.live ? " · live" : " · atención");
}
function mul(i: PulseInput) {
  return i.range === "90d" ? 12 : i.range === "30d" ? 4 : 1;
}
function money(n: number) {
  return "US$ " + n.toLocaleString("es-AR");
}

type Pack = { title: string; body: string; action: string; label: string; confirm?: boolean; score: number };

function score(q: string, keys: string[]) {
  let s = 0;
  for (let i = 0; i < keys.length; i++) {
    if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;
  }
  return s;
}

export function decide(input: PulseInput): PulseDecision {
  let q = (input.q || "").toLowerCase().trim();
  if (q === "ok" || q === "si" || q === "sí" || q === "y eso" || q === "mas" || q === "más") {
    q = lastAction === "orders" ? "pedidos" : lastAction === "products" ? "stock" : lastAction === "analytics" ? "ventas" : lastAction === "__health" ? "health" : lastAction === "website-builder" ? "hero" : "hola";
  }

  const m = mul(input);
  const salesN = Math.round(474 * m);
  const ordersN = Math.max(1, Math.round(4 * m));
  const ticket = Math.round(118 * m);
  const idHit = q.match(/db-?\s?10\d{2}/);
  const packs: Pack[] = [];

  function add(keys: string[], title: string, body: string, action: string, label: string, confirm?: boolean) {
    const s = score(q, keys);
    if (s > 0) packs.push({ title: title, body: body, action: action, label: label, confirm: confirm, score: s });
  }

  add(["hola", "quien", "sos", "pulse"], "PULSE", st(input) + ". ¿Ventas, pedidos, stock o el canvas?", "dashboard", "Seguir acá");
  add(["venta", "plata", "ingreso", "analytics", "factur"], "PULSE · Ventas", st(input) + ". " + money(salesN) + " · " + ordersN + " pedidos · ticket " + money(ticket) + ". Mobile recorta. ¿Abro Analytics?", "analytics", "Abrir Analytics");
  add(["pedido", "orden", "envio", "despacho", "1048", "1047"], "PULSE · Pedidos", idHit ? ("Encontré " + idHit[0].toUpperCase() + ". Pagado o en preparación: el cuello es despacho.") : ("DB-1048 pagado, 1047 en preparación. " + ordersN + " en el tramo. El cuello no es la vitrina."), "orders", "Abrir Pedidos");
  add(["stock", "invent", "sku", "producto", "cap", "hoodie"], "PULSE · Stock", "Cap Digital Blue fino, Hoodie Violet en 7. Si no reponés, el drop vende vacío.", "products", "Abrir Productos");
  add(["cliente", "vip", "martin", "sofia"], "PULSE · Clientes", "Martín y Camila concentran gasto. Tag VIP, no otra campaña masiva.", "customers", "Abrir Clientes");
  add(["health", "salud", "error", "caido", "diagnost"], "PULSE · Health", "Checkout y stock piden ojo. Te abro el diagnóstico.", "__health", "Abrir Store Health");
  add(["buscar", "search", "encontrar"], "PULSE · Search", "Te abro Search: pedidos, productos, comandos.", "__search", "Abrir Search");
  add(["automat", "flujo", "trigger"], "PULSE · Flujos", "Trigger → condición → acción. Te abro Automations.", "__automations", "Abrir Automations");
  add(["integr", "stripe", "mailchimp"], "PULSE · Integrations", "Connect / Disconnect del marketplace.", "__integrations", "Abrir Integrations");
  add(["console", "log", "huella"], "PULSE · Console", "Te abro Operations Console.", "__console", "Abrir Console");
  add(["campan", "promo", "descuento", "cupon"], "PULSE · Campaña", "Carritos abandonados, 10% / 48h. Confirmá y armo el frente en Marketing.", "campaigns", "Crear campaña", true);
  add(["hero", "homepage", "titulo", "redisen", "canvas"], "PULSE Design", "Hero: 3 segundos, una promesa, un CTA. AI Design lo escribe en el canvas.", "website-builder", "Abrir Store Builder");
  add(["theme", "noir", "color", "preset"], "PULSE Design", "Aura calma · Noir precisión. Chip Theme en el studio.", "website-builder", "Seguir en el canvas");
  add(["conver", "cta", "comprar"], "PULSE Design", "Todo bloque sin CTA es ruido. Hero, productos, cierre.", "website-builder", "Abrir Store Builder");
  add(["live", "attention", "caida"], "PULSE · Status", st(input) + ". Live/Attention se cambia en el header.", "dashboard", "Overview");

  packs.sort(function (a, b) { return b.score - a.score; });

  let pick: Pack;
  if (!packs.length) {
    if (input.section === "orders") pick = { title: "PULSE · Pedidos", body: "Estás en pedidos. 1048 pagado, 1047 en preparación.", action: "orders", label: "Seguir en Pedidos", score: 1 };
    else if (input.section === "website-builder") pick = { title: "PULSE Design", body: "Estás en el estudio. Pedime hero, theme o conversion.", action: "website-builder", label: "Seguir en el canvas", score: 1 };
    else pick = { title: "PULSE", body: "No enganché el frente. Proba ventas, pedidos, stock, health, hero o campaña.", action: input.section || "dashboard", label: "Seguir acá", score: 0 };
  } else if (packs.length > 1 && packs[0].score === packs[1].score && packs[0].action !== packs[1].action) {
    pick = {
      title: "PULSE",
      body: packs[0].body + " También: " + packs[1].title.replace("PULSE · ", "").replace("PULSE Design", "canvas") + ".",
      action: packs[0].action,
      label: packs[0].label,
      confirm: packs[0].confirm,
      score: packs[0].score
    };
  } else {
    pick = packs[0];
  }

  lastAction = pick.action;
  try { localStorage.setItem("db-pulse-last", pick.action); } catch {}
  return { title: pick.title, body: pick.body, action: pick.action, actionLabel: pick.label, confirm: Boolean(pick.confirm) };
}
""", encoding="utf-8")
print("LISTO CAP")
print("Proba: ventas y stock / 1048 / ok (sigue el tema)")
