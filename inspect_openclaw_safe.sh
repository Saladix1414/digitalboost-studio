#!/usr/bin/env bash
set -u

echo "============================================================"
echo " DIGITALBOOST — OPENCLAW SAFE INSPECTION"
echo "============================================================"
echo

echo "===== 1. OPENCLAW ====="
command -v openclaw || true
openclaw --version || true
echo

echo "===== 2. OLLAMA ====="
command -v ollama || true
ollama --version || true
echo

echo "===== 3. OPENCLAW STATUS ====="
openclaw status --plain 2>&1 || true
echo

echo "===== 4. OPENCLAW MODELS ====="
openclaw models list --local 2>&1 || true
echo
openclaw models status --plain 2>&1 || true
echo

echo "===== 5. CONFIG FILE ====="
CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$CONFIG" ]; then
    echo "❌ No existe: $CONFIG"
    exit 0
fi

echo "✅ Existe: $CONFIG"
echo

echo "===== 6. CONFIGURATION (SECRETS REDACTED) ====="

python3 - "$CONFIG" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])

try:
    data = json.loads(path.read_text(encoding="utf-8"))
except Exception as e:
    print(f"❌ No se pudo leer JSON: {e}")
    sys.exit(1)

SECRET_WORDS = (
    "token",
    "password",
    "secret",
    "apikey",
    "api_key",
    "authorization",
    "credential",
)

def redact(obj, key=""):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            lk = k.lower()
            if any(word in lk for word in SECRET_WORDS):
                out[k] = "*** REDACTED ***"
            else:
                out[k] = redact(v, k)
        return out

    if isinstance(obj, list):
        return [redact(x, key) for x in obj]

    return obj

safe = redact(data)

print(json.dumps(
    safe,
    indent=2,
    ensure_ascii=False
))
PY

echo
echo "===== 7. OLLAMA INSTALLED MODELS ====="
ollama list 2>&1 || true
echo

echo "===== 8. OLLAMA API ====="
curl -sS --max-time 5 http://127.0.0.1:11434/api/tags \
  | python3 -m json.tool 2>/dev/null \
  || echo "❌ Ollama API no respondió"

echo
echo "===== 9. OPENCLAW GATEWAY ====="
curl -sS --max-time 3 http://127.0.0.1:18789/ \
  >/dev/null 2>&1 \
  && echo "✅ Gateway HTTP responde" \
  || echo "⚠️ Gateway HTTP no responde actualmente"

echo
echo "============================================================"
echo " INSPECCIÓN TERMINADA"
echo "============================================================"
echo
echo "IMPORTANTE:"
echo "- No se modificó DigitalBoost."
echo "- No se modificó el proyecto."
echo "- El token de OpenClaw fue ocultado."
echo "- No se ejecutó ninguna acción de IA."
echo
