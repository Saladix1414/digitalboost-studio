import type {
  DbxLedgerAccount,
  DbxLedgerTransactionDraft,
} from "./types";

export const dbxLedgerAccountFixtures:
  readonly DbxLedgerAccount[] =
  [
    {
      id:
        "dbx-system-issuance",

      kind:
        "SYSTEM_ISSUANCE",

      ownerRef:
        "digitalboost:system",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-platform-treasury",

      kind:
        "PLATFORM_TREASURY",

      ownerRef:
        "digitalboost:treasury",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-reward-pool",

      kind:
        "REWARD_POOL",

      ownerRef:
        "digitalboost:rewards",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-fee-pool",

      kind:
        "FEE_POOL",

      ownerRef:
        "digitalboost:fees",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-marketplace-clearing",

      kind:
        "MARKETPLACE_CLEARING",

      ownerRef:
        "digitalboost:marketplace",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-escrow",

      kind:
        "ESCROW",

      ownerRef:
        "digitalboost:escrow",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-creator-001",

      kind:
        "CREATOR",

      ownerRef:
        "creator:001",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },

    {
      id:
        "dbx-user-001",

      kind:
        "USER",

      ownerRef:
        "user:001",

      currency:
        "DBX",

      status:
        "ACTIVE",

      createdAt:
        "2026-10-02T10:00:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    },
  ] as const;

export const dbxOpeningIssuanceFixture:
  DbxLedgerTransactionDraft = {
    id:
      "dbx-tx-opening-001",

    idempotencyKey:
      "idem-dbx-opening-001",

    kind:
      "ISSUANCE",

    reference:
      "digitalboost:genesis:treasury",

    entries: [
      {
        id:
          "dbx-entry-opening-debit",

        accountId:
          "dbx-system-issuance",

        side:
          "DEBIT",

        amountMinor:
          1_000_000_000,
      },

      {
        id:
          "dbx-entry-opening-credit",

        accountId:
          "dbx-platform-treasury",

        side:
          "CREDIT",

        amountMinor:
          1_000_000_000,
      },
    ],

    createdAt:
      "2026-10-02T10:01:00.000Z",

    reversalOf:
      null,

    metadata: {
      purpose:
        "deterministic-genesis-fixture",
    },
  };

export const dbxCreatorRewardFixture:
  DbxLedgerTransactionDraft = {
    id:
      "dbx-tx-reward-001",

    idempotencyKey:
      "idem-dbx-reward-001",

    kind:
      "REWARD",

    reference:
      "creation:asset-001",

    entries: [
      {
        id:
          "dbx-entry-reward-debit",

        accountId:
          "dbx-platform-treasury",

        side:
          "DEBIT",

        amountMinor:
          25_000_000,
      },

      {
        id:
          "dbx-entry-reward-credit",

        accountId:
          "dbx-creator-001",

        side:
          "CREDIT",

        amountMinor:
          25_000_000,
      },
    ],

    createdAt:
      "2026-10-02T10:02:00.000Z",

    reversalOf:
      null,

    metadata: {
      purpose:
        "creator-reward-fixture",

      creationRef:
        "asset-001",
    },
  };
