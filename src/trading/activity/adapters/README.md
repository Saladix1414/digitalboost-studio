# Phase 32B — Cross-Domain Activity Adapters

Phase 32B projects evidence from existing Trading Islands domains into the unified Activity Center model.

## Current adapters

- DBX Consumption
- DBX Marketplace Settlement
- NFT Marketplace Lifecycle
- NFT Blockchain Gateway

## Design rule

Adapters are projections.

They do not mutate source domains.

Source domain evidence
→ adapter
→ TradingActivityEvent

## Critical boundaries

Activity projection != execution.

Activity projection != accounting authority.

Activity projection != blockchain finality.

Activity projection != ownership.

Activity projection != approval.

Activity projection != settlement.

Activity Center does not call domain mutation functions.

Historical TradingActivityItem and builders remain preserved.

## Authority

All unified Activity Center events remain:

authoritative: false

A source domain may contain authoritative approval evidence under its own historical model, but the unified Activity Center projection remains observational.
