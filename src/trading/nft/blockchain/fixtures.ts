import type {
  NftBlockchainGatewayRequest,
} from "./types";

export const nftBlockchainGatewayRequestFixture:
  NftBlockchainGatewayRequest = {
    id:
      "gateway-request-001",

    operation:
      "SIMULATE",

    chainRef:
      "chain:polygon",

    contractRef:
      "contract:nft-marketplace",

    payloadRef:
      "payload:pre-settlement-001",

    authoritative:
      false,
  };
