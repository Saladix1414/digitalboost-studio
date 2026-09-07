# DigitalBoost Studio — Canonical Status

## Estado

**Fase 0:** COMPLETE  
**Fase 1:** IN PROGRESS  
**Fase 1.1:** CANONICAL INFRASTRUCTURE

Fecha de creación:
`2026-09-02`

---

## Principio

PRESERVAR → ESTABILIZAR → CANONICALIZAR → CONECTAR → VALIDAR → EVOLUCIONAR

---

## Core

- `src/App.tsx`
- `src/main.tsx`
- `server.ts`
- `vite.config.ts`

No reconstruir estos archivos durante la Fase 1 sin evidencia técnica.

---

## Commerce OS

Commerce OS es la plataforma central.

Store Builder es un módulo de Commerce OS.

Website Builder permanece conceptualmente independiente.

---

## PULSE

PULSE continúa siendo el cerebro operacional.

Archivos canónicos identificados:

- DigitalBoostPulseKB
- DigitalBoostPulseBrain
- DigitalBoostPulseSkills
- DigitalBoostPulseTools
- DigitalBoostPulseSeo
- DigitalBoostPulseApply
- DigitalBoostPulseRouter
- DigitalBoostPulseOptimize
- DigitalBoostPulseCycle
- DigitalBoostPulseLog
- DigitalBoostPulseCard
- DigitalBoostPulseConst
- DigitalBoostOperator

No crear duplicados innecesarios.

---

## Ollama

Capa de runtime de IA local.

Archivos existentes:

- `src/ollama/client.ts`
- `src/ollama/tasks.ts`
- `src/ollama/prompts.ts`
- `src/ollama/pulseAdapter.ts`
- `src/ollama/index.ts`

Los IDs de modelos deben descubrirse dinámicamente.

No asumir `qwen2:1.5b`, `llama3:8b` ni ninguna etiqueta concreta.

---

## AI Infrastructure — Fase 1.1

### Context Builder

Canónico:

`src/context/DigitalBoostContextBuilder.ts`

Responsabilidad:

Normalizar contexto operacional para PULSE, modelos y agentes.

No ejecuta acciones.

---

### Model Registry

Canónico:

`src/ai/DigitalBoostModelRegistry.ts`

Responsabilidad:

Registrar modelos descubiertos y sus capacidades.

Los IDs deben provenir del catálogo real.

---

### Model Router

Canónico:

`src/ai/DigitalBoostModelRouter.ts`

Responsabilidad:

Seleccionar modelos según:

- tarea;
- capacidades;
- proveedor;
- disponibilidad;
- prioridad;
- necesidad de herramientas.

Debe permitir fallback.

---

### OpenClaw Bridge

Canónico:

`src/openclaw/DigitalBoostOpenClawBridge.ts`

Responsabilidad:

Aislar DigitalBoost/PULSE de OpenClaw.

OpenClaw:

- NO reemplaza PULSE;
- NO reemplaza Ollama;
- NO es una segunda aplicación;
- NO ejecuta acciones sensibles sin aprobación.

La comunicación sensible debe pasar por el backend.

---

## Seguridad

No almacenar en frontend:

- API keys
- tokens
- passwords
- secrets
- credenciales

Las tareas sensibles deben seguir:

PROPOSAL
 APPROVAL
 EXECUTION
 VERIFY
 AUDIT

---

## Históricos

Los siguientes tipos de archivos deben preservarse:

- `*.backup*`
- `*.bak*`
- `*.before_*`
- `*BACKUP*`
- snapshots
- archivos históricos
- versiones anteriores de Commerce OS
- versiones anteriores de Store Builder
- versiones anteriores de PULSE

---

## Fase siguiente

Después de validar Fase 1.1:

1. Health Check Ollama.
2. Descubrimiento real de modelos.
3. Registro automático Qwen/Llama.
4. Health Check OpenClaw.
5. Backend OpenClaw API.
6. Integración PULSE → Model Router.
7. Integración PULSE → OpenClaw Bridge.
8. Fallback multicapa.
9. Action Proposal.
10. Approval.
11. Execution.
12. Verification.
13. Audit Log.
