# Phase 31C10D — DBX Consumption Orchestrator

This layer coordinates existing DBX consumption domain components.

It does not replace them.

## Canonical flow

Consumption Intent
→ Hold Binding
→ Recovery State
→ Begin Attempt
→ Reserved Posting
→ Canonical DBX Ledger
→ Consumption Registry
→ Hold Capture
→ Completed

## Retry behavior

Retryable failure:

PROCESSING
→ RETRY_PENDING
→ hold remains ACTIVE

Terminal failure:

PROCESSING
→ TERMINAL_FAILURE
→ hold RELEASED

Success:

PROCESSING
→ COMPLETED
→ hold CAPTURED

## Replay

A completed orchestration may be replayed only when:

- the hold is already captured by the same transaction
- the registry contains the same consumption record
- the ledger contains the same transaction

The replay must never create a second debit.

## Boundaries

Orchestrator != ledger authority.

Recovery != approval.

Retry != duplicate execution.

Hold != payment.

Capture != issuance.

DBX Rewards remain outside this economic system.

No external payment provider or blockchain execution exists here.
