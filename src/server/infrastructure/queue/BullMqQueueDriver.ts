import {
  Queue,
  createNodeRedisClient,
} from "bullmq";

import {
  createClient,
} from "redis";

import type {
  QueueDriverLike,
  QueueDriverPublishInput,
} from "./QueueDriverTypes";

export type ManagedQueueDriver =
  QueueDriverLike & {
    close():
      Promise<void>;
  };

export type BullMqQueueDriverFactory =
  (
    input: {
      readonly redisUrl:
        string;

      readonly queueName:
        string;
    }
  ) =>
    Promise<
      ManagedQueueDriver
    >;

export async function createBullMqQueueDriver(
  input: {
    readonly redisUrl:
      string;

    readonly queueName:
      string;
  }
):
  Promise<
    ManagedQueueDriver
  > {
  const rawRedis =
    createClient({
      url:
        input.redisUrl,
    });

  rawRedis.on(
    "error",
    () => {
      // Queue health is surfaced via QueueDriverLike.ping().
      // Redis secrets are intentionally never logged here.
    }
  );

  const connection =
    createNodeRedisClient(
      rawRedis
    );

  const queue =
    new Queue<
      QueueDriverPublishInput
    >(
      input.queueName,
      {
        connection,
      }
    );

  await queue.waitUntilReady();

  let closed =
    false;

  return {
    async publish(
      message:
        QueueDriverPublishInput
    ) {
      const job =
        await queue.add(
          message.type,
          message,
          {
            jobId:
              message.id,

            removeOnComplete:
              100,

            removeOnFail:
              500,
          }
        );

      return {
        accepted:
          true,

        messageId:
          job.id ??
          message.id,
      };
    },

    async ping():
      Promise<string> {
      await queue.waitUntilReady();

      return "READY";
    },

    async close():
      Promise<void> {
      if (
        closed
      ) {
        return;
      }

      closed =
        true;

      await queue.close();

      if (
        rawRedis.isOpen
      ) {
        await rawRedis.quit();
      }
    },
  };
}
