# Phase 31C6 — Creator Earnings & Marketplace Settlement

Marketplace settlement moves existing DBX.

It does not issue new DBX.

Canonical flow:

BUYER
→ RESERVED DBX
→ SETTLEMENT PLAN
→ CREATOR EARNINGS
→ PLATFORM FEE
→ DBX LEDGER

## Base allocation

Phase 31C6 establishes two destinations:

- CREATOR
- PLATFORM

Future phases may add:

- Treasury
- Infrastructure pool
- Reward pool
- Affiliate pool
- Tax or compliance reserves

without changing the settlement invariant.

## Core invariant

Buyer debit must equal the sum of all settlement credits.

Example:

Buyer      DEBIT  100 DBX
Creator    CREDIT  85 DBX
Platform   CREDIT  15 DBX

Total debit = total credit.

No new DBX is created.

## Boundaries

Settlement != issuance.

Creator earnings != DBX minting.

Platform fee != governance authority.

DBX Rewards are outside this economic settlement system.

DBX Rewards have no economic value and cannot participate in marketplace settlement.

Rewarded advertising revenue belongs to the DigitalBoost business model and is not represented as transferable DBX Rewards value.

Phase 31C6 does not connect advertising or DBX Rewards.
