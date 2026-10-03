# Phase 32A — Trading Islands Activity Center Foundation

Activity Center provides a unified read model for notable Trading Islands events.

## Domains

- DBX
- Marketplace
- NFT
- Blockchain
- Trading
- Bot
- Runtime
- Security
- System

## Responsibilities

Activity Center may:

- record domain activity
- expose user-visible activity
- expose operator-visible activity
- filter by domain
- filter by event type
- filter by severity
- filter by actor
- correlate related references
- summarize recent activity

## Authority boundary

Activity Center is an observational system.

Activity != authority.

Activity != ledger.

Activity != settlement.

Activity != ownership.

Activity != provenance authority.

Activity != blockchain finality.

Activity != approval.

Activity != execution.

Activity events always remain:

authoritative: false

## Mutation boundary

Activity Center must never execute:

- DBX ledger postings
- hold capture
- hold release
- marketplace settlement
- blockchain transactions
- wallet signing
- bot deployment
- trading orders

Domain systems remain responsible for their own state.

Activity Center only records and exposes evidence of what those systems report.
