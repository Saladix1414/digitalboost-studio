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

export type NftBlockchainSimulationStatus =
  | "PASS"
  | "FAIL";

export type NftBlockchainSimulationCheckCode =
  | "CHAIN_REFERENCE"
  | "CONTRACT_REFERENCE"
  | "PAYLOAD_REFERENCE"
  | "EXECUTION_BOUNDARY";

export type NftBlockchainSimulationCheck = {
  readonly code:
    NftBlockchainSimulationCheckCode;

  readonly passed:
    boolean;

  readonly message:
    string;

  readonly authoritative:
    false;
};

export type NftBlockchainSimulationReport = {
  readonly requestId:
    string;

  readonly status:
    NftBlockchainSimulationStatus;

  readonly checks:
    readonly NftBlockchainSimulationCheck[];

  readonly simulationRef:
    string;

  readonly executable:
    false;

  readonly authoritative:
    false;
};

export type NftBlockchainSendPreparation = {
  readonly requestId:
    string;

  readonly chainRef:
    string;

  readonly contractRef:
    string;

  readonly payloadRef:
    string;

  readonly simulationRef:
    string;

  readonly stage:
    "SEND_PREPARED";

  readonly walletSigningRequired:
    true;

  readonly transactionSubmitted:
    false;

  readonly executable:
    false;

  readonly authoritative:
    false;
};

export type NftBlockchainSubmissionEvidence = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly chainRef:
    string;

  readonly submittedAt:
    string;

  readonly source:
    "FIXTURE";

  readonly stage:
    "SUBMITTED";

  readonly authoritative:
    false;
};

export type NftBlockchainVerificationCheckCode =
  | "REQUEST_BINDING"
  | "CHAIN_BINDING"
  | "TX_HASH_PRESENT"
  | "BLOCK_REFERENCE_PRESENT";

export type NftBlockchainVerificationCheck = {
  readonly code:
    NftBlockchainVerificationCheckCode;

  readonly passed:
    boolean;

  readonly message:
    string;

  readonly authoritative:
    false;
};

export type NftBlockchainVerificationEvidence = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly chainRef:
    string;

  readonly blockRef:
    string | null;

  readonly checks:
    readonly NftBlockchainVerificationCheck[];

  readonly verified:
    boolean;

  readonly stage:
    "VERIFIED";

  readonly authoritative:
    false;
};

export type NftBlockchainIndexEvidence = {
  readonly requestId:
    string;

  readonly txHash:
    string;

  readonly chainRef:
    string;

  readonly blockRef:
    string;

  readonly indexRef:
    string;

  readonly indexedAt:
    string;

  readonly stage:
    "INDEXED";

  readonly authoritative:
    false;
};

export type NftBlockchainRetryDecision =
  | "RETRY"
  | "FALLBACK"
  | "STOP";

export type NftBlockchainRetryPolicy = {
  readonly maxAttempts:
    number;

  readonly fallbackEnabled:
    boolean;

  readonly authoritative:
    false;
};

export type NftBlockchainRetryResult = {
  readonly attempt:
    number;

  readonly decision:
    NftBlockchainRetryDecision;

  readonly reason:
    string;

  readonly authoritative:
    false;
};

export type NftBlockchainFallbackRecord = {
  readonly requestId:
    string;

  readonly fromChainRef:
    string;

  readonly fallbackRef:
    string;

  readonly reason:
    string;

  readonly executable:
    false;

  readonly authoritative:
    false;
};
