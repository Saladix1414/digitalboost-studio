#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

op = Path("src/DigitalBoostOperator.tsx")
if not op.is_file():
    raise SystemExit("Falta DigitalBoostOperator.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))
t = op.read_text(encoding="utf-8")
if "function storeCtx" not in t:
    t = t.replace(
        "function isBuilder(section: string) {",
        """function storeCtx() {
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
function isBuilder(section: string) {""",
        1,
    )
    print("ok storeCtx")
else:
    print("storeCtx ya estaba")
if "storeCtx()" not in t.split("function analyze")[-1][:400]:
    t = t.replace(
        "function analyze(q: string, section: string) {",
        """function analyze(q: string, section: string) {
  const ctx = storeCtx();
  const stamp = ctx.store + " · " + ctx.range + " · " + (ctx.live ? "Live" : "Attention");""",
        1,
    )
t = t.replace(
    'return { title: "PULSE · Commerce OS", body: "Frente activo: " + here + ". Pedime ventas, pedidos, stock, clientes o una campana.", action: here, actionLabel: "Seguir aca", confirm: false };',
    'return { title: "PULSE · Commerce OS", body: stamp + ". Frente: " + here + ". Pedime ventas, pedidos, stock, clientes o una campana.", action: here, actionLabel: "Seguir aca", confirm: false };',
    1,
)
if 'body: "Estoy en Commerce OS.' in t:
    t = t.replace(
        'body: "Estoy en Commerce OS. Opero ventas, stock, pedidos y campanas de este comercio."',
        'body: "Estoy en Commerce OS · " + stamp + ". Opero ventas, stock, pedidos y campanas de esta tienda."',
        1,
    )
op.write_text(t, encoding="utf-8")
print("ok operator")
print("LISTO PULSE MEM")
print("Cambia Aura / 30d / Attention y pregunta hola a PULSE")
