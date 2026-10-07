import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "./types";

export type ObjectStorageKey =
  string;

export type ObjectStorageContentType =
  string;

export type ObjectStorageObject = {
  readonly key:
    ObjectStorageKey;

  readonly body:
    Uint8Array;

  readonly contentType:
    ObjectStorageContentType | null;

  readonly etag:
    string | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export type ObjectStoragePutInput = {
  readonly key:
    ObjectStorageKey;

  readonly body:
    Uint8Array;

  readonly contentType:
    ObjectStorageContentType | null;

  readonly operation:
    InfrastructureOperationContext;
};

export type ObjectStoragePutResult = {
  readonly key:
    ObjectStorageKey;

  readonly etag:
    string | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export interface ObjectStoragePort {
  health():
    Promise<
      InfrastructureHealth
    >;

  get(
    key:
      ObjectStorageKey,

    operation:
      InfrastructureOperationContext
  ):
    Promise<
      ObjectStorageObject | null
    >;

  put(
    input:
      ObjectStoragePutInput
  ):
    Promise<
      ObjectStoragePutResult
    >;

  delete(
    key:
      ObjectStorageKey,

    operation:
      InfrastructureOperationContext
  ):
    Promise<void>;

  exists(
    key:
      ObjectStorageKey,

    operation:
      InfrastructureOperationContext
  ):
    Promise<boolean>;
}
