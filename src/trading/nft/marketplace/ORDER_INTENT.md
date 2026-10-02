# Marketplace Order Intent

Phase 26C introduces buyer intent and deterministic buyer/seller matching.

## Flow

LISTED listing

 order CREATED

 validation

 MATCHED

 pre-settlement model

## Validation

Order validation checks:

- buyer identity
- buyer wallet reference
- seller identity
- buyer != seller
- listing status
- price alignment
- asset alignment
- seller alignment

## Pre-settlement

Pre-settlement means only that the local domain has a coherent matched order.

It does not mean:

- payment executed
- DBX debited
- funds reserved
- wallet signed
- smart contract called
- ownership transferred
- blockchain settlement completed

Real execution remains reserved for later infrastructure and Blockchain Gateway phases.

All order and pre-settlement records remain:

`authoritative:false`
