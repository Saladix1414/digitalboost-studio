
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
      : { title: "PULSE IA", body: stamp + ". Soy el operador de Commerce OS. Ventas, pedidos, stock, campanas y health.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (builder) {
    if (q.indexOf("hero") !== -1 || q.indexOf("redisen") !== -1)
      return { title: "PULSE Design · Hero", body: "El hero tiene que vender en 3 segundos. Chip AI Design aplica el copy.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("conver") !== -1 || q.indexOf("cta") !== -1)
      return { title: "PULSE Design · Conversion", body: "Todo bloque sin accion es ruido. CTA en hero, productos y cierre.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("theme") !== -1 || q.indexOf("noir") !== -1 || q.indexOf("color") !== -1)
      return { title: "PULSE Design · Theme", body: "Nimbus vende calma. Noir vende precisio. Preset desde Theme.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    return { title: "PULSE Design", body: stamp + ". Pedime hero, conversion, theme o copy.", action: "website-builder", actionLabel: "Seguir disenando", confirm: false };
  }
  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1 || q.indexOf("1048") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search del OS.", action: "__search", actionLabel: "Abrir Search", confirm: false };
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


export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  const fallback = analyze(input);
  return { decision: fallback, engine: "rules" };
}
