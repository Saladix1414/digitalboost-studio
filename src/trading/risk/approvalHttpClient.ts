export type ApprovalHttpMethod =
  | "GET"
  | "PUT"
  | "DELETE";


export type ApprovalHttpHeaders = {
  readonly [name:
    string]:
    string;
};


export type ApprovalHttpRequest = {
  readonly method:
    ApprovalHttpMethod;

  readonly path:
    string;

  readonly headers:
    ApprovalHttpHeaders;

  readonly body:
    string | null;

  readonly timeoutMs:
    number;

  readonly signal:
    AbortSignal | null;
};


export type ApprovalHttpResponse = {
  readonly status:
    number;

  readonly headers:
    ApprovalHttpHeaders;

  readonly body:
    string | null;
};


export type ApprovalHttpFailureCode =
  | "aborted"
  | "timeout"
  | "network"
  | "invalid-response";


export class ApprovalHttpClientError
  extends Error {
  readonly code:
    ApprovalHttpFailureCode;

  readonly retryable:
    boolean;

  readonly status:
    number | null;

  readonly authoritative =
    false as const;

  constructor(
    input: {
      readonly message:
        string;

      readonly code:
        ApprovalHttpFailureCode;

      readonly retryable:
        boolean;

      readonly status?:
        number | null;
    }
  ) {
    super(
      input.message
    );

    this.name =
      "ApprovalHttpClientError";

    this.code =
      input.code;

    this.retryable =
      input.retryable;

    this.status =
      input.status ??
      null;
  }
}


export interface ApprovalHttpClient {
  request(
    request:
      ApprovalHttpRequest
  ):
    Promise<
      ApprovalHttpResponse
    >;
}


export function createApprovalHttpRequest(
  input: {
    readonly method:
      ApprovalHttpMethod;

    readonly path:
      string;

    readonly headers?:
      ApprovalHttpHeaders;

    readonly body?:
      string | null;

    readonly timeoutMs?:
      number;

    readonly signal?:
      AbortSignal | null;
  }
):
  ApprovalHttpRequest {
  const path =
    input.path.trim();

  if (
    path.length ===
    0
  ) {
    throw new Error(
      "Approval HTTP request path is required."
    );
  }

  if (
    !path.startsWith(
      "/"
    )
  ) {
    throw new Error(
      "Approval HTTP request path must be relative."
    );
  }

  const timeoutMs =
    input.timeoutMs ??
    10_000;

  if (
    !Number.isFinite(
      timeoutMs
    ) ||
    timeoutMs <=
      0
  ) {
    throw new Error(
      "Approval HTTP timeout must be greater than zero."
    );
  }

  return {
    method:
      input.method,

    path,

    headers:
      input.headers ??
      {},

    body:
      input.body ??
      null,

    timeoutMs,

    signal:
      input.signal ??
      null,
  };
}


export function isApprovalHttpSuccess(
  response:
    ApprovalHttpResponse
):
  boolean {
  return (
    response.status >=
      200 &&
    response.status <
      300
  );
}


export function isApprovalHttpRetryableStatus(
  status:
    number
):
  boolean {
  return (
    status ===
      408 ||
    status ===
      425 ||
    status ===
      429 ||
    status >=
      500
  );
}
