import {
  ApprovalBackendError,
} from "./approvalBackendTransactions";

import {
  deserializeApprovalBackendReadResponse,
  mapApprovalBackendErrorDto,
  parseApprovalBackendErrorDto,
  parseApprovalBackendWriteResponse,
  serializeApprovalBackendClearRequest,
  serializeApprovalBackendWriteRequest,
} from "./approvalBackendTransport";

import {
  ApprovalHttpClientError,
  createApprovalHttpRequest,
  isApprovalHttpRetryableStatus,
  isApprovalHttpSuccess,
} from "./approvalHttpClient";

import type {
} from "./approvalBackendTransport";

import type {
  ApprovalHttpClient,
  ApprovalHttpResponse,
} from "./approvalHttpClient";

import type {
  ApprovalBackendClient,
  ApprovalBackendClearInput,
  ApprovalBackendWriteInput,
} from "./remoteApprovalPersistence";


export const APPROVAL_HTTP_PATH =
  "/approval";


export type ApprovalHttpBackendClientOptions = {
  readonly path?:
    string;

  readonly timeoutMs?:
    number;
};


function parseJsonBody(
  response:
    ApprovalHttpResponse
):
  unknown {
  if (
    response.body ===
    null
  ) {
    throw new ApprovalHttpClientError({
      message:
        "Approval backend returned an empty JSON response.",

      code:
        "invalid-response",

      retryable:
        false,

      status:
        response.status,
    });
  }

  try {
    return JSON.parse(
      response.body
    ) as unknown;
  } catch {
    throw new ApprovalHttpClientError({
      message:
        "Approval backend returned invalid JSON.",

      code:
        "invalid-response",

      retryable:
        false,

      status:
        response.status,
    });
  }
}

function throwApprovalHttpBackendError(
  response:
    ApprovalHttpResponse
):
  never {
  if (
    response.body !==
    null
  ) {
    try {
      const parsed =
        JSON.parse(
          response.body
        ) as unknown;

      const dto =
        parseApprovalBackendErrorDto(
          parsed
        );

      throw mapApprovalBackendErrorDto(
        dto
      );
    } catch (
      error
    ) {
      if (
        error instanceof
          ApprovalBackendError
      ) {
        throw error;
      }
    }
  }

  throw new ApprovalBackendError({
    message:
      `Approval backend request failed with HTTP ${response.status}.`,

    code:
      isApprovalHttpRetryableStatus(
        response.status
      )
        ? "unavailable"
        : "internal",

    operation:
      "read",

    retryable:
      isApprovalHttpRetryableStatus(
        response.status
      ),
  });
}

export function createApprovalHttpBackendClient(
  http:
    ApprovalHttpClient,

  options:
    ApprovalHttpBackendClientOptions = {}
):
  ApprovalBackendClient {
  const path =
    options.path ??
    APPROVAL_HTTP_PATH;

  const timeoutMs =
    options.timeoutMs ??
    10_000;

  return {
    async read() {
      const response =
        await http.request(
          createApprovalHttpRequest({
            method:
              "GET",

            path,

            headers: {
              accept:
                "application/json",
            },

            timeoutMs,
          })
        );

      if (
        !isApprovalHttpSuccess(
          response
        )
      ) {
        throwApprovalHttpBackendError(
          response
        );
      }

      const dto =
        parseJsonBody(
          response
        );

      try {
        return deserializeApprovalBackendReadResponse(
          dto
        );
      } catch (
        error
      ) {
        throw new ApprovalHttpClientError({
          message:
            error instanceof Error
              ? `Approval backend returned invalid approval state: ${error.message}`
              : "Approval backend returned invalid approval state.",

          code:
            "invalid-response",

          retryable:
            false,

          status:
            response.status,
        });
      }
    },


    async write(
      input:
        ApprovalBackendWriteInput
    ) {
      const requestDto =
        serializeApprovalBackendWriteRequest(
          input
        );

      const response =
        await http.request(
          createApprovalHttpRequest({
            method:
              "PUT",

            path,

            headers: {
              accept:
                "application/json",

              "content-type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestDto
              ),

            timeoutMs,
          })
        );

      if (
        !isApprovalHttpSuccess(
          response
        )
      ) {
        throwApprovalHttpBackendError(
          response
        );
      }

      const parsed =
        parseJsonBody(
          response
        );

      let dto;

      try {
        dto =
          parseApprovalBackendWriteResponse(
            parsed
          );
      } catch (
        error
      ) {
        throw new ApprovalHttpClientError({
          message:
            error instanceof Error
              ? `Approval backend returned invalid write response: ${error.message}`
              : "Approval backend returned invalid write response.",

          code:
            "invalid-response",

          retryable:
            false,

          status:
            response.status,
        });
      }

      return {
        revision:
          dto.revision,

        authoritative:
          false,
      };
    },


    async clear(
      input:
        ApprovalBackendClearInput
    ) {
      const requestDto =
        serializeApprovalBackendClearRequest(
          input
        );

      const response =
        await http.request(
          createApprovalHttpRequest({
            method:
              "DELETE",

            path,

            headers: {
              accept:
                "application/json",

              "content-type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestDto
              ),

            timeoutMs,
          })
        );

      if (
        !isApprovalHttpSuccess(
          response
        )
      ) {
        throwApprovalHttpBackendError(
          response
        );
      }
    },
  };
}
