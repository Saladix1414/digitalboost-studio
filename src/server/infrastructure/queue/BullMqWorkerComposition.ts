import {
  Worker,
  createNodeRedisClient,
} from "bullmq";

import {
  createClient,
} from "redis";

import {
  createQueueMessage,
} from "../../../infrastructure/core/queue";

import type {
  WorkerPort,
} from "../../../infrastructure/core/worker";

import {
  createWorkerRuntime,
} from "./WorkerRuntime";

import type {
  WorkerRuntimeResult,
} from "./WorkerRuntime";

import type {
  QueueDriverPublishInput,
} from "./QueueDriverTypes";

export type BullMqWorkerComposition = {
  readonly running:
    boolean;

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

export async function createBullMqWorkerComposition<T>(
  input: {
    readonly redisUrl:
      string;

    readonly queueName:
      string;

    readonly worker:
      WorkerPort<T>;

    readonly maxAttempts?:
      number;
  }
):
  Promise<
    BullMqWorkerComposition
  > {
  const redisUrl =
    input.redisUrl.trim();

  const queueName =
    input.queueName.trim();

  if (
    redisUrl.length ===
      0
  ) {
    throw new Error(
      "Worker Redis URL is required."
    );
  }

  if (
    queueName.length ===
      0
  ) {
    throw new Error(
      "Worker queue name is required."
    );
  }

  const runtime =
    createWorkerRuntime(
      input.worker,
      {
        maxAttempts:
          input.maxAttempts,
      }
    );

  if (
    runtime.boundary
      .mayExecuteExternalSideEffects ||
    runtime.boundary
      .mayBypassPolicy ||
    runtime.boundary
      .mayBypassRisk ||
    runtime.boundary
      .mayBypassApproval
  ) {
    throw new Error(
      "Worker execution boundary is unsafe."
    );
  }

  const rawRedis =
    createClient({
      url:
        redisUrl,
    });

  rawRedis.on(
    "error",
    () => {
      // Worker transport errors contain no user-visible secret logging here.
    }
  );

  const connection =
    createNodeRedisClient(
      rawRedis
    );

  const worker =
    new Worker<
      QueueDriverPublishInput,
      WorkerRuntimeResult
    >(
      queueName,
      async job => {
        const data =
          job.data;

        const message =
          createQueueMessage<T>({
            id:
              data.id,

            type:
              data.type,

            payload:
              data.payload as T,

            createdAt:
              data.createdAt,

            correlationId:
              data.correlationId,
          });

        return runtime.process(
          message
        );
      },
      {
        connection,

        autorun:
          false,
      }
    );

  await worker.run();

  let closed =
    false;

  return {
    running:
      true,

    authoritative:
      false,

    async close():
      Promise<void> {
      if (
        closed
      ) {
        return;
      }

      closed =
        true;

      await worker.close();

      if (
        rawRedis.isOpen
      ) {
        await rawRedis.quit();
      }
    },
  };
}
