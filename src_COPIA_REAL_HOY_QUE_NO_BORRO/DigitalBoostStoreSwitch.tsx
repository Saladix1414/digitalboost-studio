
import { useEffect, useState } from "react";
const STORES = ["Nimbus", "Nimbus", "Taller 09"];
const KEY = "db-active-store-v1";
export default function DigitalBoostStoreSwitch() {
  const [name, setName] = useState("Nimbus");
  useEffect(function () {
    try { setName(localStorage.getItem(KEY) || "Nimbus"); } catch {}
  }, []);
  function cycle() {
    const i = (STORES.indexOf(name) + 1) % STORES.length;
    const next = STORES[i];
    setName(next);
    try { localStorage.setItem(KEY, next); } catch {}
  }
  return (
    <button type="button" onClick={cycle} className="hidden h-9 items-center rounded-full border border-white/10 px-3 text-[11px] text-cyan-300 sm:inline-flex">
      {name}
    </button>
  );
}
