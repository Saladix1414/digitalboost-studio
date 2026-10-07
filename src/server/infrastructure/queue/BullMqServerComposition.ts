import type {
  QueuePort,
} from "../../../infrastructure/core/queue";

import type {
  InfrastructureProviderConfiguration,
} from "../../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "../DigitalBoostInfrastructureEnvironment";

import {
  createQueueAdapter,
} from "./QueueAdapter";

import {
  createBullMqQueueDriver,
} from "./BullMqQueueDriver";

import type {
  BullMqQueueDriverFactory,
  ManagedQueueDriver,
} from "./BullMqQueueDriver";

export type QueueServerComposition = {
  readonly enabled:
    boolean;

  readonly queue:
    QueuePort | null;

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

const DEFAULT_QUEUE_NAME =
  "digitalboost-infrastructure";

function requireQueueRedisUrl(
  source:
    InfrastructureEnvironmentSource
):
  string {
  const value =
    source.QUEUE_REDIS_URL?.trim();

  if (
    value === undefined ||
    value.length ===
      0
  ) {
    throw new Error(
      "QUEUE_REDIS_URL is required when Redis queue infrastructure is enabled."
    );
  }

  return value;
}

export async function composeQueueFromEnvironment(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;

    readonly driverFactory?:
      BullMqQueueDriverFactory;

    readonly queueName?:
      string;
  }
):
  Promise<
    QueueServerComposition
  > {
  if (
    input.configuration.queue.provider ===
      "disabled"
  ) {
    return {
      enabled:
        false,

      queue:
        null,

      authoritative:
        false,

      async close():
        Promise<void> {
        // No queue transport exists.
      },
    };
  }

  if (
    input.configuration.queue.provider !==
      "redis-queue"
  ) {
    throw new Error(
      "Unsupported queue provider."
    );
  }

  if (
    input.configuration.queue.connectionReference !==
      "env:QUEUE_REDIS_URL"
  ) {
    throw new Error(
      "Queue server composition requires env:QUEUE_REDIS_URL."
    );
  }

  const redisUrl =
    requireQueueRedisUrl(
      input.source
    );

  const queueName =
    (
      input.queueName ??
      DEFAULT_QUEUE_NAME
    ).trim();

  if (
    queueName.length ===
      0
  ) {
    throw new Error(
      "Queue name is required."
    );
  }

  const factory =
    input.driverFactory ??
    createBullMqQueueDriver;

  const driver:
    ManagedQueueDriver =
    await factory({
      redisUrl,
      queueName,
    });

  const queue =
    createQueueAdapter(
      driver,
      {
        source:
          "bullmq",
      }
    );

  let closed =
    false;

  return {
    enabled:
      true,

    queue,

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

      await driver.close();
    },
  };
}
