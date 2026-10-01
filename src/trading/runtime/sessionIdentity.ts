let runtimeSessionSequence =
  0;


/*
 * A runtime context receives one collision-resistant origin.
 *
 * Different browser tabs, reloads and JS processes naturally receive
 * different origins. The sequence remains useful for local ordering.
 *
 * This identifier is evidence correlation metadata only.
 * It grants no execution or approval authority.
 */
const runtimeSessionOrigin =
  createRuntimeSessionOrigin();


function createRuntimeSessionOrigin():
  string {
  if (
    typeof globalThis.crypto?.randomUUID !==
      "function"
  ) {
    throw new Error(
      "Runtime session identity requires crypto.randomUUID()."
    );
  }

  return globalThis.crypto.randomUUID();
}


export function createRuntimeSessionId(
  botId:
    string
):
  string {
  runtimeSessionSequence +=
    1;

  return [
    "runtime",
    botId,
    runtimeSessionOrigin,
    runtimeSessionSequence,
  ].join(
    "-"
  );
}


export function getRuntimeSessionSequenceForDiagnostics():
  number {
  return runtimeSessionSequence;
}


export function getRuntimeSessionOriginForDiagnostics():
  string {
  return runtimeSessionOrigin;
}


/*
 * Tests may reset local ordering.
 *
 * The origin intentionally does not reset: resetting test sequence state
 * must not pretend that a new runtime context was created.
 */
export function resetRuntimeSessionIdentityForTests():
  void {
  runtimeSessionSequence =
    0;
}
