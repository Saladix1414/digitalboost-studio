export type QueueDriverPublishInput = {
  readonly id:
    string;

  readonly type:
    string;

  readonly payload:
    unknown;

  readonly correlationId:
    string | null;

  readonly createdAt:
    string;
};

export interface QueueDriverLike {
  publish(
    input:
      QueueDriverPublishInput
  ):
    Promise<{
      readonly accepted:
        boolean;

      readonly messageId:
        string;
    }>;

  ping():
    Promise<string>;
}
