export type LogicReactorPhase = "briefing" | "playing" | "results";

export interface LogicReactorFeedback {
  correct: boolean;
}

export interface LogicReactorSessionState {
  phase: LogicReactorPhase;
  round: number;
  score: number;
  streak: number;
  correctCount: number;
  hintsUsed: number;
  selectedChoiceId: string | null;
  feedback: LogicReactorFeedback | null;
}

export type LogicReactorSessionAction =
  | { type: "START" }
  | {
      type: "ANSWER";
      choiceId: string;
      correctChoiceId: string;
    }
  | { type: "REVEAL_HINT" }
  | { type: "ADVANCE"; roundsInRun: number }
  | { type: "RETURN_TO_BRIEFING" };

export function createInitialLogicReactorSession(): LogicReactorSessionState {
  return {
    phase: "briefing",
    round: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    hintsUsed: 0,
    selectedChoiceId: null,
    feedback: null,
  };
}

export function logicReactorSessionReducer(
  state: LogicReactorSessionState,
  action: LogicReactorSessionAction,
): LogicReactorSessionState {
  switch (action.type) {
    case "START":
      return {
        ...createInitialLogicReactorSession(),
        phase: "playing",
      };

    case "ANSWER": {
      if (state.phase !== "playing" || state.feedback !== null) {
        return state;
      }

      const correct = action.choiceId === action.correctChoiceId;

      return {
        ...state,
        selectedChoiceId: action.choiceId,
        feedback: { correct },
        score: correct ? state.score + 100 + state.streak * 15 : state.score,
        streak: correct ? state.streak + 1 : 0,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      };
    }

    case "REVEAL_HINT":
      if (
        state.phase !== "playing" ||
        state.feedback !== null ||
        state.hintsUsed >= 2
      ) {
        return state;
      }

      return { ...state, hintsUsed: state.hintsUsed + 1 };

    case "ADVANCE": {
      if (state.phase !== "playing" || state.feedback === null) {
        return state;
      }

      const rounds = Number.isFinite(action.roundsInRun)
        ? Math.max(1, Math.floor(action.roundsInRun))
        : 1;

      if (state.round < rounds - 1) {
        return {
          ...state,
          round: state.round + 1,
          hintsUsed: 0,
          selectedChoiceId: null,
          feedback: null,
        };
      }

      return { ...state, phase: "results" };
    }

    case "RETURN_TO_BRIEFING":
      return { ...state, phase: "briefing" };
  }
}
