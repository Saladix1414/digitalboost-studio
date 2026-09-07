# DigitalBoost — Verificación

Estado: CANÓNICO
Autoridad: Secundaria
Documento raíz: ../agente.md

---

## Definition of Done

DISCOVERED
IMPLEMENTED
COMPILES
TESTED
INTEGRATED
RUNTIME VERIFIED
REGRESSION VERIFIED
ACCEPTED

---

## Tipos de prueba

### Static

- imports;
- tipos;
- estructura;
- lint;
- dependencias.

### Build

El proyecto debe compilar.

### Unit

Validación de lógica aislada.

### Integration

Validación entre componentes.

### Runtime

Validación de funcionamiento real.

### Regression

Comprobar que funcionalidades existentes continúan funcionando.

### Acceptance

Comprobar que cumple la intención original.

---

## Regla

BUILD PASS ≠ FEATURE VERIFIED

Una interfaz visible tampoco demuestra que el backend funcional exista.
