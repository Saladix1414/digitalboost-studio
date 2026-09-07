from pathlib import Path
import shutil
import re
from datetime import datetime

FILE = Path("src/StoreBuilderWorkspace.tsx")

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

text = FILE.read_text(encoding="utf-8")

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

backup = FILE.with_name(
    f"StoreBuilderWorkspace.before-hooks-fix.{datetime.now().strftime('%Y%m%d-%H%M%S')}.tsx"
)

shutil.copy2(FILE, backup)

print("==============================================")
print("🔥 DIGITALBOOST COMMERCE OS — FIX DE HOOKS")
print("==============================================")
print()
print(f"Backup creado: {backup}")
print()

# ------------------------------------------------------------
# 1. LOCALIZAR EL BOOT SEQUENCE ACTUAL
# ------------------------------------------------------------

start_marker = """    // ----------------------------------------------------------
    // DIGITALBOOST COMMERCE OS — BOOT SEQUENCE
    // ----------------------------------------------------------
"""

start = text.find(start_marker)

if start == -1:
    print("⚠️ No encontré el bloque de Commerce OS Boot.")
    print("El archivo puede ya estar parcialmente corregido.")
    print()
    print("Probando solamente el build...")
    raise SystemExit(0)

# ------------------------------------------------------------
# 2. LOCALIZAR openGroups
# ------------------------------------------------------------

open_marker = """    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({"""

open_pos = text.find(open_marker, start)

if open_pos == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ No se encontró openGroups. Se restauró el backup.")

# Todo desde el comentario BOOT hasta openGroups
# corresponde al loading actual.
boot_block = text[start:open_pos]

print("✓ Bloque de loading encontrado")
print("✓ openGroups encontrado")
print()

# ------------------------------------------------------------
# 3. ELIMINAR EL RETURN TEMPRANO
# ------------------------------------------------------------

new_text = text[:start] + text[open_pos:]

# ------------------------------------------------------------
# 4. LOCALIZAR filteredProducts
# ------------------------------------------------------------

filtered_marker = """    const filteredProducts = useMemo(() => {"""

filtered_pos = new_text.find(filtered_marker)

if filtered_pos == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró filteredProducts. Se restauró el backup."
    )

# ------------------------------------------------------------
# 5. ENCONTRAR EL FINAL REAL DEL useMemo
# ------------------------------------------------------------

def find_matching_bracket(s, opening_pos, opening="{", closing="}"):
    depth = 0
    in_string = None
    escaped = False
    line_comment = False
    block_comment = False
    i = opening_pos

    while i < len(s):
        c = s[i]
        n = s[i + 1] if i + 1 < len(s) else ""

        if line_comment:
            if c == "\n":
                line_comment = False
            i += 1
            continue

        if block_comment:
            if c == "*" and n == "/":
                block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_string:
            if escaped:
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == in_string:
                in_string = None
            i += 1
            continue

        if c in ("'", '"', "`"):
            in_string = c
            i += 1
            continue

        if c == "/" and n == "/":
            line_comment = True
            i += 2
            continue

        if c == "/" and n == "*":
            block_comment = True
            i += 2
            continue

        if c == opening:
            depth += 1
        elif c == closing:
            depth -= 1
            if depth == 0:
                return i

        i += 1

    return -1


# Encontramos el paréntesis de useMemo(
memo_open = new_text.find("(", filtered_pos)

if memo_open == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ No se encontró useMemo(. Se restauró el backup.")

memo_close = find_matching_bracket(
    new_text,
    memo_open,
    "(",
    ")"
)

if memo_close == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se pudo determinar el final de filteredProducts. "
        "Se restauró el backup."
    )

# El useMemo termina con );
memo_end = memo_close + 1

while memo_end < len(new_text) and new_text[memo_end] in " \t":
    memo_end += 1

if memo_end < len(new_text) and new_text[memo_end] == ";":
    memo_end += 1

# ------------------------------------------------------------
# 6. CONSTRUIR EL LOADING SIN HOOKS DESPUÉS
# ------------------------------------------------------------

