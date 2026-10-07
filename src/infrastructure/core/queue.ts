import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "./types";

export type QueueMessageId =
  string;

export type QueueMessage<T> = {
  readonly id:
    QueueMessageId;

  readonly type:
    string;

  readonly payload:
    T;

  readonly createdAt:
    string;

  readonly correlationId:
    string | null;

  readonly authoritative:
    false;
};

export type QueuePublishInput<T> = {
  readonly message:
    QueueMessage<T>;

  readonly operation:
    InfrastructureOperationContext;
};

export type QueuePublishResult = {
  readonly accepted:
    boolean;

  readonly messageId:
    QueueMessageId;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export interface QueuePort {
  health():
    Promise<
      InfrastructureHealth
    >;

  publish<T>(
    input:
      QueuePublishInput<T>
  ):
    Promise<
      QueuePublishResult
    >;
}

export function createQueueMessage<T>(
  input: {
    readonly id:
      QueueMessageId;

    readonly type:
      string;

    readonly payload:
      T;

    readonly createdAt:
      string;

    readonly correlationId?:
      string | null;
  }
):
  QueueMessage<T> {
  if (
    input.id.trim().length ===
      0
  ) {
    throw new Error(
      "Queue message id is required."
    );
  }

  if (
    input.type.trim().length ===
      0
  ) {
    throw new Error(
      "Queue message type is required."
    );
  }

  return {
    id:
      input.id,

    type:
      input.type,

    payload:
      input.payload,

    createdAt:
      input.createdAt,

    correlationId:
      input.correlationId ??
      null,

    authoritative:
      false,
  };
}
