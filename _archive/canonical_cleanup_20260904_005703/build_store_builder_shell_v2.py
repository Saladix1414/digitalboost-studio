from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "VisualBuilderShell.tsx"

print("="*70)
print("DIGITALBOOST — STORE BUILDER SHELL V2")
print("WEB DENTRO DE LA WEB")
print("="*70)

if not FILE.exists():
    raise SystemExit("❌ No existe src/VisualBuilderShell.tsx")

backup = FILE.with_name(
    f"VisualBuilderShell.tsx.before_shell_v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.bak"
)
shutil.copy2(FILE, backup)
print(f"✓ Backup: {backup.name}")

code = r'''import {
  Sparkles,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Layers3,
  FileText,
  Plus,
  PanelRight,
  Settings2,
  Search,
  Bell,
  Cloud,
  ChevronRight,
  Grid3X3,
  ShoppingBag,
  Type,
  Image as ImageIcon,
  Box,
  Undo2,
  Redo2,
  Palette,
} from "lucide-react";
import { useMemo, useState } from "react";

type Viewport="desktop"|"tablet"|"mobile";

type Block={
  id:string;
  type:string;
  title:string;
  content:string;
  visible:boolean;
};

const seed:Block[]=[
 {id:"header",type:"header",title:"Header",content:"TU MARCA",visible:true},
 {id:"hero",type:"hero",title:"Hero",content:"Vendé más con DigitalBoost.",visible:true},
 {id:"products",type:"products",title:"Productos",content:"Productos destacados",visible:true},
 {id:"footer",type:"footer",title:"Footer",content:"© DigitalBoost",visible:true},
];

export default function VisualBuilderShell(){

 const [viewport,setViewport]=useState<Viewport>("desktop");
 const [preview,setPreview]=useState(false);
 const [blocks,setBlocks]=useState(seed);
 const [selected,setSelected]=useState("hero");

 const current=useMemo(
   ()=>blocks.find(b=>b.id===selected),
   [blocks,selected]
 );

 const update=(patch:Partial<Block>)=>{
   if(!current) return;
   setBlocks(
     blocks.map(b=>b.id===current.id?{...b,...patch}:b)
   );
 };

 const width={
   desktop:"100%",
   tablet:"820px",
   mobile:"390px"
 }[viewport];

 const render=(b:Block)=>{
   if(!b.visible) return null;

   const active=b.id===selected;

   if(b.type==="header"){
     return(
      <div key={b.id}
        onClick={()=>setSelected(b.id)}
        className={`border-b px-8 py-5 cursor-pointer ${active?"ring-2 ring-cyan-400":""}`}>
        <div className="flex justify-between items-center">
          <div className="font-bold">{b.content}</div>
          <div className="hidden md:flex gap-5 text-xs text-slate-500">
            <span>Inicio</span>
            <span>Productos</span>
            <span>Contacto</span>
          </div>
        </div>
      </div>
     );
   }

   if(b.type==="hero"){
     return(
      <section key={b.id}
        onClick={()=>setSelected(b.id)}
        className={`cursor-pointer px-10 py-24 text-center ${active?"ring-2 ring-cyan-400":""}`}>
        <div className="inline-flex rounded-full bg-slate-950 text-white px-3 py-1 text-[10px] uppercase tracking-[.18em]">
          Nueva colección
        </div>
        <h1 className="mt-5 text-5xl font-bold tracking-tight">
          {b.content}
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-slate-500">
          Construida completamente desde DigitalBoost Commerce OS.
        </p>
        <button className="mt-8 rounded-xl bg-slate-950 px-6 py-3 text-white text-sm font-semibold">
          Comprar ahora
        </button>
      </section>
     );
   }

   if(b.type==="products"){
     return(
      <section key={b.id}
        onClick={()=>setSelected(b.id)}
        className={`cursor-pointer px-10 py-12 ${active?"ring-2 ring-cyan-400":""}`}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[.18em] text-slate-400">
              Catálogo
            </div>
            <h2 className="text-2xl font-bold">
              {b.content}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Ver todo →
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i=>(
            <div key={i} className="rounded-2xl border overflow-hidden bg-white">
              <div className="aspect-square bg-slate-100"/>
              <div className="p-4">
                <div className="font-semibold text-sm">
                  Producto {i}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  $24.990
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
     );
   }

   return(
    <div key={b.id}
      onClick={()=>setSelected(b.id)}
      className={`cursor-pointer border-t px-8 py-10 ${active?"ring-2 ring-cyan-400":""}`}>
      <div className="font-semibold text-sm">
        {b.content}
      </div>
    </div>
   );
 };

 return(
<div className="flex h-full min-h-[760px] flex-col overflow-hidden rounded-3xl border border-white/[.08] bg-[#040814] text-white shadow-[0_40px_120px_rgba(0,0,0,.45)]">

{/* TOPBAR */}
<header className="h-14 border-b border-white/[.06] bg-[#07101d]/95 backdrop-blur-xl flex items-center justify-between px-4">

<div className="flex items-center gap-3">
<div className="h-9 w-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
<Sparkles size={17}/>
</div>

<div>
<div className="text-xs font-semibold">
Store Builder
</div>
<div className="text-[10px] text-slate-500">
Proyecto • Tienda Online
</div>
</div>

<div className="hidden lg:flex ml-5 rounded-xl border border-white/[.06] bg-black/20 px-3 py-2 text-[11px] gap-4">
<div className="flex items-center gap-1 text-cyan-300"><Cloud size={13}/> Guardado</div>
<div className="flex items-center gap-1 text-emerald-300"><Sparkles size={13}/> IA lista</div>
</div>
</div>

<div className="flex items-center gap-1">
<button className="p-2 rounded-lg hover:bg-white/[.04]"><Undo2 size={15}/></button>
<button className="p-2 rounded-lg hover:bg-white/[.04]"><Redo2 size={15}/></button>

<div className="hidden md:flex border border-white/[.06] rounded-lg p-1 bg-black/20">
<button onClick={()=>setViewport("desktop")} className={`p-2 rounded ${viewport==="desktop"?"bg-white/10":""}`}><Monitor size={15}/></button>
<button onClick={()=>setViewport("tablet")} className={`p-2 rounded ${viewport==="tablet"?"bg-white/10":""}`}><Tablet size={15}/></button>
<button onClick={()=>setViewport("mobile")} className={`p-2 rounded ${viewport==="mobile"?"bg-white/10":""}`}><Smartphone size={15}/></button>
</div>

<button onClick={()=>setPreview(!preview)} className="ml-1 flex items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.03] px-3 py-2 text-[11px]">
<Eye size={14}/>
{preview?"Editar":"Preview"}
</button>

<button className="ml-1 flex items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-[11px] font-semibold text-slate-950 hover:bg-cyan-300">
<Save size={14}/> Guardar
</button>
</div>
</header>

<div className="flex flex-1 min-h-0">

{/* LEFT */}
{!preview&&(
<aside className="hidden lg:flex w-64 flex-col border-r border-white/[.06] bg-[#060c17]">

<div className="p-4 border-b border-white/[.06]">
<div className="text-[10px] uppercase tracking-[.18em] text-slate-500">
Páginas
</div>

<div className="mt-3 space-y-1">
{["Inicio","Productos","Colecciones","Contacto"].map((p,i)=>(
<button key={p} className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] ${i===0?"bg-cyan-400/10 text-cyan-300":"text-slate-400 hover:bg-white/[.04]"}`}>
<span className="flex items-center gap-2"><FileText size={13}/>{p}</span>
<ChevronRight size={13}/>
</button>
))}
</div>
</div>

<div className="p-4">
<div className="text-[10px] uppercase tracking-[.18em] text-slate-500">
Componentes
</div>

<div className="mt-3 grid grid-cols-2 gap-2">
{[
[Box,"Sección"],
[Type,"Texto"],
[ShoppingBag,"Productos"],
[ImageIcon,"Imagen"],
].map(([IconComponent,label],i)=>(
<button key={i} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3 hover:border-cyan-400/20 hover:bg-cyan-400/[.04]">
<div className="flex justify-center text-cyan-300">{IconComponent === Box ? <Box size={16}/> : IconComponent === Type ? <Type size={16}/> : IconComponent === ShoppingBag ? <ShoppingBag size={16}/> : <ImageIcon size={16}/>}</div>
<div className="mt-2 text-[10px]">{label}</div>
</button>
))}
</div>
</div>
</aside>
)}

{/* CANVAS */}
<main className="flex-1 overflow-auto bg-[#02050b] relative">

{!preview&&(
<div className="absolute inset-0 opacity-40 pointer-events-none"
style={{
backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
backgroundSize:"26px 26px"
}}/>
)}

<div className="flex justify-center p-8 relative">

<div style={{width}}
className="rounded-2xl overflow-hidden bg-white text-slate-900 shadow-[0_40px_120px_rgba(0,0,0,.55)]">
{blocks.map(render)}
</div>

</div>

</main>

{/* RIGHT */}
{!preview&&(
<aside className="hidden xl:flex w-72 flex-col border-l border-white/[.06] bg-[#060c17]">

<div className="h-12 border-b border-white/[.06] flex items-center justify-between px-4">
<div className="flex items-center gap-2 text-xs font-semibold">
<PanelRight size={14} className="text-cyan-300"/>
Inspector
</div>
<Settings2 size={14} className="text-slate-500"/>
</div>

<div className="p-4 overflow-auto flex-1">

<div className="text-[10px] uppercase tracking-[.18em] text-slate-500">
Elemento seleccionado
</div>

<div className="mt-4 space-y-4">
<input value={current?.title||""}
onChange={e=>update({title:e.target.value})}
className="w-full rounded-lg border border-white/[.06] bg-black/20 px-3 py-2 text-[11px] text-white"/>

<textarea value={current?.content||""}
onChange={e=>update({content:e.target.value})}
rows={5}
className="w-full rounded-lg border border-white/[.06] bg-black/20 px-3 py-2 text-[11px] text-white resize-none"/>

<div className="grid grid-cols-3 gap-2">
{["Desktop","Tablet","Móvil"].map(v=>(
<button key={v} className="rounded-lg border border-white/[.06] py-2 text-[10px] hover:border-cyan-400/20">
{v}
</button>
))}
</div>

<button className="w-full rounded-lg border border-cyan-400/20 bg-cyan-400/10 py-3 text-[11px] text-cyan-300">
Abrir Theme Builder
</button>
</div>

</div>

</aside>
)}

</div>

</div>
);
}
'''

FILE.write_text(code,encoding="utf-8")
print("✓ VisualBuilderShell V2 instalado")
print("✓ Application Shell creado")
print("✓ Canvas profesional")
print("✓ Inspector")
print("✓ Responsive")
print()

print("===== BUILD =====")
print()

build=subprocess.run(["npm","run","build"],cwd=ROOT)

if build.returncode!=0:
    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando backup...")
    shutil.copy2(backup,FILE)
    print("✓ Restaurado.")
    sys.exit(1)

print()
print("="*70)
print("✅ STORE BUILDER SHELL V2 LISTO")
print("="*70)
print()
print("Nuevas funciones:")
print("• Topbar tipo Figma/Framer")
print("• Canvas flotante")
print("• Sidebar de páginas")
print("• Biblioteca de componentes")
print("• Inspector contextual")
print("• Preview")
print("• Desktop / Tablet / Mobile")
print("• Estado del proyecto")
print()
print("Próxima fase:")
print("Live Preview conectado a productos reales + Theme Builder.")
