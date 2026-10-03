# Phase 32C — Unified Activity Timeline + Correlation

This subsystem reconstructs cross-domain activity histories from unified Activity Center events.

## Correlation examples

- transaction
- marketplaceOrder
- request
- bot
- strategy
- NFT
- consumptionIntent
- lifecycle

## Example

A marketplace purchase may produce:

NFT Marketplace
→ order matched

DBX
→ consumption or settlement posted

Blockchain
→ submission recorded

Blockchain
→ verification recorded

Blockchain
→ indexing recorded

All may be reconstructed into one timeline when they share references.

## Critical boundaries

Correlation != causation.

Correlation != authority.

Timeline != execution.

Timeline != ledger.

Timeline != approval.

Timeline != ownership.

Timeline != blockchain finality.

Timeline does not mutate source systems.

All timeline data remains:

authoritative: false
