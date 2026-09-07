#!/usr/bin/env bash
set -euo pipefail

CONFIG="$HOME/.openclaw/openclaw.json"
BACKUP_DIR="$HOME/.openclaw/backups"

echo "============================================================"
echo " DIGITALBOOST — OPENCLAW + OLLAMA"
echo " FASE 1.2 — CONFIGURACIÓN LOCAL"
echo "============================================================"
echo

if [ ! -f "$CONFIG" ]; then
    echo "❌ No existe:"
    echo "   $CONFIG"
    exit 1
fi

if ! command -v openclaw >/dev/null 2>&1; then
    echo "❌ OpenClaw no está disponible."
    exit 1
fi

if ! command -v ollama >/dev/null 2>&1; then
    echo "❌ Ollama no está disponible."
    exit 1
fi

echo "===== 1. VALIDANDO OLLAMA ====="

if ! curl -fsS --max-time 5 \
    http://127.0.0.1:11434/api/tags >/dev/null; then
    echo "❌ Ollama no responde en 127.0.0.1:11434"
    exit 1
fi

echo "✅ Ollama API responde"
echo

echo "===== 2. VERIFICANDO MODELOS ====="

MODELS="$(ollama list 2>/dev/null || true)"

echo "$MODELS"

echo

if ! echo "$MODELS" | grep -q '^qwen2:1.5b'; then
    echo "❌ No se encontró qwen2:1.5b"
    exit 1
fi

if ! echo "$MODELS" | grep -q '^llama3.2:latest'; then
    echo "❌ No se encontró llama3.2:latest"
    exit 1
fi

echo "✅ Qwen 2 encontrado"
echo "✅ Llama 3.2 encontrado"
echo

echo "===== 3. BACKUP DE OPENCLAW ====="

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$BACKUP_DIR/openclaw.json.before_ollama_${STAMP}.bak"

cp -p "$CONFIG" "$BACKUP"

echo "✅ Backup creado:"
echo "   $BACKUP"
echo

echo "===== 4. ACTUALIZANDO CONFIGURACIÓN ====="

python3 - "$CONFIG" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])

data = json.loads(path.read_text(encoding="utf-8"))

models = data.setdefault("models", {})
providers = models.setdefault("providers", {})

providers["ollama"] = {
    "baseUrl": "http://127.0.0.1:11434",
    "apiKey": "ollama-local",
    "api": "ollama",
    "timeoutSeconds": 300,
    "models": [
        {
            "id": "qwen2:1.5b",
            "name": "qwen2:1.5b",
            "reasoning": False,
            "input": ["text"],
            "contextWindow": 32768,
            "contextTokens": 2048,
            "maxTokens": 512,
            "params": {
                "num_ctx": 2048,
                "temperature": 0.2,
                "keep_alive": 0
            }
        },
        {
            "id": "llama3.2:latest",
            "name": "llama3.2:latest",
            "reasoning": False,
            "input": ["text"],
            "contextWindow": 131072,
            "contextTokens": 2048,
            "maxTokens": 512,
            "params": {
                "num_ctx": 2048,
                "temperature": 0.2,
                "keep_alive": 0
            }
        }
    ]
}

agents = data.setdefault("agents", {})
defaults = agents.setdefault("defaults", {})

model = defaults.setdefault("model", {})

model["primary"] = "ollama/qwen2:1.5b"
model["fallbacks"] = [
    "ollama/llama3.2:latest"
]

path.write_text(
    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8"
)

print("✅ Configuración escrita")
PY

echo
echo "===== 5. VALIDANDO JSON ====="

python3 - "$CONFIG" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])

try:
    data = json.loads(path.read_text(encoding="utf-8"))
except Exception as e:
    print(f"❌ JSON inválido: {e}")
    sys.exit(1)

provider = data.get("models", {}).get("providers", {}).get("ollama", {})
primary = data.get("agents", {}).get("defaults", {}).get("model", {}).get("primary")
fallbacks = data.get("agents", {}).get("defaults", {}).get("model", {}).get("fallbacks", [])

if provider.get("baseUrl") != "http://127.0.0.1:11434":
    print("❌ baseUrl incorrecto")
    sys.exit(1)

if provider.get("api") != "ollama":
    print("❌ api incorrecta")
    sys.exit(1)

if primary != "ollama/qwen2:1.5b":
    print("❌ modelo primario incorrecto")
    sys.exit(1)

if "ollama/llama3.2:latest" not in fallbacks:
    print("❌ fallback Llama no configurado")
    sys.exit(1)

ids = [m.get("id") for m in provider.get("models", [])]

if "qwen2:1.5b" not in ids:
    print("❌ Qwen no está registrado")
    sys.exit(1)

if "llama3.2:latest" not in ids:
    print("❌ Llama no está registrado")
    sys.exit(1)

print("✅ JSON válido")
print("✅ Ollama provider configurado")
print("✅ Qwen 2 configurado como primary")
print("✅ Llama 3.2 configurado como fallback")
PY

echo
echo "===== 6. CATÁLOGO OPENCLAW ====="

openclaw models list --provider ollama 2>&1 || true

echo
echo "===== 7. CONFIGURACIÓN DEL MODELO ====="

openclaw models status 2>&1 || true

echo
echo "============================================================"
echo " FASE 1.2 COMPLETADA"
echo "============================================================"
echo
echo "Primary : ollama/qwen2:1.5b"
echo "Fallback: ollama/llama3.2:latest"
echo "Endpoint: http://127.0.0.1:11434"
echo
echo "DigitalBoost NO fue modificado."
echo "PULSE NO fue modificado."
echo "No se descargaron modelos."
echo "No se eliminó ningún backup."
echo
echo "Backup:"
echo "$BACKUP"
echo
