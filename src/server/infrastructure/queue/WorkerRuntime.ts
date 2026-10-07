import type {
  QueueMessage,
} from "../../../infrastructure/core/queue";

import type {
  WorkerJobResult,
  WorkerPort,
} from "../../../infrastructure/core/worker";

import {
  WORKER_EXECUTION_BOUNDARY,
} from "../../../infrastructure/core/worker";

export type WorkerRuntimeOptions = {
  readonly maxAttempts?:
    number;
};

export type WorkerRuntimeResult = {
  readonly job:
    WorkerJobResult;

  readonly attempts:
    number;

  readonly authoritative:
    false;
};

export function createWorkerRuntime<T>(
  worker:
    WorkerPort<T>,

  options:
    WorkerRuntimeOptions = {}
) {
  const maxAttempts =
    options.maxAttempts ??
    3;

  if (
    !Number.isInteger(
      maxAttempts
    ) ||
    maxAttempts <=
      0
  ) {
    throw new Error(
      "Worker maxAttempts must be a positive integer."
    );
  }

  return {
    async process(
      message:
        QueueMessage<T>
    ):
      Promise<
        WorkerRuntimeResult
      > {
      let attempts =
        0;

      while (
        attempts <
        maxAttempts
      ) {
        attempts +=
          1;

        const result =
          await worker.process(
            message
          );

        if (
          result.state !==
            "retry"
        ) {
          return {
            job:
              result,

            attempts,

            authoritative:
              false,
          };
        }
      }

      return {
        job: {
          state:
            "failed",

          detail:
            "Worker retry limit exhausted.",

          authoritative:
            false,
        },

        attempts,

        authoritative:
          false,
      };
    },

    boundary:
      WORKER_EXECUTION_BOUNDARY,
  };
}
