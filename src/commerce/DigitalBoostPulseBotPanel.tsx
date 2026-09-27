import { useCommerceLive } from "./useCommerceLive";
import { evaluatePulseBotBrain } from "./DigitalBoostPulseBotBrain";

export default function DigitalBoostPulseBotPanel({
  tenantId = "local-tenant",
}: {
  tenantId?: string;
}) {
  useCommerceLive(tenantId);
  const brief = evaluatePulseBotBrain(tenantId);
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0A1020] p-5 text-[#F7FAFF]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Commerce OS · Pulse Bot
      </p>
      <h1 className="text-2xl font-semibold">Cerebro operativo</h1>
      <p className="text-sm text-slate-400">{brief.summary}</p>
      {brief.messages.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#070d18] px-4 py-6 text-sm text-slate-500">
          Sin drafts. Pulse Bot no envía mail hasta que exista transporte.
        </div>
      ) : (
        <div className="space-y-2">
          {brief.messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-[#101B32] p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {m.channel} · {m.kind} · {m.state}
              </div>
              <div className="mt-1 text-sm font-medium">{m.subject}</div>
              <div className="mt-1 text-sm text-slate-400">{m.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
