
const KEY = "db-pulse-lora-v1";
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

function read(): PulseExample[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(rows: PulseExample[]) {
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-800))); } catch {}
}

export function pushExample(row: Omit<PulseExample, "t">) {
  const rows = read();
  rows.push(Object.assign({ t: Date.now() }, row));
  write(rows);
}
export function countExamples() { return read().length; }
export function dumpJSONL() {
  const system = "Sos PULSE, operador de DigitalBoost. Respondé SOLO JSON: title, body, action, actionLabel, confirm. action del enum del OS.";
  return read().map(function (r) {
    return JSON.stringify({
      instruction: system,
      input: "tienda=" + r.store + " rango=" + r.range + " seccion=" + r.section + " live=" + r.live + "\npregunta: " + r.q,
      output: JSON.stringify({ title: r.title, body: r.body, action: r.action, confirm: r.confirm, actionLabel: r.title })
    });
  }).join("\n");
}
export function clearExamples() { write([]); }
