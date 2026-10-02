# NFT Marketplace

Phase 26 introduces the NFT Marketplace domain.

The initial marketplace models:

- listings
- seller references
- asset references
- price intent
- sale type
- lifecycle states
- deterministic validation

## Listing lifecycle

DRAFT

 READY

 LISTED

From LISTED:

- PAUSED
- SOLD
- CANCELLED
- EXPIRED

Terminal states:

- SOLD
- CANCELLED
- EXPIRED

## Important boundaries

A marketplace listing is not blockchain execution.

A listed status does not prove that an on-chain listing exists.

A sold status in this local domain does not prove blockchain settlement.

Seller wallet references are identifiers only.

They do not establish legal ownership.

Price is modeled intent.

No DBX debit exists yet.

No smart contract call exists yet.

No wallet signing exists yet.

No RPC exists yet.

Real blockchain execution remains owned by Phase 30 — Blockchain Gateway.

All marketplace records remain:

`authoritative:false`
