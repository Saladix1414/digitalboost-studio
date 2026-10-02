# NFT Detail

Phase 28 introduces the NFT Detail domain.

The detail layer composes product-facing information from existing NFT systems.

## Current composition

- asset identity
- collection reference
- creator reference
- DNA reference
- provenance reference
- marketplace listing
- seller reference
- wallet reference identifier
- price
- sale type
- listing state

## Important boundaries

NFT Detail is a composed read model.

It does not establish:

- legal ownership
- verified seller authority
- absolute authenticity
- payment execution
- wallet approval
- blockchain availability
- blockchain finality

The detail view may display references produced by earlier phases,
but displaying those references does not escalate their authority.

All detail records remain:

`authoritative:false`

Phase 30 remains the owner of real blockchain read/simulate/send/verify behavior.
