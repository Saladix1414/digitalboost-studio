
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
