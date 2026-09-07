#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
op = src / "DigitalBoostOperator.tsx"
ws = src / "StoreBuilderWorkspace.tsx"
if not op.is_file() or not ws.is_file():
    raise SystemExit("Falta Operator o Workspace")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

t = op.read_text(encoding="utf-8")
if 'from "./DigitalBoostConsoleData"' not in t and (src / "DigitalBoostConsoleData.ts").is_file():
    t = t.replace(
        'import { useState } from "react";',
        'import { useState } from "react";\nimport { pushLog } from "./DigitalBoostConsoleData";',
        1,
    )
    print("ok log import")

if 's.indexOf("health")' not in t:
    t = t.replace(
        "if (s.indexOf(\"campan\") !== -1 || s.indexOf(\"promo\") !== -1)",
        """if (s.indexOf("health") !== -1 || s.indexOf("salud") !== -1 || s.indexOf("diagnost") !== -1)
    return { title: "PULSE · Health", body: "Hay errores de checkout y stock. Te abro Store Health.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (s.indexOf("automat") !== -1 || s.indexOf("flujo") !== -1)
    return { title: "PULSE · Automations", body: "Trigger, condicion, accion. Te abro el builder de flujos.", action: "__automations", actionLabel: "Abrir Automations", confirm: false };
  if (s.indexOf("console") !== -1 || s.indexOf("log") !== -1)
    return { title: "PULSE · Console", body: "Cada accion mia queda en Operations Console. Te lo abro.", action: "__console", actionLabel: "Abrir Console", confirm: false };
  if (s.indexOf("campan") !== -1 || s.indexOf("promo") !== -1)""",
        1,
    )
    print("ok intents")

old_exec = """function exec() {
    if (!out) return;
    props.onClose();
    props.onNavigate(out.action);
  }"""
new_exec = """function exec() {
    if (!out) return;
    try {
      if (typeof pushLog === "function") {
        pushLog({ actor: "PULSE", action: out.title, resource: section, status: "completed", result: String(out.body).slice(0, 120) });
      }
    } catch {}
    props.onClose();
    if (out.action === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (out.action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (out.action === "__console" && props.onOpenConsole) props.onOpenConsole();
    else props.onNavigate(out.action);
  }"""
if "out.action === \"__health\"" not in t:
    t = t.replace(old_exec, new_exec, 1)
    print("ok exec")

t = t.replace(
    "export default function DigitalBoostOperator(props: { onClose: () => void; onNavigate: (id: any) => void; section?: string }) {",
    "export default function DigitalBoostOperator(props: { onClose: () => void; onNavigate: (id: any) => void; section?: string; onOpenHealth?: () => void; onOpenAutomations?: () => void; onOpenConsole?: () => void }) {",
    1,
)
op.write_text(t, encoding="utf-8")
print("ok operator")

w = ws.read_text(encoding="utf-8")
if "onOpenHealth={() => setShowHealth(true)}" not in w.split("DigitalBoostOperator")[-1][:500]:
    w = w.replace(
        "<DigitalBoostOperator section={section} onClose={() => setShowAI(false)}",
        "<DigitalBoostOperator section={section} onOpenHealth={() => setShowHealth(true)} onOpenAutomations={() => setShowAutomations(true)} onOpenConsole={() => setShowConsole(true)} onClose={() => setShowAI(false)}",
        1,
    )
    if "onOpenHealth={() => setShowHealth(true)}" not in w.split("DigitalBoostOperator")[-1][:800]:
        w = w.replace(
            "<DigitalBoostOperator ",
            "<DigitalBoostOperator onOpenHealth={() => setShowHealth(true)} onOpenAutomations={() => setShowAutomations(true)} onOpenConsole={() => setShowConsole(true)} ",
            1,
        )
ws.write_text(w, encoding="utf-8")
print("ok workspace")
print("LISTO PULSE OPS")
print("PULSE: health / automatizacion / console")
