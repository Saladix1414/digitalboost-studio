#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
if not (src / "DigitalBoostPulseBrain.ts").is_file():
    raise SystemExit("Corre db_pulse_brain.py primero")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(src / "DigitalBoostPulseBrain.ts", src / ("DigitalBoostPulseBrain.before_visual_rebuild_" + stamp + ".ts"))
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

const ALLOWED: Record<string, true> = {
  dashboard: true, orders: true, products: true, customers: true,
  analytics: true, campaigns: true, "website-builder": true,
  inventory: true, settings: true,
  __health: true, __automations: true, __console: true,
  __notes: true, __integrations: true, __search: true
};

export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}
export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
function sanitize(d: any, fallback: PulseDecision): PulseDecision {
  if (!d || typeof d !== "object") return fallback;
  const action = String(d.action || fallback.action);
  if (!ALLOWED[action]) return fallback;
  return {
    title: String(d.title || fallback.title).slice(0, 80),
    body: String(d.body || fallback.body).slice(0, 400),
    action: action,
    actionLabel: String(d.actionLabel || fallback.actionLabel).slice(0, 40),
    confirm: Boolean(d.confirm)
  };
}
export function analyze(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase();
  const section = input.section || "dashboard";
  const stamp = stampOf(input);
  const builder = isBuilder(section);
  if (q.indexOf("hola") !== -1 || q.indexOf("quien") !== -1 || q.indexOf("sos") !== -1) {
    return builder
      ? { title: "PULSE Design", body: stamp + ". Estoy en el estudio. Hero, CTA, theme o copy.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false }
      : { title: "PULSE", body: stamp + ". Soy el operador de Commerce OS. Ventas, pedidos, stock, campanas y health.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (builder) {
    if (q.indexOf("hero") !== -1 || q.indexOf("redisen") !== -1)
      return { title: "PULSE Design · Hero", body: "Hero en 3 segundos. Chip AI Design aplica el copy.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    if (q.indexOf("conver") !== -1 || q.indexOf("cta") !== -1)
      return { title: "PULSE Design · Conversion", body: "CTA en hero, productos y cierre.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false };
    return { title: "PULSE Design", body: stamp + ". Pedime hero, conversion, theme o copy.", action: "website-builder", actionLabel: "Seguir disenando", confirm: false };
  }
  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1 || q.indexOf("1048") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("health") !== -1 || q.indexOf("salud") !== -1)
    return { title: "PULSE · Health", body: stamp + ". Te abro Store Health.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("automat") !== -1 || q.indexOf("flujo") !== -1)
    return { title: "PULSE · Automations", body: "Te abro flujos.", action: "__automations", actionLabel: "Abrir Automations", confirm: false };
  if (q.indexOf("console") !== -1 || q.indexOf("log") !== -1)
    return { title: "PULSE · Console", body: "Operations Console.", action: "__console", actionLabel: "Abrir Console", confirm: false };
  if (q.indexOf("integr") !== -1)
    return { title: "PULSE · Integrations", body: "Marketplace base.", action: "__integrations", actionLabel: "Abrir Integrations", confirm: false };
  if (section === "orders" || q.indexOf("pedido") !== -1)
    return { title: "PULSE · Pedidos", body: stamp + ". DB-1048 pagado.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (section === "products" || q.indexOf("stock") !== -1 || q.indexOf("producto") !== -1)
    return { title: "PULSE · Catalogo", body: stamp + ". SKUs finos.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  if (section === "customers" || q.indexOf("cliente") !== -1 || q.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: stamp + ". Tag VIP.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (section === "analytics" || q.indexOf("venta") !== -1)
    return { title: "PULSE · Ventas", body: stamp + ". Mobile recorta conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("campan") !== -1 || q.indexOf("promo") !== -1)
    return { title: "PULSE · Campana", body: stamp + ". Carritos 10% / 48h.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (q.indexOf("conver") !== -1 || q.indexOf("homepage") !== -1)
    return { title: "PULSE · Conversion", body: stamp + ". Pase al estudio.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  return { title: "PULSE · Commerce OS", body: stamp + ". Frente: " + section + ".", action: section, actionLabel: "Seguir aca", confirm: false };
}

function endpoint() {
  try { return localStorage.getItem("db-pulse-endpoint") || "http://127.0.0.1:11434/api/chat"; } catch { return "http://127.0.0.1:11434/api/chat"; }
}
function modelName() {
  try { return localStorage.getItem("db-pulse-model") || "llama3.2"; } catch { return "llama3.2"; }
}
function useModel() {
  try { return localStorage.getItem("db-pulse-use-model") !== "0"; } catch { return true; }
}

const SYSTEM = "Sos PULSE, inteligencia de DigitalBoost Commerce OS. Respondes SOLO JSON valido con keys: title, body, action, actionLabel, confirm. action debe ser uno de: dashboard, orders, products, customers, analytics, campaigns, website-builder, inventory, settings, __health, __automations, __console, __notes, __integrations, __search. Voz corta, rioplatense, operativa. No menciones que sos un modelo. confirm true solo si la accion muta el negocio (campana).";

export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  const fallback = analyze(input);
  if (!useModel()) return { decision: fallback, engine: "rules" };
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, 8000);
  try {
    const res = await fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: modelName(),
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify({ pregunta: input.q, seccion: input.section, tienda: input.store, rango: input.range, live: input.live, stamp: stampOf(input) }) }
        ]
      })
    });
    if (!res.ok) return { decision: fallback, engine: "rules" };
    const data = await res.json();
    const raw = (data && data.message && data.message.content) ? String(data.message.content) : "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return { decision: sanitize(parsed, fallback), engine: "ollama" };
  } catch {
    return { decision: fallback, engine: "rules" };
  } finally {
    clearTimeout(timer);
  }
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
  if (s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1) {
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
  return { note: "Proba: premium / redesena el hero / conversion.", next: blocks };
}
""", encoding="utf-8")
print("ok brain llm")

op = (src / "DigitalBoostOperator.tsx").read_text(encoding="utf-8")
op = op.replace(
    'import { analyze, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";',
    'import { analyzeSmart, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";',
)
op = op.replace("function run() {", "async function run() {")
op = op.replace(
    """    const c = ctx();
    const r = analyze({ q: q || "hola", section: section, store: c.store, range: c.range, live: c.live });
    setOut(r);
    setAsk(Boolean(r.confirm));""",
    """    const c = ctx();
    setBusy(true);
    const smart = await analyzeSmart({ q: q || "hola", section: section, store: c.store, range: c.range, live: c.live });
    setEngine(smart.engine);
    setOut(smart.decision);
    setAsk(Boolean(smart.decision.confirm));
    setBusy(false);""",
)
if "function speak(word: string)" in op:
    op = op.replace("function speak(word: string) {", "async function speak(word: string) {")
    op = op.replace(
        """    setQ(word);
    const c = ctx();
    const r = analyze({ q: word, section: section, store: c.store, range: c.range, live: c.live });
    setOut(r);
    setAsk(Boolean(r.confirm));""",
        """    setQ(word);
    const c = ctx();
    setBusy(true);
    const smart = await analyzeSmart({ q: word, section: section, store: c.store, range: c.range, live: c.live });
    setEngine(smart.engine);
    setOut(smart.decision);
    setAsk(Boolean(smart.decision.confirm));
    setBusy(false);""",
    )
if "const [ask, setAsk]" in op and "setBusy" not in op:
    op = op.replace(
        "const [ask, setAsk] = useState(false);",
        'const [ask, setAsk] = useState(false);\n  const [busy, setBusy] = useState(false);\n  const [engine, setEngine] = useState<"ollama" | "rules">("rules");',
        1,
    )
op = op.replace(
    "PULSE · Commerce OS"}</div>",
    "PULSE · Commerce OS"} {engine === \"ollama\" ? \"· llama\" : \"· reglas\"}</div>",
)
# simpler engine badge in subtitle
op = op.replace(
    '{builder ? "Estudio · canvas" : "Operador · " + section}',
    '{(builder ? "Estudio · canvas" : "Operador · " + section) + (engine === "ollama" ? " · llama" : " · reglas")}',
)
op = op.replace(
    ">Hablar con PULSE</button>",
    ">{busy ? \"PULSE pensando…\" : \"Hablar con PULSE\"}</button>",
)
(src / "DigitalBoostOperator.tsx").write_text(op, encoding="utf-8")
print("ok operator async")
print("LISTO PULSE LLM")
print("Ollama opcional. Sin el, usa reglas.")
