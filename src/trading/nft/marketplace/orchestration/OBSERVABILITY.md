# Phase 29C — Marketplace Engine Observability

Phase 29C adds deterministic local trace output around the Marketplace Engine lifecycle.

Trace categories:

- LIFECYCLE
- DOMAIN
- GUARD
- BOUNDARY

Trace levels:

- INFO
- WARN
- ERROR

## Trace properties

Each trace entry contains:

- monotonic sequence
- kind
- level
- code
- message
- timestamp
- `authoritative:false`

## Failure reasons

Current deterministic failure codes include:

- NONE
- ELIGIBILITY_REJECTED
- INVALID_LIFECYCLE_TRANSITION
- ORDER_VALIDATION_FAILED
- PRE_SETTLEMENT_REJECTED

Not every future code is emitted yet.

The type system reserves stable failure vocabulary for later orchestration hardening.

## Authority boundary

Observability records facts about local engine execution.

Observability does not establish:

- payment
- ownership
- settlement
- legal title
- blockchain finality
- governance authority

Telemetry != authority.

Trace != approval.

Logs != truth.

`authoritative:false`
