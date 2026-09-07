# DigitalBoost — Arquitectura

Estado: CANÓNICO
Autoridad: Secundaria
Documento raíz: ../agente.md

---

## Principio

La arquitectura debe separar:

PRESENTACIÓN
 APLICACIÓN
 ORQUESTACIÓN
 EJECUCIÓN
 INFRAESTRUCTURA

---

## AI Forge

Arquitectura conceptual:

UI
 Command Center
 Project Explorer
 Agent Builder
 Workflow Builder
 Inspector
 Runtime Console

Backend
 Project Service
 Agent Service
 Workflow Engine
 Tool Registry
 Skill Registry
 Memory Service
 Knowledge Service
 Model Gateway
 Evaluation Engine
 Sandbox Manager
 Deployment Manager
 Governance Layer

---

## PULSE

Inference
 PULSE
 Request
 Validator
 Approval
 Executor
 Runtime

La generación no debe tener autoridad directa.

---

## Providers

Los proveedores de modelos deben estar detrás de una abstracción.

El resto del sistema no debe depender innecesariamente de un proveedor específico.

---

## Versionado

Los agentes deben poder tener:

- versiones;
- checkpoints;
- historial;
- rollback.

---

## Eventos

Operaciones importantes deberían producir eventos observables.

---

## Separación

Commerce OS, Web Builder, Sentinel, AI Forge y Nexus son dominios separados aunque compartan infraestructura.
