import { approvePulseAction } from "./DigitalBoostPulseGovernance";
import {
  executePulseAction,
  type PulseExecutionContext,
  type PulseExecutionOutcome,
} from "./DigitalBoostPulseExecutor";

export type PulseClientExecutionInput = PulseExecutionContext & {
  readonly userGesture: boolean;
};

export function executePulseClientAction(
  input: PulseClientExecutionInput,
): PulseExecutionOutcome {
  let approval = input.approval || null;

  if (input.envelope.requires_approval) {
    if (!approval) {
      return executePulseAction({
        ...input,
        approval: null,
      });
    }

    if (approval.state !== "APPROVED") {
      if (!input.userGesture) {
        return executePulseAction({
          ...input,
          approval,
        });
      }
      approval = approvePulseAction(approval);
    }
  }

  return executePulseAction({
    ...input,
    approval,
  });
}
