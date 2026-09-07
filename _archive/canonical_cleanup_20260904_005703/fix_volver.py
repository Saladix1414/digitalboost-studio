import re, pathlib
p=pathlib.Path("src/StoreBuilderWorkspace.tsx")
s=p.read_text(encoding="utf-8")

# 1. Si ya tiene navHistory, lo limpiamos primero para no duplicar
s=re.sub(r"\s*const \[navHistory.*?handleVolver.*?if \(section!== \"dashboard\"\) \{\s*setSection\(\"dashboard\"\);\s*\}\s*\}\s*\};\s*", "\n", s, flags=re.DOTALL)

# 2. Agregar historial después del useEffect que guarda la sección
if "navHistory" not in s:
    s=re.sub(
        r"useEffect\(\(\) => \{\s*localStorage\.setItem\(\s*\"digitalboost_store_section\",\s*section\s*\);\s*\},\s*\[section\]\);",
        """useEffect(() => {
    localStorage.setItem(
      "digitalboost_store_section",
      section
    );
  }, [section]);

  const [navHistory, setNavHistory] = React.useState<StoreSection[]>([]);
  const navigateTo = (next: StoreSection) => {
    if (next!== section) {
      setNavHistory(h => [...h, section].slice(-20));
      setSection(next);
    }
  };
  const handleVolver = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setSection(prev);
    } else {
      if (section!== "dashboard") {
        setSection("dashboard");
      }
    }
  };""",
        s, count=1
    )

# 3. Volver ya NO va a landing, va a historial
s=s.replace('onBack={() => setSection("dashboard")}', 'onBack={() => navigateTo("dashboard" as StoreSection)}')
s=s.replace(' <button\n onClick={onBack}\n className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#475569] hover:bg-[#0A0E16] hover:text-white"\n >\n <ArrowLeft size={17} />\n Volver a DigitalBoost',
            ' <button\n onClick={handleVolver}\n className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#475569] hover:bg-[#0A0E16] hover:text-white"\n >\n <ArrowLeft size={17} />\n Volver')

# 4. Sidebar usa navigateTo en vez de setSection directo
s=s.replace('setSection(item.id);', 'navigateTo(item.id as StoreSection);')
s=s.replace('setSection("seo");', 'navigateTo("seo" as StoreSection);')

p.write_text(s, encoding="utf-8")
print("Fix Volver aplicado. Ahora Volver va a dashboard, no a landing y no hace ping-pong.")
