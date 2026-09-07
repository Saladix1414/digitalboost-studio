
const KEY = "db-pulse-lora-v1";
const AUDIT = "db-pulse-audit-v1";

export type PulseExample = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
  title: string;
  body: string;
  action: string;
  confirm: boolean;
  t: number;
};

export type PulseAudit = {
  timestamp: string;
  tenant_id: string;
  store_id: string;
  actor_type: string;
  request_id: string;
  intent: string;
  agent: string;
  risk_level: string;
  tool: string;
  approval_required: boolean;
  status: string;
  result_summary: string;
};

function readArr(k: string) {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function writeArr(k: string, rows: unknown[]) {
  try { localStorage.setItem(k, JSON.stringify(rows.slice(-800))); } catch {}
}

export function pushExample(row: Omit<PulseExample, "t">) {
  const rows = readArr(KEY) as PulseExample[];
  rows.push(Object.assign({ t: Date.now() }, row));
  writeArr(KEY, rows);
}
export function countExamples() { return (readArr(KEY) as unknown[]).length; }
export function dumpJSONL() {
  const system = "Sos PULSE 4.0, orquestador de DigitalBoost. JSON only: title, body, action, actionLabel, confirm, risk.";
  return (readArr(KEY) as PulseExample[]).map(function (r) {
    return JSON.stringify({
      instruction: system,
      input: "tienda=" + r.store + " rango=" + r.range + " seccion=" + r.section + "\npregunta: " + r.q,
      output: JSON.stringify({ title: r.title, body: r.body, action: r.action, confirm: r.confirm })
    });
  }).join("\n");
}
export function pushAudit(row: PulseAudit) {
  const rows = readArr(AUDIT) as PulseAudit[];
  rows.push(row);
  writeArr(AUDIT, rows);
}
export function requestId() {
  return "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
}
