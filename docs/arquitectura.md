# DigitalBoost — Arquitectura

Estado: CANÓNICO
Autoridad: Secundaria
Documento raíz: ../agente.md

---

## Principio

La arquitectura debe separar, cuando corresponda:

PRESENTACIÓN
APLICACIÓN
ORQUESTACIÓN
EJECUCIÓN
INFRAESTRUCTURA

La existencia de una interfaz o simulación no prueba que exista una
integración productiva real.

---

## Productos canónicos

DigitalBoost contiene seis productos principales:

1. Commerce OS
2. Web Builder
3. AI Forge
4. Trading Islands
5. Sentinel
6. Nexus

Store Builder pertenece a Commerce OS.

---

## Commerce OS

Commerce OS contiene las capacidades orientadas a operar negocios
digitales.

PULSE pertenece actualmente a este dominio.

### PULSE

PULSE es la inteligencia operacional de Commerce OS.

Su cadena de control puede incluir:

USER
PULSE
POLICY
APPROVAL
EXECUTOR
ACTION
AUDIT

Principios:

- inferencia no equivale a autoridad;
- propuesta no equivale a ejecución;
- aprobación no puede inventarse;
- una acción sensible requiere evidencia de ejecución;
- no debe declararse éxito sin verificación.

PULSE no constituye actualmente una capa global de todos los productos.

Una futura integración de capacidades derivadas de PULSE dentro de
Sentinel queda fuera del alcance arquitectónico vigente.

---

## Web Builder

Web Builder es un producto independiente para creación y gestión de
experiencias web.

Puede compartir infraestructura con el resto del ecosistema sin perder
su autonomía de dominio.

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

Los modelos producen inteligencia.

La aplicación conserva autoridad y control.

---

## Trading Islands

Arquitectura conceptual:

DISCOVER
MARKET
ANALYZE
STRATEGY
AI ASSIST
BACKTEST
PAPER TRADE
RISK REVIEW
APPROVAL
DEPLOY
MONITOR

Digital assets:

DISCOVER
CREATE
FORGE
NFT DNA
ORIGIN
MINT
VERIFY
LIST
TRADE
PROVENANCE

Blockchain proof, provenance, simulación y AI output no deben confundirse
con autoridad, propiedad legal o aprobación.

---

## Sentinel

Sentinel debe separar:

SCOPE
AUTHORIZATION
OBSERVATION
ANALYSIS
TEST
EVIDENCE
REPORTING

Ninguna capacidad ofensiva debe asumir autorización por defecto.

---

## Nexus

Nexus es el foro y capa comunitaria del ecosistema.

No debe convertirse en autoridad operativa sobre otros productos.

---

## Infraestructura compartida

Cuando corresponda pueden compartirse:

- identidad;
- cuentas;
- billing;
- storage;
- seguridad;
- notificaciones;
- observabilidad;
- auditoría;
- infraestructura.

Compartir infraestructura no implica compartir autoridad.

---

## Providers

Los proveedores de modelos deben permanecer detrás de abstracciones
apropiadas.

El sistema no debe depender innecesariamente de un proveedor específico.

---

## Versionado

Los sistemas que lo requieran deben poder conservar:

- versiones;
- checkpoints;
- historial;
- rollback.

---

## Eventos

Las operaciones importantes deberían producir eventos observables.
