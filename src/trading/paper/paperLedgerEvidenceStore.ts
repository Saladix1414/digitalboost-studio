import type {
  PaperLedgerEntry,
} from "./types";


export const PAPER_LEDGER_EVIDENCE_LIMIT =
  48;


export type PaperLedgerEvidenceEntry = {
  readonly sessionId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly entry:
    PaperLedgerEntry;

  readonly authoritative:
    false;
};


export type PaperLedgerEvidenceHistory = {
  readonly entries:
    readonly PaperLedgerEvidenceEntry[];

  readonly authoritative:
    false;
};


type PaperLedgerEvidenceListener =
  () => void;


let history:
  PaperLedgerEvidenceHistory = {
    entries:
      [],

    authoritative:
      false,
  };


const listeners =
  new Set<
    PaperLedgerEvidenceListener
  >();


function emitPaperLedgerEvidenceChange():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


export function subscribePaperLedgerEvidence(
  listener:
    PaperLedgerEvidenceListener
):
  () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}


export function getPaperLedgerEvidence():
  PaperLedgerEvidenceHistory {
  return history;
}


export function recordPaperLedgerEvidence(
  input: {
    readonly sessionId:
      string;

    readonly botId:
      string;

    readonly strategyId:
      string;

    readonly entries:
      readonly PaperLedgerEntry[];
  }
):
  PaperLedgerEvidenceHistory {
  if (
    input.entries.length ===
    0
  ) {
    return history;
  }

  const correlated =
    input.entries.map(
      entry => ({
        sessionId:
          input.sessionId,

        botId:
          input.botId,

        strategyId:
          input.strategyId,

        entry,

        authoritative:
          false as const,
      })
    );

  history = {
    entries: [
      ...history.entries,
      ...correlated,
    ].slice(
      -PAPER_LEDGER_EVIDENCE_LIMIT
    ),

    authoritative:
      false,
  };

  emitPaperLedgerEvidenceChange();

  return history;
}


export function resetPaperLedgerEvidenceForTests():
  void {
  history = {
    entries:
      [],

    authoritative:
      false,
  };

  emitPaperLedgerEvidenceChange();
}
