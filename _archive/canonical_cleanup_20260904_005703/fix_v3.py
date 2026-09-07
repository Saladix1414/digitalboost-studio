import re, pathlib
p=pathlib.Path("src/StoreBuilderWorkspace.tsx")
s=p.read_text(encoding="utf-8")
# agregar historial si no existe
if "navHistory" not in s:
    s=re.sub(r"useEffect\(\(\) => \{\s*localStorage\.setItem\(\s*\"digitalboost_store_section\",\s*section\s*\);\s*\},\s*\[section\]\);",
             """useEffect(() => {
    localStorage.setItem("digitalboost_store_section", section);
  }, [section]);
  const [navHistory, setNavHistory] = React.useState([]);
  const navigateTo = (next) => {
    if (next!==section){ setNavHistory(h=>[...h, section].slice(-20)); setSection(next); }
  };
  const handleVolver = () => {
    if (navHistory.length>0){ const prev=navHistory[navHistory.length-1]; setNavHistory(h=>h.slice(0,-1)); setSection(prev); }
    else { if (section!=="dashboard") setSection("dashboard"); }
  };""", s, count=1)
s=s.replace('onBack={() => setSection("dashboard")}', 'onBack={() => navigateTo("dashboard")}')
s=s.replace('setSection(item.id);', 'navigateTo(item.id);')
s=re.sub(r'onClick=\{onBack\}\s+className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-\[#475569\] hover:bg-\[#0A0E16\] hover:text-white"\s+>\s+<ArrowLeft size=\{17\} />\s+Volver a DigitalBoost',
         'onClick={handleVolver}\n className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#475569] hover:bg-[#0A0E16] hover:text-white"\n >\n <ArrowLeft size={17} />\n Volver', s)
p.write_text(s, encoding="utf-8")
print("Workspace fixed")
