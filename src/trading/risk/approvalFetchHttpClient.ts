import {
  ApprovalHttpClientError,
} from "./approvalHttpClient";

import type {
  ApprovalHttpClient,
  ApprovalHttpHeaders,
  ApprovalHttpRequest,
  ApprovalHttpResponse,
} from "./approvalHttpClient";


export type ApprovalFetchHttpClientOptions = {
  readonly baseUrl:
    string;

  readonly fetchImpl?:
    typeof fetch;
};


function normalizeBaseUrl(
  value:
    string
):
  string {
  const trimmed =
    value.trim();

  if (
    trimmed.length ===
    0
  ) {
    throw new Error(
      "Approval fetch baseUrl is required."
    );
  }

  let parsed:
    URL;

  try {
    parsed =
      new URL(
        trimmed
      );
  } catch {
    throw new Error(
      "Approval fetch baseUrl must be a valid absolute URL."
    );
  }

  if (
    parsed.protocol !==
      "http:" &&
    parsed.protocol !==
      "https:"
  ) {
    throw new Error(
      "Approval fetch baseUrl must use HTTP or HTTPS."
    );
  }

  return trimmed.replace(
    /\/+$/,
    ""
  );
}


function mergeAbortSignals(
  external:
    AbortSignal | null,

  timeout:
    AbortSignal
):
  AbortSignal {
  if (
    !external
  ) {
    return timeout;
  }

  if (
    external.aborted
  ) {
    return external;
  }

  const controller =
    new AbortController();

  const abort =
    () => {
      controller.abort();
    };

  external.addEventListener(
    "abort",
    abort,
    {
      once:
        true,
    }
  );

  timeout.addEventListener(
    "abort",
    abort,
    {
      once:
        true,
    }
  );

  return controller.signal;
}


function responseHeadersToRecord(
  headers:
    Headers
):
  ApprovalHttpHeaders {
  const result:
    Record<
      string,
      string
    > = {};

  headers.forEach(
    (
      value,
      key
    ) => {
      result[key] =
        value;
    }
  );

  return result;
}


export function createApprovalFetchHttpClient(
  options:
    ApprovalFetchHttpClientOptions
):
  ApprovalHttpClient {
  const baseUrl =
    normalizeBaseUrl(
      options.baseUrl
    );

  const fetchImpl =
    options.fetchImpl ??
    fetch;

  return {
    async request(
      request:
        ApprovalHttpRequest
    ):
      Promise<
        ApprovalHttpResponse
      > {
      const timeoutController =
        new AbortController();

      const timeoutId =
        setTimeout(
          () => {
            timeoutController.abort();
          },
          request.timeoutMs
        );

      const signal =
        mergeAbortSignals(
          request.signal,
          timeoutController.signal
        );

      try {
        const response =
          await fetchImpl(
            `${baseUrl}${request.path}`,
            {
              method:
                request.method,

              headers:
                request.headers,

              body:
                request.body,

              signal,
            }
          );

        const body =
          response.status ===
            204
            ? null
            : await response.text();

        return {
          status:
            response.status,

          headers:
            responseHeadersToRecord(
              response.headers
            ),

          body,
        };
      } catch (
        error
      ) {
        if (
          request.signal?.aborted
        ) {
          throw new ApprovalHttpClientError({
            message:
              "Approval HTTP request was aborted.",

            code:
              "aborted",

            retryable:
              false,
          });
        }

        if (
          timeoutController.signal.aborted
        ) {
          throw new ApprovalHttpClientError({
            message:
              "Approval HTTP request timed out.",

            code:
              "timeout",

            retryable:
              true,
          });
        }

        throw new ApprovalHttpClientError({
          message:
            error instanceof Error
              ? error.message
              : "Approval HTTP network request failed.",

          code:
            "network",

          retryable:
            true,
        });
      } finally {
        clearTimeout(
          timeoutId
        );
      }
    },
  };
}
