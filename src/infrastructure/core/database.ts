import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "./types";

export type DatabaseTransactionMode =
  | "read-only"
  | "read-write";

export type DatabaseQuery = {
  readonly statement:
    string;

  readonly parameters:
    readonly unknown[];

  readonly operation:
    InfrastructureOperationContext;
};

export type DatabaseMutation = {
  readonly statement:
    string;

  readonly parameters:
    readonly unknown[];

  readonly expectedVersion:
    number | null;

  readonly operation:
    InfrastructureOperationContext;
};

export type DatabaseReadResult<T> = {
  readonly rows:
    readonly T[];

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export type DatabaseWriteResult = {
  readonly affectedRows:
    number;

  readonly version:
    number | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export interface DatabaseTransactionPort {
  readonly mode:
    DatabaseTransactionMode;

  query<T>(
    input:
      DatabaseQuery
  ):
    Promise<
      DatabaseReadResult<T>
    >;

  mutate(
    input:
      DatabaseMutation
  ):
    Promise<
      DatabaseWriteResult
    >;
}

export interface DatabasePort {
  health():
    Promise<
      InfrastructureHealth
    >;

  query<T>(
    input:
      DatabaseQuery
  ):
    Promise<
      DatabaseReadResult<T>
    >;

  mutate(
    input:
      DatabaseMutation
  ):
    Promise<
      DatabaseWriteResult
    >;

  transaction<T>(
    mode:
      DatabaseTransactionMode,

    execute:
      (
        transaction:
          DatabaseTransactionPort
      ) => Promise<T>
  ):
    Promise<T>;
}
