export type {
  AuthenticationAssurance,
  AuthenticationState,
  AuthorizationContext,
  BrandedIdentityId,
  IdentityContext,
  IdentityEvidence,
  IdentityEvidenceId,
  IdentitySource,
  SessionId,
  SubjectId,
  TenantId,
  UserId,
  UserIdentity,
} from "./types.ts";

export {
  createIdentityEvidenceId,
  createSessionId,
  createSubjectId,
  createTenantId,
  createUserId,
} from "./ids.ts";

export {
  createIdentityContext,
  hasIdentityCapability,
  isAuthenticatedIdentityContext,
} from "./context.ts";

export type {
  AccountSelection,
  CreateTradingUserContextInput,
  TradingEnvironment,
  TradingUserContext,
  WalletSelection,
  WorkspaceId,
} from "./userContext.ts";

export {
  createAccountSelection,
  createTradingUserContext,
  createWalletSelection,
  createWorkspaceId,
  selectTradingAccount,
  selectTradingWallet,
  updateTradingUserContextValidation,
} from "./userContext.ts";

export type {
  WalletAddress,
  WalletBinding,
  WalletBindingId,
  WalletBindingState,
  WalletBrandedId,
  WalletChain,
  WalletChainFamily,
  WalletConnection,
  WalletConnectionId,
  WalletConnectionState,
  WalletId,
  WalletIdentity,
  WalletProof,
  WalletProofId,
  WalletSignatureEvidence,
  WalletVerificationState,
} from "./walletTypes.ts";

export {
  createWalletAddress,
  createWalletBinding,
  createWalletBindingId,
  createWalletChain,
  createWalletConnection,
  createWalletConnectionId,
  createWalletId,
  createWalletIdentity,
  createWalletProof,
  createWalletProofId,
  createWalletSignatureEvidence,
  disconnectWalletConnection,
  revokeWalletBinding,
  sameWalletChain,
  walletBindingMatches,
} from "./wallet.ts";

export type {
  ConnectWalletInput,
  SwitchWalletChainInput,
  WalletConnectionFailure,
  WalletConnectionFailureCode,
  WalletConnectionResult,
  WalletConnectionSuccess,
  WalletConnectorPort,
  WalletProviderAccount,
} from "./walletConnection.ts";

export {
  connectWallet,
  disconnectWallet,
  expireWalletConnection,
  switchWalletChain,
  walletConnectionMatchesWallet,
} from "./walletConnection.ts";

export type {
  AssetKind,
  AssetObservationId,
  BlockchainObservationSource,
  BoundWalletOwnershipEvidence,
  FungibleTokenAsset,
  NativeTokenAsset,
  NftAsset,
  ObservedAsset,
  OwnershipEvidenceId,
  OwnershipEvidenceStatus,
  WalletAssetObservation,
  WalletOwnershipEvidence,
} from "./ownershipEvidence.ts";

export {
  bindOwnershipEvidenceToIdentity,
  buildWalletOwnershipEvidence,
  createAssetObservationId,
  createFungibleTokenAsset,
  createNativeTokenAsset,
  createNftAsset,
  createOwnershipEvidenceId,
  createWalletAssetObservation,
  hasObservedNftHolding,
  markOwnershipEvidenceStale,
  readObservedAssetQuantity,
} from "./ownershipEvidence.ts";

export type {
  IdentityWalletSecurityFailure,
  IdentityWalletSecurityFailureCode,
  IdentityWalletSecurityResult,
  IdentityWalletSecuritySuccess,
  WalletProofReplayRegistry,
} from "./security.ts";

export {
  consumeWalletProof,
  createWalletProofReplayRegistry,
  validateIdentitySessionSecurity,
  validateOwnershipEvidenceSecurity,
  validateWalletBindingSecurity,
  validateWalletConnectionSecurity,
  validateWalletProofSecurity,
} from "./security.ts";
