import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "./types";

export type CacheKey =
  string;

export type CacheValue =
  string;

export type CacheReadResult = {
  readonly value:
    CacheValue | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export type CacheWriteInput = {
  readonly key:
    CacheKey;

  readonly value:
    CacheValue;

  readonly ttlSeconds:
    number | null;

  readonly operation:
    InfrastructureOperationContext;
};

export type CacheDeleteInput = {
  readonly key:
    CacheKey;

  readonly operation:
    InfrastructureOperationContext;
};

export type CacheLockToken =
  string;

export type CacheLockResult = {
  readonly acquired:
    boolean;

  readonly token:
    CacheLockToken | null;

  readonly expiresAt:
    string | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export interface CachePort {
  health():
    Promise<
      InfrastructureHealth
    >;

  get(
    key:
      CacheKey,

    operation:
      InfrastructureOperationContext
  ):
    Promise<
      CacheReadResult
    >;

  set(
    input:
      CacheWriteInput
  ):
    Promise<void>;

  delete(
    input:
      CacheDeleteInput
  ):
    Promise<void>;

  acquireLock(
    input: {
      readonly key:
        CacheKey;

      readonly ttlSeconds:
        number;

      readonly operation:
        InfrastructureOperationContext;
    }
  ):
    Promise<
      CacheLockResult
    >;

  releaseLock(
    input: {
      readonly key:
        CacheKey;

      readonly token:
        CacheLockToken;

      readonly operation:
        InfrastructureOperationContext;
    }
  ):
    Promise<boolean>;
}
