import type {
  ApprovalPersistenceConfig,
  ApprovalPersistenceMode,
} from "./approvalPersistenceMode";


export const APPROVAL_ENV_KEYS = {
  mode:
    "VITE_TRADING_APPROVAL_PERSISTENCE_MODE",

  baseUrl:
    "VITE_TRADING_APPROVAL_BASE_URL",

  path:
    "VITE_TRADING_APPROVAL_PATH",

  timeoutMs:
    "VITE_TRADING_APPROVAL_TIMEOUT_MS",
} as const;


export type ApprovalEnvironmentValues = {
  readonly [key:
    string]:
    string | boolean | undefined;
};


function readString(
  env:
    ApprovalEnvironmentValues,

  key:
    string
):
  string | null {
  const value =
    env[key];

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return (
    trimmed.length >
      0
      ? trimmed
      : null
  );
}


function parseMode(
  raw:
    string | null
):
  ApprovalPersistenceMode {
  if (
    raw ===
      null ||
    raw ===
      "local"
  ) {
    return "local";
  }

  if (
    raw ===
    "remote"
  ) {
    return "remote";
  }

  throw new Error(
    `Invalid approval persistence mode: ${raw}.`
  );
}


function parseTimeout(
  raw:
    string | null
):
  number | undefined {
  if (
    raw ===
    null
  ) {
    return undefined;
  }

  const value =
    Number(
      raw
    );

  if (
    !Number.isInteger(
      value
    ) ||
    value <=
      0
  ) {
    throw new Error(
      "Approval persistence timeout must be a positive integer."
    );
  }

  return value;
}


function validateRelativePath(
  path:
    string | null
):
  string | undefined {
  if (
    path ===
    null
  ) {
    return undefined;
  }

  if (
    !path.startsWith(
      "/"
    )
  ) {
    throw new Error(
      "Approval persistence path must be relative."
    );
  }

  if (
    path.startsWith(
      "//"
    )
  ) {
    throw new Error(
      "Approval persistence path cannot be protocol-relative."
    );
  }

  return path;
}


function validateRemoteBaseUrl(
  value:
    string | null
):
  string {
  if (
    value ===
    null
  ) {
    throw new Error(
      "Remote approval persistence requires VITE_TRADING_APPROVAL_BASE_URL."
    );
  }

  let parsed:
    URL;

  try {
    parsed =
      new URL(
        value
      );
  } catch {
    throw new Error(
      "Approval persistence base URL must be a valid absolute URL."
    );
  }

  if (
    parsed.protocol !==
      "http:" &&
    parsed.protocol !==
      "https:"
  ) {
    throw new Error(
      "Approval persistence base URL must use HTTP or HTTPS."
    );
  }

  return value;
}


export function parseApprovalEnvironmentConfig(
  env:
    ApprovalEnvironmentValues
):
  ApprovalPersistenceConfig {
  const mode =
    parseMode(
      readString(
        env,
        APPROVAL_ENV_KEYS.mode
      )
    );

  if (
    mode ===
    "local"
  ) {
    return {
      mode:
        "local",
    };
  }

  const baseUrl =
    validateRemoteBaseUrl(
      readString(
        env,
        APPROVAL_ENV_KEYS.baseUrl
      )
    );

  const path =
    validateRelativePath(
      readString(
        env,
        APPROVAL_ENV_KEYS.path
      )
    );

  const timeoutMs =
    parseTimeout(
      readString(
        env,
        APPROVAL_ENV_KEYS.timeoutMs
      )
    );

  return {
    mode:
      "remote",

    baseUrl,

    path,

    timeoutMs,
  };
}


export function readApprovalEnvironmentConfig():
  ApprovalPersistenceConfig {
  const meta =
    import.meta as
      ImportMeta & {
        readonly env?:
          ApprovalEnvironmentValues;
      };

  return parseApprovalEnvironmentConfig(
    meta.env ??
    {}
  );
}
