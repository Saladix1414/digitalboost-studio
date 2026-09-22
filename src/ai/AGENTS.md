# DigitalBoost — AI Infrastructure AGENTS

Scope: `src/ai/`

Aplica además de las reglas de `src/AGENTS.md` y del root.

---

## MODEL REGISTRY

`DigitalBoostModelRegistry.ts` es la capa de registro de modelos.

Reglas:

- mantener IDs reales;
- favorecer discovery dinámico;
- no inventar modelos;
- no convertir una etiqueta fija en verdad arquitectónica;
- separar metadata del modelo de lógica de negocio.

---

## MODEL ROUTER

`DigitalBoostModelRouter.ts` decide qué proveedor/modelo utilizar según contexto y capacidades.

El router:

- no debe convertirse en executor;
- no debe otorgar permisos;
- debe respetar fallback;
- debe tolerar proveedores ausentes;
- debe producir errores explícitos cuando no existe una ruta válida.

---

## PROVIDERS

Los proveedores deben estar detrás de abstracciones.

Evitar lógica como:

`if provider === "X" ...`

cuando pueda resolverse mediante capacidades, registro o configuración.

---

## SEGURIDAD

Nunca colocar secretos en componentes frontend.

Las operaciones sensibles deben terminar en capas de backend/control adecuadas.

La IA genera o propone.

PULSE / Policy / Approval / Executor controlan la acción.

---

## CAMBIOS

Antes de modificar Registry o Router:

1. inspeccionar consumidores;
2. revisar OpenClaw/Ollama;
3. revisar PULSE;
4. revisar fallback;
5. compilar;
6. ejecutar pruebas;
7. verificar runtime.

No romper contratos existentes sin evidencia.
