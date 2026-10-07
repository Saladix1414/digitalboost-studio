import type {
  QueueMessage,
  QueuePort,
  QueuePublishResult,
} from "../../../infrastructure/core/queue";

import type {
  InfrastructureHealth,
  InfrastructureResultMetadata,
} from "../../../infrastructure/core/types";

import type {
  QueueDriverLike,
} from "./QueueDriverTypes";

export type QueueAdapterOptions = {
  readonly source?:
    string;

  readonly now?:
    () => string;
};

function metadata(
  source:
    string,

  now:
    () => string
):
  InfrastructureResultMetadata {
  return {
    observedAt:
      now(),

    source,

    authoritative:
      false,
  };
}

export function createQueueAdapter(
  driver:
    QueueDriverLike,

  options:
    QueueAdapterOptions = {}
):
  QueuePort {
  const source =
    options.source ??
    "queue";

  const now =
    options.now ??
    (() =>
      new Date().toISOString());

  return {
    async health():
      Promise<
        InfrastructureHealth
      > {
      try {
        const pong =
          await driver.ping();

        return {
          state:
            pong.length >
              0
              ? "ready"
              : "degraded",

          checkedAt:
            now(),

          detail:
            null,

          authoritative:
            false,
        };
      } catch {
        return {
          state:
            "unavailable",

          checkedAt:
            now(),

          detail:
            "Queue health check failed.",

          authoritative:
            false,
        };
      }
    },

    async publish<T>(
      message:
        QueueMessage<T>
    ):
      Promise<
        QueuePublishResult
      > {
      const result =
        await driver.publish({
          id:
            message.id,

          type:
            message.type,

          payload:
            message.payload,

          correlationId:
            message.correlationId,

          createdAt:
            message.createdAt,
        });

      return {
        accepted:
          result.accepted,

        messageId:
          result.messageId,

        metadata:
          metadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },
  };
}
