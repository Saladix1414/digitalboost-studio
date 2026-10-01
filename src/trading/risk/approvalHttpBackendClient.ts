import {
  ApprovalBackendError,
} from "./approvalBackendTransactions";

import {
  deserializeApprovalBackendReadResponse,
  mapApprovalBackendErrorDto,
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
  ApprovalBackendErrorDto,
  ApprovalBackendReadResponseDto,
  ApprovalBackendWriteResponseDto,
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


function parseJsonBody<T>(
  response:
    ApprovalHttpResponse
):
  T {
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
    ) as T;
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
  let dto:
    ApprovalBackendErrorDto | null =
      null;

  if (
    response.body !==
    null
  ) {
    try {
      dto =
        JSON.parse(
          response.body
        ) as ApprovalBackendErrorDto;
    } catch {
      dto =
        null;
    }
  }

  if (
    dto !==
    null &&
    typeof dto.code ===
      "string" &&
    typeof dto.operation ===
      "string" &&
    typeof dto.message ===
      "string"
  ) {
    throw mapApprovalBackendErrorDto(
      dto
    );
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
        parseJsonBody<
          ApprovalBackendReadResponseDto
        >(
          response
        );

      return deserializeApprovalBackendReadResponse(
        dto
      );
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

      const dto =
        parseJsonBody<
          ApprovalBackendWriteResponseDto
        >(
          response
        );

      if (
        !Number.isInteger(
          dto.revision
        ) ||
        dto.revision <
          0
      ) {
        throw new ApprovalHttpClientError({
          message:
            "Approval backend returned an invalid revision.",

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
