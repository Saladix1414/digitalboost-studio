export default function LandingBuilderWorkspace({ onBack }: { onBack?:()=>void }){
  return (
    <div className="min-h-screen bg-[#020206] text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-3xl font-bold">LandingBuilderWorkspace</h1>
      <p className="text-slate-500 mt-3">Este builder vuelve pronto</p>
      <button onClick={onBack} className="mt-6 px-6 py-3 bg-white/10 rounded-xl">← Volver al inicio</button>
    </div>
  );
}