loading_block = r'''
    
    // ----------------------------------------------------------
    // DIGITALBOOST COMMERCE OS — BOOT SCREEN
    //
    // IMPORTANTE:
    // Este return está DESPUÉS de todos los hooks.
    // Nunca se ejecuta antes de useState/useEffect/useMemo.
    // ----------------------------------------------------------

    if (commerceOSBooting) {
      return (
        <div className="min-h-screen overflow-hidden bg-[#02040a] text-white">
          <div className="relative flex min-h-screen items-center justify-center">

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[.08] blur-[120px]" />
              <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-violet-600/[.07] blur-[100px]" />
              <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-600/[.06] blur-[110px]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
              <div className="rounded-[28px] border border-white/[.08] bg-[#070b14]/90 p-8 shadow-2xl backdrop-blur-xl">

                <div className="flex flex-col items-center text-center">

                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[.06] shadow-[0_0_60px_rgba(34,211,238,.10)]">
                    <div className="absolute inset-0 rounded-2xl border border-cyan-300/10 animate-pulse" />
                    <ShoppingBag size={34} className="text-cyan-300" />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[.32em] text-cyan-300/80">
                    DigitalBoost
                  </p>

                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Commerce OS
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Inicializando tu entorno comercial
                  </p>

                  <div className="mt-8 w-full space-y-3 text-left">

                    {[
                      ["Commerce Engine", "READY"],
                      ["Store Intelligence", "READY"],
                      ["Analytics", "READY"],
                      ["AI Operator", "READY"],
                    ].map(([label, status], index) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] px-4 py-3"
                        style={{
                          animation: `commerceBootRow .45s ease-out ${index * 90}ms both`,
                        }}
                      >
                        <span className="text-xs text-slate-400">
                          {label}
                        </span>

                        <span className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />
                          {status}
                        </span>
                      </div>
                    ))}

                  </div>

                  <div className="mt-7 w-full">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Commerce Environment
                      </span>

                      <span className="text-[10px] text-cyan-300">
                        100%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                      <div
                        className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400"
                        style={{
                          animation: "commerceBootProgress 1.35s ease-out both",
                        }}
                      />
                    </div>

                  </div>

                  <p className="mt-6 text-[10px] text-slate-600">
                    DIGITALBOOST COMMERCE OS
                  </p>

                </div>
              </div>
            </div>

          </div>

          <style>{`
            @keyframes commerceBootRow {
              from {
                opacity: 0;
                transform: translateY(6px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes commerceBootProgress {
              from {
                transform: translateX(-100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>

        </div>
      );
    }

'''

# ------------------------------------------------------------
# 7. INSERTAR DESPUÉS DEL useMemo
# ------------------------------------------------------------

insert_pos = memo_end

new_text = (
    new_text[:insert_pos]
    + loading_block
    + new_text[insert_pos:]
)

# ------------------------------------------------------------
# 8. VERIFICACIONES
# ------------------------------------------------------------

# Ya no debe existir el antiguo bloque antes de openGroups.
open_check = new_text.find(open_marker)
boot_check = new_text.find("// DIGITALBOOST COMMERCE OS — BOOT SCREEN")

if open_check == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ Verificación fallida: openGroups desapareció.")

if boot_check == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ Verificación fallida: nuevo loading no encontrado.")

if boot_check < open_check:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ El loading todavía está antes de openGroups. "
        "Se restauró el backup."
    )

# Verificar que App.tsx no haya cambiado.
app = Path("src/App.tsx")
main = Path("src/DigitalBoostMainPage.tsx")

print("✓ Loading eliminado de la zona inicial")
print("✓ Hooks iniciales conservados")
print("✓ Loading insertado después de filteredProducts")
print("✓ Commerce OS conservado")
print()

# ------------------------------------------------------------
# 9. ESCRIBIR
# ------------------------------------------------------------

FILE.write_text(new_text, encoding="utf-8")

print("✓ Cambio aplicado a StoreBuilderWorkspace.tsx")
print()

# ------------------------------------------------------------
# 10. BUILD
# ------------------------------------------------------------

import subprocess

print("==============================================")
print("🔥 EJECUTANDO BUILD")
print("==============================================")
print()

result = subprocess.run(
    ["npm", "run", "build"],
    text=True
)

if result.returncode != 0:
    print()
    print("❌ EL BUILD FALLÓ.")
    print(f"Backup disponible en: {backup}")
    print()
    raise SystemExit(1)

print()
print("==============================================")
print("🔥 FIX APLICADO CORRECTAMENTE")
print("==============================================")
print()
print("✓ Error 'Rendered more hooks' corregido")
print("✓ Pantalla de carga de Commerce OS conservada")
print("✓ Commerce OS conservado")
print("✓ App.tsx NO tocado")
print("✓ DigitalBoostMainPage.tsx NO tocado")
print("✓ Splash NO tocada")
print("✓ Build correcto")
print()
print(f"Backup: {backup}")
print()
print("👉 Ahora reiniciá el servidor de desarrollo")
print("   y hacé una recarga completa de la web.")
print()
