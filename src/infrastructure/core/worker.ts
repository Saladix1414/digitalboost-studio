import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "./types";

import type {
  QueueMessage,
} from "./queue";

export type WorkerJobState =
  | "accepted"
  | "completed"
  | "retry"
  | "failed"
  | "blocked";

export type WorkerJobResult = {
  readonly state:
    WorkerJobState;

  readonly detail:
    string | null;

  readonly retryAfterSeconds:
    number | null;

  readonly metadata:
    InfrastructureResultMetadata;

  readonly authoritative:
    false;
};

export interface WorkerPort<T> {
  health():
    Promise<
      InfrastructureHealth
    >;

  process(
    message:
      QueueMessage<T>,

    operation:
      InfrastructureOperationContext
  ):
    Promise<
      WorkerJobResult
    >;
}

export type WorkerExecutionBoundary = {
  readonly mayExecuteExternalSideEffects:
    false;

  readonly mayBypassPolicy:
    false;

  readonly mayBypassRisk:
    false;

  readonly mayBypassApproval:
    false;

  readonly authoritative:
    false;
};

export const WORKER_EXECUTION_BOUNDARY:
  WorkerExecutionBoundary = {
    mayExecuteExternalSideEffects:
      false,

    mayBypassPolicy:
      false,

    mayBypassRisk:
      false,

    mayBypassApproval:
      false,

    authoritative:
      false,
  };
