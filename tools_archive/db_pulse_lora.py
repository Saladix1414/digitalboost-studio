#!/usr/bin/env python3
from pathlib import Path

src = Path("src")

(src / "DigitalBoostPulseLog.ts").write_text(r"""
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
""", encoding="utf-8")
print("ok log")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
if "pushExample" not in t:
    t = 'import { countExamples, dumpJSONL, pushExample } from "./DigitalBoostPulseLog";\n' + t
    t = t.replace(
        "lastAction = pick.action;",
        """lastAction = pick.action;
  try {
    pushExample({ q: input.q || "", section: input.section, store: input.store, range: input.range, live: input.live, title: pick.title, body: pick.body, action: pick.action, confirm: Boolean(pick.confirm) });
  } catch {}""",
        1,
    )
    if "dataset" not in t[:800] and "export function decide" in t:
        t = t.replace(
            "export function decide(input: PulseInput): PulseDecision {",
            """export function decide(input: PulseInput): PulseDecision {
  const q0 = (input.q || "").toLowerCase();
  if (q0.indexOf("dataset") !== -1 || q0.indexOf("jsonl") !== -1) {
    const n = countExamples();
    try { (window as any).__pulseJSONL = dumpJSONL(); } catch {}
    return { title: "PULSE · Dataset LoRA", body: n + " ejemplos en este navegador. JSONL listo en window.__pulseJSONL. Eso entra a Unsloth en Colab, no acá.", action: "dashboard", actionLabel: "Seguir", confirm: false };
  }
""",
            1,
        )
    kb.write_text(t, encoding="utf-8")
    print("ok kb log")

op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    o = o.replace(
        '["briefing", "plan", "alerta", "debug", "ventas", "stock"]',
        '["briefing", "plan", "alerta", "debug", "dataset"]',
        1,
    )
    o = o.replace(
        '["briefing", "plan", "alerta", "hola", "ventas", "pedidos", "stock"]',
        '["briefing", "plan", "alerta", "debug", "dataset"]',
        1,
    )
    op.write_text(o, encoding="utf-8")
    print("ok chip dataset")

Path("pulse_unsloth_colab.py").write_text(r"""
# Correr en Google Colab CON GPU (T4). NO en Termux.
# 1) Subí pulse.jsonl (export PULSE → chip dataset → console: copy(__pulseJSONL))
# 2) Runtime → GPU
# pip install unsloth

from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

MODEL = "unsloth/Llama-3.2-3B-Instruct"
MAXLEN = 2048

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL, max_seq_length=MAXLEN, load_in_4bit=True
)
model = FastLanguageModel.get_peft_model(
    model, r=16, lora_alpha=16, lora_dropout=0,
    target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
)

def fmt(ex):
    return {"text": "### Sistema:\n" + ex["instruction"] + "\n### Input:\n" + ex["input"] + "\n### Output:\n" + ex["output"]}

ds = load_dataset("json", data_files="pulse.jsonl", split="train").map(fmt)

trainer = SFTTrainer(
    model=model, tokenizer=tokenizer, train_dataset=ds,
    dataset_text_field="text", max_seq_length=MAXLEN,
    args=TrainingArguments(per_device_train_batch_size=2, num_train_epochs=2, learning_rate=2e-4, output_dir="pulse-lora", fp16=True, logging_steps=5),
)
trainer.train()
model.save_pretrained("pulse-lora")
print("Listo. Merge/GGUF -> ollama create pulse")
""", encoding="utf-8")
print("ok colab script")
print("LISTO LORA PIPELINE")
