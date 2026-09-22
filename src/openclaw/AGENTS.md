# DigitalBoost — OpenClaw AGENTS

Scope: `src/openclaw/`

Aplica además de `src/AGENTS.md`.

---

## ROLE

OpenClaw es integración/infraestructura de IA.

No es una segunda aplicación.

No reemplaza:

- PULSE;
- Policy;
- Approval;
- Executor;
- Audit.

---

## GOVERNANCE

La ruta correcta para acciones controladas es:

USER
 PULSE
 POLICY
 APPROVAL
 EXECUTOR
 ACTION
 AUDIT

OpenClaw nunca debe saltarse esta cadena.

Un modelo o agente conectado mediante OpenClaw no obtiene autoridad global.

---

## OLLAMA

Respetar la configuración real de Ollama.

Para el entorno local de DigitalBoost, no inventar endpoints incompatibles ni transformar arbitrariamente:

`http://127.0.0.1:11434`

en otra API base.

Verificar primero la configuración real y el contrato existente.

---

## MODELS

No asumir modelos fijos.

Usar discovery/registry cuando esté disponible.

No codificar una etiqueta de modelo como dependencia obligatoria sin evidencia.

---

## BACKEND

Las operaciones sensibles deben pasar por backend/control apropiado.

No exponer credenciales ni secretos al frontend.

---

## DEBUG

Antes de corregir OpenClaw:

- revisar bridge;
- revisar router;
- revisar Ollama;
- revisar PULSE;
- revisar logs;
- reproducir el flujo;
- verificar respuesta real.

No solucionar un fallo agregando un segundo bridge o un parche paralelo.
