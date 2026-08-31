
export default function DigitalBoostOsHello() {
  const h = new Date().getHours();
  const hello = h < 12 ? "Buenos dias" : h < 19 ? "Buenas tardes" : "Buenas noches";
  return <span className="hidden text-[11px] text-[#AFC0D5] lg:inline">{hello}</span>;
}
