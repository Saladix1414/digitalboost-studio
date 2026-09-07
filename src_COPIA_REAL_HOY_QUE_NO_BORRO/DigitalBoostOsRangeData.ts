
import { useEffect, useState } from "react";
export const RANGE_KEY = "db-os-range-v1";
export function readRange() {
  try { return localStorage.getItem(RANGE_KEY) || "7d"; } catch { return "7d"; }
}
export function rangeMul(r: string) {
  if (r === "30d") return 4;
  if (r === "90d") return 12;
  return 1;
}
export function useOsRange() {
  const [r, setR] = useState("7d");
  useEffect(function () {
    function pull() { setR(readRange()); }
    pull();
    window.addEventListener("db-os-range", pull);
    window.addEventListener("storage", pull);
    return function () {
      window.removeEventListener("db-os-range", pull);
      window.removeEventListener("storage", pull);
    };
  }, []);
  return r;
}
