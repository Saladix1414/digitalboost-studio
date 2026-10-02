# Phase 29B — Marketplace Engine Lifecycle

Marketplace Engine now exposes an explicit deterministic lifecycle.

Canonical progression:

CREATED
→ ELIGIBILITY_VERIFIED
→ SALE_INTENT_CREATED
→ LISTING_PUBLISHED
→ DETAIL_COMPOSED
→ ORDER_CREATED
→ ORDER_MATCHED
→ PRE_SETTLEMENT_READY

Alternative terminal states:

- REJECTED
- CANCELLED

## Guardrails

Invalid jumps are rejected.

Terminal states cannot continue.

Lifecycle events are append-only snapshots.

Lifecycle state does not imply:

- payment
- settlement
- ownership transfer
- wallet approval
- blockchain finality
- governance authority

`PRE_SETTLEMENT_READY != settlement`

`ORDER_MATCHED != paid`

`authoritative:false`
