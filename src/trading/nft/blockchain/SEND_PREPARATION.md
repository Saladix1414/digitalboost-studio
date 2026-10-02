# Phase 30B — Simulation + Send Preparation

Phase 30B separates:

1. simulation
2. send preparation
3. real execution

Only the first two exist in this phase.

## Simulation

Simulation validates local request references and produces a deterministic report.

Simulation:

- does not sign
- does not submit
- does not call RPC
- does not prove chain acceptance
- does not prove settlement

## Send preparation

Send preparation may exist only after a successful simulation.

It records:

- chain reference
- contract reference
- payload reference
- simulation reference
- signing requirement

It explicitly records:

`transactionSubmitted:false`

`executable:false`

## Boundary

SEND_PREPARED != SENT

Simulation PASS != blockchain success

Wallet signing required != wallet signed

Prepared transaction != submitted transaction

All records remain:

`authoritative:false`
