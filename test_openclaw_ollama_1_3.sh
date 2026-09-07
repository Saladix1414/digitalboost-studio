#!/usr/bin/env bash
set -euo pipefail

echo "============================================================"
echo " DIGITALBOOST — FASE 1.3"
echo " OPENCLAW → OLLAMA → QWEN / LLAMA"
echo " PRUEBA REAL DE INFERENCIA"
echo "============================================================"
echo

if ! command -v openclaw >/dev/null 2>&1; then
    echo "❌ OpenClaw no está disponible."
    exit 1
fi

if ! command -v ollama >/dev/null 2>&1; then
    echo "❌ Ollama no está disponible."
    exit 1
fi

echo "===== 1. VERSIONES ====="
openclaw --version
ollama --version
echo

echo "===== 2. OLLAMA API ====="

if ! curl -fsS --max-time 5 \
    http://127.0.0.1:11434/api/tags >/dev/null; then
    echo "❌ Ollama no responde."
    exit 1
fi

echo "✅ Ollama API responde"
echo

echo "===== 3. OPENCLAW — CATÁLOGO OLLAMA ====="

if ! openclaw models list --provider ollama; then
    echo "❌ OpenClaw no pudo consultar el provider Ollama."
    exit 1
fi

echo

echo "===== 4. OPENCLAW — QWEN 2 ====="
echo "Prompt: Reply with exactly: DIGITALBOOST_QWEN_OK"
echo

QWEN_OUTPUT="$(
    timeout 120 \
    openclaw infer model run \
      --model ollama/qwen2:1.5b \
      --prompt "Reply with exactly: DIGITALBOOST_QWEN_OK" \
      2>&1 || true
)"

printf '%s\n' "$QWEN_OUTPUT"

echo

if echo "$QWEN_OUTPUT" | grep -qi "DIGITALBOOST_QWEN_OK"; then
    echo "✅ QWEN 2 — INFERENCIA OPENCLAW OK"
    QWEN_OK=1
else
    echo "⚠️ QWEN 2 — no se detectó automáticamente la respuesta esperada."
    QWEN_OK=0
fi

echo
echo "===== 5. OPENCLAW — LLAMA 3.2 ====="
echo "Prompt: Reply with exactly: DIGITALBOOST_LLAMA_OK"
echo

LLAMA_OUTPUT="$(
    timeout 180 \
    openclaw infer model run \
      --model ollama/llama3.2:latest \
      --prompt "Reply with exactly: DIGITALBOOST_LLAMA_OK" \
      2>&1 || true
)"

printf '%s\n' "$LLAMA_OUTPUT"

echo

if echo "$LLAMA_OUTPUT" | grep -qi "DIGITALBOOST_LLAMA_OK"; then
    echo "✅ LLAMA 3.2 — INFERENCIA OPENCLAW OK"
    LLAMA_OK=1
else
    echo "⚠️ LLAMA 3.2 — no se detectó automáticamente la respuesta esperada."
    LLAMA_OK=0
fi

echo
echo "===== 6. ESTADO FINAL OLLAMA ====="

ollama ps 2>/dev/null || true

echo
echo "============================================================"
echo " RESULTADO FASE 1.3"
echo "============================================================"
echo

if [ "$QWEN_OK" -eq 1 ]; then
    echo "✅ OpenClaw → Ollama → Qwen 2: OK"
else
    echo "⚠️ OpenClaw → Ollama → Qwen 2: REVISAR"
fi

if [ "$LLAMA_OK" -eq 1 ]; then
    echo "✅ OpenClaw → Ollama → Llama 3.2: OK"
else
    echo "⚠️ OpenClaw → Ollama → Llama 3.2: REVISAR"
fi

echo

if [ "$QWEN_OK" -eq 1 ] && [ "$LLAMA_OK" -eq 1 ]; then
    echo "🎯 FASE 1.3 — INFERENCIA REAL COMPLETADA"
    echo
    echo "Cadena validada:"
    echo "DigitalBoost [todavía NO conectado]"
    echo "        ↓"
    echo "    OpenClaw"
    echo "        ↓"
    echo "      Ollama"
    echo "      ↙   ↘"
    echo "   Qwen   Llama"
    echo
    echo "Siguiente paso: FASE 1.4"
    echo "Conectar OpenClaw al backend de DigitalBoost mediante"
    echo "DigitalBoostOpenClawBridge, sin modificar el cerebro PULSE."
    exit 0
else
    echo "⚠️ FASE 1.3 requiere revisión antes de continuar."
    exit 1
fi
