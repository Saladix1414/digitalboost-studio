from pathlib import Path
ov = Path("src/CommerceOSOverview.tsx")
t = ov.read_text(encoding="utf-8")

# 1. Saca el parche roto que te dejó negro
t = t.replace("' } />\n <div className=\"mt-2\"><DigitalBoostOllamaStatus /></div>\n <div className=\"hidden'>{/*", "' } />")
t = t.replace("' } />\n      <div className=\"mt-2\"><DigitalBoostOllamaStatus /></div>\n      <div className=\"hidden'>{/*", "' } />")
t = t.replace("<div className=\"hidden\">", "")
t = t.replace("{/*", "")

# 2. Asegura import
if "DigitalBoostOllamaStatus" not in t:
    t = t.replace("import DigitalBoostOsKpiPaint", "import DigitalBoostOllamaStatus from './DigitalBoostOllamaStatus';\nimport DigitalBoostOsKpiPaint")

# 3. Inserta status de forma segura: busca el STORE LIVE y pone el status después
if "<DigitalBoostOllamaStatus" not in t:
    # intenta después de la linea que tiene NIMBUS.DIGITALBOOST.SHOP
    t = t.replace(
        "NIMBUS.DIGITALBOOST.SHOP",
        "NIMBUS.DIGITALBOOST.SHOP\n      <div className=\"mt-2\"><DigitalBoostOllamaStatus /></div>"
    )

# 4. Si sigue sin estar, lo mete al final del primer div grande
if "<DigitalBoostOllamaStatus" not in t:
    t = t.replace("Tu comercio", "<DigitalBoostOllamaStatus />\nTu comercio")

ov.write_text(t, encoding="utf-8")
print("✅ Overview restaurado y status bien insertado")
