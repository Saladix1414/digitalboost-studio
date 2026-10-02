export type NftBlockchainGatewayStage =
  | "IDLE"
  | "READ"
  | "SIMULATED"
  | "SEND_PREPARED"
  | "SUBMITTED"
  | "VERIFIED"
  | "INDEXED"
  | "FAILED";

export type NftBlockchainGatewayOperation =
  | "READ"
  | "SIMULATE"
  | "SEND"
  | "VERIFY"
  | "INDEX"
  | "RETRY"
  | "FALLBACK";

export type NftBlockchainGatewayFailureCode =
  | "NONE"
  | "INVALID_REQUEST"
  | "SIMULATION_FAILED"
  | "SEND_NOT_ALLOWED"
  | "SUBMISSION_FAILED"
  | "VERIFICATION_FAILED"
  | "INDEX_FAILED"
  | "RETRY_EXHAUSTED"
  | "FALLBACK_REQUIRED";

export type NftBlockchainGatewayRequest = {
  readonly id:
    string;

  readonly operation:
    NftBlockchainGatewayOperation;

  readonly chainRef:
    string;

  readonly contractRef:
    string | null;

  readonly payloadRef:
    string | null;

  readonly authoritative:
    false;
};

export type NftBlockchainGatewayReadResult = {
  readonly requestId:
    string;

  readonly valueRef:
    string;

  readonly stage:
    "READ";

  readonly authoritative:
    false;
};

export type NftBlockchainGatewaySimulationResult = {
  readonly requestId:
    string;

  readonly success:
    boolean;

  readonly simulationRef:
    string;

  readonly stage:
    "SIMULATED";

  readonly authoritative:
    false;
};

export type NftBlockchainGatewaySubmission = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly stage:
    "SUBMITTED";

  readonly authoritative:
    false;
};

export type NftBlockchainGatewayVerification = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly verified:
    boolean;

  readonly blockRef:
    string | null;

  readonly stage:
    "VERIFIED";

  readonly authoritative:
    false;
};

export type NftBlockchainGatewayIndexRecord = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly indexRef:
    string;

  readonly stage:
    "INDEXED";

  readonly authoritative:
    false;
};

export type NftBlockchainGatewayState = {
  readonly id:
    string;

  readonly stage:
    NftBlockchainGatewayStage;

  readonly failureCode:
    NftBlockchainGatewayFailureCode;

  readonly attempt:
    number;

  readonly authoritative:
    false;
};
