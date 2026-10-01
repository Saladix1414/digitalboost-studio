let runtimeSessionSequence =
  0;


export function createRuntimeSessionId(
  botId:
    string
):
  string {
  runtimeSessionSequence +=
    1;

  return (
    `runtime-${botId}-${runtimeSessionSequence}`
  );
}


export function getRuntimeSessionSequenceForDiagnostics():
  number {
  return runtimeSessionSequence;
}


export function resetRuntimeSessionIdentityForTests():
  void {
  runtimeSessionSequence =
    0;
}
