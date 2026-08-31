
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

export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}

export function analyze(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase().trim();
  const section = input.section || "dashboard";
  const stamp = stampOf(input);
  const builder = isBuilder(section);

  if (!q || q === "hola" || q.indexOf("quien") !== -1 || q.indexOf("sos") !== -1) {
    if (builder)
      return { title: "PULSE Design", body: stamp + ". Estudio abierto. Puedo reescribir el hero, meter CTAs o mandarte a Theme. Chip AI Design aplica al canvas.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    return { title: "PULSE", body: stamp + ". Operador de este OS. Pedime ventas, pedidos, stock, health, buscar o una campana. Si Ollama esta vivo, pienso con Llama; si no, con reglas.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (q.indexOf("gracias") !== -1)
    return { title: "PULSE", body: "De nada. Cuando quieras, health o el canvas.", action: section, actionLabel: "Seguir", confirm: false };

  if (builder) {
    if (q.indexOf("hero") !== -1 || q.indexOf("redisen") !== -1 || q.indexOf("titulo") !== -1)
      return { title: "PULSE Design · Hero", body: "3 segundos. Una promesa. Un CTA. Usa AI Design o decime premium / conversion.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1 || q.indexOf("color") !== -1)
      return { title: "PULSE Design · Theme", body: "Nimbus = calma. Noir = precisio. El chip Theme aplica tokens al telefono.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("conver") !== -1 || q.indexOf("cta") !== -1)
      return { title: "PULSE Design · Conversion", body: "Hero, productos y cierre con CTA. El grid sin accion es ruido.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("public") !== -1)
      return { title: "PULSE Design · Publish", body: "Publicar guarda snapshot en History. Reversible.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
  }

  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1 || q.indexOf("1048") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search: pedidos, productos, PULSE.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("health") !== -1 || q.indexOf("salud") !== -1 || q.indexOf("error") !== -1)
    return { title: "PULSE · Health", body: stamp + ". Checkout y stock. Te abro el diagnostico.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("automat") !== -1 || q.indexOf("flujo") !== -1)
    return { title: "PULSE · Automations", body: "Trigger → condicion → accion. Te abro el builder.", action: "__automations", actionLabel: "Abrir Automations", confirm: false };
  if (q.indexOf("console") !== -1 || q.indexOf("log") !== -1)
    return { title: "PULSE · Console", body: "Huella de operaciones. Te abro el log.", action: "__console", actionLabel: "Abrir Console", confirm: false };
  if (q.indexOf("integr") !== -1 || q.indexOf("stripe") !== -1)
    return { title: "PULSE · Integrations", body: "Connect / Disconnect del marketplace.", action: "__integrations", actionLabel: "Abrir Integrations", confirm: false };
  if (q.indexOf("pedido") !== -1 || section === "orders")
    return { title: "PULSE · Pedidos", body: stamp + ". DB-1048 pagado, 1047 en preparacion. El cuello es despacho, no la vitrina.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (q.indexOf("stock") !== -1 || q.indexOf("invent") !== -1 || q.indexOf("producto") !== -1)
    return { title: "PULSE · Catalogo", body: stamp + ". Cap Digital Blue esta fino. Reponer antes del drop.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  if (q.indexOf("cliente") !== -1 || q.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: stamp + ". Valor concentrado. Tag VIP, no otra campana masiva.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (q.indexOf("venta") !== -1 || q.indexOf("analytics") !== -1 || q.indexOf("30d") !== -1)
    return { title: "PULSE · Ventas", body: stamp + ". Ticket firme. Mobile recorta conversion. Toca 30d en el header para ver el tramo.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("campan") !== -1 || q.indexOf("promo") !== -1)
    return { title: "PULSE · Campana", body: stamp + ". Recuperacion de carritos 10% / 48h. Confirma si la creo.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (q.indexOf("homepage") !== -1 || q.indexOf("tienda") !== -1 || q.indexOf("conver") !== -1)
    return { title: "PULSE · Conversion", body: stamp + ". El hero sostiene. El grid no. Te mando al estudio.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  if (q.indexOf("live") !== -1)
    return { title: "PULSE", body: stamp + ". Live/Attention esta en el header. Un toque lo cambia.", action: "dashboard", actionLabel: "Overview", confirm: false };

  return { title: "PULSE", body: stamp + ". Frente " + section + ". Proba: ventas, pedidos, stock, health, buscar, hero, campana.", action: section, actionLabel: "Seguir aca", confirm: false };
}

export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  const fallback = analyze(input);
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, 6000);
  try {
    const res = await fetch("/ollama/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "llama3.2",
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: "Sos PULSE de DigitalBoost. JSON only: title, body, action, actionLabel, confirm. action in dashboard,orders,products,customers,analytics,campaigns,website-builder,__health,__search,__automations,__console,__integrations. Voz corta rioplatense. No digas que sos un modelo." },
          { role: "user", content: JSON.stringify({ q: input.q, section: input.section, store: input.store, range: input.range, live: input.live, stamp: stampOf(input) }) }
        ]
      })
    });
    if (!res.ok) return { decision: fallback, engine: "rules" };
    const data = await res.json();
    const raw = String((data && data.message && data.message.content) || "");
    const a = raw.indexOf("{");
    const b = raw.lastIndexOf("}");
    if (a < 0) return { decision: fallback, engine: "rules" };
    const parsed = JSON.parse(raw.slice(a, b + 1));
    const allow = " dashboard orders products customers analytics campaigns website-builder inventory settings __health __automations __console __notes __integrations __search ";
    const action = String(parsed.action || fallback.action);
    if (allow.indexOf(" " + action + " ") < 0) return { decision: fallback, engine: "rules" };
    return {
      engine: "ollama",
      decision: {
        title: String(parsed.title || "PULSE").slice(0, 80),
        body: String(parsed.body || fallback.body).slice(0, 500),
        action: action,
        actionLabel: String(parsed.actionLabel || fallback.actionLabel).slice(0, 48),
        confirm: Boolean(parsed.confirm)
      }
    };
  } catch {
    return { decision: fallback, engine: "rules" };
  } finally {
    clearTimeout(timer);
  }
}

export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const next = blocks.map(function (b) { return Object.assign({}, b); });
  if (s.indexOf("premium") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "Ingenieria que se siente lujo."; b.body = "Oscuro, preciso, rapido."; b.cta = "Ver drop"; }
    });
    return { note: "Estetica tech premium.", next: next };
  }
  if (s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1) {
    next.forEach(function (b) {
      if (b.type === "hero") { b.title = "La coleccion que no pide permiso."; b.body = "Menos texto. Un CTA."; b.cta = "Entrar"; }
    });
    return { note: "Hero de conversion.", next: next };
  }
  if (s.indexOf("cta") !== -1 || s.indexOf("conver") !== -1) {
    next.forEach(function (b) {
      if (!b.cta) b.cta = "Comprar ahora";
    });
    return { note: "CTAs completados.", next: next };
  }
  return { note: "Proba: premium / hero / conversion.", next: blocks };
}
