import type {
  CachePort,
} from "./cache";

import type {
  DatabasePort,
} from "./database";

import type {
  ObjectStoragePort,
} from "./objectStorage";

import type {
  QueuePort,
} from "./queue";

export type InfrastructureFoundation = {
  readonly database:
    DatabasePort | null;

  readonly cache:
    CachePort | null;

  readonly objectStorage:
    ObjectStoragePort | null;

  readonly queue:
    QueuePort | null;

  readonly authoritative:
    false;
};

export function createInfrastructureFoundation(
  input: {
    readonly database?:
      DatabasePort | null;

    readonly cache?:
      CachePort | null;

    readonly objectStorage?:
      ObjectStoragePort | null;

    readonly queue?:
      QueuePort | null;
  } = {}
):
  InfrastructureFoundation {
  return {
    database:
      input.database ??
      null,

    cache:
      input.cache ??
      null,

    objectStorage:
      input.objectStorage ??
      null,

    queue:
      input.queue ??
      null,

    authoritative:
      false,
  };
}
