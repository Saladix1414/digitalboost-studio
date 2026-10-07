export type S3StoredObject = {
  readonly key:
    string;

  readonly body:
    Uint8Array;

  readonly contentType:
    string;

  readonly etag:
    string | null;

  readonly metadata:
    Readonly<Record<string, string>>;
};

export type S3PutObjectInput = {
  readonly key:
    string;

  readonly body:
    Uint8Array;

  readonly contentType:
    string;

  readonly metadata:
    Readonly<Record<string, string>>;
};

export interface S3ObjectStorageClientLike {
  putObject(
    input:
      S3PutObjectInput
  ):
    Promise<{
      readonly etag:
        string | null;
    }>;

  getObject(
    key:
      string
  ):
    Promise<
      S3StoredObject | null
    >;

  deleteObject(
    key:
      string
  ):
    Promise<void>;

  headObject(
    key:
      string
  ):
    Promise<
      {
        readonly exists:
          boolean;

        readonly etag:
          string | null;
      }
    >;
}
