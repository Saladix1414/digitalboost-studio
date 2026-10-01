import {
  useEffect,
} from "react";

import {
  bootstrapRuntimeEvidenceBrowserPersistence,
} from "./runtimeEvidenceBrowserBootstrap";


export function useRuntimeEvidenceBrowserBootstrap():
  void {
  useEffect(
    () => {
      /*
       * Bootstrap is intentionally fire-and-observe.
       *
       * Trading execution must never wait for evidence persistence.
       */
      void bootstrapRuntimeEvidenceBrowserPersistence();
    },
    []
  );
}
