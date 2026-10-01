import {
  createRuntimeAuditRecord,
} from "./audit";

import type {
  RuntimeAuditRecord,
} from "./auditTypes";

import type {
  BotRuntimeSessionResult,
} from "./session";

import type {
  PaperLedgerEvidenceEntry,
} from "../paper/paperLedgerEvidenceStore";


export const RUNTIME_EVIDENCE_HISTORY_LIMIT =
  24;


export type RuntimeEvidenceBundle = {
  readonly sessionId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly audit:
    RuntimeAuditRecord;

  readonly ledger:
    readonly PaperLedgerEvidenceEntry[];

  readonly authoritative:
    false;
};


export type RuntimeEvidenceHistory = {
  readonly entries:
    readonly RuntimeEvidenceBundle[];

  readonly authoritative:
    false;
};


type RuntimeEvidenceListener =
  () => void;


let history:
  RuntimeEvidenceHistory = {
    entries:
      [],

    authoritative:
      false,
  };


const listeners =
  new Set<
    RuntimeEvidenceListener
  >();


function emitRuntimeEvidenceChange():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


export function subscribeRuntimeEvidenceHistory(
  listener:
    RuntimeEvidenceListener
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


export function getRuntimeEvidenceHistory():
  RuntimeEvidenceHistory {
  return history;
}


export function createRuntimeEvidenceBundle(
  result:
    BotRuntimeSessionResult
):
  RuntimeEvidenceBundle {
  const audit =
    createRuntimeAuditRecord(
      result
    );

  const ledger =
    result.runtime.account.ledger.map(
      entry => ({
        sessionId:
          result.session.id,

        botId:
          result.session.botId,

        strategyId:
          result.session.strategyId,

        entry,

        authoritative:
          false as const,
      })
    );

  return {
    sessionId:
      result.session.id,

    botId:
      result.session.botId,

    strategyId:
      result.session.strategyId,

    audit,

    ledger,

    authoritative:
      false,
  };
}


export function recordRuntimeSessionEvidence(
  result:
    BotRuntimeSessionResult
):
  RuntimeEvidenceHistory {
  const bundle =
    createRuntimeEvidenceBundle(
      result
    );

  history = {
    entries: [
      ...history.entries,
      bundle,
    ].slice(
      -RUNTIME_EVIDENCE_HISTORY_LIMIT
    ),

    authoritative:
      false,
  };

  /*
   * One completed runtime session produces one store mutation
   * and one subscriber notification.
   */
  emitRuntimeEvidenceChange();

  return history;
}


export function resetRuntimeEvidenceHistoryForTests():
  void {
  history = {
    entries:
      [],

    authoritative:
      false,
  };

  emitRuntimeEvidenceChange();
}
