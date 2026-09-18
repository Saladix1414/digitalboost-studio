# DigitalBoost Studio — SRC AGENTS

Scope: todo `src/`.

Estas reglas complementan el `AGENTS.md` raíz.

---

## 1. ORDEN DE PRIORIDAD DE TRABAJO

Cuando una tarea afecta varios dominios, considerar este orden:

1. PULSE
2. IA / Ollama / OpenClaw / Model Infrastructure
3. Store Builder
4. Commerce OS
5. Marketing / SEO
6. Web Builder
7. resto del ecosistema

Este orden organiza la integración.
No autoriza cambios fuera del alcance de la tarea.

---

## 2. PULSE

PULSE es el orquestador operacional.

Arquitectura obligatoria:

USER
 PULSE
 POLICY
 APPROVAL
 EXECUTOR
 ACTION
 AUDIT

La generación de una respuesta o plan no implica permiso de ejecución.

No conectar una IA directamente con acciones sensibles.

Las acciones desconocidas deben rechazarse.

No declarar éxito sin resultado real verificable.

Antes de modificar PULSE:

- localizar implementación actual;
- identificar router/governance/executor;
- revisar flujo existente;
- buscar duplicados;
- preservar backups;
- probar integración real.

Los archivos `DigitalBoostPulse*` ubicados directamente en `src/` forman actualmente parte del conjunto PULSE.
No inventar una nueva carpeta PULSE solo para ordenar instrucciones.

---

## 3. IA / OLLAMA

La infraestructura de IA debe permanecer modular.

Prioridades:

- registry;
- router;
- provider abstraction;
- discovery dinámico;
- fallback;
- observabilidad;
- errores explícitos.

No asumir modelos fijos.

No acoplar la lógica de negocio a una etiqueta específica de Ollama.

Los proveedores generan inteligencia.
La aplicación conserva la autoridad.

---

## 4. STORE BUILDER

Store Builder es un módulo de Commerce OS.

Debe conservar separación clara frente a Web Builder.

reas relevantes:

- editor;
- canvas;
- layout;
- sections;
- themes;
- productos;
- colecciones;
- responsive;
- persistencia;
- preview;
- publish.

No crear una segunda arquitectura de Store Builder.

Antes de cambiar estilos, buscar primero el renderer y stylesheet realmente montados.

---

## 5. COMMERCE OS

Commerce OS es la base operativa comercial.

Debe conservar coherencia entre:

- catálogo;
- productos;
- colecciones;
- clientes;
- pedidos;
- operaciones;
- marketing;
- analytics;
- automatización;
- IA aplicada al comercio.

Store Builder pertenece a esta capa.

---

## 6. MARKETING / SEO

SEO y Marketing deben conectarse con Commerce OS y PULSE cuando corresponda.

No tratar SEO como simples componentes visuales.

Diferenciar:

- configuración;
- análisis;
- recomendación;
- generación;
- aplicación de cambios;
- verificación.

Una recomendación de SEO no significa que el cambio haya sido aplicado.

---

## 7. WEB BUILDER

Web Builder permanece conceptualmente independiente de Commerce OS.

No mezclar Store Builder y Web Builder solo porque compartan componentes visuales.

Mantener clara la semántica de:

- tiendas;
- sitios;
- landing pages;
- campañas;
- experiencias web.

---

## 8. AI FORGE / SENTINEL / NEXUS

Estos dominios forman parte del ecosistema global.

No crear directorios ficticios solo para alojar AGENTS.md.

Cuando exista implementación real para un dominio, crear reglas locales específicas dentro de su directorio real.

Mientras tanto, usar:

- `agente.md`
- `docs/arquitectura.md`
- `docs/producto.md`
- `docs/seguridad.md`
- documentación correspondiente.

---

## 9. ESTRUCTURA REAL DEL REPOSITORIO

No asumir que cada producto posee actualmente una carpeta propia.

Algunos dominios están implementados como archivos directamente dentro de `src/`.

Respetar la estructura existente hasta que una reorganización sea justificada por evidencia y se haga de manera controlada.

---

## 10. DEBUG

Para bugs visuales:

SCREENSHOT
 DOM
 COMPONENT
 RENDERER
 MOUNT
 CSS
 TAILWIND
 SPECIFICITY
 RUNTIME

Para bugs funcionales:

INPUT
 ROUTER
 STATE
 SERVICE
 BACKEND
 EXECUTION
 RESPONSE
 UI

---

## 11. REGLA ANTI-PARCES

No crear:

- `fix2`;
- `final2`;
- `new`;
- `backup-final`;
- wrappers innecesarios;
- componentes duplicados;
- routers paralelos.

Primero localizar la implementación existente y corregir la fuente real.

---

## 12. VERIFICACIÓN

Compilar no es suficiente.

Una modificación funcional debe verificarse en la ruta real de ejecución.

BUILD PASS ≠ FEATURE VERIFIED
