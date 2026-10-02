# Phase 29A — Marketplace Engine Foundation

The Marketplace Engine coordinates existing NFT Marketplace domains.

Canonical sequence:

READY LISTING
→ ELIGIBILITY
→ SALE INTENT
→ LISTED
→ DETAIL
→ ORDER INTENT
→ MATCHED
→ PRE-SETTLEMENT READY

## Engine responsibility

The engine may coordinate:

- listing eligibility
- sale intent
- listing publication state
- NFT detail composition
- buyer order intent
- deterministic order matching
- pre-settlement preparation

## Engine does not execute

The engine does not perform:

- DBX debit
- token transfer
- payment
- wallet signing
- RPC
- smart contract calls
- blockchain settlement
- ownership transfer

`PRE_SETTLEMENT_READY` is not settlement.

`MATCHED` is not paid.

`LISTED` is not ownership proof.

`authoritative:false`
