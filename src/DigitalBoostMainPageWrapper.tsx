import { useEffect } from "react";
import Original from "./DigitalBoostMainPage.backup";

export default function DigitalBoostMainPageWrapper({ onSelectTool }: any){
  useEffect(()=>{
    const id = setInterval(()=>{
      const cards = Array.from(document.querySelectorAll("div"));
      for(const card of cards){
        const t = (card.textContent||"").toLowerCase();
        if(t.includes("tiendas virtuales") && t.includes("explorar")){
          const btn = card.querySelector("button");
          if(btn &&!(btn as any)._fixed){
            (btn as any)._fixed=true;
            btn.addEventListener("click",(e:any)=>{
              e.preventDefault(); e.stopPropagation();
              onSelectTool("store");
            });
            (card as any).style.cursor="pointer";
            card.addEventListener("click",()=>onSelectTool("store"));
            console.log("BOTON TIENDA CONECTADO - sin borde");
          }
        }
      }
    },500);
    return ()=>clearInterval(id);
  },[onSelectTool]);
  return <Original onSelectTool={onSelectTool} />;
}
