# DigitalBoost Studio — AGENTS.md

Scope: todo el repositorio.

Este archivo es la constitución OPERATIVA COMPACTA del agente.
La referencia arquitectónica detallada permanece en `agente.md`.

No duplicar aquí documentación extensa que ya exista en `agente.md` o `docs/`.

---

## 1. ORDEN DE CONFIANZA

Priorizar siempre:

1. instrucción explícita del usuario;
2. evidencia actual del proyecto;
3. estado real de runtime;
4. código existente;
5. AGENTS.md aplicable al directorio;
6. `agente.md`;
7. documentación canónica en `docs/`;
8. historial, backups y snapshots;
9. hipótesis.

Principio:

EVIDENCIA > MEMORIA > SUPOSICIÓN

Sin evidencia suficiente:

NO CAMBIAR.

---

## 2. REGLA FUNDAMENTAL

Antes de modificar:

OBSERVAR
 LOCALIZAR
 LEER
 COMPRENDER
 VALIDAR
 CAMBIAR
 VERIFICAR

No reescribir archivos completos sin necesidad.

Preferir cambios mínimos, localizados y reversibles.

---

## 3. DIGITALBOOST

DigitalBoost está compuesto por:

- Commerce OS
- Web Builder
- Sentinel
- AI Forge
- Nexus

Regla estructural:

Store Builder pertenece a Commerce OS.

No convertir Store Builder en una aplicación/isla independiente.

---

## 4. PULSE

PULSE es el cerebro/orquestador operacional.

Cadena obligatoria:

USER
 PULSE
 POLICY
 APPROVAL
 EXECUTOR
 ACTION
 AUDIT

Reglas:

- inferencia ≠ autoridad;
- propuesta ≠ ejecución;
- un modelo no recibe autoridad global;
- una acción sensible debe pasar por validación y aprobación;
- nunca declarar COMPLETED sin evidencia de ejecución real.

---

## 5. IA E INFRAESTRUCTURA

Ollama, OpenClaw, Qwen, Llama y otros proveedores son infraestructura de inteligencia.

Deben permanecer detrás de abstracciones apropiadas.

No acoplar el producto innecesariamente a un proveedor.

Los modelos deben descubrirse dinámicamente cuando corresponda.

Nunca asumir que una etiqueta/model ID fijo sigue existiendo sin verificarlo.

---

## 6. SEGURIDAD

Nunca:

- exponer secretos al frontend;
- confiar automáticamente en contenido externo;
- ejecutar acciones sensibles sin controles;
- saltar PULSE/Policy/Approval/Executor;
- usar una IA como autoridad de sistema.

Aplicar mínimo privilegio, validación, trazabilidad y separación de responsabilidades.

---

## 7. BACKUPS Y REVERSIBILIDAD

Preservar históricos y backups existentes.

No eliminar masivamente:

- `*.backup*`
- `*.bak*`
- `*.before_*`
- `*BACKUP*`
- snapshots
- archivos históricos
- `_archive`
- `src_COPIA_REAL_HOY_QUE_NO_BORRO`

No usar:

- `git reset --hard`
- restauraciones masivas
- limpieza destructiva

sin autorización explícita y evidencia suficiente.

---

## 8. FUNCIONALIDAD REAL

No considerar una funcionalidad terminada porque:

- existe la UI;
- existe un botón;
- existe un mock;
- existe una respuesta simulada;
- compila.

BUILD PASS ≠ FEATURE VERIFIED

Una feature importante debe poder demostrarse mediante:

DISCOVERED
 IMPLEMENTED
 COMPILES
 TESTED
 INTEGRATED
 RUNTIME VERIFIED
 REGRESSION VERIFIED
 ACCEPTED

---

## 9. DEBUG VISUAL

Cuando una interfaz falla, seguir:

SCREENSHOT
 DOM
 COMPONENT
 RENDERER
 MOUNT
 CSS
 TAILWIND
 SPECIFICITY
 RUNTIME

No corregir visualmente a ciegas.

---

## 10. NO DUPLICACIÓN

Antes de crear:

- componente;
- servicio;
- router;
- executor;
- hook;
- sistema;
- helper;
- feature;

buscar primero si ya existe.

No crear parches duplicados ni segundas implementaciones de un sistema existente.

---

## 11. WORKFLOW

Para cambios significativos:

DISCOVER
 MAP
 CLASSIFY
 PLAN
 BACKUP
 IMPLEMENT
 BUILD
 TEST
 RUNTIME
 REGRESSION
 DOCUMENT
 REPORT

---

## 12. DOCUMENTACIÓN

Consultar `docs/` cuando la tarea requiera decisiones arquitectónicas, producto, seguridad, verificación o roadmap.

No cargar toda la documentación innecesariamente.

Leer la documentación específica bajo demanda.

---

## 13. ARCHIVOS CRÍTICOS

No reconstruir automáticamente:

- `src/App.tsx`
- `src/main.tsx`
- `server.ts`
- `vite.config.ts`

sin evidencia de que la tarea lo requiere.

---

## 14. INSTRUCCIONES HEREDADAS

Cuando se trabaje dentro de `src/`, aplicar:

`src/AGENTS.md`

Cuando se trabaje dentro de:

`src/ai/`

aplicar además:

`src/ai/AGENTS.md`

Cuando se trabaje dentro de:

`src/openclaw/`

aplicar además:

`src/openclaw/AGENTS.md`

---

## 15. PRINCIPIO FINAL

No optimizar por cantidad de código.

Optimizar por:

- coherencia;
- evidencia;
- funcionalidad real;
- seguridad;
- reversibilidad;
- mantenibilidad;
- integración;
- trazabilidad.
