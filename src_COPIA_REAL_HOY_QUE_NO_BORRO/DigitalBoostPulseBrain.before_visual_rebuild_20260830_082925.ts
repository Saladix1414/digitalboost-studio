
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
  const q = (input.q || "").toLowerCase();
  const section = input.section || "dashboard";
  const stamp = stampOf(input);
  if (q.indexOf("hola") !== -1 || q.indexOf("quien") !== -1 || q === "") {
    return { title: "PULSE IA", body: stamp + ". Soy el operador de Commerce OS. Pedime ventas, pedidos, health o buscar.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (q.indexOf("health") !== -1)
    return { title: "PULSE · Health", body: stamp + ". Te abro Store Health.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("pedido") !== -1)
    return { title: "PULSE · Pedidos", body: stamp + ". DB-1048 pagado.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (q.indexOf("venta") !== -1)
    return { title: "PULSE · Ventas", body: stamp + ". Mobile recorta conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("campan") !== -1)
    return { title: "PULSE · Campana", body: stamp + ". Carritos 10% / 48h.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (q.indexOf("hero") !== -1 || q.indexOf("homepage") !== -1)
    return { title: "PULSE Design", body: stamp + ". Pase al canvas.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  return { title: "PULSE IA", body: stamp + ". Frente: " + section + ". No enganche un intent: prueba hola, ventas, health.", action: section, actionLabel: "Seguir aca", confirm: false };
}
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  return { decision: analyze(input), engine: "rules" };
}
export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const copy = blocks.map(function (b) { return Object.assign({}, b); });
  copy.forEach(function (b) {
    if (b.type === "hero" && (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1 || s.indexOf("redisen") !== -1)) {
      b.title = "La coleccion que no pide permiso.";
      b.body = "Menos texto. Mas tension. Un solo CTA.";
      b.cta = "Entrar";
    }
  });
  return { note: "PULSE Design aplico el matcher.", next: copy };
}
