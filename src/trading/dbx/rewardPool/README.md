# Phase 31C8 — Economic Reward Pool

This module manages the economic DBX Reward Pool.

It does not create DBX.

Funding moves existing DBX from another economic account into the reward pool.

Distribution moves existing DBX from the reward pool to an eligible recipient.

## Canonical flows

Funding:

Economic source
→ DEBIT
→ Reward Pool
→ CREDIT

Distribution:

Reward Pool
→ DEBIT
→ Recipient
→ CREDIT

Every operation is balanced through the canonical DBX Ledger.

## Economic invariant

Reward Pool funding != issuance.

Reward distribution != issuance.

No transaction in this module uses SYSTEM_ISSUANCE.

## Critical naming boundary

The economic `REWARD_POOL` account is NOT `DBX Rewards`.

DBX Rewards are non-economic usage credits for eligible Free users.

DBX Rewards:

- have no monetary value
- do not enter the DBX Ledger
- cannot be transferred
- cannot be withdrawn
- cannot be traded
- cannot purchase marketplace assets
- cannot convert into DBX

Advertising revenue belongs to the DigitalBoost business economics and does not make DBX Rewards economically redeemable.

## Authority

Reward Pool records are accounting evidence.

They are not governance authority.

`systemOfRecord: DBX_LEDGER`

`governanceAuthority: false`
