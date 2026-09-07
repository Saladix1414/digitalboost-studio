#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("cd digitalboost-studio")
t = ws.read_text(encoding="utf-8")

# glow en items
old = '''className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                            active
                              ? "border border-violet-400/20 bg-violet-500/20 text-white shadow-[0_0_24px_rgba(139,92,246,0.08)]"
                              : "border border-transparent text-[#475569] hover:border-[#D6E2EE] hover:bg-[#0A0E16] hover:text-[#334155]"
                          }`}'''
new = '''className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                            active
                              ? "border border-cyan-400/50 bg-cyan-400/15 text-white shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                              : "border border-white/10 bg-[#0B1B30]/80 text-[#D6E2EE] shadow-[0_0_12px_rgba(0,183,255,0.12)] hover:border-cyan-400/30 hover:text-white"
                          }`}'''
if old in t:
    t = t.replace(old, new, 1)
    print("ok glow active")
else:
    # looser
    t2 = t.replace(
        'text-[#475569] hover:border-[#D6E2EE]',
        'text-[#D6E2EE] hover:border-cyan-400/30',
        1,
    )
    if t2 != t:
        t = t2
        print("ok glow loose")
    else:
        print("no match glow — el className cambio")

# active incluye marketing cuando estas en seo
if "section === 'seo' && item.id === 'marketing'" not in t:
    t = t.replace(
        "const active = section === item.id;",
        "const active = section === item.id || (section === 'seo' && (item.id === 'marketing' || item.id === 'seo'));",
        1,
    )
    print("ok dual active")

# click marketing abre seo + tab
if "db-seo-tab-v1" not in t:
    t = t.replace(
        "setSection(item.id);\n                            setMobileMenu(false);",
        """if (item.id === "marketing") {
                              try { localStorage.setItem("db-seo-tab-v1", "marketing"); } catch {}
                              setSection("seo");
                            } else {
                              setSection(item.id);
                            }
                            setMobileMenu(false);""",
        1,
    )
    print("ok click mkt")

# case marketing -> same center
if 'case "marketing":' in t and "DigitalBoostSeoCenter" in t:
    a = t.find('case "marketing":')
    b = t.find('case "', a + 10)
    if a > 0 and b > a:
        t = t[:a] + 'case "marketing":\n        return (<DigitalBoostSeoCenter />);\n\n      ' + t[b:]
        print("ok case mkt")

ws.write_text(t, encoding="utf-8")

# tab marketing in engine + center
eng = src / "DigitalBoostSeo.ts"
if eng.is_file():
    e = eng.read_text(encoding="utf-8")
    if "'marketing'" not in e:
        e = e.replace(
            "export const TABS=['overview'",
            "export const TABS=['overview'",
            1,
        )
        e = e.replace(
            "'reports'];",
            "'reports','marketing'];",
            1,
        )
        e = e.replace(
            "'reports'];",
            "'marketing','reports'];",
            1,
        )
        eng.write_text(e, encoding="utf-8")
        print("ok tabs")

ui = src / "DigitalBoostSeoCenter.tsx"
if ui.is_file():
    u = ui.read_text(encoding="utf-8")
    if "db-seo-tab-v1" not in u:
        u = u.replace(
            "const [tab, setTab] = useState('overview');",
            "const [tab, setTab] = useState(function () { try { return localStorage.getItem('db-seo-tab-v1') || 'overview'; } catch { return 'overview'; } });",
            1,
        )
        print("ok tab init")
    if "tab === 'marketing'" not in u:
        # before last closing of return's inner
        needle = "{tab === 'reports'"
        if needle not in u:
            needle = "{tab==='reports'"
        block = (
            "{tab === 'marketing' && ("
            "<div className=\"space-y-3\">"
            "<p className=\"text-sm font-semibold text-white\">Marketing en el recorte</p>"
            "<p className=\"text-xs text-[#AFC0D5]\">Misma tienda, otro job. SEO = snippet. Ads = Pulse Card (L3). No mezclar title SERP con copy de campana.</p>"
            "<div className=\"rounded-xl border border-white/10 p-4\"><p className=\"text-[10px] uppercase text-cyan-300\">Social / OG</p><p className=\"mt-2 text-sm\">{(pages[0] && pages[0].title) || 'Home'}</p><p className=\"text-xs text-[#AFC0D5]\">{(pages[0] && pages[0].description) || 'Sin description'}</p></div>"
            "<button type=\"button\" className=\"h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]\" onClick={function () { setTab('pages'); if (pages[0]) openP(pages[0]); }}>Editar OG de la home</button>"
            "<button type=\"button\" className=\"h-11 w-full rounded-lg border border-white/10 text-xs\" onClick={function () { setLog('Campana = Pulse Card. No se dispara desde SEO.'); }}>Crear campana (L3, no desde aca)</button>"
            "</div>)}"
        )
        if needle in u:
            u = u.replace(needle, block + needle, 1)
            print("ok mkt panel")
        else:
            print("no reports needle")
    ui.write_text(u, encoding="utf-8")
print("LISTO NAV SEO")
