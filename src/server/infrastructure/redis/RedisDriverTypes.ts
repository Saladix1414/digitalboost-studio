export type RedisSetMode =
  | "NX";

export type RedisSetInput = {
  readonly ttlSeconds:
    number | null;

  readonly mode:
    RedisSetMode | null;
};

export interface RedisClientLike {
  get(
    key:
      string
  ):
    Promise<
      string | null
    >;

  set(
    key:
      string,

    value:
      string,

    input:
      RedisSetInput
  ):
    Promise<
      "OK" | null
    >;

  del(
    key:
      string
  ):
    Promise<number>;

  compareAndDelete(
    key:
      string,

    expectedValue:
      string
  ):
    Promise<boolean>;

  ping():
    Promise<string>;
}
