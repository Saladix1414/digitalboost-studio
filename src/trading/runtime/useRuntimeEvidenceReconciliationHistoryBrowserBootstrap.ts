import {
  useEffect,
} from "react";

import {
  bootstrapRuntimeEvidenceReconciliationHistoryBrowserPersistence,
} from "./runtimeEvidenceReconciliationHistoryBrowserBootstrap";


export function useRuntimeEvidenceReconciliationHistoryBrowserBootstrap():
  void {
  useEffect(
    () => {
      void bootstrapRuntimeEvidenceReconciliationHistoryBrowserPersistence();
    },
    []
  );
}
