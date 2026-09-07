import { useState } from "react";
import DigitalBoostMainPage from "./DigitalBoostMainPage";
import CommerceOSBoot from "./CommerceOSBoot";
import StoreBuilderWorkspace from "./StoreBuilderWorkspace";
export default function App(){
  const [screen,setScreen]=useState("main");
  return (<>
    {screen==="main" && <DigitalBoostMainPage onSelectTool={()=>setScreen("commerceBoot")} />}
    {screen==="commerceBoot" && <CommerceOSBoot onComplete={()=>setScreen("workspace")} />}
    {screen==="workspace" && <StoreBuilderWorkspace onBack={()=>setScreen("main")} />}
  </>);
}
