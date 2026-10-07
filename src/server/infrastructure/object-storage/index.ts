export type {
  S3ObjectStorageClientLike,
  S3PutObjectInput,
  S3StoredObject,
} from "./S3DriverTypes";

export type {
  S3ObjectStorageAdapterOptions,
} from "./S3ObjectStorageAdapter";

export {
  createS3ObjectStorageAdapter,
} from "./S3ObjectStorageAdapter";


export type {
  ManagedS3ClientLike,
  S3ClientFactory,
  S3ServerComposition,
} from "./S3ServerComposition";

export {
  composeS3ObjectStorageFromEnvironment,
} from "./S3ServerComposition";
