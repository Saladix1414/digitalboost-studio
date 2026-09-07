from pathlib import Path
src = Path("src")
bridge = Path("/mnt/data/DigitalBoostOllamaBridge.ts").read_text()
(src / "DigitalBoostOllamaBridge.ts").write_text(bridge, encoding="utf-8")
Path(".env.example").write_text("""VITE_OLLAMA_MODE=local
VITE_OLLAMA_LOCAL_URL=http://localhost:11434
VITE_OLLAMA_PROD_URL=/api/ollama
VITE_OLLAMA_MODEL=qwen2:1.5b
""", encoding="utf-8")
print("✅ Bridge listo")
