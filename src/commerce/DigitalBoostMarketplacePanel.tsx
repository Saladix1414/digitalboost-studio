export default function DigitalBoostMarketplacePanel() {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0A1020] p-5 text-[#F7FAFF]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
        Commerce OS · Market
      </p>
      <h1 className="text-2xl font-semibold">Marketplace</h1>
      <p className="text-sm text-slate-400">
        Plaza multi-vendedor. Sin sellers, listings ni GMV.
        El catálogo del ledger será la fuente cuando exista.
      </p>
      <div className="rounded-xl border border-white/10 bg-[#070d18] px-4 py-6 text-sm text-slate-500">
        0 vendedores · 0 listings · GMV unavailable
      </div>
    </div>
  );
}
