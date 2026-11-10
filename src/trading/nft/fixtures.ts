import type {
  NftAsset,
  NftCollection,
  NftForgeActivity,
} from "./types";

export const nftCollectionsFixture:
  readonly NftCollection[] = [
    {
      id: "collection-origin-001",
      name: "OriginX Foundation Origins",
      symbol: "DBO",
      description:
        "Deterministic collection fixture for the NFT Forge product foundation.",
      creator: "OriginX Foundation Studio",
      status: "ACTIVE",
      version: 1,
      assetIds: [
        "asset-origin-001",
        "asset-origin-002",
      ],
      createdAt:
        "2026-09-01T12:00:00.000Z",
      updatedAt:
        "2026-09-01T12:00:00.000Z",
    },
    {
      id: "collection-signal-001",
      name: "Signal Constructs",
      symbol: "SGNL",
      description:
        "Experimental digital objects created inside the local Forge workspace.",
      creator: "OriginX Foundation Studio",
      status: "DRAFT",
      version: 1,
      assetIds: [
        "asset-signal-001",
      ],
      createdAt:
        "2026-09-02T12:00:00.000Z",
      updatedAt:
        "2026-09-02T12:00:00.000Z",
    },
  ];

export const nftAssetsFixture:
  readonly NftAsset[] = [
    {
      id: "asset-origin-001",
      title: "Origin Node 01",
      collectionId:
        "collection-origin-001",
      creator: "OriginX Foundation Studio",
      mediaKind: "image",
      status: "READY",
      traits: [
        {
          traitType: "Edition",
          value: "Genesis",
        },
        {
          traitType: "System",
          value: "Origin",
        },
      ],
      metadata: {
        name: "Origin Node 01",
        description:
          "Genesis deterministic asset for the OriginX Foundation Origins collection.",
        attributes: [
          {
            traitType: "Edition",
            value: "Genesis",
          },
          {
            traitType: "System",
            value: "Origin",
          },
        ],
      },
      version: 1,
      updatedAt:
        "2026-09-01T12:05:00.000Z",
    },
    {
      id: "asset-origin-002",
      title: "Origin Node 02",
      collectionId:
        "collection-origin-001",
      creator: "OriginX Foundation Studio",
      mediaKind: "interactive",
      status: "DRAFT",
      traits: [
        {
          traitType: "Edition",
          value: "Prototype",
        },
      ],
      metadata: {
        name: "Origin Node 02",
        description:
          "Prototype interactive asset in the OriginX Foundation Origins collection.",
        attributes: [
          {
            traitType: "Edition",
            value: "Prototype",
          },
        ],
      },
      version: 1,
      updatedAt:
        "2026-09-01T12:15:00.000Z",
    },
    {
      id: "asset-signal-001",
      title: "Signal Construct 01",
      collectionId:
        "collection-signal-001",
      creator: "OriginX Foundation Studio",
      mediaKind: "image",
      status: "DRAFT",
      traits: [
        {
          traitType: "Signal",
          value: "Synthetic",
        },
      ],
      metadata: {
        name: "Signal Construct 01",
        description:
          "Deterministic synthetic signal asset.",
        attributes: [
          {
            traitType: "Signal",
            value: "Synthetic",
          },
        ],
      },
      version: 1,
      updatedAt:
        "2026-09-02T12:10:00.000Z",
    },
  ];

export const nftForgeActivityFixture:
  readonly NftForgeActivity[] = [
    {
      id: "forge-activity-001",
      kind: "collection.created",
      collectionId:
        "collection-origin-001",
      label:
        "OriginX Foundation Origins collection created",
      timestamp:
        "2026-09-01T12:00:00.000Z",
      authoritative: false,
    },
    {
      id: "forge-activity-002",
      kind: "asset.attached",
      collectionId:
        "collection-origin-001",
      assetId:
        "asset-origin-001",
      label:
        "Origin Node 01 attached to OriginX Foundation Origins",
      timestamp:
        "2026-09-01T12:05:00.000Z",
      authoritative: false,
    },
  ];
